/**
 * REACTIVE PRAYER TIMES HOOK
 * ==============================================================================
 * Connects the pure Prayer Calculation Engine with UI state, centralized location
 * store, real-time next-prayer countdown ticks, and date navigation.
 * ==============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore.js';
import { useLocationStore } from '../stores/useLocationStore.js';
import { calculatePrayerTimes, calculateMonthlyPrayerTimes } from '../core/prayerEngine/prayerEngine.js';
import { DailyPrayerTimesResult, LocationInfo } from '../core/prayerEngine/types.js';

export function usePrayerTimes(initialDate: Date = new Date()) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [now, setNow] = useState<Date>(new Date());

  const { madhhab, calculationMethod, highLatitudeRule, timeFormat } = useSettingsStore();
  const {
    latitude,
    longitude,
    timezone,
    city,
    country,
    displayName,
    isAutoDetected,
    status: locationStatus,
    errorMessage: locationError,
    detectLocation: centralDetectLocation,
    setManualLocation,
  } = useLocationStore();

  const isDetectingLocation = locationStatus === 'detecting';

  const locationInfo: LocationInfo = useMemo(() => ({
    city,
    country,
    latitude,
    longitude,
    timezone,
    isAutoDetected,
  }), [city, country, latitude, longitude, timezone, isAutoDetected]);

  // Tick timer every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate daily prayer times whenever date, location, or options change
  const timetable = useMemo<DailyPrayerTimesResult>(() => {
    return calculatePrayerTimes({
      date: selectedDate,
      latitude,
      longitude,
      timezone,
      options: {
        madhhab,
        calculationMethod,
        highLatitudeRule,
        timeFormat,
      },
    });
  }, [
    selectedDate,
    latitude,
    longitude,
    timezone,
    madhhab,
    calculationMethod,
    highLatitudeRule,
    timeFormat,
  ]);

  // Compute live next prayer and countdown based on `now`
  const liveCountdown = useMemo(() => {
    const fardPrayers = timetable.prayers.filter((p) => p.isFard && p.key !== 'jumuah');
    let current = fardPrayers[0];
    let next = fardPrayers[0];

    for (let i = 0; i < fardPrayers.length; i++) {
      const p = fardPrayers[i];
      if (now >= p.date) {
        current = p;
      } else {
        next = p;
        break;
      }
    }

    let diffSeconds = Math.floor((next.date.getTime() - now.getTime()) / 1000);
    if (diffSeconds < 0) {
      diffSeconds += 24 * 3600;
    }

    const h = Math.floor(diffSeconds / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    const s = diffSeconds % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatted = `${pad(h)}:${pad(m)}:${pad(s)}`;

    return {
      currentPrayer: current,
      nextPrayer: next,
      timeToNextPrayerFormatted: formatted,
      timeToNextPrayerSeconds: diffSeconds,
    };
  }, [timetable, now]);

  // Request browser geolocation via central store
  const detectLocation = useCallback(async () => {
    return centralDetectLocation({ force: true });
  }, [centralDetectLocation]);

  // Manually select a city from the global database
  const selectCity = useCallback(
    (cityObj: LocationInfo) => {
      setManualLocation(cityObj);
    },
    [setManualLocation]
  );

  // Helper to fetch monthly grid
  const getMonthlyTimetable = useCallback(
    (year: number, month: number) => {
      return calculateMonthlyPrayerTimes({
        year,
        month,
        latitude,
        longitude,
        timezone,
        options: {
          madhhab,
          calculationMethod,
          highLatitudeRule,
          timeFormat,
        },
      });
    },
    [latitude, longitude, timezone, madhhab, calculationMethod, highLatitudeRule, timeFormat]
  );

  return {
    selectedDate,
    setSelectedDate,
    timetable: {
      ...timetable,
      location: locationInfo,
      currentPrayer: liveCountdown.currentPrayer,
      nextPrayer: liveCountdown.nextPrayer,
      timeToNextPrayerFormatted: liveCountdown.timeToNextPrayerFormatted,
      timeToNextPrayerSeconds: liveCountdown.timeToNextPrayerSeconds,
    },
    displayName,
    isDetectingLocation,
    locationError,
    detectLocation,
    selectCity,
    getMonthlyTimetable,
  };
}

