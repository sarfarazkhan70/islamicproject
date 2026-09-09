/**
 * BROWSER GEOLOCATION UTILITY
 * ==============================================================================
 * Privacy-preserving, high-accuracy geolocation lookup with reverse geocoding,
 * permission querying, accuracy reporting, and graceful error handling.
 * ==============================================================================
 */

import { LocationInfo } from '../core/prayerEngine/types.js';
import { reverseGeocodeCoordinates, findNearestKnownCity } from './reverseGeocoding.js';
import { getSystemTimezone } from './timezone.js';

export interface CentralLocationData extends LocationInfo {
  accuracy: number | null;
  locality?: string;
  district?: string;
  state?: string;
  displayName: string;
  timestamp: number;
  isLowAccuracy: boolean;
}

export interface GeolocationResult {
  success: boolean;
  location?: LocationInfo;
  data?: CentralLocationData;
  accuracyMeters?: number;
  isLowAccuracy?: boolean;
  errorCode?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
  errorMessage?: string;
}

/**
 * Checks browser permission state for geolocation
 */
export async function checkGeolocationPermission(): Promise<
  'prompt' | 'granted' | 'denied' | 'unsupported'
> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.permissions ||
    !navigator.permissions.query
  ) {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
      ? 'prompt'
      : 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state as 'prompt' | 'granted' | 'denied';
  } catch {
    return 'prompt';
  }
}

/**
 * Requests fresh, high-accuracy GPS position with robust fallback and reverse geocoded human name
 */
export async function requestCurrentAutoLocation(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}): Promise<GeolocationResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      errorCode: 'UNSUPPORTED',
      errorMessage: 'Geolocation is not supported by your browser.',
    };
  }

  const timeout = options?.timeout ?? 10000;
  const maxAge = options?.maximumAge ?? 60000;

  // Helper to run getCurrentPosition as a promise
  const tryGetPosition = (highAccuracy: boolean, t: number): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: highAccuracy,
        timeout: t,
        maximumAge: maxAge,
      });
    });
  };

  let position: GeolocationPosition | null = null;
  let isPermissionDenied = false;

  // Tier 1: Attempt with high accuracy (GPS)
  try {
    position = await tryGetPosition(true, timeout);
  } catch (err: any) {
    if (err && err.code === 1) {
      // PERMISSION_DENIED
      isPermissionDenied = true;
    } else {
      // If high-accuracy timed out or hardware unavailable, fallback to standard Wi-Fi/IP location
      try {
        position = await tryGetPosition(false, 10000);
      } catch (fallbackErr: any) {
        if (fallbackErr && fallbackErr.code === 1) {
          isPermissionDenied = true;
        }
      }
    }
  }

  if (isPermissionDenied) {
    return {
      success: false,
      errorCode: 'PERMISSION_DENIED',
      errorMessage: 'Location permission was denied. Please allow location access in your browser or select your city manually.',
    };
  }

  if (!position) {
    return {
      success: false,
      errorCode: 'TIMEOUT',
      errorMessage: 'Unable to acquire GPS location. Please check your connection and click to retry, or select manually.',
    };
  }

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;
  const isLow = accuracy !== null && accuracy > 200;

  // Perform reverse geocoding with graceful fallback
  let geocode;
  try {
    geocode = await reverseGeocodeCoordinates(lat, lng);
  } catch {
    const nearest = findNearestKnownCity(lat, lng);
    geocode = {
      city: nearest?.city || 'Current Location',
      country: nearest?.country || '',
      displayName: nearest ? `${nearest.city}, ${nearest.country}` : `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
      timezone: getSystemTimezone() || 'UTC',
      source: 'fallback' as const,
    };
  }

  const tz = geocode.timezone || getSystemTimezone() || 'UTC';

  const centralData: CentralLocationData = {
    city: geocode.city || 'Current Location',
    country: geocode.country || '',
    locality: geocode.locality,
    district: geocode.district,
    state: geocode.state,
    displayName: geocode.displayName || `${geocode.city}, ${geocode.country}`,
    latitude: lat,
    longitude: lng,
    accuracy,
    timezone: tz,
    timestamp: Date.now(),
    isAutoDetected: true,
    isLowAccuracy: isLow,
  };

  return {
    success: true,
    data: centralData,
    location: {
      city: geocode.city,
      country: geocode.country,
      latitude: lat,
      longitude: lng,
      timezone: tz,
      isAutoDetected: true,
    },
    accuracyMeters: accuracy || undefined,
    isLowAccuracy: isLow,
  };
}

/**
 * Backward compatibility wrappers
 */
export async function requestCurrentLocation(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}): Promise<GeolocationResult> {
  return requestCurrentAutoLocation(options);
}

export async function requestHighAccuracyLocation(): Promise<GeolocationResult> {
  return requestCurrentAutoLocation({
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
  });
}

export { findNearestKnownCity };



