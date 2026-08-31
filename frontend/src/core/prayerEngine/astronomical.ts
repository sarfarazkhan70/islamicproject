/**
 * ASTRONOMICAL SOLAR POSITION CALCULATION ENGINE
 * ==============================================================================
 * Rigorous implementation of solar coordinates, Equation of Time, Solar Transit,
 * and Hour Angle calculations based on Jean Meeus Astronomical Algorithms
 * and standard international solar ephemerides.
 * ==============================================================================
 */

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

/** Standard solar refraction angle at horizon (-0.8333 degrees / 50 arcminutes) */
export const STANDARD_HORIZON_REFRACTION_DEG = -0.8333;

export function degToRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

export function radToDeg(rad: number): number {
  return rad * RAD_TO_DEG;
}

export function normalizeAngle(deg: number): number {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

export function normalizeHours(hours: number): number {
  let h = hours % 24;
  if (h < 0) h += 24;
  return h;
}

/**
 * Calculates Julian Day Number for a given UTC calendar date
 */
export function getJulianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5
  );
}

export interface SolarCoordinates {
  declinationRad: number;
  declinationDeg: number;
  equationOfTimeMinutes: number;
  solarNoonUtcHours: number;
}

/**
 * Calculates Sun Declination and Equation of Time for a given Julian Day
 */
export function calculateSolarCoordinates(julianDay: number): SolarCoordinates {
  const d = julianDay - 2451545.0; // Days since J2000.0
  const t = d / 36525.0; // Julian centuries

  // Geometric Mean Longitude of the Sun (degrees)
  const l0 = normalizeAngle(280.46646 + 36000.76983 * t + 0.0003032 * t * t);

  // Mean Anomaly of the Sun (degrees)
  const m = normalizeAngle(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  const mRad = degToRad(m);

  // Sun's Equation of Center (degrees)
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mRad) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * mRad) +
    0.000289 * Math.sin(3 * mRad);

  // Sun's True Longitude (degrees)
  const trueLong = l0 + c;

  // Sun's Apparent Longitude (degrees)
  const omega = 125.04 - 1934.136 * t;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
  const lambdaRad = degToRad(lambda);

  // Mean Obliquity of the Ecliptic (degrees)
  const eps0 =
    23 +
    (26 +
      (21.448 -
        t * (46.815 + t * (0.00059 - t * 0.001813)))) /
      60;

  // Corrected Obliquity (degrees)
  const eps = eps0 + 0.00256 * Math.cos(degToRad(omega));
  const epsRad = degToRad(eps);

  // Sun Declination (radians & degrees)
  const sinDecl = Math.sin(epsRad) * Math.sin(lambdaRad);
  const declinationRad = Math.asin(sinDecl);
  const declinationDeg = radToDeg(declinationRad);

  // Eccentricity of Earth's orbit
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const y = Math.tan(epsRad / 2) * Math.tan(epsRad / 2);

  // Equation of Time (minutes)
  const l0Rad = degToRad(l0);
  const eotRad =
    y * Math.sin(2 * l0Rad) -
    2 * e * Math.sin(mRad) +
    4 * e * y * Math.sin(mRad) * Math.cos(2 * l0Rad) -
    0.5 * y * y * Math.sin(4 * l0Rad) -
    1.25 * e * e * Math.sin(2 * mRad);
  const equationOfTimeMinutes = 4 * radToDeg(eotRad);

  // Solar noon transit in UTC hours (standard 12:00 UTC base)
  const solarNoonUtcHours = 12 - equationOfTimeMinutes / 60;

  return {
    declinationRad,
    declinationDeg,
    equationOfTimeMinutes,
    solarNoonUtcHours,
  };
}

/**
 * Calculates local solar transit (solar noon) for a specific longitude and timezone offset
 */
export function calculateSolarTransitHours(
  longitude: number,
  timezoneOffsetHours: number,
  equationOfTimeMinutes: number
): number {
  // Transit = 12 + Timezone - (Longitude / 15) - (Equation of Time / 60)
  return 12 + timezoneOffsetHours - longitude / 15 - equationOfTimeMinutes / 60;
}

export interface HourAngleResult {
  hourAngleHours: number;
  isPolarDay: boolean;
  isPolarNight: boolean;
}

/**
 * Calculates the solar hour angle (in decimal hours) for a given altitude angle
 * @param altitudeDeg Target solar altitude (negative for below horizon)
 * @param latitudeDeg Observer's latitude in degrees
 * @param declinationRad Sun's declination in radians
 */
export function calculateHourAngle(
  altitudeDeg: number,
  latitudeDeg: number,
  declinationRad: number
): HourAngleResult {
  const latRad = degToRad(latitudeDeg);
  const altRad = degToRad(altitudeDeg);

  // cos(H) = (sin(alt) - sin(lat)*sin(decl)) / (cos(lat)*cos(decl))
  const cosH =
    (Math.sin(altRad) - Math.sin(latRad) * Math.sin(declinationRad)) /
    (Math.cos(latRad) * Math.cos(declinationRad));

  if (cosH > 1) {
    // Sun never reaches this altitude (Polar night)
    return { hourAngleHours: 0, isPolarDay: false, isPolarNight: true };
  }
  if (cosH < -1) {
    // Sun never dips below this altitude (Polar day)
    return { hourAngleHours: 12, isPolarDay: true, isPolarNight: false };
  }

  const hRad = Math.acos(cosH);
  const hourAngleHours = radToDeg(hRad) / 15;
  return { hourAngleHours, isPolarDay: false, isPolarNight: false };
}

/**
 * Calculates Asr Solar Altitude Angle based on Madhhab shadow factor
 * @param shadowMultiplier 1 for Shafi'i/Maliki/Hanbali, 2 for Hanafi
 * @param latitudeDeg Observer's latitude
 * @param declinationDeg Sun's declination
 */
export function calculateAsrAltitudeDeg(
  shadowMultiplier: 1 | 2,
  latitudeDeg: number,
  declinationDeg: number
): number {
  // Shadow length at zenith = tan(|latitude - declination|)
  const zenithDistanceDeg = Math.abs(latitudeDeg - declinationDeg);
  const noonShadowLength = Math.tan(degToRad(zenithDistanceDeg));
  
  // Total shadow = shadowMultiplier * objectLength (1) + noonShadowLength
  const totalShadowLength = shadowMultiplier + noonShadowLength;

  // Altitude angle = arccot(totalShadowLength) = atan(1 / totalShadowLength)
  const asrAltitudeRad = Math.atan(1 / totalShadowLength);
  return radToDeg(asrAltitudeRad);
}
