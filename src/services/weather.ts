// ============================================================
// KrishiMitra OS — Open-Meteo Weather Service (No API Key)
// ============================================================

import type { GeoCoordinates, HistoricalClimate, WeatherData } from '../types';

// ─── Current Weather ──────────────────────────────────────────────────────────

export async function fetchCurrentWeather(
  coords: GeoCoordinates
): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', coords.lat.toString());
  url.searchParams.set('longitude', coords.lng.toString());
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,precipitation'
  );
  url.searchParams.set('daily', 'precipitation_sum');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'Asia/Kolkata');

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Open-Meteo current: HTTP ${res.status}`);

  const json = await res.json() as OpenMeteoForecastResponse;

  const tempC = json.current.temperature_2m;
  const humidity = json.current.relative_humidity_2m;
  // Sum 7-day precipitation as a season proxy
  const rainfallMm7d = (json.daily.precipitation_sum ?? []).reduce(
    (a: number, b: number | null) => a + (b ?? 0),
    0
  ) as number;

  // Infer agricultural season from current month (India)
  const month = new Date().getMonth() + 1;
  const season =
    month >= 6 && month <= 10
      ? 'kharif'
      : month >= 11 || month <= 2
      ? 'rabi'
      : 'zaid';

  // Drought risk: higher when temp is high and rain is low
  const droughtRiskScore = Math.min(
    10,
    Math.max(0, Math.round((tempC - 25) / 2 + 5 - rainfallMm7d / 20))
  );

  return {
    annualRainfallMm: Math.max(0, Math.round(rainfallMm7d * 52)), // extrapolate weekly to annual
    avgTemperatureC: Math.round(tempC),
    avgHumidityPercent: Math.round(humidity),
    droughtRiskScore,
    season,
    month,
  };
}

// ─── 5-Year Historical Climate ────────────────────────────────────────────────

export async function fetchHistoricalClimate(
  coords: GeoCoordinates
): Promise<HistoricalClimate> {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() - 1); // yesterday (archive is 1-day delayed)
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 5);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.searchParams.set('latitude', coords.lat.toString());
  url.searchParams.set('longitude', coords.lng.toString());
  url.searchParams.set('start_date', fmt(startDate));
  url.searchParams.set('end_date', fmt(endDate));
  url.searchParams.set(
    'daily',
    'precipitation_sum,temperature_2m_max,temperature_2m_min'
  );
  url.searchParams.set('timezone', 'Asia/Kolkata');

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Open-Meteo archive: HTTP ${res.status}`);

  const json = await res.json() as OpenMeteoArchiveResponse;

  const daily = json.daily;
  const count = daily.time.length;
  if (count === 0) throw new Error('No historical data returned');

  const totalRainfall = daily.precipitation_sum.reduce(
    (a, v) => (a ?? 0) + (v ?? 0),
    0 as number | null
  ) ?? 0;
  const avgDailyRain = totalRainfall / count;
  const avg5YrRainfallMm = Math.round(avgDailyRain * 365);

  const avgTempMax =
    daily.temperature_2m_max.reduce((a, v) => (a ?? 0) + (v ?? 0), 0 as number | null) ?? 0 / count;
  const avgTempMin =
    daily.temperature_2m_min.reduce((a, v) => (a ?? 0) + (v ?? 0), 0 as number | null) ?? 0 / count;

  // Heatwave days: days above 40°C  → drought risk proxy
  const heatwaveDays = daily.temperature_2m_max.filter((t) => t !== null && t >= 40).length;
  const droughtRiskPercent = Math.min(100, Math.round((heatwaveDays / count) * 100 * 10));

  return {
    avg5YrRainfallMm,
    avgTempMinC: Math.round(avgTempMin * 10) / 10,
    avgTempMaxC: Math.round(avgTempMax * 10) / 10,
    droughtRiskPercent,
  };
}

// ─── Resilient Fetcher (never throws – returns null on failure) ───────────────

export async function tryFetchCurrentWeather(
  coords: GeoCoordinates
): Promise<WeatherData | null> {
  try {
    return await fetchCurrentWeather(coords);
  } catch {
    return null;
  }
}

export async function tryFetchHistoricalClimate(
  coords: GeoCoordinates
): Promise<HistoricalClimate | null> {
  try {
    return await fetchHistoricalClimate(coords);
  } catch {
    return null;
  }
}

// ─── Open-Meteo API Response Shapes ──────────────────────────────────────────

interface OpenMeteoForecastResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
  };
  daily: {
    time: string[];
    precipitation_sum: (number | null)[];
  };
}

interface OpenMeteoArchiveResponse {
  daily: {
    time: string[];
    precipitation_sum: (number | null)[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
  };
}
