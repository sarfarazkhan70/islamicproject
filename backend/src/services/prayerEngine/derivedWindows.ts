/**
 * DERIVED ISLAMIC PRAYER WINDOWS
 * ==============================================================================
 * Methodologies for computing derived voluntary prayer windows (Ishraq, Chasht,
 * Tahajjud) and astronomical boundary periods (Zawal, Solar Transit, Jumu'ah).
 * ==============================================================================
 */

export interface DerivedWindowsResult {
  ishraqStartHours: number;
  ishraqEndHours: number;
  chashtStartHours: number;
  chashtEndHours: number;
  zawalStartHours: number;
  zawalEndHours: number;
  tahajjudStartHours: number; // Start of last third of night
  tahajjudEndHours: number;   // Fajr
  midnightHours: number;      // Midpoint of night (Nisf al-Layl)
  nightDurationHours: number;
}

/**
 * Calculates derived prayer windows based on astronomical anchor times
 * @param sunriseHours Time of Sunrise in decimal hours
 * @param solarNoonHours Time of Solar Noon (Zuhr) in decimal hours
 * @param sunsetHours Time of Sunset (Maghrib) in decimal hours
 * @param fajrHours Time of Fajr in decimal hours
 */
export function calculateDerivedWindows(
  sunriseHours: number,
  solarNoonHours: number,
  sunsetHours: number,
  fajrHours: number
): DerivedWindowsResult {
  // 1. Ishraq Window: Starts 15-20 min (~0.3 hours) post sunrise
  const ishraqStartHours = sunriseHours + 18 / 60; // 18 minutes post sunrise
  // Ishraq window ends approx halfway between sunrise and solar noon
  const ishraqEndHours = sunriseHours + (solarNoonHours - sunriseHours) * 0.45;

  // 2. Chasht (Duha) Window: Starts when 1/4 of daylight has passed, ends before Zawal
  const daylightHours = sunsetHours - sunriseHours;
  const chashtStartHours = sunriseHours + daylightHours * 0.25;
  const chashtEndHours = solarNoonHours - 15 / 60; // 15 mins before Zuhr

  // 3. Zawal Prohibited Window: 12-15 minutes leading up to Solar Noon (Zenith)
  const zawalStartHours = solarNoonHours - 12 / 60;
  const zawalEndHours = solarNoonHours; // Zuhr starts as soon as Zawal ends

  // 4. Night and Tahajjud Calculation:
  // Night runs from Sunset (Maghrib) to Dawn (Fajr next day)
  let nightDurationHours = fajrHours + 24 - sunsetHours;
  if (nightDurationHours > 24) nightDurationHours -= 24;

  // Midpoint of the night (Nisf al-Layl)
  const midnightHours = (sunsetHours + nightDurationHours / 2) % 24;

  // Last third of the night begins at: Fajr - (NightDuration / 3)
  let tahajjudStartHours = fajrHours - nightDurationHours / 3;
  if (tahajjudStartHours < 0) tahajjudStartHours += 24;
  const tahajjudEndHours = fajrHours;

  return {
    ishraqStartHours,
    ishraqEndHours,
    chashtStartHours,
    chashtEndHours,
    zawalStartHours,
    zawalEndHours,
    tahajjudStartHours,
    tahajjudEndHours,
    midnightHours,
    nightDurationHours,
  };
}
