// ============================================================
// KrishiMitra OS — useGeolocation Custom Hook
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoCoordinates } from '../types';

interface GeolocationState {
  coordinates: GeoCoordinates | null;
  isLocating: boolean;
  error: string | null;
  isSupported: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => void;
  clearError: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLocating: false,
    error: null,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  });

  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(() => {
    if (!state.isSupported) {
      setState((s) => ({
        ...s,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setState((s) => ({ ...s, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((s) => ({
          ...s,
          isLocating: false,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          error: null,
        }));
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access denied. Using Latur fallback.',
          2: 'Location unavailable. Using Latur fallback.',
          3: 'Location request timed out. Using Latur fallback.',
        };
        setState((s) => ({
          ...s,
          isLocating: false,
          coordinates: { lat: 18.4088, lng: 76.5604, accuracy: 100 }, // Latur fallback
          error: messages[err.code] ?? 'Unknown location error. Using Latur fallback.',
        }));
      },
      GEO_OPTIONS
    );
  }, [state.isSupported]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, requestLocation, clearError };
}
