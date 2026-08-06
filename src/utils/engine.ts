// ============================================================
// KrishiMitra OS — Agronomic Suitability & Ranking Engine
// ============================================================

import {
  BASELINE_WATER_USE_MM,
  CROP_BASELINE_DATA,
  SCORING_WEIGHTS,
  TARGET_OILSEED_CROPS,
} from '../config/constants';
import type {
  AgronomicScore,
  CropBaselineData,
  CropRecommendation,
  FarmerIngestionContext,
  IrrigationType,
  NetProfitBreakdown,
  SoilTextureType,
  WeatherData,
} from '../types';

// ─── Hard Agronomic Filter ────────────────────────────────────────────────────

/**
 * Eliminates crops that are biologically incompatible with the given conditions.
 * Returns only viable candidates.
 */
export function hardFilter(
  candidates: CropBaselineData[],
  soilTexture: SoilTextureType,
  irrigation: IrrigationType,
  weather: WeatherData
): CropBaselineData[] {
  return candidates.filter((crop) => {
    const soilOk = crop.suitableSoils.includes(soilTexture);
    const irrigationOk = crop.suitableIrrigation.includes(irrigation);
    const rainfallOk = weather.annualRainfallMm >= crop.minRainfallMm * 0.8; // 20% tolerance
    const tempOk =
      weather.avgTemperatureC <= crop.maxTemperatureC &&
      weather.avgTemperatureC >= crop.minTemperatureC;

    return soilOk && irrigationOk && rainfallOk && tempOk;
  });
}

// ─── Suitability Score ────────────────────────────────────────────────────────

/**
 * Computes a normalized suitability score [0,1] based on soil, water, and climate fit.
 */
function computeSuitabilityScore(
  crop: CropBaselineData,
  soilTexture: SoilTextureType,
  irrigation: IrrigationType,
  weather: WeatherData
): number {
  let score = 0;

  // Soil match
  score += crop.suitableSoils.includes(soilTexture) ? 0.4 : 0.0;

  // Dynamic soil boosts based on explicit agronomic traits
  if (soilTexture === 'red_and_yellow_soil' && (crop.id === 'groundnut' || crop.id === 'mustard')) {
    score += 0.15; // Red Soil has excellent drainage, ideal for groundnut/mustard
  }

  // Irrigation match
  score += crop.suitableIrrigation.includes(irrigation) ? 0.2 : 0.1;

  // Rainfall adequacy (0 → 0.2)
  const rainfallRatio = Math.min(
    weather.annualRainfallMm / crop.minRainfallMm,
    1.5
  );
  score += (rainfallRatio / 1.5) * 0.2;

  // Temperature fit (0 → 0.2)
  const tempRange = crop.maxTemperatureC - crop.minTemperatureC;
  const tempFit =
    weather.avgTemperatureC >= crop.minTemperatureC &&
    weather.avgTemperatureC <= crop.maxTemperatureC
      ? 1.0
      : Math.max(
          0,
          1 -
            Math.abs(weather.avgTemperatureC - crop.minTemperatureC) / tempRange
        );
  score += tempFit * 0.2;

  return Math.min(score, 1.0);
}

// ─── Water Savings Score ──────────────────────────────────────────────────────

/**
 * Computes normalized water savings score vs paddy baseline.
 */
function computeWaterSavingsScore(crop: CropBaselineData): number {
  const baseline = BASELINE_WATER_USE_MM.paddy;
  const saved = Math.max(0, baseline - crop.waterRequirementMmPerSeason);
  return Math.min(saved / baseline, 1.0);
}

// ─── Weighted Rank Score ──────────────────────────────────────────────────────

/**
 * Rank Score = (0.40 * Suitability) + (0.30 * Demand) + (0.20 * WaterSavings) + (0.10 * FPOAccess)
 */
function computeRankScore(
  suitability: number,
  demand: number,
  waterSavings: number,
  fpoAccess: number
): number {
  return (
    SCORING_WEIGHTS.suitability * suitability +
    SCORING_WEIGHTS.demand * demand +
    SCORING_WEIGHTS.waterSavings * waterSavings +
    SCORING_WEIGHTS.fpoAccess * fpoAccess
  );
}

// ─── Net Profit Calculator ────────────────────────────────────────────────────

/**
 * Net Profit per Acre = (District Yield * Effective Market Price) - CACP Input Cost
 */
