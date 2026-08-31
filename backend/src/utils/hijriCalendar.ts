/**
 * ISLAMIC HIJRI CALENDAR ENGINE
 * ==============================================================================
 * Algorithmic Umm al-Qura baseline with Julian Day Number (JDN) conversion,
 * user-configurable moon-sighting adjustment (-2 to +2 days), and verified
 * sacred Islamic events.
 * ==============================================================================
 */

export interface HijriDate {
  year: number;
  month: number; // 1 - 12
  monthName: string;
  monthNameArabic: string;
  day: number; // 1 - 30
  formatted: string; // e.g. "14 Safar 1448 AH"
  formattedArabic: string; // e.g. "١٤ صفر ١٤٤٨ هـ"
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  gregorianDate: string; // YYYY-MM-DD
  isSacredMonth: boolean; // Muharram, Rajab, Dhul Qi'dah, Dhul Hijjah
  event?: string;
  eventArabic?: string;
}

export interface IslamicEvent {
  title: string;
  arabicTitle: string;
  hijriMonth: number;
  hijriDay: number;
  description: string;
  category: 'major' | 'fasting' | 'sacred';
}

export const HIJRI_MONTHS = [
  { number: 1, name: 'Muharram', arabicName: 'المحرم', isSacred: true },
  { number: 2, name: 'Safar', arabicName: 'صفر', isSacred: false },
  { number: 3, name: 'Rabi\' al-Awwal', arabicName: 'ربيع الأول', isSacred: false },
  { number: 4, name: 'Rabi\' al-Thani', arabicName: 'ربيع الثاني', isSacred: false },
  { number: 5, name: 'Jumada al-Ula', arabicName: 'جمادى الأولى', isSacred: false },
  { number: 6, name: 'Jumada al-Akhirah', arabicName: 'جمادى الآخرة', isSacred: false },
  { number: 7, name: 'Rajab', arabicName: 'رجب', isSacred: true },
  { number: 8, name: 'Sha\'ban', arabicName: 'شعبان', isSacred: false },
  { number: 9, name: 'Ramadan', arabicName: 'رمضان', isSacred: false },
  { number: 10, name: 'Shawwal', arabicName: 'شوال', isSacred: false },
  { number: 11, name: 'Dhul Qi\'dah', arabicName: 'ذو القعدة', isSacred: true },
  { number: 12, name: 'Dhul Hijjah', arabicName: 'ذو الحجة', isSacred: true },
];

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    title: 'Islamic New Year',
    arabicTitle: 'رأس السنة الهجرية',
    hijriMonth: 1,
    hijriDay: 1,
    description: 'First day of the Islamic lunar calendar year (1 Muharram).',
    category: 'major',
  },
  {
    title: 'Day of Ashura',
    arabicTitle: 'يوم عاشوراء',
    hijriMonth: 1,
    hijriDay: 10,
    description: 'Sacred day of fasting commemorating the salvation of Prophet Musa (AS).',
    category: 'fasting',
  },
  {
    title: 'Mawlid an-Nabi',
    arabicTitle: 'المولد النبوي الشريف',
    hijriMonth: 3,
    hijriDay: 12,
    description: 'Commemoration of the birth of Prophet Muhammad ﷺ.',
    category: 'major',
  },
  {
    title: 'Al-Isra\' wal-Mi\'raj',
    arabicTitle: 'الإسراء والمعراج',
    hijriMonth: 7,
    hijriDay: 27,
    description: 'The miraculous Night Journey and Ascension of the Prophet ﷺ.',
    category: 'sacred',
  },
  {
    title: 'Mid-Sha\'ban (Laylat al-Bara\'ah)',
    arabicTitle: 'ليلة النصف من شعبان',
    hijriMonth: 8,
    hijriDay: 15,
    description: 'Night of repentance, forgiveness, and preparation for Ramadan.',
    category: 'sacred',
  },
  {
    title: 'First Day of Ramadan',
    arabicTitle: 'أول أيام شهر رمضان المبارك',
    hijriMonth: 9,
    hijriDay: 1,
    description: 'Beginning of the holy month of fasting, prayer, and Quran.',
    category: 'major',
  },
  {
    title: 'Laylat al-Qadr (Night of Decree)',
    arabicTitle: 'ليلة القدر المباركة',
    hijriMonth: 9,
    hijriDay: 27,
    description: 'The night better than a thousand months in which the Quran was sent down.',
    category: 'sacred',
  },
  {
    title: 'Eid al-Fitr',
    arabicTitle: 'عيد الفطر المبارك',
    hijriMonth: 10,
    hijriDay: 1,
    description: 'Festival of Breaking the Fast concluding the blessed month of Ramadan.',
    category: 'major',
  },
  {
    title: 'Day of Arafah',
    arabicTitle: 'يوم عرفة',
    hijriMonth: 12,
    hijriDay: 9,
    description: 'Pinnacle of the Hajj pilgrimage and the most virtuous day for fasting.',
    category: 'fasting',
  },
  {
    title: 'Eid al-Adha',
    arabicTitle: 'عيد الأضحى المبارك',
    hijriMonth: 12,
    hijriDay: 10,
    description: 'Feast of the Sacrifice commemorating Prophet Ibrahim\'s (AS) devotion.',
    category: 'major',
  },
];

