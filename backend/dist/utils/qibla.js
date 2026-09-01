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
export const toRadians = (deg) => (deg * Math.PI) / 180;
export const toDegrees = (rad) => (rad * 180) / Math.PI;
/**
 * Calculates the forward Great-Circle bearing from user coordinates to the Kaaba.
 * Formula:
 * θ = atan2(sin(Δλ) * cos(φ2), cos(φ1) * sin(φ2) − sin(φ1) * cos(φ2) * cos(Δλ))
 */
export function calculateQiblaBearing(latitude, longitude) {
    const latDiff = Math.abs(latitude - KAABA_COORDINATES.latitude);
    const lngDiff = Math.abs(longitude - KAABA_COORDINATES.longitude);
    if (latDiff < 1e-6 && lngDiff < 1e-6) {
        return 0;
    }
    const phi1 = toRadians(latitude);
    const phi2 = toRadians(KAABA_COORDINATES.latitude);
    const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);
    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    let bearing = toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;
    return Math.round(bearing * 10) / 10;
}
/**
 * Calculates the Great-Circle distance to the Kaaba using the Haversine formula.
 */
export function calculateKaabaDistanceKm(latitude, longitude) {
    const R = 6371; // Earth mean radius in kilometers
    const phi1 = toRadians(latitude);
    const phi2 = toRadians(KAABA_COORDINATES.latitude);
    const deltaPhi = toRadians(KAABA_COORDINATES.latitude - latitude);
    const deltaLambda = toRadians(KAABA_COORDINATES.longitude - longitude);
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}
/**
 * Resolves 16-point compass cardinal direction (e.g., N, NNE, NE, ENE, E...)
 */
export function getCompassCardinal(bearing) {
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
 * Calculates relative Qibla angle on device screen
 */
export function getRelativeQiblaAngle(qiblaBearing, deviceHeading) {
    const rel = ((qiblaBearing - deviceHeading) % 360 + 360) % 360;
    return Math.round(rel * 10) / 10;
}
/**
 * Determines whether device heading is aligned with Qibla bearing within threshold (default ±3°)
 */
export function isAlignedWithQibla(qiblaBearing, deviceHeading, thresholdDeg = 3) {
    const diff = Math.abs(((qiblaBearing - deviceHeading + 540) % 360) - 180);
    return diff <= thresholdDeg;
}
/**
 * Complete Qibla calculation bundle
 */
export function getQiblaInfo(latitude, longitude) {
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
