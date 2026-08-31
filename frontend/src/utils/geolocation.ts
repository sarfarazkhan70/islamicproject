/**
 * BROWSER GEOLOCATION UTILITY
 * ==============================================================================
 * Privacy-preserving, one-time geolocation lookup with graceful error handling
 * and offline closest city matching.
 * ==============================================================================
 */

import { LocationInfo } from '../core/prayerEngine/types.js';
import { GLOBAL_CITIES } from '../core/prayerEngine/cities.js';
import { getSystemTimezone } from './timezone.js';

export interface GeolocationResult {
  success: boolean;
  location?: LocationInfo;
  errorCode?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
  errorMessage?: string;
}

/**
 * Finds the nearest known city in our offline database to the given coordinates
 */
export function findNearestKnownCity(lat: number, lng: number): LocationInfo {
  let nearestCity = GLOBAL_CITIES[0];
  let minDistance = Infinity;

  for (const city of GLOBAL_CITIES) {
    const dLat = city.latitude - lat;
    const dLng = city.longitude - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      nearestCity = city;
    }
  }

  return {
    ...nearestCity,
    latitude: lat,
    longitude: lng,
    isAutoDetected: true,
  };
}

/**
 * Requests the user's current GPS position via navigator.geolocation
 */
export async function requestCurrentLocation(): Promise<GeolocationResult> {
  if (!navigator.geolocation) {
    return {
      success: false,
      errorCode: 'UNSUPPORTED',
      errorMessage: 'Geolocation is not supported by your browser.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const tz = getSystemTimezone();

        // Match with nearest known city for friendly label and timezone
        const nearest = findNearestKnownCity(lat, lng);

        resolve({
          success: true,
          location: {
            city: nearest.city,
            country: nearest.country,
            latitude: lat,
            longitude: lng,
            timezone: tz || nearest.timezone,
            isAutoDetected: true,
          },
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
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes cache
      }
    );
  });
}
