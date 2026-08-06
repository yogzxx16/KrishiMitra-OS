// ============================================================
// KrishiMitra OS — FPO Network Service
// ============================================================

import type { ApiResponse, FPOEntity, GeoCoordinates } from '../types';
import { MOCK_FPO_SEED_DATA } from '../config/constants';

// ─── Distance Calculation (Haversine) ────────────────────────────────────────

function haversineDistanceKm(a: GeoCoordinates, b: GeoCoordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const chord =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function fetchNearbyFPOs(
  userCoords: GeoCoordinates,
  radiusKm = 150
): Promise<ApiResponse<FPOEntity[]>> {
  await new Promise((r) => setTimeout(r, 400));

  let fpos: FPOEntity[] = MOCK_FPO_SEED_DATA.map((raw) => ({
    ...raw,
    procurementCrops: raw.procurementCrops as FPOEntity['procurementCrops'],
    supportedLanguages: raw.supportedLanguages as FPOEntity['supportedLanguages'],
    distanceKm: Math.round(haversineDistanceKm(userCoords, raw.coordinates) * 10) / 10,
  })).filter((f) => f.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // If outside Maharashtra (e.g. Tamil Nadu) and no seed data matches, dynamically mock local FPOs
  if (fpos.length === 0) {
    fpos = [
      {
        id: 'fpo-dyn-1',
        name: 'Regional Farmer Producer Co.',
        district: 'Local District',
        block: 'Local Block',
        state: 'Local State',
        coordinates: { lat: userCoords.lat + 0.05, lng: userCoords.lng + 0.05 },
        distanceKm: Math.round(haversineDistanceKm(userCoords, { lat: userCoords.lat + 0.05, lng: userCoords.lng + 0.05 }) * 10) / 10,
        memberCount: 450,
        procurementCrops: ['soybean', 'groundnut', 'paddy', 'wheat'] as FPOEntity['procurementCrops'],
        contactPhone: '+91-8888888888',
        registrationNumber: 'FPO-DYN-001',
        supportedLanguages: ['en', 'hi'] as FPOEntity['supportedLanguages'],
        rating: 4.5,
      },
      {
        id: 'fpo-dyn-2',
        name: 'Agri Collective Ltd.',
        district: 'Local District',
        block: 'Local Block',
        state: 'Local State',
        coordinates: { lat: userCoords.lat - 0.03, lng: userCoords.lng + 0.04 },
        distanceKm: Math.round(haversineDistanceKm(userCoords, { lat: userCoords.lat - 0.03, lng: userCoords.lng + 0.04 }) * 10) / 10,
        memberCount: 320,
        procurementCrops: ['mustard', 'sunflower', 'sugarcane'] as FPOEntity['procurementCrops'],
        contactPhone: '+91-7777777777',
        registrationNumber: 'FPO-DYN-002',
        supportedLanguages: ['en'] as FPOEntity['supportedLanguages'],
        rating: 4.2,
      },
      {
        id: 'fpo-dyn-3',
        name: 'Local Growers Association',
        district: 'Local District',
        block: 'Local Block',
        state: 'Local State',
        coordinates: { lat: userCoords.lat + 0.08, lng: userCoords.lng - 0.02 },
        distanceKm: Math.round(haversineDistanceKm(userCoords, { lat: userCoords.lat + 0.08, lng: userCoords.lng - 0.02 }) * 10) / 10,
        memberCount: 850,
        procurementCrops: ['cotton', 'soybean', 'groundnut'] as FPOEntity['procurementCrops'],
        contactPhone: '+91-9999999999',
        registrationNumber: 'FPO-DYN-003',
        supportedLanguages: ['en', 'hi'] as FPOEntity['supportedLanguages'],
        rating: 4.8,
      }
    ].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return {
    data: fpos,
    success: true,
    message: `Found ${fpos.length} FPOs within ${radiusKm}km`,
    timestamp: new Date().toISOString(),
  };
}

export async function fetchFPOById(id: string): Promise<ApiResponse<FPOEntity | null>> {
  await new Promise((r) => setTimeout(r, 200));

  const raw = MOCK_FPO_SEED_DATA.find((f) => f.id === id);
  if (!raw) {
    return {
      data: null,
      success: false,
      message: 'FPO not found',
      timestamp: new Date().toISOString(),
    };
  }

  const fpo: FPOEntity = {
    ...raw,
    procurementCrops: raw.procurementCrops as FPOEntity['procurementCrops'],
    supportedLanguages: raw.supportedLanguages as FPOEntity['supportedLanguages'],
    distanceKm: 0,
  };

  return {
    data: fpo,
    success: true,
    message: 'FPO fetched',
    timestamp: new Date().toISOString(),
  };
}
