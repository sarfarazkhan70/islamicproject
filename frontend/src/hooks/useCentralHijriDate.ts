import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore.js';
import { useLocationStore } from '../stores/useLocationStore.js';
import {
  getCentralHijriDate,
  getMaghribRolloverDelay,
  HijriDate,
} from '../utils/hijriCalendar.js';

/**
 * Central reactive hook providing the synchronized live Hijri date.
 * Respects Automatic (Maghrib-based) and Manual modes from useSettingsStore.
 */
export function useCentralHijriDate(): HijriDate {
  const { hijriMode, hijriAdjustment, manualHijriDate } = useSettingsStore();
  const { latitude, longitude, timezone } = useLocationStore();

  const [hijriDate, setHijriDate] = useState<HijriDate>(() => getCentralHijriDate());

  useEffect(() => {
    const update = () => {
      setHijriDate(getCentralHijriDate());
    };

    update();
    const interval = setInterval(update, 5000);

    const delay = getMaghribRolloverDelay({ latitude, longitude }, timezone);
    const maghribTimeout = setTimeout(update, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(maghribTimeout);
    };
  }, [
    hijriMode,
    hijriAdjustment,
    manualHijriDate?.day,
    manualHijriDate?.month,
    manualHijriDate?.year,
    latitude,
    longitude,
    timezone,
  ]);

  return hijriDate;
}
