/**
 * ISLAMIC PRAYER CALCULATION ENGINE TYPES
 * ==============================================================================
 * Pure TypeScript types and interfaces for astronomical prayer calculations.
 * ==============================================================================
 */

export type SunniMadhhab = 'hanafi' | 'shafii' | 'maliki' | 'hanbali';

export type CalculationMethod =
  | 'Karachi'
  | 'MWL'
  | 'ISNA'
  | 'UmmAlQura'
  | 'Egypt'
  | 'Tehran'
  | 'Gulf'
  | 'Moonsighting';

export type HighLatitudeRule =
  | 'TwilightAngle'
  | 'MiddleOfTheNight'
  | 'SeventhOfTheNight'
  | 'None';

export type PrayerKey =
  | 'fajr'
  | 'sunrise'
  | 'ishraq'
  | 'chasht'
  | 'zawal'
  | 'zuhr'
  | 'asr'
  | 'sunset'
  | 'maghrib'
  | 'isha'
  | 'tahajjud'
  | 'jumuah';

export type PrayerCategory = 'fard' | 'astronomical' | 'voluntary';

export interface MethodParameters {
  name: string;
  fullName: string;
  fajrAngle: number;
  ishaAngle?: number;
  ishaIntervalMinutes?: number; // E.g. UmmAlQura (90 mins after Maghrib)
  maghribIntervalMinutes?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isAutoDetected?: boolean;
}

export interface CalculationOptions {
  madhhab?: SunniMadhhab;
  calculationMethod?: CalculationMethod;
  highLatitudeRule?: HighLatitudeRule;
  timeFormat?: '12h' | '24h';
  fajrOffsetMinutes?: number;
  sunriseOffsetMinutes?: number;
  zuhrOffsetMinutes?: number;
  asrOffsetMinutes?: number;
  maghribOffsetMinutes?: number;
  ishaOffsetMinutes?: number;
}

export interface PrayerCalculationParams {
  date: Date;
  latitude: number;
  longitude: number;
  timezone?: string; // IANA timezone e.g. "Asia/Riyadh", "Europe/London"
  options?: CalculationOptions;
}

export interface CalculatedPrayerSlot {
  key: PrayerKey;
  name: string;
  arabicName: string;
  category: PrayerCategory;
  date: Date;
  timeFormatted: string;
  time24Formatted: string;
  isProhibited?: boolean;
  isVoluntary?: boolean;
  isFard?: boolean;
  description: string;
  windowEnd?: {
    date: Date;
    timeFormatted: string;
  };
}

export interface DailyPrayerTimesResult {
  date: Date;
  dateFormatted: string;
  location: LocationInfo;
  madhhab: SunniMadhhab;
  calculationMethod: CalculationMethod;
  highLatitudeRule: HighLatitudeRule;
  prayers: CalculatedPrayerSlot[];
  astronomical: {
    solarNoon: Date;
    sunDeclinationDeg: number;
    equationOfTimeMinutes: number;
    nightDurationHours: number;
    lastThirdOfNightStart: Date;
    midpointOfNight: Date;
    isPolarDay: boolean;
    isPolarNight: boolean;
    highLatitudeAdjusted: boolean;
  };
  currentPrayer?: CalculatedPrayerSlot;
  nextPrayer?: CalculatedPrayerSlot;
  timeToNextPrayerFormatted?: string;
  timeToNextPrayerSeconds?: number;
}
