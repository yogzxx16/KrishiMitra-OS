// ============================================================
// KrishiMitra OS — Formatters & Utilities
// ============================================================

import i18next from 'i18next';

// Helper to get locale string based on active language
function getLocale(): string {
  const lang = i18next.resolvedLanguage || 'en';
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'ta') return 'ta-IN';
  return 'en-IN';
}

// ─── Currency ─────────────────────────────────────────────────────────────────

function getINRFormatter() {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

function getINRCompactFormatter() {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });
}

export function formatINR(amount: number): string {
  return getINRFormatter().format(amount);
}

export function formatINRCompact(amount: number): string {
  return getINRCompactFormatter().format(amount);
}

export function formatINRLakhs(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  }
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(2)} L`;
  }
  return formatINR(amount);
}

// ─── Volume ───────────────────────────────────────────────────────────────────

export function formatCubicMeters(m3: number): string {
  const loc = getLocale();
  if (m3 >= 1_000_000) return `${(m3 / 1_000_000).toLocaleString(loc, { maximumFractionDigits: 2 })}M m³`;
  if (m3 >= 1_000) return `${(m3 / 1_000).toLocaleString(loc, { maximumFractionDigits: 1 })}K m³`;
  return `${m3.toLocaleString(loc)} m³`;
}

export function formatMilliMeters(mm: number): string {
  return `${mm.toLocaleString(getLocale())} mm`;
}

// ─── Weight ───────────────────────────────────────────────────────────────────

export function formatKg(kg: number): string {
  const loc = getLocale();
  if (kg >= 1000) return `${(kg / 1000).toLocaleString(loc, { maximumFractionDigits: 2 })} MT`;
  return `${kg.toLocaleString(loc)} kg`;
}

// ─── Distance ─────────────────────────────────────────────────────────────────

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ─── Percentage ──────────────────────────────────────────────────────────────

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ─── Date / Time ──────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(getLocale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(getLocale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

// ─── Token ID Generator ───────────────────────────────────────────────────────

export function generateTokenId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KM-${timestamp}-${random}`;
}

// ─── Coordinate Formatter ────────────────────────────────────────────────────

export function formatCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

// ─── Clamp ────────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─── Acreage Display ─────────────────────────────────────────────────────────

export function formatAcreage(acres: number): string {
  const hectares = acres * 0.404686;
  return `${acres.toFixed(1)} ac (${hectares.toFixed(2)} ha)`;
}
