/**
 * TIMEZONE & LOCAL TIME UTILITIES
 * ==============================================================================
 * Timezone offset calculation, IANA detection, and UTC conversion safety.
 * ==============================================================================
 */

/**
 * Gets user's local IANA timezone
 */
export function getSystemTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Calculates timezone offset in decimal hours for a specific date and IANA timezone
 * Handles Daylight Saving Time (DST) changes precisely using Intl.DateTimeFormat
 */
export function getTimezoneOffsetHours(date: Date, timezone: string): number {
  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const diffMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
    return diffMinutes / 60;
  } catch {
    // Fallback to browser local offset
    return -date.getTimezoneOffset() / 60;
  }
}
