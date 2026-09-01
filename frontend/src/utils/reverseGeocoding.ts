/**
 * REVERSE GEOCODING & LOCATION NAME FORMATTER
 * ==============================================================================
 * Multi-tier reverse geocoding engine with offline fallback and intelligent,
 * privacy-preserving location name formatting.
 * Resolves: Locality, City, District, State, Country.
 * Example outputs:
 *   - "Roorkee, Uttarakhand, India"
 *   - "Civil Lines, Roorkee, Uttarakhand, India"
 *   - "New Delhi, Delhi, India"
 * ==============================================================================
 */

import { GLOBAL_CITIES } from '../core/prayerEngine/cities.js';
import { getSystemTimezone } from './timezone.js';

export interface ReverseGeocodeResult {
  locality?: string;
  city: string;
  district?: string;
  state?: string;
  country: string;
  displayName: string;
  timezone: string;
  source: 'bigdatacloud' | 'nominatim' | 'offline_database' | 'fallback';
}

/**
 * Removes duplicate segments and formats clean, human-readable display name.
 * Omits full house/street numbers for privacy.
 */
export function formatLocationDisplayName(parts: {
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
}): string {
  const rawSegments = [
    parts.locality?.trim(),
    parts.city?.trim(),
    parts.district?.trim(),
    parts.state?.trim(),
    parts.country?.trim(),
  ].filter((s): s is string => Boolean(s && s.length > 0));

  // Deduplicate case-insensitively while preserving order
  const uniqueSegments: string[] = [];
  const seenLower = new Set<string>();

  for (const seg of rawSegments) {
    const lower = seg.toLowerCase();
    // Skip if already seen or if a word is entirely contained in another adjacent segment
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      uniqueSegments.push(seg);
    }
  }

  // If city and district are identical, only keep city
  if (
    parts.city &&
    parts.district &&
    parts.city.toLowerCase() === parts.district.toLowerCase()
  ) {
    const distIdx = uniqueSegments.findIndex(
      (s) => s.toLowerCase() === parts.district!.toLowerCase()
    );
    if (distIdx > 0) {
      uniqueSegments.splice(distIdx, 1);
    }
  }

  // If locality and city are identical, only keep city
  if (
    parts.locality &&
    parts.city &&
    parts.locality.toLowerCase() === parts.city.toLowerCase()
  ) {
    const locIdx = uniqueSegments.findIndex(
      (s) => s.toLowerCase() === parts.locality!.toLowerCase()
    );
    if (locIdx >= 0) {
      uniqueSegments.splice(locIdx, 1);
      uniqueSegments.unshift(parts.city);
    }
  }

  if (uniqueSegments.length === 0) {
    return 'Current Location';
  }

  return uniqueSegments.join(', ');
}

/**
 * Finds the nearest known city from our curated offline database
 */
export function findNearestKnownCity(lat: number, lng: number) {
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

  return nearestCity;
}

/**
 * Tier 1: BigDataCloud Reverse Geocoding API (Fast, Free, Client-side CORS)
 */
async function fetchBigDataCloud(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = await response.json();

    const locality = data.locality || undefined;
    const city = data.city || data.locality || 'Current Location';
    const state = data.principalSubdivision || undefined;
    const country = data.countryName || '';

    // Extract district if available in administrative hierarchy
    let district: string | undefined = undefined;
    if (Array.isArray(data.localityInfo?.administrative)) {
      const adminList = data.localityInfo.administrative;
      const districtObj = adminList.find(
        (a: any) =>
          a.adminLevel === 6 ||
          a.description?.toLowerCase().includes('district') ||
          (a.name && a.name !== city && a.name !== state && a.name !== country)
      );
      if (districtObj && districtObj.name) {
        district = districtObj.name;
      }
    }

    const displayName = formatLocationDisplayName({
      locality: locality !== city ? locality : undefined,
      city,
      district: district !== city && district !== state ? district : undefined,
      state,
      country,
    });

    const timezone = getSystemTimezone() || 'UTC';

    return {
      locality,
      city,
      district,
      state,
      country,
      displayName,
      timezone,
      source: 'bigdatacloud',
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Tier 2: OpenStreetMap Nominatim Reverse Geocoding
 */
async function fetchNominatim(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = await response.json();
    const addr = data.address || {};

    const locality = addr.suburb || addr.neighbourhood || addr.village || undefined;
    const city = addr.city || addr.town || addr.municipality || addr.county || 'Current Location';
    const district = addr.state_district || addr.county || undefined;
    const state = addr.state || undefined;
    const country = addr.country || '';

    const displayName = formatLocationDisplayName({
      locality: locality !== city ? locality : undefined,
      city,
      district: district !== city && district !== state ? district : undefined,
      state,
      country,
    });

    const timezone = getSystemTimezone() || 'UTC';

    return {
      locality,
      city,
      district,
      state,
      country,
      displayName,
      timezone,
      source: 'nominatim',
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Main reverse geocoding function with multi-tier fallbacks
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  // Try Tier 1: BigDataCloud
  const bdcResult = await fetchBigDataCloud(latitude, longitude);
  if (bdcResult && bdcResult.city && bdcResult.country) {
    return bdcResult;
  }

  // Try Tier 2: Nominatim
  const nomResult = await fetchNominatim(latitude, longitude);
  if (nomResult && nomResult.city && nomResult.country) {
    return nomResult;
  }

  // Try Tier 3: Curated Offline Database nearest city match
  const nearest = findNearestKnownCity(latitude, longitude);
  if (nearest) {
    const displayName = `${nearest.city}, ${nearest.country}`;
    return {
      city: nearest.city,
      country: nearest.country,
      displayName,
      timezone: nearest.timezone || getSystemTimezone() || 'UTC',
      source: 'offline_database',
    };
  }

  // Tier 4: Absolute Fallback
  return {
    city: 'Current Location',
    country: '',
    displayName: 'Current Location',
    timezone: getSystemTimezone() || 'UTC',
    source: 'fallback',
  };
}
