// ============================================================
// KrishiMitra OS — Groq LLM Agronomic AI Service
// ============================================================

import type {

  GroqAIResponse,
  HistoricalClimate,
  IrrigationType,
  SoilTextureType,
  WeatherData,
} from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const TIMEOUT_MS = 4000;

// ─── Soil label map (local copy to avoid circular imports) ────────────────────

const SOIL_DISPLAY: Record<SoilTextureType, string> = {
  red_and_yellow_soil: 'Red and Yellow Soil (High Iron Oxide, pH 6.2, Excellent Drainage)',
  black_soil: 'Black Soil / Regur (High Moisture Retention, pH 7.8)',
  alluvial_soil: 'Alluvial Soil (Rich in Potash, Light & Porous)',
  arid_soil: 'Arid Soil (Sandy texture, Low humus, High salt content)',
};

const IRRIGATION_DISPLAY: Record<IrrigationType, string> = {
  rainfed: 'Rainfed (monsoon dependent)',
  borewell: 'Borewell (groundwater)',
  canal: 'Canal irrigation',
};

// ─── Build Agronomic Prompt ───────────────────────────────────────────────────

function buildPrompt(params: GroqPromptParams): string {
  return `You are an expert agronomic AI for Indian agriculture. Given:
- Location: ${params.district}, ${params.state} (Lat: ${params.lat.toFixed(4)}, Lng: ${params.lng.toFixed(4)})
- Soil Type: ${SOIL_DISPLAY[params.soilType]}
- Land Acreage: ${params.acreage} acres
- Irrigation: ${IRRIGATION_DISPLAY[params.irrigationType]}
- Current Weather: ${params.weather.avgTemperatureC}°C, ${params.weather.avgHumidityPercent}% humidity
- 5-Year Historical Climate Summary: ${params.historical.avg5YrRainfallMm}mm avg rainfall, ${params.historical.droughtRiskPercent}% drought risk

Analyze crop viability for high-yield oilseeds (Soybean, Groundnut, Mustard) vs baseline Paddy/Sugarcane. Return a raw JSON object with:
1. "recommendedCrops": Array of top 3 crops with "cropName", "suitabilityScore" (0-100).
   - "projectedNetProfitPerAcre": Return strictly as a raw integer representing Indian Rupees PER ACRE (e.g., 35000 for ₹35,000/acre, NOT in Lakhs or raw totals across 100 acres). Realistic range is between 25000 and 80000.
   - "waterSavedCubicMeters": Return strictly as a raw integer representing cubic meters saved per acre (e.g., 1200 for 1,200 m³, NOT 18000).
   - "maturityDays": Integer.
   - "reasoning": String.
2. "historicalInsight": Brief narrative of how the 5-year weather trend influenced this decision.
3. "futureCultivationPlan": Array of step objects with "phase", "timing", "action" tailored to the local weather forecast for ${params.district}.

Important: Return ONLY valid JSON. No preamble, no markdown, no explanation outside the JSON.`;
}

// ─── Groq API Call ────────────────────────────────────────────────────────────

export async function fetchGroqRecommendation(
  params: GroqPromptParams
): Promise<GroqAIResponse> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_NO_KEY');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a precision agronomic AI assistant for Indian farmers. Always respond in valid JSON.',
          },
          {
            role: 'user',
            content: buildPrompt(params),
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Groq API error ${res.status}: ${text.slice(0, 120)}`);
    }

    const json = await res.json() as GroqAPIResponse;
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty Groq response');

    const parsed = JSON.parse(content) as GroqAIResponse;

    // Validate minimal structure
    if (!Array.isArray(parsed.recommendedCrops)) {
      throw new Error('Invalid Groq response shape');
    }

    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Resilient wrapper ────────────────────────────────────────────────────────

export async function tryFetchGroqRecommendation(
  params: GroqPromptParams
): Promise<GroqAIResponse | null> {
  try {
    return await fetchGroqRecommendation(params);
  } catch {
    return null;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GroqPromptParams {
  lat: number;
  lng: number;
  district: string;
  state: string;
  soilType: SoilTextureType;
  acreage: number;
  irrigationType: IrrigationType;
  weather: WeatherData;
  historical: HistoricalClimate;
}

interface GroqAPIResponse {
  choices: Array<{
    message: { content: string };
  }>;
}
