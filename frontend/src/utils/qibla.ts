/**
 * QIBLA GREAT-CIRCLE BEARING & DISTANCE ENGINE
 * ==============================================================================
 * Accurate spherical trigonometry calculations for Kaaba direction & distance.
 * Kaaba Coordinates: Latitude 21.42250° N, Longitude 39.82620° E
 * ==============================================================================
 */

export const KAABA_COORDINATES = {
  latitude: 21.4225,
  longitude: 39.8262,
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

const toRadians = (deg: number) => (deg * Math.PI) / 180;
const toDegrees = (rad: number) => (rad * 180) / Math.PI;

export function calculateQiblaBearing(latitude: number, longitude: number): number {
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

export function calculateKaabaDistanceKm(latitude: number, longitude: number): number {
  const R = 6371;
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
  const index = Math.round(bearing / 22.5) % 16;
  return points[index];
}

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
