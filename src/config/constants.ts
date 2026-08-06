// ============================================================
// KrishiMitra OS — System Constants & Baseline Data
// ============================================================

import type {
  CropBaselineData,
  LanguageCode,
  SoilTextureType,
} from '../types';

// ─── API Endpoints ────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  nominatimReverse: 'https://nominatim.openstreetmap.org/reverse',
  openMeteo: 'https://api.open-meteo.com/v1/forecast',
  agmarknet: '/api/v1/agmarknet', // Backend proxy
  supabase: import.meta.env.VITE_SUPABASE_URL ?? '',
} as const;

// ─── Scoring Weights ──────────────────────────────────────────────────────────

export const SCORING_WEIGHTS = {
  suitability: 0.40,
  demand: 0.30,
  waterSavings: 0.20,
  fpoAccess: 0.10,
} as const;

// ─── Baseline Water Use (mm/season) ──────────────────────────────────────────

export const BASELINE_WATER_USE_MM = {
  paddy: 1200,
  sugarcane: 2100,
} as const;

// ─── Language Labels ──────────────────────────────────────────────────────────

export const LANGUAGE_OPTIONS: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

export const SPEECH_LOCALE: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

// ─── Soil Display Labels ──────────────────────────────────────────────────────

export const SOIL_LABELS: Record<SoilTextureType, string> = {
  black_soil: 'Black Soil',
  alluvial_soil: 'Alluvial Soil',
  red_and_yellow_soil: 'Red and Yellow Soil',
  arid_soil: 'Arid Soil',
};

// ─── Crop Baseline Dataset ────────────────────────────────────────────────────

export const CROP_BASELINE_DATA: Record<string, CropBaselineData> = {
  soybean: {
    id: 'soybean',
    name: 'Soybean',
    nameHi: 'सोयाबीन',
    nameMr: 'सोयाबीन',
    emoji: '🌿',
    season: 'kharif',
    maturiyDays: 100,
    yieldPerAcreKg: 800,
    mspPerKg: 4600,
    inputCosts: {
      seedCostPerAcre: 2400,
      fertilizerCostPerAcre: 3200,
      tillageCostPerAcre: 2000,
      laborCostPerAcre: 4500,
      irrigationCostPerAcre: 1200,
      otherCostPerAcre: 800,
    },
    waterRequirementMmPerSeason: 450,
    suitableSoils: ['black_soil', 'alluvial_soil'],
    suitableIrrigation: ['rainfed', 'borewell', 'canal'],
    minRainfallMm: 400,
    maxTemperatureC: 38,
    minTemperatureC: 18,
    fpoAvailabilityScore: 0.85,
    demandScore: 0.90,
    colorPrimary: '#064e3b',
    colorSecondary: '#10b981',
  },
  mustard: {
    id: 'mustard',
    name: 'Mustard',
    nameHi: 'सरसों',
    nameMr: 'मोहरी',
    emoji: '🌼',
    season: 'rabi',
    maturiyDays: 115,
    yieldPerAcreKg: 600,
    mspPerKg: 5950,
    inputCosts: {
      seedCostPerAcre: 800,
      fertilizerCostPerAcre: 2800,
      tillageCostPerAcre: 1800,
      laborCostPerAcre: 3200,
      irrigationCostPerAcre: 1800,
      otherCostPerAcre: 600,
    },
    waterRequirementMmPerSeason: 300,
    suitableSoils: ['alluvial_soil', 'red_and_yellow_soil'],
    suitableIrrigation: ['borewell', 'canal', 'rainfed'],
    minRainfallMm: 250,
    maxTemperatureC: 30,
    minTemperatureC: 8,
    fpoAvailabilityScore: 0.78,
    demandScore: 0.85,
    colorPrimary: '#92400e',
    colorSecondary: '#f59e0b',
  },
  groundnut: {
    id: 'groundnut',
    name: 'Groundnut',
    nameHi: 'मूंगफली',
    nameMr: 'शेंगदाणे',
    emoji: '🥜',
    season: 'kharif',
    maturiyDays: 120,
    yieldPerAcreKg: 900,
    mspPerKg: 6377,
    inputCosts: {
      seedCostPerAcre: 4800,
      fertilizerCostPerAcre: 2600,
      tillageCostPerAcre: 2200,
      laborCostPerAcre: 5500,
      irrigationCostPerAcre: 1600,
      otherCostPerAcre: 900,
    },
    waterRequirementMmPerSeason: 500,
    suitableSoils: ['red_and_yellow_soil', 'alluvial_soil'],
    suitableIrrigation: ['rainfed', 'borewell', 'canal'],
    minRainfallMm: 450,
    maxTemperatureC: 40,
    minTemperatureC: 20,
    fpoAvailabilityScore: 0.72,
    demandScore: 0.88,
    colorPrimary: '#78350f',
    colorSecondary: '#d97706',
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    nameHi: 'सूरजमुखी',
    nameMr: 'सूर्यफूल',
    emoji: '🌻',
    season: 'rabi',
    maturiyDays: 90,
    yieldPerAcreKg: 700,
    mspPerKg: 7280,
    inputCosts: {
      seedCostPerAcre: 1200,
      fertilizerCostPerAcre: 3000,
      tillageCostPerAcre: 1600,
      laborCostPerAcre: 3800,
      irrigationCostPerAcre: 2000,
      otherCostPerAcre: 700,
    },
    waterRequirementMmPerSeason: 550,
    suitableSoils: ['alluvial_soil', 'black_soil'],
    suitableIrrigation: ['borewell', 'canal'],
    minRainfallMm: 350,
    maxTemperatureC: 35,
    minTemperatureC: 15,
    fpoAvailabilityScore: 0.60,
    demandScore: 0.75,
    colorPrimary: '#713f12',
    colorSecondary: '#eab308',
  },
  paddy: {
    id: 'paddy',
    name: 'Paddy (Rice)',
    nameHi: 'धान',
    nameMr: 'भात',
    emoji: '🌾',
    season: 'kharif',
    maturiyDays: 130,
    yieldPerAcreKg: 1400,
    mspPerKg: 2300,
    inputCosts: {
      seedCostPerAcre: 1200,
      fertilizerCostPerAcre: 4500,
      tillageCostPerAcre: 3500,
      laborCostPerAcre: 7000,
      irrigationCostPerAcre: 5500,
      otherCostPerAcre: 1200,
    },
    waterRequirementMmPerSeason: 1200,
    suitableSoils: ['alluvial_soil'],
    suitableIrrigation: ['canal', 'borewell'],
    minRainfallMm: 900,
    maxTemperatureC: 42,
    minTemperatureC: 20,
    fpoAvailabilityScore: 0.95,
    demandScore: 0.70,
    colorPrimary: '#365314',
    colorSecondary: '#84cc16',
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    nameHi: 'गन्ना',
    nameMr: 'ऊस',
    emoji: '🎋',
    season: 'zaid',
    maturiyDays: 365,
    yieldPerAcreKg: 35000,
    mspPerKg: 340,
    inputCosts: {
      seedCostPerAcre: 18000,
      fertilizerCostPerAcre: 12000,
      tillageCostPerAcre: 8000,
      laborCostPerAcre: 20000,
      irrigationCostPerAcre: 15000,
      otherCostPerAcre: 5000,
    },
    waterRequirementMmPerSeason: 2100,
    suitableSoils: ['alluvial_soil', 'black_soil'],
    suitableIrrigation: ['canal', 'borewell'],
    minRainfallMm: 1200,
    maxTemperatureC: 42,
    minTemperatureC: 18,
    fpoAvailabilityScore: 0.88,
    demandScore: 0.65,
    colorPrimary: '#14532d',
    colorSecondary: '#22c55e',
  },
};

