// ============================================================
// KrishiMitra OS — useAgronomicEngine (AI-Enhanced Hook)
// ============================================================
//
// Data pipeline:
//   GPS Coords → Open-Meteo (Current + 5yr History) → Groq AI → Dashboard
//   Fallback: If Groq key is absent / times out → deterministic engine.ts
// ============================================================

import { useCallback, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { reverseGeocode } from '../services/nominatim';
import { tryFetchCurrentWeather, tryFetchHistoricalClimate } from '../services/weather';
import { tryFetchGroqRecommendation } from '../services/groq';
import { generateMockWeather, runAgronomicEngine } from '../utils/engine';
import { CROP_BASELINE_DATA } from '../config/constants';
import type { HistoricalClimate, WeatherData, CropRecommendation, GroqAIResponse } from '../types';

// ─── Engine Mode ──────────────────────────────────────────────────────────────

export type EngineMode = 'idle' | 'locating' | 'weather' | 'ai' | 'fallback' | 'done';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAgronomicEngine() {
  const {
    ingestionContext,
    setRecommendations,
    setEngineRunning,
    setEngineError,
    setLocation,
    setWeather,
  } = useAppStore();

  const [engineMode, setEngineMode] = useState<EngineMode>('idle');
  const [isAIPowered, setIsAIPowered] = useState(false);
  const [liveWeather, setLiveWeather] = useState<WeatherData | null>(null);
  const [historicalClimate, setHistoricalClimate] = useState<HistoricalClimate | null>(null);

  const evaluate = useCallback(async () => {
    const { soilProfile, location, acreage, irrigationType } = ingestionContext;

    if (!soilProfile) {
      setEngineError('Please provide soil information before evaluating.');
      return;
    }

    setEngineRunning(true);
    setEngineError(null);
    setIsAIPowered(false);
    setEngineMode('locating');

    try {
      // ── Step 1: Resolve location ────────────────────────────────────────────
      let resolvedLocation = location;
      if (!resolvedLocation) {
        const fallbackCoords = { lat: 18.4088, lng: 76.5604 }; // Latur default
        const geoResult = await reverseGeocode(fallbackCoords);
        resolvedLocation = geoResult.data;
        setLocation(geoResult.data);
      }
      const coords = resolvedLocation.coordinates;

      // ── Step 2: Fetch real-time weather (non-blocking) ──────────────────────
      setEngineMode('weather');
      const [fetchedWeather, fetchedHistory] = await Promise.all([
        tryFetchCurrentWeather(coords),
        tryFetchHistoricalClimate(coords),
      ]);

      // Merge live weather with mock fallback for any missing fields
      const mockWeather = generateMockWeather(coords.lat);
      const weather: WeatherData = fetchedWeather ?? mockWeather;
      const historical: HistoricalClimate = fetchedHistory ?? {
        avg5YrRainfallMm: mockWeather.annualRainfallMm,
        avgTempMinC: mockWeather.avgTemperatureC - 5,
        avgTempMaxC: mockWeather.avgTemperatureC + 8,
        droughtRiskPercent: mockWeather.droughtRiskScore * 10,
      };

      setWeather(weather);
      setLiveWeather(weather);
      setHistoricalClimate(historical);

      // ── Step 3: Run deterministic engine (always happens) ──────────────────
      const enrichedCtx = {
        ...ingestionContext,
        location: resolvedLocation,
        weather,
        acreage,
        irrigationType,
      };
      const deterministicRecs = runAgronomicEngine(enrichedCtx);

      if (deterministicRecs.length === 0) {
        setEngineError(
          'No suitable crops found for the given conditions. Try adjusting soil type or irrigation.'
        );
        return;
      }

      // ── Step 4: Try Groq AI enrichment ─────────────────────────────────────
      setEngineMode('ai');

      const groqParams = {
        lat: coords.lat,
        lng: coords.lng,
        district: resolvedLocation.district,
        state: resolvedLocation.state,
        soilType: soilProfile.texture,
        acreage,
        irrigationType,
        weather,
        historical,
      };

      const aiResponse = await tryFetchGroqRecommendation(groqParams);

      if (aiResponse) {
        // Groq succeeded — merge AI plan into deterministic recommendations
        setIsAIPowered(true);
        const enrichedRecs = mergeAIWithDeterministic(deterministicRecs, aiResponse);
        setRecommendations(enrichedRecs);
      } else {
        // Groq failed / no key — use deterministic only (silent fallback)
        setEngineMode('fallback');
        setRecommendations(deterministicRecs);
      }

      setEngineMode('done');
    } catch (err) {
      setEngineError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setEngineRunning(false);
    }
  }, [
    ingestionContext,
    setRecommendations,
    setEngineRunning,
    setEngineError,
    setLocation,
    setWeather,
  ]);

  return {
    evaluate,
    ingestionContext,
    engineMode,
    isAIPowered,
    liveWeather,
    historicalClimate,
  };
}

// ─── Merge Groq AI plan into deterministic results ────────────────────────────
//
// The deterministic engine owns the financial numbers (CACP-based).
// Groq contributes the cultivation plan, historical insight, and reasoning text.

function mergeAIWithDeterministic(
  recs: CropRecommendation[],
  ai: GroqAIResponse
): CropRecommendation[] {
  return recs.map((rec) => {
    // Match AI crop entry by normalizing names (case-insensitive prefix match)
    const aiCrop = ai.recommendedCrops.find((ac) =>
      rec.crop.name.toLowerCase().startsWith(ac.cropName.toLowerCase().slice(0, 5)) ||
      ac.cropName.toLowerCase().startsWith(rec.crop.name.toLowerCase().slice(0, 5))
    );

    const matchedEntry = aiCrop
      ? { ...ai, recommendedCrops: [aiCrop] }
      : ai;

    // Boost suitability score using Groq's estimate if higher
    const aiSuitability = aiCrop ? aiCrop.suitabilityScore / 100 : null;
    const blendedSuitability =
      aiSuitability !== null
        ? Math.min(1, (rec.score.suitabilityScore + aiSuitability) / 2)
        : rec.score.suitabilityScore;

    const suitabilityPct = Math.round(blendedSuitability * 100);

    // Boost water savings from AI if available
    const boostedProfit = aiCrop?.waterSavedCubicMeters
      ? { ...rec.profit, waterSavedCubicMeters: Math.max(rec.profit.waterSavedCubicMeters, aiCrop.waterSavedCubicMeters) }
      : rec.profit;

    return {
      ...rec,
      profit: boostedProfit,
      score: { ...rec.score, suitabilityScore: blendedSuitability },
      suitabilityBadge: `${suitabilityPct}% Match`,
      aiPlan: matchedEntry,
    };
  });
}

// ─── Helper: resolve crop name from CropId ────────────────────────────────────

export function getCropDisplayName(cropId: string): string {
  return CROP_BASELINE_DATA[cropId]?.name ?? cropId;
}
