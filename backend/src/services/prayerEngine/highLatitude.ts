/**
 * HIGH LATITUDE PRAYER TIME ADJUSTMENT STRATEGIES
 * ==============================================================================
 * Methodologies for calculating Fajr and Isha in high-latitude regions (>48°N/S)
 * where the sun may not dip sufficiently below the horizon during summer.
 * ==============================================================================
 */

import { HighLatitudeRule } from './types.js';

export interface HighLatitudeAdjustmentResult {
  adjustedHours: number;
  wasAdjusted: boolean;
}

/**
 * Adjusts dawn (Fajr) or dusk (Isha) time using the selected high-latitude rule
 * @param eventType 'fajr' | 'isha'
 * @param calculatedHours The raw calculated hour (or undefined/NaN if sun doesn't reach angle)
 * @param sunriseHours Time of sunrise in hours
 * @param sunsetHours Time of sunset in hours
 * @param targetAngleDeg The convention's twilight angle (e.g. 18.0)
 * @param rule The selected HighLatitudeRule
 */
export function adjustHighLatitudeTime(
  eventType: 'fajr' | 'isha',
  calculatedHours: number,
  sunriseHours: number,
  sunsetHours: number,
  targetAngleDeg: number,
  rule: HighLatitudeRule = 'TwilightAngle'
): HighLatitudeAdjustmentResult {
  // Calculate total night duration (from sunset to sunrise next morning)
  let nightDurationHours = sunriseHours + 24 - sunsetHours;
  if (nightDurationHours > 24) nightDurationHours -= 24;

  // Determine the portion of the night allocated to twilight based on rule
  let maxPortionOfNight: number;
  switch (rule) {
    case 'MiddleOfTheNight':
      maxPortionOfNight = 0.5; // 1/2 of night
      break;
    case 'SeventhOfTheNight':
      maxPortionOfNight = 1 / 7; // 1/7 of night
      break;
    case 'TwilightAngle':
    default:
      maxPortionOfNight = (1 / 60) * targetAngleDeg; // e.g. 18/60 = 0.3 of night
      break;
  }

  const maxIntervalHours = nightDurationHours * maxPortionOfNight;

  if (eventType === 'fajr') {
    const earliestFajrHours = sunriseHours - maxIntervalHours;
    // If raw calculation failed (NaN/polar) or is earlier than allowed threshold
    if (isNaN(calculatedHours) || calculatedHours < earliestFajrHours || rule === 'TwilightAngle' && isNaN(calculatedHours)) {
      return {
        adjustedHours: earliestFajrHours,
        wasAdjusted: true,
      };
    }
    // Check if raw fajr is unreasonably early (more than maxInterval before sunrise)
    if (sunriseHours - calculatedHours > maxIntervalHours) {
      return {
        adjustedHours: earliestFajrHours,
        wasAdjusted: true,
      };
    }
    return { adjustedHours: calculatedHours, wasAdjusted: false };
  } else {
    // Isha
    const latestIshaHours = sunsetHours + maxIntervalHours;
    if (isNaN(calculatedHours) || calculatedHours > latestIshaHours) {
      return {
        adjustedHours: latestIshaHours,
        wasAdjusted: true,
      };
    }
    if (calculatedHours - sunsetHours > maxIntervalHours) {
      return {
        adjustedHours: latestIshaHours,
        wasAdjusted: true,
      };
    }
    return { adjustedHours: calculatedHours, wasAdjusted: false };
  }
}
