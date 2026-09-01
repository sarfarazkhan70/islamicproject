/**
 * QIBLA GREAT-CIRCLE BEARING & DISTANCE ENGINE
 * ==============================================================================
 * Accurate spherical trigonometry calculations for Kaaba direction & distance.
 * Exact Kaaba Coordinates: Latitude 21.422487° N, Longitude 39.826206° E
 * Bearing measured clockwise from TRUE NORTH (0° = N, 90° = E, 180° = S, 270° = W).
 * ==============================================================================
 */

export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export interface QiblaResult {
  bearing: number;
  bearingFormatted: string;
  directionCompass: string;
  distanceKm: number;
  distanceMiles: number;
  userCoordinates: {
    latitude: number;
    longitude: number;
  };
  kaabaCoordinates: {
    latitude: number;
    longitude: number;
  };
}

export const toRadians = (deg: number): number => (deg * Math.PI) / 180;
export const toDegrees = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Calculates initial forward Great-Circle bearing from user coordinates to Kaaba.
 * Formula:
 *   Δλ = λ2 - λ1
 *   y = sin(Δλ) * cos(φ2)
 *   x = cos(φ1) * sin(φ2) − sin(φ1) * cos(φ2) * cos(Δλ)
 *   θ = atan2(y, x)
 *   bearing = (θ * 180 / π + 360) % 360
 */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  // Edge case: if coordinates are identical to Kaaba
  const latDiff = Math.abs(latitude - KAABA_COORDINATES.latitude);
  const lngDiff = Math.abs(longitude - KAABA_COORDINATES.longitude);
  if (latDiff < 1e-6 && lngDiff < 1e-6) {
    return 0;
  }

  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = toDegrees(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return Math.round(bearing * 10) / 10;
}

/**
 * Calculates Great-Circle distance to Kaaba using Haversine formula
 */
export function calculateKaabaDistanceKm(latitude: number, longitude: number): number {
  const R = 6371; // Earth mean radius in kilometers
  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaPhi = toRadians(KAABA_COORDINATES.latitude - latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves 16-point cardinal compass text (e.g. N, NNE, NE, ENE, E... WNW, NW, NNW)
 */
export function getCompassCardinal(bearing: number): string {
  const points = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const normalized = ((bearing % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return points[index];
}

/**
 * Calculates the relative arrow angle on screen:
 * Relative angle = (Qibla Bearing - Device Heading) normalized to 0° - 360°.
 * 0° points straight UP to top of device (towards Qibla).
 */
export function getRelativeQiblaAngle(qiblaBearing: number, deviceHeading: number): number {
  const rel = ((qiblaBearing - deviceHeading) % 360 + 360) % 360;
  return Math.round(rel * 10) / 10;
}

/**
 * Determines whether device heading is aligned with Qibla bearing within threshold (default ±3°)
 */
export function isAlignedWithQibla(
  qiblaBearing: number,
  deviceHeading: number,
  thresholdDeg = 3
): boolean {
  // Shortest angular difference on circle [-180, +180]
  const diff = Math.abs(((qiblaBearing - deviceHeading + 540) % 360) - 180);
  return diff <= thresholdDeg;
}

/**
 * Unwraps an angle (0-360) relative to a continuous tracking angle
 * to prevent 360° spin reversals during CSS animations.
 */
export function unwrapAngle(targetAngle: number, currentAngle: number): number {
  const targetNorm = ((targetAngle % 360) + 360) % 360;
  const currentNorm = ((currentAngle % 360) + 360) % 360;
  let diff = targetNorm - currentNorm;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return currentAngle + diff;
}

/**
 * Computes complete Qibla calculation bundle
 */
export function getQiblaInfo(latitude: number, longitude: number): QiblaResult {
  const bearing = calculateQiblaBearing(latitude, longitude);
  const distanceKm = calculateKaabaDistanceKm(latitude, longitude);
  const distanceMiles = Math.round(distanceKm * 0.621371);
  const directionCompass = getCompassCardinal(bearing);

  return {
    bearing,
    bearingFormatted: `${bearing.toFixed(1)}°`,
    directionCompass,
    distanceKm,
    distanceMiles,
    userCoordinates: { latitude, longitude },
    kaabaCoordinates: KAABA_COORDINATES,
  };
}

