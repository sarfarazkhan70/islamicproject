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
export function decimalHoursToDate(baseDate: Date, decimalHours: number): Date {
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
export function formatTime12(input: Date | number): string {
  let hours: number;
  let minutes: number;

  if (input instanceof Date) {
    hours = input.getHours();
    minutes = input.getMinutes();
  } else {
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
export function formatTime24(input: Date | number): string {
  let hours: number;
  let minutes: number;

  if (input instanceof Date) {
    hours = input.getHours();
    minutes = input.getMinutes();
  } else {
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
 * Formats full Gregorian date (e.g. "Tuesday, September 1, 2026")
 */
export function formatGregorianDate(date: Date, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  if (timezone) {
    options.timeZone = timezone;
  }
  return new Intl.DateTimeFormat('en-US', options).format(date);
}


/**
 * Formats countdown seconds into "HH:MM:SS"
 */
export function formatCountdown(seconds: number): string {
  if (seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
