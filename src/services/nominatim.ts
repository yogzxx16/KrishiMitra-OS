// ============================================================
// KrishiMitra OS — Nominatim Reverse Geocoding Service
// ============================================================

import type { ApiResponse, GeoCoordinates, LocationMeta, NominatimReverseResult } from '../types';
import { API_ENDPOINTS } from '../config/constants';

// ─── Reverse Geocode ──────────────────────────────────────────────────────────

export async function reverseGeocode(
  coords: GeoCoordinates
): Promise<ApiResponse<LocationMeta>> {
  try {
    const url = new URL(API_ENDPOINTS.nominatimReverse);
    url.searchParams.set('lat', coords.lat.toString());
    url.searchParams.set('lon', coords.lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('zoom', '12');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'KrishiMitraOS/1.0 (sih2026@krishimitra.in)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const raw: NominatimReverseResult = await response.json();
    const addr = raw.address;

    const district =
      addr.county ?? addr.state_district ?? addr.city ?? 'Unknown District';
    const block =
      addr.suburb ?? addr.town ?? addr.village ?? 'Unknown Block';
    const state = addr.state ?? 'Maharashtra';

    const location: LocationMeta = {
      coordinates: coords,
      district,
      block,
      state,
      pincode: addr.postcode,
      displayName: raw.display_name,
    };

    return {
      data: location,
      success: true,
      message: 'Location resolved successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Graceful fallback with mock data
    const fallback = getMockLocation(coords);
    return {
      data: fallback,
      success: false,
      message: error instanceof Error ? error.message : 'Geocoding failed',
      timestamp: new Date().toISOString(),
    };
  }
}

// ─── Mock Fallback ────────────────────────────────────────────────────────────

function getMockLocation(coords: GeoCoordinates): LocationMeta {
  // Rough bounding box matching Maharashtra districts
  let district = 'Nagpur';
  let block = 'Kamptee';

  if (coords.lat < 19.5 && coords.lng > 77.0) {
    district = 'Nanded';
    block = 'Bhokar';
  } else if (coords.lat < 19.5 && coords.lng > 76.0) {
    district = 'Latur';
    block = 'Udgir';
  } else if (coords.lat > 21.0 && coords.lng < 75.5) {
    district = 'Dhule';
    block = 'Shirpur';
  } else if (coords.lat < 18.5) {
    district = 'Solapur';
    block = 'Barshi';
  }

  return {
    coordinates: coords,
    district,
    block,
    state: 'Maharashtra',
    displayName: `${block}, ${district}, Maharashtra`,
  };
}
