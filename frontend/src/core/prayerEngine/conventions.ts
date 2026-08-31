/**
 * ISLAMIC PRAYER CALCULATION CONVENTIONS
 * ==============================================================================
 * Standard international conventions for Fajr and Isha solar twilight angles.
 * ==============================================================================
 */

import { CalculationMethod, MethodParameters } from './types.js';

export const CALCULATION_CONVENTIONS: Record<CalculationMethod, MethodParameters> = {
  Karachi: {
    name: 'Karachi',
    fullName: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
  },
  MWL: {
    name: 'MWL',
    fullName: 'Muslim World League (Makkah)',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
  },
  ISNA: {
    name: 'ISNA',
    fullName: 'Islamic Society of North America',
    fajrAngle: 15.0,
    ishaAngle: 15.0,
  },
  UmmAlQura: {
    name: 'UmmAlQura',
    fullName: 'Umm al-Qura University, Makkah',
    fajrAngle: 18.5,
    ishaIntervalMinutes: 90, // Fixed 90 minutes after Maghrib
  },
  Egypt: {
    name: 'Egypt',
    fullName: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  Tehran: {
    name: 'Tehran',
    fullName: 'Institute of Geophysics, University of Tehran',
    fajrAngle: 17.7,
    ishaAngle: 14.0,
  },
  Gulf: {
    name: 'Gulf',
    fullName: 'Gulf Region (UAE / Dubai Awqaf)',
    fajrAngle: 19.5,
    ishaIntervalMinutes: 90,
  },
  Moonsighting: {
    name: 'Moonsighting',
    fullName: 'Moonsighting Committee Worldwide',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
  },
};

export function getCalculationMethodParameters(
  method: CalculationMethod = 'Karachi'
): MethodParameters {
  return CALCULATION_CONVENTIONS[method] || CALCULATION_CONVENTIONS.Karachi;
}
