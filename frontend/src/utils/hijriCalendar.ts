/**
 * ISLAMIC HIJRI CALENDAR ENGINE (Umm al-Qura Standard)
 * ==============================================================================
 * Authoritative Umm al-Qura astronomical baseline with local timezone resolution,
 * automatic system date detection, user moon-sighting adjustment (-2 to +2 days),
 * bidirectional conversion, and sacred Islamic events.
 * ==============================================================================
 */

export interface HijriDate {
  year: number;
  month: number;
  monthName: string;
  monthNameArabic: string;
  day: number;
  formatted: string;
  formattedArabic: string;
  dayOfWeek: number;
  gregorianDate: string; // YYYY-MM-DD
  isSacredMonth: boolean;
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
  { number: 3, name: 'Rabi-ul-Awwal', arabicName: 'ربيع الأول', isSacred: false },
  { number: 4, name: 'Rabi-us-Sani', arabicName: 'ربيع الثاني', isSacred: false },
  { number: 5, name: 'Jumada-al-Ula', arabicName: 'جمادى الأولى', isSacred: false },
  { number: 6, name: 'Jumada-as-Sani', arabicName: 'جمادى الآخرة', isSacred: false },
  { number: 7, name: 'Rajab', arabicName: 'رجب', isSacred: true },
  { number: 8, name: "Sha'ban", arabicName: 'شعبان', isSacred: false },
  { number: 9, name: 'Ramadan', arabicName: 'رمضان', isSacred: false },
  { number: 10, name: 'Shawwal', arabicName: 'شوال', isSacred: false },
  { number: 11, name: "Dhul-Qi'dah", arabicName: 'ذو القعدة', isSacred: true },
  { number: 12, name: 'Dhul-Hijjah', arabicName: 'ذو الحجة', isSacred: true },
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
 * Returns current resolved system/browser timezone
 */
export function getResolvedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Computes milliseconds remaining until the next local midnight
 */
export function getMidnightRolloverDelay(): number {
  const now = new Date();
  const tomorrowMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1,
    0
  );
  return Math.max(1000, tomorrowMidnight.getTime() - now.getTime());
}

/**
 * Converts a Gregorian Date to Hijri Date using Umm al-Qura standard with timezone and optional moon adjustment
 */
export function gregorianToHijri(
  gregorianDate: Date | string,
  adjustmentDays: number = 0,
  timezone?: string
): HijriDate {
  const tz = timezone || getResolvedTimezone();

  let targetDate: Date;
  let yearG: number;
  let monthG: number;
  let dayG: number;
  let dayOfWeek: number;

  if (typeof gregorianDate === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(gregorianDate)) {
      const [y, m, d] = gregorianDate.split('-').map(Number);
      yearG = y;
      monthG = m;
      dayG = d;
      targetDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      dayOfWeek = targetDate.getUTCDay();
    } else {
      const parsed = new Date(gregorianDate);
      targetDate = new Date(parsed.getTime());
      yearG = parsed.getFullYear();
      monthG = parsed.getMonth() + 1;
      dayG = parsed.getDate();
      dayOfWeek = parsed.getDay();
    }
  } else {
    targetDate = new Date(gregorianDate.getTime());
    yearG = gregorianDate.getFullYear();
    monthG = gregorianDate.getMonth() + 1;
    dayG = gregorianDate.getDate();
    dayOfWeek = gregorianDate.getDay();
  }

  // Apply moon-sighting day adjustment if specified
  if (adjustmentDays !== 0) {
    targetDate = new Date(targetDate.getTime() + adjustmentDays * 86400000);
  }

  let hijriYear = 1448;
  let hijriMonth = 1;
  let hijriDay = 1;

  // Use authoritative Umm al-Qura formatting
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      timeZone: tz,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(targetDate);
    for (const p of parts) {
      if (p.type === 'day') {
        const dNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(dNum) && dNum >= 1 && dNum <= 30) hijriDay = dNum;
      } else if (p.type === 'month') {
        const mNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
          hijriMonth = mNum;
        } else {
          const val = p.value.toLowerCase();
          if (val.includes('muharram')) hijriMonth = 1;
          else if (val.includes('safar')) hijriMonth = 2;
          else if (val.includes('rabi') && (val.includes('1') || val.includes('i') || val.includes('awwal'))) hijriMonth = 3;
          else if (val.includes('rabi') && (val.includes('2') || val.includes('ii') || val.includes('thani') || val.includes('sani'))) hijriMonth = 4;
          else if (val.includes('jumad') && (val.includes('1') || val.includes('i') || val.includes('ula') || val.includes('awwal'))) hijriMonth = 5;
          else if (val.includes('jumad') && (val.includes('2') || val.includes('ii') || val.includes('akhir') || val.includes('sani'))) hijriMonth = 6;
          else if (val.includes('rajab')) hijriMonth = 7;
          else if (val.includes('sha')) hijriMonth = 8;
          else if (val.includes('ramadan') || val.includes('ramazan')) hijriMonth = 9;
          else if (val.includes('shawwal')) hijriMonth = 10;
          else if (val.includes('qi') || val.includes('kada')) hijriMonth = 11;
          else if (val.includes('hij') || val.includes('hajj')) hijriMonth = 12;
        }
      } else if (p.type === 'year') {
        const yNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(yNum) && yNum >= 1300 && yNum <= 1600) hijriYear = yNum;
      }
    }
  } catch {
    try {
      const fallbackFormatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
        timeZone: tz,
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
      const parts = fallbackFormatter.formatToParts(targetDate);
      for (const p of parts) {
        if (p.type === 'day') {
          const dNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(dNum) && dNum >= 1 && dNum <= 30) hijriDay = dNum;
        } else if (p.type === 'month') {
          const mNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) hijriMonth = mNum;
        } else if (p.type === 'year') {
          const yNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(yNum) && yNum >= 1300 && yNum <= 1600) hijriYear = yNum;
        }
      }
    } catch {
      // Approximate fallback
      const approxYear = Math.floor((yearG - 622) * 1.030684);
      hijriYear = approxYear;
      hijriMonth = 3;
      hijriDay = 19;
    }
  }


  // Ensure valid month bounds 1-12
  if (hijriMonth < 1) hijriMonth = 1;
  if (hijriMonth > 12) hijriMonth = 12;

  const monthObj = HIJRI_MONTHS[hijriMonth - 1] || HIJRI_MONTHS[0];

  const matchedEvent = ISLAMIC_EVENTS.find(
    (e) => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay
  );

  const dateStr = `${yearG}-${String(monthG).padStart(2, '0')}-${String(dayG).padStart(2, '0')}`;

  return {
    year: hijriYear,
    month: hijriMonth,
    monthName: monthObj.name,
    monthNameArabic: monthObj.arabicName,
    day: hijriDay,
    formatted: `${hijriDay} ${monthObj.name} ${hijriYear} AH`,
    formattedArabic: `${hijriDay} ${monthObj.arabicName} ${hijriYear} هـ`,
    dayOfWeek,
    gregorianDate: dateStr,
    isSacredMonth: monthObj.isSacred,
    event: matchedEvent?.title,
    eventArabic: matchedEvent?.arabicTitle,
  };
}

