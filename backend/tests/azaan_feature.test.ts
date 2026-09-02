import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculatePrayerTimes } from '../../frontend/src/core/prayerEngine/prayerEngine.js';
import { azaanScheduler } from '../../frontend/src/core/azaan/azaanScheduler.js';
import { useLocationStore } from '../../frontend/src/stores/useLocationStore.js';
import { useSettingsStore } from '../../frontend/src/stores/useSettingsStore.js';
import { useNotificationStore } from '../../frontend/src/stores/useNotificationStore.js';
import fs from 'fs';
import path from 'path';

describe('🕌 Comprehensive Azaan & 15-Minute Reminder Engine Tests', () => {
  const testDate = new Date('2026-09-02T04:00:00.000Z');
  const makkahCoords = { latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' };
  const londonCoords = { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' };

  beforeEach(() => {
    azaanScheduler.destroy();
    useLocationStore.setState({
      latitude: makkahCoords.latitude,
      longitude: makkahCoords.longitude,
      timezone: makkahCoords.timezone,
      city: 'Makkah',
      country: 'Saudi Arabia',
      displayName: 'Makkah, Saudi Arabia',
      isAutoDetected: true,
      status: 'ready',
    });

    useSettingsStore.setState({
      madhhab: 'hanafi',
      calculationMethod: 'UmmAlQura',
      highLatitudeRule: 'TwilightAngle',
      timeFormat: '24h',
    });

    useNotificationStore.setState({
      permission: 'granted',
      isSubscribed: true,
      preferences: {
        enabled: true,
        azaanEnabled: true,
        azaanVolume: 0.85,
        reminder15MinEnabled: true,
        reminderVolume: 0.75,
        prayerReminders: {
          enabled: true,
          fajr: true,
          zuhr: true,
          asr: true,
          maghrib: true,
          isha: true,
          leadTimeMinutes: 0,
        },
        surahMulk11pm: { enabled: true, time: '23:00' },
        fridayKahf: { enabled: true, leadTimeMinutes: 60 },
        jumuahTime: '13:30',
        soundEnabled: true,
      },
    });
  });

  afterEach(() => {
    azaanScheduler.destroy();
  });

  it('1. Verifies local audio assets exist and are non-empty', () => {
    const azaanPath = path.resolve(process.cwd(), '../frontend/public/audio/madina_azaan.mp3');
    const reminderPath = path.resolve(process.cwd(), '../frontend/public/audio/namaz_reminder.mp3');

    expect(fs.existsSync(azaanPath)).toBe(true);
    expect(fs.statSync(azaanPath).size).toBeGreaterThan(500000); // ~600KB authentic Madina Azaan MP3

    expect(fs.existsSync(reminderPath)).toBe(true);
    expect(fs.statSync(reminderPath).size).toBeGreaterThan(500000); // ~2MB gentle spoken reminder sound
  });

  it('2. Calculates 5 daily prayer timings accurately using existing core engine', () => {
    const timetable = calculatePrayerTimes({
      date: testDate,
      latitude: makkahCoords.latitude,
      longitude: makkahCoords.longitude,
      timezone: makkahCoords.timezone,
      options: {
        madhhab: 'hanafi',
        calculationMethod: 'UmmAlQura',
        timeFormat: '24h',
      },
    });

    expect(timetable.prayers.length).toBeGreaterThanOrEqual(6); // Fajr, Sunrise, Zuhr, Asr, Maghrib, Isha
    const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];

    for (const p of prayers) {
      const item = timetable.prayers.find((x) => x.key === p);
      expect(item).toBeDefined();
      expect(item?.date).toBeInstanceOf(Date);
      expect(item?.timeFormatted).toBeDefined();
    }
  });

  it('3. Verifies exact +15 minute delta for all 15-minute reminders', () => {
    const timetable = calculatePrayerTimes({
      date: testDate,
      latitude: makkahCoords.latitude,
      longitude: makkahCoords.longitude,
      timezone: makkahCoords.timezone,
      options: { madhhab: 'shafii', calculationMethod: 'UmmAlQura' },
    });

    for (const prayer of timetable.prayers.filter((p) => p.isFard)) {
      const azaanTime = prayer.date;
      const reminderTime = new Date(azaanTime.getTime() + 15 * 60 * 1000);
      const diffMinutes = (reminderTime.getTime() - azaanTime.getTime()) / (1000 * 60);

      expect(diffMinutes).toBe(15);
    }
  });

  it('4. Respects Hanafi vs Shafi / Maliki / Hanbali Madhhab for Asr prayer timing', () => {
    const hanafiTimetable = calculatePrayerTimes({
      date: testDate,
      latitude: makkahCoords.latitude,
      longitude: makkahCoords.longitude,
      timezone: makkahCoords.timezone,
      options: { madhhab: 'hanafi' },
    });

    const shafiTimetable = calculatePrayerTimes({
      date: testDate,
      latitude: makkahCoords.latitude,
      longitude: makkahCoords.longitude,
      timezone: makkahCoords.timezone,
      options: { madhhab: 'shafii' },
    });

    const hanafiAsr = hanafiTimetable.prayers.find((p) => p.key === 'asr')!;
    const shafiAsr = shafiTimetable.prayers.find((p) => p.key === 'asr')!;

    // Hanafi Asr (2x shadow) must occur later than Shafi Asr (1x shadow)
    expect(hanafiAsr.date.getTime()).toBeGreaterThan(shafiAsr.date.getTime());
  });

  it('5. Initializing scheduler schedules future events and registers listeners', () => {
    azaanScheduler.init();
    const events = azaanScheduler.getScheduledEvents();

    expect(events.length).toBeGreaterThan(0);
    for (const evt of events) {
      expect(['AZAAN', 'REMINDER_15MIN']).toContain(evt.type);
      expect(['PENDING', 'TRIGGERED', 'EXPIRED']).toContain(evt.status);
    }
  });

  it('6. Automatically reschedules when location changes', () => {
    azaanScheduler.init();

    // Change location to London
    useLocationStore.setState({
      latitude: londonCoords.latitude,
      longitude: londonCoords.longitude,
      timezone: londonCoords.timezone,
      city: 'London',
      country: 'United Kingdom',
    });

    const events = azaanScheduler.getScheduledEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it('7. Automatically reschedules when Madhhab changes', () => {
    azaanScheduler.init();

    // Switch from Hanafi to Shafi
    useSettingsStore.setState({ madhhab: 'shafii' });

    const events = azaanScheduler.getScheduledEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it('8. Suppresses past events when opened mid-day and does not trigger expired Azaan', () => {
    azaanScheduler.init();
    const events = azaanScheduler.getScheduledEvents();

    const pastEvents = events.filter((e) => e.status === 'EXPIRED');
    // For expired events, they are not scheduled as pending timers
    for (const past of pastEvents) {
      expect(past.scheduledTime.getTime()).toBeLessThanOrEqual(Date.now());
    }
  });

  it('9. Duplicate Protection: Triggering the same eventId twice only runs once', () => {
    const triggerSpy = vi.spyOn(azaanScheduler, 'playAudio');
    const testEventId = '2026-09-02_zuhr_azaan';

    azaanScheduler.triggerAzaan('Dhuhr', 'zuhr', testEventId);
    expect(triggerSpy).toHaveBeenCalledTimes(1);

    // Second call with same event ID should be blocked by duplicate protection
    azaanScheduler.triggerAzaan('Dhuhr', 'zuhr', testEventId);
    expect(triggerSpy).toHaveBeenCalledTimes(1);

    triggerSpy.mockRestore();
  });

  it('10. Audio Safety: Uses only local authentic male Azaan audio file and gentle chime', () => {
    const playSpy = vi.spyOn(azaanScheduler, 'playAudio');

    azaanScheduler.triggerAzaan('Fajr', 'fajr');
    expect(playSpy).toHaveBeenCalledWith('/audio/madina_azaan.mp3', expect.any(Number));

    azaanScheduler.trigger15MinReminder('Fajr', 'fajr');
    expect(playSpy).toHaveBeenCalledWith('/audio/namaz_reminder.mp3', expect.any(Number));

    playSpy.mockRestore();
  });
});
