/**
 * DATE FORMATTING & LOCALIZATION UTILITIES
 * ==============================================================================
 * Helpers for decimal hour conversions, 12h/24h time formatting, countdowns,
 * and date arithmetic.
 * ==============================================================================
 */
/**
 * Converts decimal hours (e.g. 5.5) into a Date object on the specified calendar day
 */
export function decimalHoursToDate(baseDate, decimalHours) {
    const normalized = (decimalHours % 24 + 24) % 24;
    const hours = Math.floor(normalized);
    const totalMinutes = (normalized - hours) * 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.floor((totalMinutes - minutes) * 60);
    const result = new Date(baseDate);
    result.setHours(hours, minutes, seconds, 0);
    return result;
}
/**
 * Formats a Date or decimal hours into 12-hour AM/PM string (e.g. "05:02 AM")
 */
export function formatTime12(input) {
    let hours;
    let minutes;
    if (input instanceof Date) {
        hours = input.getHours();
        minutes = input.getMinutes();
    }
    else {
        const normalized = (input % 24 + 24) % 24;
        hours = Math.floor(normalized);
        minutes = Math.floor((normalized - hours) * 60 + 0.5);
        if (minutes === 60) {
            hours = (hours + 1) % 24;
            minutes = 0;
        }
    }
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const padHours = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
    const padMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${padHours}:${padMinutes} ${period}`;
}
/**
 * Formats a Date or decimal hours into 24-hour string (e.g. "17:02")
 */
export function formatTime24(input) {
    let hours;
    let minutes;
    if (input instanceof Date) {
        hours = input.getHours();
        minutes = input.getMinutes();
    }
    else {
        const normalized = (input % 24 + 24) % 24;
        hours = Math.floor(normalized);
        minutes = Math.floor((normalized - hours) * 60 + 0.5);
        if (minutes === 60) {
            hours = (hours + 1) % 24;
            minutes = 0;
        }
    }
    const padHours = hours < 10 ? `0${hours}` : `${hours}`;
    const padMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${padHours}:${padMinutes}`;
}
/**
 * Formats full Gregorian date (e.g. "Monday, August 31, 2026")
 */
export function formatGregorianDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}
/**
 * Formats countdown seconds into "HH:MM:SS"
 */
export function formatCountdown(seconds) {
    if (seconds < 0)
        return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