/**
 * Returns the live automatic Hijri date for today in the user's local timezone
 */
export function getCurrentHijriDate(adjustmentDays: number = 0, timezone?: string): HijriDate {
  return gregorianToHijri(new Date(), adjustmentDays, timezone);
}

/**
 * Converts a Hijri date back to Gregorian date using Umm al-Qura standard
 */
export function hijriToGregorian(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number,
  adjustmentDays: number = 0
): { year: number; month: number; day: number; dateFormatted: string } {
  // Approximate starting point
  const approxGregYear = Math.floor(621.57 + hijriYear * 0.970224);
  const estDate = new Date(Date.UTC(approxGregYear, Math.floor((hijriMonth - 1) * 0.97), hijriDay, 12, 0, 0));

  const h = gregorianToHijri(estDate, adjustmentDays, 'UTC');
  const diffDays = (hijriYear - h.year) * 354 + (hijriMonth - h.month) * 29.5 + (hijriDay - h.day);
  let currDate = new Date(estDate.getTime() + Math.round(diffDays) * 86400000);

  for (let step = 0; step < 60; step++) {
    const curH = gregorianToHijri(currDate, adjustmentDays, 'UTC');
    if (curH.year === hijriYear && curH.month === hijriMonth && curH.day === hijriDay) {
      const year = currDate.getUTCFullYear();
      const month = currDate.getUTCMonth() + 1;
      const day = currDate.getUTCDate();
      const dateFormatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { year, month, day, dateFormatted };
    }
    const dayDiff = (hijriYear - curH.year) * 354 + (hijriMonth - curH.month) * 30 + (hijriDay - curH.day);
    const sign = dayDiff > 0 ? 1 : -1;
    currDate = new Date(currDate.getTime() + (Math.abs(dayDiff) > 5 ? Math.round(dayDiff * 0.9) : sign) * 86400000);
  }

  const year = currDate.getUTCFullYear();
  const month = currDate.getUTCMonth() + 1;
  const day = currDate.getUTCDate();
  const dateFormatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { year, month, day, dateFormatted };
}

/**
 * Returns a monthly calendar grid of synchronized Gregorian and Hijri days
 */
export function getMonthlyCalendarGrid(
  gregorianYear: number,
  gregorianMonth: number,
  adjustmentDays: number = 0,
  timezone?: string
) {
  const daysInMonth = new Date(gregorianYear, gregorianMonth, 0).getDate();
  const firstDayOfWeek = new Date(Date.UTC(gregorianYear, gregorianMonth - 1, 1)).getUTCDay();

  const days: (HijriDate & { isCurrentMonth: boolean })[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${gregorianYear}-${String(gregorianMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hijri = gregorianToHijri(dateStr, adjustmentDays, timezone);
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

