/**
 * ISLAMIC HIJRI CALENDAR ENGINE (Umm al-Qura Standard)
 * ==============================================================================
 * Authoritative Umm al-Qura astronomical baseline with local timezone resolution,
 * automatic system date detection, user moon-sighting adjustment (-2 to +2 days),
 * bidirectional conversion, and sacred Islamic events.
 * ==============================================================================
 */
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
export const ISLAMIC_EVENTS = [
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
import { getJulianDay, calculateSolarCoordinates, calculateHourAngle, STANDARD_HORIZON_REFRACTION_DEG, } from '../services/prayerEngine/astronomical.js';
/**
 * Extracts local date components (year, month, day, hour, minute, second) in a specific IANA timezone
 */
export function getLocalDateComponents(date, timezone) {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hourCycle: 'h23',
        });
        const parts = formatter.formatToParts(date);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        for (const p of parts) {
            if (p.type === 'year')
                year = parseInt(p.value, 10);
            else if (p.type === 'month')
                month = parseInt(p.value, 10);
            else if (p.type === 'day')
                day = parseInt(p.value, 10);
            else if (p.type === 'hour')
                hour = parseInt(p.value, 10);
            else if (p.type === 'minute')
                minute = parseInt(p.value, 10);
            else if (p.type === 'second')
                second = parseInt(p.value, 10);
        }
        return { year, month, day, hour, minute, second };
    }
    catch {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        };
    }
}
/**
 * Calculates exact local Maghrib (sunset) time for a date and location
 */
export function calculateMaghribDate(date, latitude, longitude, timezone, maghribOffsetMinutes = 0) {
    const tz = timezone || getResolvedTimezone();
    const { year, month, day } = getLocalDateComponents(date, tz);
    const julianDay = getJulianDay(year, month, day);
    const solarCoords = calculateSolarCoordinates(julianDay);
    const solarNoonUtcHours = 12 - longitude / 15 - solarCoords.equationOfTimeMinutes / 60;
    const sunsetHourAngle = calculateHourAngle(STANDARD_HORIZON_REFRACTION_DEG, latitude, solarCoords.declinationRad);
    const sunsetUtcHours = solarNoonUtcHours + sunsetHourAngle.hourAngleHours + maghribOffsetMinutes / 60;
    const maghribTimestamp = Date.UTC(year, month - 1, day, 0, 0, 0) + sunsetUtcHours * 3600 * 1000;
    return new Date(maghribTimestamp);
}
/**
 * Returns current resolved system/browser timezone
 */
export function getResolvedTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }
    catch {
        return 'UTC';
    }
}
/**
 * Computes milliseconds remaining until the next local midnight
 */
export function getMidnightRolloverDelay() {
    const now = new Date();
    const tomorrowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
    return Math.max(1000, tomorrowMidnight.getTime() - now.getTime());
}
/**
 * Computes milliseconds remaining until the next local Maghrib (sunset) day boundary
 */
export function getMaghribRolloverDelay(location, timezone, nowDate) {
    const now = nowDate || new Date();
    const tz = timezone || getResolvedTimezone();
    const loc = location || { latitude: 21.422487, longitude: 39.826206 };
    const todayMaghrib = calculateMaghribDate(now, loc.latitude, loc.longitude, tz, loc.maghribOffsetMinutes || 0);
    if (now.getTime() < todayMaghrib.getTime()) {
        return Math.max(1000, todayMaghrib.getTime() - now.getTime() + 1000);
    }
    // Next rollover is tomorrow's Maghrib
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowMaghrib = calculateMaghribDate(tomorrow, loc.latitude, loc.longitude, tz, loc.maghribOffsetMinutes || 0);
    return Math.max(1000, tomorrowMaghrib.getTime() - now.getTime() + 1000);
}
/**
 * Returns the live automatic Hijri date for today in the local timezone,
 * transitioning at local sunset (Maghrib)
 */
export function getCurrentHijriDate(adjustmentDays = 0, timezone, location) {
    return gregorianToHijri(new Date(), adjustmentDays, timezone, location);
}
/**
 * Converts a Gregorian Date to Hijri Date using Umm al-Qura standard.
 * Islamic day rolls over at local SUNSET (Maghrib).
 */
