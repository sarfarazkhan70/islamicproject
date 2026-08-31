/**
 * TIMEZONE & LOCAL TIME UTILITIES
 * ==============================================================================
 * Timezone offset calculation, IANA detection, and UTC conversion safety.
 * Handles Daylight Saving Time (DST) changes precisely using Intl.DateTimeFormat.
 * ==============================================================================
 */
/**
 * Gets user's local IANA timezone
 */
export function getSystemTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }
    catch {
        return 'UTC';
    }
}
/**
 * Calculates timezone offset in milliseconds for a specific date and IANA timezone
 */
export function getTimezoneOffsetMs(date, timeZone) {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        });
        const parts = formatter.formatToParts(date);
        const map = {};
        for (const p of parts)
            map[p.type] = p.value;
        const asUtc = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour, +map.minute, +map.second);
        return asUtc - date.getTime();
    }
    catch {
        return -date.getTimezoneOffset() * 60 * 1000;
    }
}
/**
 * Calculates timezone offset in decimal hours for a specific date and IANA timezone
 */
export function getTimezoneOffsetHours(date, timezone) {
    return getTimezoneOffsetMs(date, timezone) / (1000 * 3600);
}
/**
 * Converts a local date string (YYYY-MM-DD) and local time string (HH:mm)
 * in an IANA timezone into the precise UTC Date object.
 * Fully DST-aware.
 */
export function localTimeToUtcDate(dateStr, timeStr, timeZone) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    const targetAsUtc = Date.UTC(y, m - 1, d, h, min, 0);
    const approxDate = new Date(targetAsUtc);
    const offsetMs = getTimezoneOffsetMs(approxDate, timeZone);
    return new Date(targetAsUtc - offsetMs);
}
