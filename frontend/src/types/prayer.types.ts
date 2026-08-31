export type Madhhab = 'hanafi' | 'shafii' | 'maliki' | 'hanbali';

export type CalculationMethod =
  | 'Karachi'
  | 'MWL'
  | 'ISNA'
  | 'Egypt'
  | 'Makkah'
  | 'Tehran'
  | 'Gulf'
  | 'Moonsighting';

export type PrayerName =
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

export type PrayerStatus = 'pending' | 'prayed' | 'missed' | 'excused' | 'qaza';

export interface PrayerTimeItem {
  id: PrayerName;
  name: string;
  arabicName: string;
  time: string;
  status: PrayerStatus;
  isProhibited?: boolean;
  isVoluntary?: boolean;
  isCurrent?: boolean;
  isNext?: boolean;
  note?: string;
}

export interface LocationInfo {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isAutoDetected: boolean;
}

export interface DailyTimetable {
  dateGregorian: string;
  dateHijri: string;
  location: LocationInfo;
  madhhab: Madhhab;
  calculationMethod: CalculationMethod;
  prayers: PrayerTimeItem[];
  currentPrayer: PrayerTimeItem;
  nextPrayer: PrayerTimeItem;
  nextPrayerCountdown: string; // e.g. "01:24:18"
}
