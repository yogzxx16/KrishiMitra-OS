// ============================================================
// KrishiMitra OS — Market Price Service (Agmarknet via Proxy)
// ============================================================

import type { ApiResponse, CropId, MarketPrice, MandiRecord } from '../types';

// ─── Mock Market Data (Fallback) ──────────────────────────────────────────────

const MOCK_MARKET_PRICES: Record<CropId, Omit<MarketPrice, 'districtName'>> = {
  soybean: {
    cropId: 'soybean',
    mspPerKg: 4600,
    arrivalPricePerKg: 4820,
    effectivePricePerKg: 4820,
    updatedAt: new Date().toISOString(),
    trend: 'up',
    trendPercent: 3.2,
  },
  mustard: {
    cropId: 'mustard',
    mspPerKg: 5950,
    arrivalPricePerKg: 5780,
    effectivePricePerKg: 5950,
    updatedAt: new Date().toISOString(),
    trend: 'stable',
    trendPercent: 0.8,
  },
  groundnut: {
    cropId: 'groundnut',
    mspPerKg: 6377,
    arrivalPricePerKg: 6600,
    effectivePricePerKg: 6600,
    updatedAt: new Date().toISOString(),
    trend: 'up',
    trendPercent: 5.1,
  },
  sunflower: {
    cropId: 'sunflower',
    mspPerKg: 7280,
    arrivalPricePerKg: 7100,
    effectivePricePerKg: 7280,
    updatedAt: new Date().toISOString(),
    trend: 'down',
    trendPercent: -1.4,
  },
  paddy: {
    cropId: 'paddy',
    mspPerKg: 2300,
    arrivalPricePerKg: 2180,
    effectivePricePerKg: 2300,
    updatedAt: new Date().toISOString(),
    trend: 'stable',
    trendPercent: 0.2,
  },
  sugarcane: {
    cropId: 'sugarcane',
    mspPerKg: 340,
    arrivalPricePerKg: 320,
    effectivePricePerKg: 340,
    updatedAt: new Date().toISOString(),
    trend: 'down',
    trendPercent: -2.1,
  },
  cotton: {
    cropId: 'cotton',
    mspPerKg: 7020,
    arrivalPricePerKg: 7200,
    effectivePricePerKg: 7200,
    updatedAt: new Date().toISOString(),
    trend: 'up',
    trendPercent: 2.6,
  },
  wheat: {
    cropId: 'wheat',
    mspPerKg: 2275,
    arrivalPricePerKg: 2350,
    effectivePricePerKg: 2350,
    updatedAt: new Date().toISOString(),
    trend: 'up',
    trendPercent: 1.9,
  },
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Normalizes commodity strings from Agmarknet to internal CropId.
 */
function normalizeCommodityToCropId(commodity: string): CropId | null {
  const c = commodity.toLowerCase();
  if (c.includes('soyabean') || c.includes('soybean')) return 'soybean';
  if (c.includes('mustard')) return 'mustard';
  if (c.includes('groundnut')) return 'groundnut';
  if (c.includes('sunflower')) return 'sunflower';
  if (c.includes('paddy')) return 'paddy';
  if (c.includes('sugar') || c.includes('cane')) return 'sugarcane';
  if (c.includes('cotton')) return 'cotton';
  if (c.includes('wheat')) return 'wheat';
  return null;
}

export async function fetchLiveMandiPrices(
  state?: string,
  commodity?: string
): Promise<ApiResponse<MarketPrice[]>> {
  try {
    const url = new URL('http://localhost:5000/api/mandi-prices');
    if (state) url.searchParams.set('state', state);
    if (commodity) url.searchParams.set('commodity', commodity);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Proxy error: ${res.status}`);

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('No real data or key missing from proxy.');
    }

    const rawRecords: MandiRecord[] = json.data;

    // Deduplicate by commodity and take the latest/highest prices
    const priceMap = new Map<CropId, MarketPrice>();

    rawRecords.forEach((record) => {
      const cid = normalizeCommodityToCropId(record.commodity);
      if (!cid) return;

      const modalPrice = Number(record.modal_price);
      if (isNaN(modalPrice) || modalPrice <= 0) return;

      // Agmarknet returns prices per Quintal (100 kg), we store per Kg
      const pricePerKg = modalPrice / 100;

      // Merge with base mock to keep MSP references valid if missing
      const baseMock = MOCK_MARKET_PRICES[cid];

      if (!priceMap.has(cid) || priceMap.get(cid)!.arrivalPricePerKg < pricePerKg) {
        priceMap.set(cid, {
          cropId: cid,
          districtName: record.district || 'Regional',
          mspPerKg: baseMock?.mspPerKg || Math.round(pricePerKg * 0.9), // fallback MSP estimation
          arrivalPricePerKg: pricePerKg,
          effectivePricePerKg: Math.max(
            baseMock?.mspPerKg || 0,
            pricePerKg
          ),
          updatedAt: record.arrival_date,
          trend: 'up', // dynamically could be based on min/max but setting static for demo
          trendPercent: Math.round(Math.random() * 5 * 10) / 10,
        });
      }
    });

    const transformedPrices = Array.from(priceMap.values());

    if (transformedPrices.length === 0) {
      throw new Error('No mapped crops found in response.');
    }

    return {
      data: transformedPrices,
      success: true,
      message: 'Live mandi prices fetched',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Live API unavailable, falling back to local static benchmark:', error);
    return fetchAllMarketPrices('All Districts');
  }
}

export async function fetchMarketPrice(
  cropId: CropId,
  district: string
): Promise<ApiResponse<MarketPrice>> {
  // Try live first
  const liveResult = await fetchLiveMandiPrices(undefined, cropId);
  const liveCrop = liveResult.data.find((p) => p.cropId === cropId);

  if (liveCrop) {
    return {
      data: { ...liveCrop, districtName: district },
      success: true,
      message: 'Live market price fetched',
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback to strict local mock
  const base = MOCK_MARKET_PRICES[cropId];
  if (!base) {
    return {
      data: {} as MarketPrice,
      success: false,
      message: `No price data for crop: ${cropId}`,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    data: { ...base, districtName: district },
    success: true,
    message: 'Local market price benchmark fetched',
    timestamp: new Date().toISOString(),
  };
}

export async function fetchAllMarketPrices(
  district: string
): Promise<ApiResponse<MarketPrice[]>> {
  await new Promise((r) => setTimeout(r, 300)); // Simulating latency

  const prices = Object.values(MOCK_MARKET_PRICES).map((p) => ({
    ...p,
    districtName: district,
  }));

  return {
    data: prices,
    success: true,
    message: 'All local market prices fetched',
    timestamp: new Date().toISOString(),
  };
}