export function gregorianToHijri(gregorianDate, adjustmentDays = 0, timezone, location) {
    const tz = timezone || getResolvedTimezone();
    let targetDate;
    let yearG;
    let monthG;
    let dayG;
    let dayOfWeek;
    if (typeof gregorianDate === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(gregorianDate)) {
            // Pure calendar date string (e.g. "2026-09-02") — standard daytime baseline
            const [y, m, d] = gregorianDate.split('-').map(Number);
            yearG = y;
            monthG = m;
            dayG = d;
            // Daytime of civil date y-m-d corresponds to target day d - 1 in Umm al-Qura baseline
            targetDate = new Date(Date.UTC(y, m - 1, d - 1, 12, 0, 0));
            dayOfWeek = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
        }
        else {
            const parsed = new Date(gregorianDate);
            const loc = location || { latitude: 28.6139, longitude: 77.209, maghribOffsetMinutes: 0 };
            const maghribDate = calculateMaghribDate(parsed, loc.latitude, loc.longitude, tz, loc.maghribOffsetMinutes || 0);
            const isAfterMaghrib = parsed.getTime() >= maghribDate.getTime();
            const localComp = getLocalDateComponents(parsed, tz);
            yearG = localComp.year;
            monthG = localComp.month;
            dayG = localComp.day;
            // Before Maghrib: active Islamic day is baseline (day - 1)
            // At/After Maghrib: new Islamic day begins (day)
            const targetDay = isAfterMaghrib ? localComp.day : localComp.day - 1;
            targetDate = new Date(Date.UTC(localComp.year, localComp.month - 1, targetDay, 12, 0, 0));
            dayOfWeek = new Date(Date.UTC(localComp.year, localComp.month - 1, localComp.day, 12, 0, 0)).getUTCDay();
        }
    }
    else {
        // gregorianDate is a Date object (e.g. new Date())
        const loc = location || { latitude: 28.6139, longitude: 77.209, maghribOffsetMinutes: 0 };
        const maghribDate = calculateMaghribDate(gregorianDate, loc.latitude, loc.longitude, tz, loc.maghribOffsetMinutes || 0);
        const isAfterMaghrib = gregorianDate.getTime() >= maghribDate.getTime();
        const localComp = getLocalDateComponents(gregorianDate, tz);
        yearG = localComp.year;
        monthG = localComp.month;
        dayG = localComp.day;
        // Before Maghrib: active Islamic day is baseline (day - 1)
        // At/After Maghrib: new Islamic day begins (day)
        const targetDay = isAfterMaghrib ? localComp.day : localComp.day - 1;
        targetDate = new Date(Date.UTC(localComp.year, localComp.month - 1, targetDay, 12, 0, 0));
        dayOfWeek = new Date(Date.UTC(localComp.year, localComp.month - 1, localComp.day, 12, 0, 0)).getUTCDay();
    }
    // Apply moon-sighting day adjustment
    if (adjustmentDays !== 0) {
        targetDate = new Date(targetDate.getTime() + adjustmentDays * 86400000);
    }
    let hijriYear = 1448;
    let hijriMonth = 1;
    let hijriDay = 1;
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
                if (!isNaN(dNum) && dNum >= 1 && dNum <= 30)
                    hijriDay = dNum;
            }
            else if (p.type === 'month') {
                const mNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
                    hijriMonth = mNum;
                }
                else {
                    const val = p.value.toLowerCase();
                    if (val.includes('muharram'))
                        hijriMonth = 1;
                    else if (val.includes('safar'))
                        hijriMonth = 2;
                    else if (val.includes('rabi') && (val.includes('1') || val.includes('i') || val.includes('awwal')))
                        hijriMonth = 3;
                    else if (val.includes('rabi') && (val.includes('2') || val.includes('ii') || val.includes('thani') || val.includes('sani')))
                        hijriMonth = 4;
                    else if (val.includes('jumad') && (val.includes('1') || val.includes('i') || val.includes('ula') || val.includes('awwal')))
                        hijriMonth = 5;
                    else if (val.includes('jumad') && (val.includes('2') || val.includes('ii') || val.includes('akhir') || val.includes('sani')))
                        hijriMonth = 6;
                    else if (val.includes('rajab'))
                        hijriMonth = 7;
                    else if (val.includes('sha'))
                        hijriMonth = 8;
                    else if (val.includes('ramadan') || val.includes('ramazan'))
                        hijriMonth = 9;
                    else if (val.includes('shawwal'))
                        hijriMonth = 10;
                    else if (val.includes('qi') || val.includes('kada'))
                        hijriMonth = 11;
                    else if (val.includes('hij') || val.includes('hajj'))
                        hijriMonth = 12;
                }
            }
            else if (p.type === 'year') {
                const yNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(yNum) && yNum >= 1300 && yNum <= 1600)
                    hijriYear = yNum;
            }
        }
    }
    catch {
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
                    if (!isNaN(dNum) && dNum >= 1 && dNum <= 30)
                        hijriDay = dNum;
                }
                else if (p.type === 'month') {
                    const mNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(mNum) && mNum >= 1 && mNum <= 12)
                        hijriMonth = mNum;
                }
                else if (p.type === 'year') {
                    const yNum = parseInt(p.value.replace(/[^0-9]/g, ''), 10);
                    if (!isNaN(yNum) && yNum >= 1300 && yNum <= 1600)
                        hijriYear = yNum;
                }
            }
        }
        catch {
            // Approximate fallback
            const approxYear = Math.floor((targetDate.getUTCFullYear() - 622) * 1.030684);
            hijriYear = approxYear;
            hijriMonth = 3;
            hijriDay = 19;
        }
    }
    if (hijriMonth < 1)
        hijriMonth = 1;
    if (hijriMonth > 12)
        hijriMonth = 12;
    const monthObj = HIJRI_MONTHS[hijriMonth - 1] || HIJRI_MONTHS[0];
    const matchedEvent = ISLAMIC_EVENTS.find((e) => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay);
    // Exact Gregorian local date string YYYY-MM-DD
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
 * Converts Hijri Date to Gregorian Date
 */
export function hijriToGregorian(hijriYear, hijriMonth, hijriDay, adjustmentDays = 0) {
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
 * Generates a full month calendar grid for a given Gregorian year and month
 */
export function getMonthlyCalendarGrid(gregorianYear, gregorianMonth, adjustmentDays = 0, timezone) {
    const daysInMonth = new Date(gregorianYear, gregorianMonth, 0).getDate();
    const firstDayOfWeek = new Date(Date.UTC(gregorianYear, gregorianMonth - 1, 1)).getUTCDay();
    const days = [];
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