// ─── Oilseed Target Crops (for recommendation engine) ─────────────────────────

export const TARGET_OILSEED_CROPS: Array<keyof typeof CROP_BASELINE_DATA> = [
  'soybean',
  'mustard',
  'groundnut',
  'sunflower',
];

// ─── Acreage Slider Bounds ────────────────────────────────────────────────────

export const ACREAGE_BOUNDS = {
  min: 0.5,
  max: 20.0,
  step: 0.5,
  default: 2.0,
} as const;

// ─── Mock FPO Data ─────────────────────────────────────────────────────────────

export const MOCK_FPO_SEED_DATA = [
  {
    id: 'fpo-001',
    name: 'Vidarbha Oilseed FPO',
    nameKey: 'fpo.fpoNames.vidarbha',
    district: 'Nagpur',
    districtKey: 'fpo.locations.nagpur',
    block: 'Kamptee',
    blockKey: 'fpo.locations.kamptee',
    state: 'Maharashtra',
    coordinates: { lat: 21.2514, lng: 79.0999 },
    memberCount: 342,
    procurementCrops: ['soybean', 'mustard'],
    contactPhone: '+91-9876543210',
    registrationNumber: 'MH-FPO-2021-0342',
    supportedLanguages: ['mr', 'hi'],
    rating: 4.5,
  },
  {
    id: 'fpo-002',
    name: 'Marathwada Groundnut Collective',
    nameKey: 'fpo.fpoNames.marathwada',
    district: 'Latur',
    districtKey: 'fpo.locations.latur',
    block: 'Udgir',
    blockKey: 'fpo.locations.udgir',
    state: 'Maharashtra',
    coordinates: { lat: 18.3962, lng: 76.5694 },
    memberCount: 218,
    procurementCrops: ['groundnut', 'soybean'],
    contactPhone: '+91-9876543211',
    registrationNumber: 'MH-FPO-2022-0218',
    supportedLanguages: ['mr', 'hi', 'en'],
    rating: 4.2,
  },
  {
    id: 'fpo-003',
    name: 'Khandesh Mustard Producers',
    nameKey: 'fpo.fpoNames.khandesh',
    district: 'Dhule',
    districtKey: 'fpo.locations.dhule',
    block: 'Shirpur',
    blockKey: 'fpo.locations.shirpur',
    state: 'Maharashtra',
    coordinates: { lat: 21.0177, lng: 74.7749 },
    memberCount: 156,
    procurementCrops: ['mustard', 'sunflower'],
    contactPhone: '+91-9876543212',
    registrationNumber: 'MH-FPO-2023-0156',
    supportedLanguages: ['mr', 'hi'],
    rating: 3.9,
  },
];

// ─── Voice Script Templates ───────────────────────────────────────────────────

export const VOICE_SCRIPTS = {
  en: (crop: string, profit: string, water: string) =>
    `Based on your soil and location, ${crop} is your best option. You can earn approximately ${profit} per acre, and save ${water} cubic meters of groundwater compared to paddy.`,
  hi: (crop: string, profit: string, water: string) =>
    `आपकी मिट्टी और स्थान के आधार पर, ${crop} आपके लिए सबसे अच्छा विकल्प है। आप प्रति एकड़ लगभग ${profit} कमा सकते हैं, और धान की तुलना में ${water} घन मीटर भूजल बचा सकते हैं।`,
  mr: (crop: string, profit: string, water: string) =>
    `तुमच्या माती आणि ठिकाणाच्या आधारे, ${crop} हा तुमच्यासाठी सर्वोत्तम पर्याय आहे. तुम्ही प्रति एकर अंदाजे ${profit} कमवू शकता आणि भात शेतीच्या तुलनेत ${water} घनमीटर भूजल वाचवू शकता.`,
} as const;
