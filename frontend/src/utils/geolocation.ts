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
 * Requests fresh, high-accuracy GPS position with reverse geocoded human name
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

  const highAccuracy = options?.enableHighAccuracy ?? true;
  const timeout = options?.timeout ?? 12000;
  const maxAge = options?.maximumAge ?? 0;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy
          ? Math.round(position.coords.accuracy)
          : null;
        const isLow = accuracy !== null && accuracy > 200;

        // Perform multi-tier reverse geocoding
        const geocode = await reverseGeocodeCoordinates(lat, lng);
        const tz = geocode.timezone || getSystemTimezone() || 'UTC';

        const centralData: CentralLocationData = {
          city: geocode.city,
          country: geocode.country,
          locality: geocode.locality,
          district: geocode.district,
          state: geocode.state,
          displayName: geocode.displayName,
          latitude: lat,
          longitude: lng,
          accuracy,
          timezone: tz,
          timestamp: Date.now(),
          isAutoDetected: true,
          isLowAccuracy: isLow,
        };

        resolve({
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
        });
      },
      (error) => {
        let code: GeolocationResult['errorCode'] = 'POSITION_UNAVAILABLE';
        let msg = 'Unable to determine your location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            msg = 'Location permission was denied. You can select your city manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            msg = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            msg = 'Location request timed out. Please try again or select manually.';
            break;
        }

        resolve({
          success: false,
          errorCode: code,
          errorMessage: msg,
        });
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge: maxAge,
      }
    );
  });
}

/**
 * Backward compatibility wrapper
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
    timeout: 15000,
    maximumAge: 0,
  });
}

export { findNearestKnownCity };