/**
 * Converts Gregorian Date to Julian Day Number
 */
function gregorianToJdn(year: number, month: number, day: number): number {
  if (month < 3) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

/**
 * Converts Julian Day Number to Gregorian Date
 */
function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const z = Math.floor(jdn + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const b = z + 1 + a - Math.floor(a / 4);
  const c = b + 1524;
  const d = Math.floor((c - 122.1) / 365.25);
  const e = Math.floor(365.25 * d);
  const g = Math.floor((c - e) / 30.6001);
  const day = c - e - Math.floor(30.6001 * g);
  const month = g < 14 ? g - 1 : g - 13;
  const year = month > 2 ? d - 4716 : d - 4715;
  return { year, month, day };
}

/**
 * Converts Gregorian Date to Hijri Date with Moon-sighting Adjustment (-2 to +2)
 */
export function gregorianToHijri(
  gregorianDate: Date | string,
  adjustmentDays: number = 0
): HijriDate {
  const d = typeof gregorianDate === 'string' ? new Date(gregorianDate) : gregorianDate;
  const jdn =
    gregorianToJdn(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()) +
    adjustmentDays;

  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lPrime = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - lPrime) / 5316) * Math.floor((50 * lPrime) / 17719) +
    Math.floor(lPrime / 5670) * Math.floor((43 * lPrime) / 15238);
  const lDoublePrime =
    lPrime -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * lDoublePrime) / 709);
  const day = lDoublePrime - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  const monthObj = HIJRI_MONTHS[month - 1] || HIJRI_MONTHS[0];

  // Match event
  const matchedEvent = ISLAMIC_EVENTS.find(
    (e) => e.hijriMonth === month && e.hijriDay === day
  );

  const dateStr = d.toISOString().split('T')[0];

  return {
    year,
    month,
    monthName: monthObj.name,
    monthNameArabic: monthObj.arabicName,
    day,
    formatted: `${day} ${monthObj.name} ${year} AH`,
    formattedArabic: `${day} ${monthObj.arabicName} ${year} هـ`,
    dayOfWeek: d.getUTCDay(),
    gregorianDate: dateStr,
    isSacredMonth: monthObj.isSacred,
    event: matchedEvent?.title,
    eventArabic: matchedEvent?.arabicTitle,
  };
}

/**
 * Converts Hijri Date to Gregorian Date
 */
export function hijriToGregorian(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number,
  adjustmentDays: number = 0
): { year: number; month: number; day: number; dateFormatted: string } {
  const jdn =
    Math.floor((11 * hijriYear + 3) / 30) +
    354 * hijriYear +
    30 * hijriMonth -
    Math.floor((hijriMonth - 1) / 2) +
    hijriDay +
    1948440 -
    385 -
    adjustmentDays;

  const { year, month, day } = jdnToGregorian(jdn);
  const dateFormatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { year, month, day, dateFormatted };
}

/**
 * Generates a full month calendar grid for a given Gregorian year and month
 */
export function getMonthlyCalendarGrid(
  gregorianYear: number,
  gregorianMonth: number, // 1 - 12
  adjustmentDays: number = 0
) {
  const daysInMonth = new Date(gregorianYear, gregorianMonth, 0).getDate();
  const firstDayOfWeek = new Date(Date.UTC(gregorianYear, gregorianMonth - 1, 1)).getUTCDay();

  const days: (HijriDate & { isCurrentMonth: boolean })[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(gregorianYear, gregorianMonth - 1, day));
    const hijri = gregorianToHijri(d, adjustmentDays);
    days.push({
      ...hijri,
      isCurrentMonth: true,
    });
  }

  return {
    year: gregorianYear,
    month: gregorianMonth,
    firstDayOfWeek,
    daysInMonth,
    days,
  };
}
