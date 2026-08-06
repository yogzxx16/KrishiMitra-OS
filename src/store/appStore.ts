// ============================================================
// KrishiMitra OS — Zustand Global App Store
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  CropRecommendation,
  FarmerIngestionContext,
  FPOEntity,
  IntentionToken,
  IrrigationType,
  LanguageCode,
  LocationMeta,
  RoleType,
  SoilProfile,
  WeatherData,
} from '../types';

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_INGESTION: FarmerIngestionContext = {
  location: null,
  soilProfile: null,
  acreage: 2.0,
  irrigationType: 'rainfed',
  weather: null,
};

const INITIAL_STATE: AppState = {
  preferences: {
    language: 'en',
    farmerName: '',
    farmerMobile: '',
    village: '',
  },
  ingestionContext: INITIAL_INGESTION,
  recommendations: [],
  isEngineRunning: false,
  engineError: null,
  selectedFPO: null,
  intentionToken: null,
};

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AppStore extends AppState {
  // Role & Preferences
  setLanguage: (lang: LanguageCode) => void;
  setFarmerProfile: (name: string, mobile: string, village: string) => void;

  // Ingestion Context
  setLocation: (location: LocationMeta) => void;
  setSoilProfile: (soil: SoilProfile) => void;
  setAcreage: (acres: number) => void;
  setIrrigationType: (type: IrrigationType) => void;
  setWeather: (weather: WeatherData) => void;
  resetIngestion: () => void;

  // Engine State
  setRecommendations: (recs: CropRecommendation[]) => void;
  setEngineRunning: (running: boolean) => void;
  setEngineError: (err: string | null) => void;

  // Market / FPO
  setSelectedFPO: (fpo: FPOEntity | null) => void;
  setIntentionToken: (token: IntentionToken | null) => void;
}

// ─── Store Creation ───────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      // ── Preferences ─────────────────────────────────────────────────────────

      setLanguage: (language) =>
        set((s) => ({ preferences: { ...s.preferences, language } })),

      setFarmerProfile: (farmerName, farmerMobile, village) =>
        set((s) => ({
          preferences: { ...s.preferences, farmerName, farmerMobile, village },
        })),

      // ── Ingestion ────────────────────────────────────────────────────────────

      setLocation: (location) =>
        set((s) => ({
          ingestionContext: { ...s.ingestionContext, location },
        })),

      setSoilProfile: (soilProfile) =>
        set((s) => ({
          ingestionContext: { ...s.ingestionContext, soilProfile },
        })),

      setAcreage: (acreage) =>
        set((s) => ({
          ingestionContext: { ...s.ingestionContext, acreage },
        })),

      setIrrigationType: (irrigationType) =>
        set((s) => ({
          ingestionContext: { ...s.ingestionContext, irrigationType },
        })),

      setWeather: (weather) =>
        set((s) => ({
          ingestionContext: { ...s.ingestionContext, weather },
        })),

      resetIngestion: () =>
        set({ ingestionContext: INITIAL_INGESTION, recommendations: [], engineError: null }),

      // ── Engine ───────────────────────────────────────────────────────────────

      setRecommendations: (recommendations) => set({ recommendations }),
      setEngineRunning: (isEngineRunning) => set({ isEngineRunning }),
      setEngineError: (engineError) => set({ engineError }),

      // ── Market ───────────────────────────────────────────────────────────────

      setSelectedFPO: (selectedFPO) => set({ selectedFPO }),
      setIntentionToken: (intentionToken) => set({ intentionToken }),
    }),
    {
      name: 'krishimitra-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
