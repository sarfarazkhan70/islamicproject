/**
 * ISLAMIC PRAYER — PHASE 1 DEVELOPMENT MOCK DATA
 * ==============================================================================
 * IMPORTANT DISCLAIMER:
 * This file contains strictly VISUAL PLACEHOLDER DATA for Phase 1 frontend layout
 * and design system development.
 * 
 * - NOT real calculated prayer times (Calculations will be implemented in Phase 3)
 * - NOT production Quran or Hadith API data (Will be integrated in Phase 6)
 * - NOT real Qibla or Hijri calculations (Will be implemented in Phase 7)
 * ==============================================================================
 */

import { DailyTimetable, PrayerTimeItem } from '../types/prayer.types';
import { getCurrentHijriDate } from '../utils/hijriCalendar.js';


export const mockPrayersList: PrayerTimeItem[] = [
  {
    id: 'fajr',
    name: 'Fajr',
    arabicName: 'الفجر',
    time: '05:02 AM',
    status: 'prayed',
    note: 'Dawn prayer (UI Placeholder)',
  },
  {
    id: 'sunrise',
    name: 'Sunrise / Tulu',
    arabicName: 'شروق الشمس',
    time: '06:21 AM',
    status: 'pending',
    isProhibited: true,
    note: 'Prohibited prayer time begins (UI Placeholder)',
  },
  {
    id: 'ishraq',
    name: 'Ishraq',
    arabicName: 'الإشراق',
    time: '06:38 AM',
    status: 'prayed',
    isVoluntary: true,
    note: '15-20 min post sunrise (UI Placeholder)',
  },
  {
    id: 'chasht',
    name: 'Chasht / Duha',
    arabicName: 'الضحى',
    time: '09:15 AM',
    status: 'pending',
    isVoluntary: true,
    note: 'Mid-morning voluntary prayer (UI Placeholder)',
  },
  {
    id: 'zawal',
    name: 'Zawal / Istiwa',
    arabicName: 'الزوال',
    time: '12:08 PM',
    status: 'pending',
    isProhibited: true,
    note: 'Zenith prohibited window (UI Placeholder)',
  },
  {
    id: 'zuhr',
    name: 'Zuhr',
    arabicName: 'الظهر',
    time: '12:22 PM',
    status: 'prayed',
    isCurrent: true,
    note: 'Midday prayer (UI Placeholder)',
  },
  {
    id: 'asr',
    name: 'Asr',
    arabicName: 'العصر',
    time: '03:54 PM',
    status: 'pending',
    isNext: true,
    note: 'Hanafi / Shafi\'i shadow calculation placeholder',
  },
  {
    id: 'sunset',
    name: 'Sunset / Ghurub',
    arabicName: 'غروب الشمس',
    time: '06:25 PM',
    status: 'pending',
    isProhibited: true,
    note: 'Prohibited prayer window (UI Placeholder)',
  },
  {
    id: 'maghrib',
    name: 'Maghrib',
    arabicName: 'المغرب',
    time: '06:27 PM',
    status: 'pending',
    note: 'Evening prayer post sunset (UI Placeholder)',
  },
  {
    id: 'isha',
    name: 'Isha',
    arabicName: 'العشاء',
    time: '07:48 PM',
    status: 'pending',
    note: 'Night prayer (UI Placeholder)',
  },
  {
    id: 'tahajjud',
    name: 'Tahajjud',
    arabicName: 'التهجد',
    time: '02:30 AM',
    status: 'pending',
    isVoluntary: true,
    note: 'Last third of the night (UI Placeholder)',
  },
  {
    id: 'jumuah',
    name: "Jumu'ah",
    arabicName: 'الجمعة',
    time: '12:22 PM',
    status: 'pending',
    note: 'Friday congregational prayer (UI Placeholder)',
  },
];

export const mockDailyTimetable: DailyTimetable = {
  dateGregorian: 'Tuesday, September 1, 2026',
  dateHijri: getCurrentHijriDate().formatted,
  location: {


    city: 'Makkah',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    timezone: 'Asia/Riyadh',
    isAutoDetected: true,
  },
  madhhab: 'hanafi',
  calculationMethod: 'Karachi',
  prayers: mockPrayersList,
  currentPrayer: mockPrayersList[5], // Zuhr
  nextPrayer: mockPrayersList[6], // Asr
  nextPrayerCountdown: '01:19:42',
};

export const mockSurahs = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', meaning: 'The Opening', versesCount: 7, revelationType: 'Meccan' },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', meaning: 'The Cow', versesCount: 286, revelationType: 'Medinan' },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', meaning: 'The Cave', versesCount: 110, revelationType: 'Meccan' },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', meaning: 'Ya-Sin', versesCount: 83, revelationType: 'Meccan' },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', meaning: 'The Beneficent', versesCount: 78, revelationType: 'Medinan' },
  { number: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة', meaning: 'The Inevitable', versesCount: 96, revelationType: 'Meccan' },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', meaning: 'The Sovereignty', versesCount: 30, revelationType: 'Meccan' },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', meaning: 'The Sincerity', versesCount: 4, revelationType: 'Meccan' },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', meaning: 'The Daybreak', versesCount: 5, revelationType: 'Meccan' },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', meaning: 'Mankind', versesCount: 6, revelationType: 'Meccan' },
];

export const mockAzkarCategories = [
  { id: 'morning', title: 'Morning Azkar', arabicTitle: 'أذكار الصباح', count: 18, icon: 'Sun' },
  { id: 'evening', title: 'Evening Azkar', arabicTitle: 'أذكار المساء', count: 18, icon: 'Moon' },
  { id: 'after-salah', title: 'After Obligatory Salah', arabicTitle: 'أذكار بعد الصلاة', count: 12, icon: 'CheckCircle' },
  { id: 'sleep', title: 'Sleep & Night Duas', arabicTitle: 'أذكار النوم', count: 14, icon: 'Bed' },
  { id: 'protection', title: 'Protection & Healing', arabicTitle: 'أذكار الحفظ والشفاء', count: 9, icon: 'Shield' },
  { id: 'travel', title: 'Travel & Journeys', arabicTitle: 'دعاء السفر', count: 6, icon: 'Compass' },
];

export const mockCalendarEvents = [
  { date: '1 Ramadan 1448 AH', title: 'First Day of Ramadan (UI Placeholder)', category: 'Fasting' },
  { date: '27 Ramadan 1448 AH', title: 'Laylatul Qadr (UI Placeholder)', category: 'Sacred Night' },
  { date: '1 Shawwal 1448 AH', title: 'Eid al-Fitr (UI Placeholder)', category: 'Celebration' },
  { date: '9 Dhul Hijjah 1448 AH', title: 'Day of Arafah (UI Placeholder)', category: 'Hajj' },
  { date: '10 Dhul Hijjah 1448 AH', title: 'Eid al-Adha (UI Placeholder)', category: 'Celebration' },
  { date: '10 Muharram 1449 AH', title: 'Day of Ashura (UI Placeholder)', category: 'Sunnah Fast' },
];