export function computeNetProfit(
  crop: CropBaselineData,
  acreage: number,
  effectivePricePerKg?: number
): NetProfitBreakdown {
  const price = effectivePricePerKg ?? crop.mspPerKg;
  const yieldKg = Math.max(0, Math.round(crop.yieldPerAcreKg * acreage)) || 0;
  const grossIncomeINR = Math.max(0, Math.round(yieldKg * price)) || 0;

  const costs = crop.inputCosts;
  const totalInputCostPerAcre =
    costs.seedCostPerAcre +
    costs.fertilizerCostPerAcre +
    costs.tillageCostPerAcre +
    costs.laborCostPerAcre +
    costs.irrigationCostPerAcre +
    costs.otherCostPerAcre;

  const totalInputCostINR = Math.max(0, Math.round(totalInputCostPerAcre * acreage)) || 0;
  
  let netProfitINR = Math.max(0, Math.round(grossIncomeINR - totalInputCostINR)) || 0;
  if (!isFinite(netProfitINR)) netProfitINR = 0;

  let netProfitPerAcre = Math.max(0, Math.round(netProfitINR / Math.max(acreage, 0.01))) || 0;
  if (!isFinite(netProfitPerAcre)) netProfitPerAcre = 0;
  
  if (netProfitPerAcre > 100000) {
    // If somehow it's a raw total masquerading as a per-acre value, divide it
    netProfitPerAcre = Math.round(netProfitPerAcre / Math.max(acreage, 1));
  }
  netProfitPerAcre = Math.min(85000, netProfitPerAcre);

  // Cubic meters saved vs paddy baseline (1mm per m² = 1 litre per m², 1 acre = 4047 m²)
  const waterSavedMmPerAcre = Math.max(
    0,
    BASELINE_WATER_USE_MM.paddy - crop.waterRequirementMmPerSeason
  );
  let waterSavedCubicMeters = Math.max(0, Math.round((waterSavedMmPerAcre / 1000) * 4047 * acreage)) || 0;
  if (!isFinite(waterSavedCubicMeters)) waterSavedCubicMeters = 0;

  // 5-year ROI assuming 8% annual price appreciation
  let fiveYearROI = Array.from({ length: 5 })
    .map((_, i) => netProfitINR * Math.pow(1.08, i))
    .reduce((a, b) => a + b, 0);
  fiveYearROI = Math.max(0, Math.round(fiveYearROI)) || 0;
  if (!isFinite(fiveYearROI)) fiveYearROI = 0;

  return {
    cropId: crop.id,
    yieldKg,
    grossIncomeINR,
    totalInputCostINR,
    netProfitINR,
    netProfitPerAcre,
    waterSavedCubicMeters,
    fiveYearROI,
  };
}

// ─── Main Engine Orchestrator ─────────────────────────────────────────────────

/**
 * Full pipeline: filter → score → rank → enrich with profit data
 */
export function runAgronomicEngine(
  ctx: FarmerIngestionContext
): CropRecommendation[] {
  const { soilProfile, irrigationType, acreage, weather } = ctx;

  if (!soilProfile || !weather) return [];

  const allCandidates = TARGET_OILSEED_CROPS.map(
    (id) => CROP_BASELINE_DATA[id]
  ).filter((c): c is CropBaselineData => c !== undefined);

  const viable = hardFilter(
    allCandidates,
    soilProfile.texture,
    irrigationType,
    weather
  );

  // If hard filter eliminates all, relax constraints and use top scorers
  let candidates = viable.length > 0 ? viable : allCandidates;
  
  // Clone candidates to apply dynamic soil-specific adjustments
  candidates = candidates.map(c => {
    const clone = { ...c, inputCosts: { ...c.inputCosts } };
    
    if (soilProfile.texture === 'red_and_yellow_soil') {
      // Excellent drainage = 10% higher water requirement/irrigation cost to maintain moisture
      clone.waterRequirementMmPerSeason = Math.round(clone.waterRequirementMmPerSeason * 1.1);
      clone.inputCosts.irrigationCostPerAcre = Math.round(clone.inputCosts.irrigationCostPerAcre * 1.1);
    }
    return clone;
  });

  const scored: Array<{ crop: CropBaselineData; score: AgronomicScore }> =
    candidates.map((crop) => {
      const suitabilityScore = computeSuitabilityScore(
        crop,
        soilProfile.texture,
        irrigationType,
        weather
      );
      const waterSavingsScore = computeWaterSavingsScore(crop);
      const compositeRankScore = computeRankScore(
        suitabilityScore,
        crop.demandScore,
        waterSavingsScore,
        crop.fpoAvailabilityScore
      );

      const agronomicScore: AgronomicScore = {
        cropId: crop.id,
        suitabilityScore,
        demandScore: crop.demandScore,
        waterSavingsScore,
        fpoAccessScore: crop.fpoAvailabilityScore,
        compositeRankScore,
      };

      return { crop, score: agronomicScore };
    });

  // Sort descending by composite rank score
  scored.sort((a, b) => b.score.compositeRankScore - a.score.compositeRankScore);

  // Take top 3 and enrich with profit
  return scored.slice(0, 3).map(({ crop, score }, index) => {
    const profit = computeNetProfit(crop, acreage);
    const suitabilityPct = Math.round(score.suitabilityScore * 100);

    return {
      rank: index + 1,
      crop,
      score,
      profit,
      suitabilityBadge: `${suitabilityPct}% Match`,
    };
  });
}

// ─── Water Savings Calculator (standalone) ────────────────────────────────────

export function calculateWaterSavings(
  cropWaterMm: number,
  acreage: number,
  baselineCrop: 'paddy' | 'sugarcane' = 'paddy'
): number {
  const baseline = BASELINE_WATER_USE_MM[baselineCrop];
  const savedMm = Math.max(0, baseline - cropWaterMm);
  const savedCubicMeters = (savedMm / 1000) * 4047 * acreage;
  return Math.round(savedCubicMeters);
}

// ─── Mock Weather Generator ───────────────────────────────────────────────────

export function generateMockWeather(lat: number): WeatherData {
  // Simulate different climate zones by latitude
  const isNorthern = lat > 22;
  return {
    annualRainfallMm: isNorthern ? 850 : 650,
    avgTemperatureC: isNorthern ? 24 : 27,
    avgHumidityPercent: isNorthern ? 68 : 72,
    droughtRiskScore: isNorthern ? 4 : 6,
    season: 'kharif',
    month: new Date().getMonth() + 1,
  };
}
