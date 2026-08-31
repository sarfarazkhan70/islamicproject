/**
 * ISLAMIC PRAYER CALCULATION ENGINE
 * ==============================================================================
 * Primary deterministic calculation facade computing all 12 daily time slots,
 * 4 Sunni Madhhab shadow calculations, international conventions, and derived windows.
 * ==============================================================================
 */
import { STANDARD_HORIZON_REFRACTION_DEG, getJulianDay, calculateSolarCoordinates, calculateSolarTransitHours, calculateHourAngle, calculateAsrAltitudeDeg, } from './astronomical.js';
import { getMadhhabShadowMultiplier } from './madhhabRules.js';
import { getCalculationMethodParameters } from './conventions.js';
import { adjustHighLatitudeTime } from './highLatitude.js';
import { calculateDerivedWindows } from './derivedWindows.js';
import { getTimezoneOffsetHours, getSystemTimezone } from '../../utils/timezone.js';
import { decimalHoursToDate, formatTime12, formatTime24, formatGregorianDate, formatCountdown, } from '../../utils/dateUtils.js';
export function calculatePrayerTimes(params) {
    const { date, latitude, longitude } = params;
    const options = params.options || {};
    // Input Validation
    if (latitude < -90 || latitude > 90) {
        throw new Error(`Invalid latitude ${latitude}. Must be between -90 and +90 degrees.`);
    }
    if (longitude < -180 || longitude > 180) {
        throw new Error(`Invalid longitude ${longitude}. Must be between -180 and +180 degrees.`);
    }
    const madhhab = options.madhhab || 'hanafi';
    const method = options.calculationMethod || 'Karachi';
    const highLatRule = options.highLatitudeRule || 'TwilightAngle';
    const timezone = params.timezone || getSystemTimezone();
    // 1. Timezone offset in hours
    const tzOffsetHours = getTimezoneOffsetHours(date, timezone);
    // 2. Julian Day & Solar Coordinates
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const julianDay = getJulianDay(year, month, day);
    const solarCoords = calculateSolarCoordinates(julianDay);
    // 3. Solar Noon / Midday Transit (Zuhr anchor)
    const baseSolarNoonHours = calculateSolarTransitHours(longitude, tzOffsetHours, solarCoords.equationOfTimeMinutes);
    const zuhrOffsetMin = options.zuhrOffsetMinutes || 0;
    const solarNoonHours = baseSolarNoonHours + zuhrOffsetMin / 60;
    // 4. True Sunrise and True Sunset (Horizon refraction -0.8333 deg)
    const sunriseHourAngle = calculateHourAngle(STANDARD_HORIZON_REFRACTION_DEG, latitude, solarCoords.declinationRad);
    const sunriseOffsetMin = options.sunriseOffsetMinutes || 0;
    const sunriseHours = solarNoonHours - sunriseHourAngle.hourAngleHours + sunriseOffsetMin / 60;
    const sunsetHours = solarNoonHours + sunriseHourAngle.hourAngleHours;
    // 5. Asr Calculation using Sunni Madhhab Shadow Rule
    const shadowMultiplier = getMadhhabShadowMultiplier(madhhab);
    const asrAltitudeDeg = calculateAsrAltitudeDeg(shadowMultiplier, latitude, solarCoords.declinationDeg);
    const asrHourAngle = calculateHourAngle(asrAltitudeDeg, latitude, solarCoords.declinationRad);
    const asrOffsetMin = options.asrOffsetMinutes || 0;
    const asrHours = solarNoonHours + asrHourAngle.hourAngleHours + asrOffsetMin / 60;
    // 6. Fajr (Dawn) Calculation using selected Method
    const methodParams = getCalculationMethodParameters(method);
    const fajrHourAngle = calculateHourAngle(-methodParams.fajrAngle, latitude, solarCoords.declinationRad);
    const rawFajrHours = solarNoonHours - fajrHourAngle.hourAngleHours;
    const fajrAdjusted = adjustHighLatitudeTime('fajr', rawFajrHours, sunriseHours, sunsetHours, methodParams.fajrAngle, highLatRule);
    const fajrOffsetMin = options.fajrOffsetMinutes || 0;
    const fajrHours = fajrAdjusted.adjustedHours + fajrOffsetMin / 60;
    // 7. Maghrib Calculation (Immediately post sunset)
    const maghribOffsetMin = options.maghribOffsetMinutes || 0;
    const maghribHours = sunsetHours + maghribOffsetMin / 60;
    // 8. Isha (Night) Calculation using selected Method
    let rawIshaHours;
    if (methodParams.ishaIntervalMinutes) {
        // Fixed interval after Maghrib (e.g. UmmAlQura 90 min)
        rawIshaHours = maghribHours + methodParams.ishaIntervalMinutes / 60;
    }
    else {
        const ishaHourAngle = calculateHourAngle(-(methodParams.ishaAngle || 18), latitude, solarCoords.declinationRad);
        rawIshaHours = solarNoonHours + ishaHourAngle.hourAngleHours;
    }
    const ishaAdjusted = adjustHighLatitudeTime('isha', rawIshaHours, sunriseHours, sunsetHours, methodParams.ishaAngle || 18, highLatRule);
    const ishaOffsetMin = options.ishaOffsetMinutes || 0;
    const ishaHours = ishaAdjusted.adjustedHours + ishaOffsetMin / 60;
    // 9. Derived Prayer Windows (Ishraq, Chasht, Zawal, Tahajjud)
    const derived = calculateDerivedWindows(sunriseHours, solarNoonHours, sunsetHours, fajrHours);
    // Convert decimal hours into Date objects on the active date
    const fajrDate = decimalHoursToDate(date, fajrHours);
    const sunriseDate = decimalHoursToDate(date, sunriseHours);
    const ishraqStartDate = decimalHoursToDate(date, derived.ishraqStartHours);
    const ishraqEndDate = decimalHoursToDate(date, derived.ishraqEndHours);
    const chashtStartDate = decimalHoursToDate(date, derived.chashtStartHours);
    const chashtEndDate = decimalHoursToDate(date, derived.chashtEndHours);
    const zawalStartDate = decimalHoursToDate(date, derived.zawalStartHours);
    const zawalEndDate = decimalHoursToDate(date, derived.zawalEndHours);
    const zuhrDate = decimalHoursToDate(date, solarNoonHours);
    const asrDate = decimalHoursToDate(date, asrHours);
    const sunsetDate = decimalHoursToDate(date, sunsetHours);
    const maghribDate = decimalHoursToDate(date, maghribHours);
    const ishaDate = decimalHoursToDate(date, ishaHours);
    const tahajjudStartDate = decimalHoursToDate(date, derived.tahajjudStartHours);
    // Build the complete 12 calculated prayer slots
    const prayers = [
        {
            key: 'fajr',
            name: 'Fajr',
            arabicName: 'الفجر',
            category: 'fard',
            date: fajrDate,
            timeFormatted: formatTime12(fajrDate),
            time24Formatted: formatTime24(fajrDate),
            isFard: true,
            description: `Dawn prayer (${methodParams.fajrAngle}° twilight angle)`,
            windowEnd: {
                date: sunriseDate,
                timeFormatted: formatTime12(sunriseDate),
            },
        },
        {
            key: 'sunrise',
            name: 'Sunrise / Tulu',
            arabicName: 'شروق الشمس',
            category: 'astronomical',
            date: sunriseDate,
            timeFormatted: formatTime12(sunriseDate),
            time24Formatted: formatTime24(sunriseDate),
            isProhibited: true,
            description: 'Prohibited prayer time begins at sun disk appearance',
        },
        {
            key: 'ishraq',
            name: 'Ishraq',
            arabicName: 'الإشراق',
            category: 'voluntary',
            date: ishraqStartDate,
            timeFormatted: formatTime12(ishraqStartDate),
            time24Formatted: formatTime24(ishraqStartDate),
            isVoluntary: true,
            description: 'Recommended post-sunrise voluntary prayer (~18 min after sunrise)',
            windowEnd: {
                date: ishraqEndDate,
                timeFormatted: formatTime12(ishraqEndDate),
            },
        },
        {
            key: 'chasht',
            name: 'Chasht / Duha',
            arabicName: 'الضحى',
            category: 'voluntary',
            date: chashtStartDate,
            timeFormatted: formatTime12(chashtStartDate),
            time24Formatted: formatTime24(chashtStartDate),
            isVoluntary: true,
            description: 'Mid-morning voluntary prayer window',
            windowEnd: {
                date: chashtEndDate,
                timeFormatted: formatTime12(chashtEndDate),
            },
        },
        {
            key: 'zawal',
            name: 'Zawal / Istiwa',
            arabicName: 'الزوال',
            category: 'astronomical',
            date: zawalStartDate,
            timeFormatted: formatTime12(zawalStartDate),
            time24Formatted: formatTime24(zawalStartDate),
            isProhibited: true,
            description: 'Prohibited zenith window (~12 min before solar noon)',
            windowEnd: {
                date: zawalEndDate,
                timeFormatted: formatTime12(zawalEndDate),
            },
        },
        {
            key: 'zuhr',
            name: 'Zuhr',
            arabicName: 'الظهر',
            category: 'fard',
            date: zuhrDate,
            timeFormatted: formatTime12(zuhrDate),
            time24Formatted: formatTime24(zuhrDate),
            isFard: true,
            description: 'Midday prayer immediately following solar noon',
            windowEnd: {
                date: asrDate,
                timeFormatted: formatTime12(asrDate),
            },
        },
        {
            key: 'asr',
            name: 'Asr',
            arabicName: 'العصر',
            category: 'fard',
            date: asrDate,
            timeFormatted: formatTime12(asrDate),
            time24Formatted: formatTime24(asrDate),
            isFard: true,
            description: `Afternoon prayer (${madhhab.toUpperCase()} ${shadowMultiplier}x shadow standard)`,
            windowEnd: {
                date: sunsetDate,
                timeFormatted: formatTime12(sunsetDate),
            },
        },
        {
            key: 'sunset',
            name: 'Sunset / Ghurub',
            arabicName: 'غروب الشمس',
            category: 'astronomical',
            date: sunsetDate,
            timeFormatted: formatTime12(sunsetDate),
            time24Formatted: formatTime24(sunsetDate),
            isProhibited: true,
            description: 'Prohibited prayer window during disk descent',
        },
        {
            key: 'maghrib',
            name: 'Maghrib',
            arabicName: 'المغرب',
            category: 'fard',
            date: maghribDate,
            timeFormatted: formatTime12(maghribDate),
            time24Formatted: formatTime24(maghribDate),
            isFard: true,
            description: 'Evening prayer immediately post sunset',
            windowEnd: {
                date: ishaDate,
                timeFormatted: formatTime12(ishaDate),
            },
        },
        {
            key: 'isha',
            name: 'Isha',
            arabicName: 'العشاء',
            category: 'fard',
            date: ishaDate,
            timeFormatted: formatTime12(ishaDate),
            time24Formatted: formatTime24(ishaDate),
            isFard: true,
            description: `Night prayer (${methodParams.ishaIntervalMinutes ? `${methodParams.ishaIntervalMinutes}m post Maghrib` : `${methodParams.ishaAngle}° angle`})`,
            windowEnd: {
                date: fajrDate,
                timeFormatted: formatTime12(fajrDate),
            },
        },
        {
            key: 'tahajjud',
            name: 'Tahajjud',
            arabicName: 'التهجد',
            category: 'voluntary',
            date: tahajjudStartDate,
            timeFormatted: formatTime12(tahajjudStartDate),
            time24Formatted: formatTime24(tahajjudStartDate),
            isVoluntary: true,
            description: 'Optimal night voluntary prayer (Last third of the night)',
            windowEnd: {
                date: fajrDate,
                timeFormatted: formatTime12(fajrDate),
            },
        },
        {
            key: 'jumuah',
            name: "Jumu'ah",
            arabicName: 'الجمعة',
            category: 'fard',
            date: zuhrDate,
            timeFormatted: formatTime12(zuhrDate),
            time24Formatted: formatTime24(zuhrDate),
            isFard: true,
            description: "Friday congregational prayer solar window (Mosque schedule may vary)",
        },
    ];
    // Determine current active and next upcoming fard prayers
    const now = new Date();
    const fardPrayers = prayers.filter((p) => p.isFard && p.key !== 'jumuah');
    let currentPrayer;
    let nextPrayer;
    for (let i = 0; i < fardPrayers.length; i++) {
        const p = fardPrayers[i];
        if (now >= p.date) {
            currentPrayer = p;
        }
        else if (!nextPrayer && now < p.date) {
            nextPrayer = p;
        }
    }
    // If all daily fard prayers have passed, next prayer is Fajr tomorrow
    if (!nextPrayer && fardPrayers.length > 0) {
        nextPrayer = fardPrayers[0]; // Fajr next day
    }
    let timeToNextPrayerSeconds;
    let timeToNextPrayerFormatted;
    if (nextPrayer) {
        let diffMs = nextPrayer.date.getTime() - now.getTime();
        if (diffMs < 0) {
            diffMs += 24 * 60 * 60 * 1000;
        }
        timeToNextPrayerSeconds = Math.floor(diffMs / 1000);
        timeToNextPrayerFormatted = formatCountdown(timeToNextPrayerSeconds);
    }
    return {
        date,
        dateFormatted: formatGregorianDate(date),
        location: {
            city: 'Unknown City',
            country: '',
            latitude,
            longitude,
            timezone,
        },
        madhhab,
        calculationMethod: method,
        highLatitudeRule: highLatRule,
        prayers,
        astronomical: {
            solarNoon: zuhrDate,
            sunDeclinationDeg: solarCoords.declinationDeg,
            equationOfTimeMinutes: solarCoords.equationOfTimeMinutes,
            nightDurationHours: derived.nightDurationHours,
            lastThirdOfNightStart: tahajjudStartDate,
            midpointOfNight: decimalHoursToDate(date, derived.midnightHours),
            isPolarDay: sunriseHourAngle.isPolarDay,
            isPolarNight: sunriseHourAngle.isPolarNight,
            highLatitudeAdjusted: fajrAdjusted.wasAdjusted || ishaAdjusted.wasAdjusted,
        },
        currentPrayer,
        nextPrayer,
        timeToNextPrayerFormatted,
        timeToNextPrayerSeconds,
    };
}
/**
 * Calculates prayer times for an entire month for calendar grids
 */
export function calculateMonthlyPrayerTimes(params) {
    const { year, month, latitude, longitude, timezone, options } = params;
    const daysInMonth = new Date(year, month, 0).getDate();
    const results = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day, 12, 0, 0);
        results.push(calculatePrayerTimes({
            date,
            latitude,
            longitude,
            timezone,
            options,
        }));
    }
    return results;
}
