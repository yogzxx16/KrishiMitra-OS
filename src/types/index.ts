// ============================================================
// KrishiMitra OS — Comprehensive TypeScript Type Definitions
// ============================================================

// ─── Role & Language ──────────────────────────────────────────────────────────

export type RoleType = 'farmer' | 'fpo' | 'government';

export type LanguageCode = 'en' | 'hi' | 'mr';

export type IrrigationType = 'rainfed' | 'borewell' | 'canal';

export type SoilTextureType =
  | 'black_soil'
  | 'alluvial_soil'
  | 'red_and_yellow_soil'
  | 'arid_soil';

export type SeasonType = 'kharif' | 'rabi' | 'zaid';

export type CropId =
  | 'soybean'
  | 'mustard'
  | 'groundnut'
  | 'sunflower'
  | 'paddy'
  | 'sugarcane'
  | 'cotton'
  | 'wheat';

// ─── Geolocation ──────────────────────────────────────────────────────────────

export interface GeoCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface LocationMeta {
  coordinates: GeoCoordinates;
  district: string;
  block: string;
  state: string;
  pincode?: string;
  displayName: string;
}

// ─── Soil & Weather ───────────────────────────────────────────────────────────

export interface SoilProfile {
  texture: SoilTextureType;
  organicMatter: number; // percentage 0–10
  pH: number;            // 4.5–8.5
  nitrogen: 'low' | 'medium' | 'high';
  phosphorus: 'low' | 'medium' | 'high';
  potassium: 'low' | 'medium' | 'high';
  classificationLabel: string;
  confidence: number; // 0–100
  capturedImageUrl?: string;
}

export interface WeatherData {
  annualRainfallMm: number;
  avgTemperatureC: number;
  avgHumidityPercent: number;
  droughtRiskScore: number; // 0–10, higher = drier
  season: SeasonType;
  month: number; // 1–12
}

export interface HistoricalClimate {
  avg5YrRainfallMm: number;
  avgTempMinC: number;
  avgTempMaxC: number;
  droughtRiskPercent: number; // 0–100
}

// ─── Crop & Engine ────────────────────────────────────────────────────────────

export interface CACPInputCost {
  seedCostPerAcre: number;     // INR
  fertilizerCostPerAcre: number;
  tillageCostPerAcre: number;
  laborCostPerAcre: number;
  irrigationCostPerAcre: number;
  otherCostPerAcre: number;
}

export interface CropBaselineData {
  id: CropId;
  name: string;
  nameHi: string;
  nameMr: string;
  emoji: string;
  season: SeasonType;
  maturiyDays: number;
  yieldPerAcreKg: number;
  mspPerKg: number;           // INR — Minimum Support Price
  inputCosts: CACPInputCost;
  waterRequirementMmPerSeason: number;
  suitableSoils: SoilTextureType[];
  suitableIrrigation: IrrigationType[];
  minRainfallMm: number;
  maxTemperatureC: number;
  minTemperatureC: number;
  fpoAvailabilityScore: number; // 0–1
  demandScore: number;          // 0–1 market demand
  colorPrimary: string;
  colorSecondary: string;
}

export interface AgronomicScore {
  cropId: CropId;
  suitabilityScore: number;   // 0–1
  demandScore: number;        // 0–1
  waterSavingsScore: number;  // 0–1
  fpoAccessScore: number;     // 0–1
  compositeRankScore: number; // weighted sum
}

export interface NetProfitBreakdown {
  cropId: CropId;
  yieldKg: number;
  grossIncomeINR: number;
  totalInputCostINR: number;
  netProfitINR: number;
  netProfitPerAcre: number;
  waterSavedCubicMeters: number;
  fiveYearROI: number;
}

// ─── Groq AI Response ─────────────────────────────────────────────────────────

export interface AICropEntry {
  cropName: string;
  suitabilityScore: number;
  projectedNetProfitPerAcre: number;
  waterSavedCubicMeters: number;
  maturityDays: number;
  reasoning: string;
}

export interface AICultivationStep {
  phase: string;
  timing: string;
  action: string;
}

export interface GroqAIResponse {
  recommendedCrops: AICropEntry[];
  historicalInsight: string;
  futureCultivationPlan: AICultivationStep[];
}

export interface CropRecommendation {
  rank: number;
  crop: CropBaselineData;
  score: AgronomicScore;
  profit: NetProfitBreakdown;
  suitabilityBadge: string; // e.g. "94% Match"
  aiPlan?: GroqAIResponse; // enriched by Groq if available
}

// ─── FPO ──────────────────────────────────────────────────────────────────────

export interface FPOEntity {
  id: string;
  name: string;
  nameKey?: string;
  district: string;
  districtKey?: string;
  block: string;
  blockKey?: string;
  state: string;
  coordinates: GeoCoordinates;
  distanceKm: number;
  memberCount: number;
  procurementCrops: CropId[];
  contactPhone: string;
  registrationNumber: string;
  supportedLanguages: LanguageCode[];
  rating: number; // 1–5
}

// ─── Intention Token ──────────────────────────────────────────────────────────

export interface IntentionToken {
  tokenId: string;
  farmerName: string;
  farmerMobile: string;
  village: string;
  district: string;
  acreage: number;
  cropId: CropId;
  cropName: string;
  fpoId: string;
  fpoName: string;
  season: SeasonType;
  year: number;
  issuedAt: string; // ISO timestamp
  expiresAt: string;
  qrPayload: string;
  status: 'pending' | 'confirmed' | 'fulfilled';
}

// ─── Market ───────────────────────────────────────────────────────────────────

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string | number;
  max_price: string | number;
  modal_price: string | number;
}

export interface MarketPrice {
  cropId: CropId;
  districtName: string;
  mspPerKg: number;
  arrivalPricePerKg: number;
  effectivePricePerKg: number; // max(msp, arrival)
  updatedAt: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

// ─── User & App State ─────────────────────────────────────────────────────────

export interface UserPreferences {
  language: LanguageCode;
  farmerName: string;
  farmerMobile: string;
  village: string;
}

export interface FarmerIngestionContext {
  location: LocationMeta | null;
  soilProfile: SoilProfile | null;
  acreage: number;
  irrigationType: IrrigationType;
  weather: WeatherData | null;
}

export interface AppState {
  preferences: UserPreferences;
  ingestionContext: FarmerIngestionContext;
  recommendations: CropRecommendation[];
  isEngineRunning: boolean;
  engineError: string | null;
  selectedFPO: FPOEntity | null;
  intentionToken: IntentionToken | null;
}

// ─── Authentication ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  department?: string;
  designation?: string;
}

// ─── Weather & Soil ───────────────────────────────────────────────────────────────

export interface ProfitChartDataPoint {
  year: string;
  paddy: number;
  sugarcane: number;
  soybean: number;
  mustard: number;
  groundnut: number;
}

export interface WaterChartDataPoint {
  crop: string;
  waterMm: number;
  saved: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface NominatimReverseResult {
  address: {
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
  };
  display_name: string;
}

// ─── Voice ────────────────────────────────────────────────────────────────────

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
}

export interface SpeechConfig {
  language: LanguageCode;
  rate: number;
  pitch: number;
  volume: number;
}
