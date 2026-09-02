/**
 * ISLAMIC PRAYER — PRAYER AZAAN & 15-MINUTE ISLAMIC REMINDER SCHEDULER
 * ==============================================================================
 * Production-ready, location-reactive, Sunni Madhhab-compliant automated scheduler
 * for full authentic Azaan audio and gentle 15-minute Islamic Namaz reminders.
 * ==============================================================================
 */

import { calculatePrayerTimes } from '../prayerEngine/prayerEngine.js';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { DailyPrayerTimesResult, CalculatedPrayerSlot } from '../prayerEngine/types.js';

export interface ScheduledEventInfo {
  id: string;
  prayerKey: string;
  prayerName: string;
  type: 'AZAAN' | 'REMINDER_15MIN';
  scheduledTime: Date;
  status: 'PENDING' | 'TRIGGERED' | 'EXPIRED';
}

class AzaanSchedulerService {
  private static instance: AzaanSchedulerService;
  private isInitialized = false;
  private activeTimers: number[] = [];
  private triggeredEventIds = new Set<string>();
  private activeAudio: HTMLAudioElement | null = null;
  private unsubscribers: Array<() => void> = [];
  private midnightTimerId: number | null = null;

  // Cached scheduled events for UI display & testing inspection
  private currentScheduledEvents: ScheduledEventInfo[] = [];

  private constructor() {}

  public static getInstance(): AzaanSchedulerService {
    if (!AzaanSchedulerService.instance) {
      AzaanSchedulerService.instance = new AzaanSchedulerService();
    }
    return AzaanSchedulerService.instance;
  }

  /**
   * Initialize the scheduler on application launch.
   * Attaches reactive listeners to Location, Settings, and Notifications stores.
   */
  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initial schedule build
    this.reschedule();

    // Listen to Location store updates (GPS detection, manual coordinates, timezone)
    const unsubLocation = useLocationStore.subscribe((state, prevState) => {
      if (
        state.latitude !== prevState.latitude ||
        state.longitude !== prevState.longitude ||
        state.timezone !== prevState.timezone
      ) {
        this.reschedule();
      }
    });
    this.unsubscribers.push(unsubLocation);

    // Listen to Settings store updates (Sunni Madhhab, Calculation Method, High-Lat Rule)
    const unsubSettings = useSettingsStore.subscribe((state, prevState) => {
      if (
        state.madhhab !== prevState.madhhab ||
        state.calculationMethod !== prevState.calculationMethod ||
        state.highLatitudeRule !== prevState.highLatitudeRule
      ) {
        this.reschedule();
      }
    });
    this.unsubscribers.push(unsubSettings);

    // Listen to Notification Preferences updates (Azaan ON/OFF, volume, prayer toggles)
    const unsubNotifications = useNotificationStore.subscribe((state, prevState) => {
      if (state.preferences !== prevState.preferences) {
        this.reschedule();
      }
    });
    this.unsubscribers.push(unsubNotifications);

    // Setup recurring midnight rollover for new day schedule
    this.setupMidnightRollover();
  }

  /**
   * Stop and cleanup all timers and subscriptions (used in testing or teardown)
   */
  public destroy(): void {
    this.clearAllTimers();
    this.stopAudio();
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    if (this.midnightTimerId !== null) {
      window.clearTimeout(this.midnightTimerId);
      this.midnightTimerId = null;
    }
    this.isInitialized = false;
  }

  /**
   * Clear all active setTimeout timers
   */
  private clearAllTimers(): void {
    const clearFn = typeof window !== 'undefined' ? window.clearTimeout : clearTimeout;
    this.activeTimers.forEach((timerId) => clearFn(timerId));
    this.activeTimers = [];
  }

  /**
   * Setup midnight rollover to recalculate prayer times automatically at 00:00:01
   */
  private setupMidnightRollover(): void {
    const clearFn = typeof window !== 'undefined' ? window.clearTimeout : clearTimeout;
    const setFn = typeof window !== 'undefined' ? window.setTimeout : setTimeout;

    if (this.midnightTimerId !== null) {
      clearFn(this.midnightTimerId);
      this.midnightTimerId = null;
    }

    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const delay = Math.max(1000, midnight.getTime() - now.getTime());

    this.midnightTimerId = (setFn as any)(() => {
      // Clear triggered cache for the fresh day
      this.triggeredEventIds.clear();
      this.reschedule();
      this.setupMidnightRollover();
    }, delay);
  }

  /**
   * Recalculate daily prayer schedule and set up accurate timers
   */
  public reschedule(): void {
    this.clearAllTimers();
    this.currentScheduledEvents = [];

    const loc = useLocationStore.getState();
    const settings = useSettingsStore.getState();
    const notif = useNotificationStore.getState();
    const prefs = notif.preferences;

    // Master notification toggle check
    if (!prefs.enabled) {
      return;
    }

    // Latitude & Longitude check
    if (typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
      return;
    }

    const setFn = typeof window !== 'undefined' ? window.setTimeout : setTimeout;
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Pure prayer calculation from existing engine
    const timetable: DailyPrayerTimesResult = calculatePrayerTimes({
      date: now,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      options: {
        madhhab: settings.madhhab,
        calculationMethod: settings.calculationMethod,
        highLatitudeRule: settings.highLatitudeRule,
        timeFormat: settings.timeFormat,
      },
    });

    const targetPrayers: Array<'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha'> = [
      'fajr',
      'zuhr',
      'asr',
      'maghrib',
      'isha',
    ];

    for (const prayerKey of targetPrayers) {
      const isPrayerEnabled = prefs.prayerReminders?.[prayerKey] ?? true;
      if (!isPrayerEnabled) continue;

      const prayerItem: CalculatedPrayerSlot | undefined = timetable.prayers.find((p) => p.key === prayerKey);
      if (!prayerItem) continue;

      const azaanTime = new Date(prayerItem.date);
      const reminderTime = new Date(azaanTime.getTime() + 15 * 60 * 1000); // Exactly +15 minutes

      const azaanEventId = `${dateKey}-${prayerKey}-azaan`;
      const reminderEventId = `${dateKey}-${prayerKey}-reminder15`;

      // -------------------------------------------------------------
      // 1. AZAAN SCHEDULING (At exact prayer time)
      // -------------------------------------------------------------
      if (prefs.azaanEnabled ?? true) {
        if (azaanTime > now && !this.triggeredEventIds.has(azaanEventId)) {
          const delay = azaanTime.getTime() - now.getTime();
          const timerId = (setFn as any)(() => {
            this.triggerAzaan(prayerItem.name, prayerKey, azaanEventId);
          }, delay);

          this.activeTimers.push(timerId);
          this.currentScheduledEvents.push({
            id: azaanEventId,
            prayerKey,
            prayerName: prayerItem.name,
            type: 'AZAAN',
            scheduledTime: azaanTime,
            status: 'PENDING',
          });
        } else {
          // Prayer time has already passed or was already triggered today
          this.currentScheduledEvents.push({
            id: azaanEventId,
            prayerKey,
            prayerName: prayerItem.name,
            type: 'AZAAN',
            scheduledTime: azaanTime,
            status: this.triggeredEventIds.has(azaanEventId) ? 'TRIGGERED' : 'EXPIRED',
          });
        }
      }

      // -------------------------------------------------------------
      // 2. 15-MINUTE ISLAMIC REMINDER SCHEDULING
      // -------------------------------------------------------------
      if (prefs.reminder15MinEnabled ?? true) {
        if (reminderTime > now && !this.triggeredEventIds.has(reminderEventId)) {
          const delay = reminderTime.getTime() - now.getTime();
          const timerId = (setFn as any)(() => {
            this.trigger15MinReminder(prayerItem.name, prayerKey, reminderEventId);
          }, delay);

          this.activeTimers.push(timerId);
          this.currentScheduledEvents.push({
            id: reminderEventId,
            prayerKey,
            prayerName: prayerItem.name,
            type: 'REMINDER_15MIN',
            scheduledTime: reminderTime,
            status: 'PENDING',
          });
        } else {
          this.currentScheduledEvents.push({
            id: reminderEventId,
            prayerKey,
            prayerName: prayerItem.name,
            type: 'REMINDER_15MIN',
            scheduledTime: reminderTime,
            status: this.triggeredEventIds.has(reminderEventId) ? 'TRIGGERED' : 'EXPIRED',
          });
        }
      }
    }
  }

  /**
   * Trigger the authentic Madina / Masjid an-Nabawi Azaan notification & audio
   */
  public triggerAzaan(prayerName: string, prayerKey: string, eventId?: string): void {
    if (eventId) {
      if (this.triggeredEventIds.has(eventId)) return; // Duplicate protection
      this.triggeredEventIds.add(eventId);
    }

    const prefs = useNotificationStore.getState().preferences;
    const volume = prefs.azaanVolume ?? 0.8;

    // 1. Play Full Authentic Madina / Masjid an-Nabawi Azaan Audio from beginning to end
    if (prefs.soundEnabled !== false) {
      this.playAudio('/audio/madina_azaan.mp3', volume);
    }

    // 2. Dispatch OS / Browser Notification
    const title = `🕌 ${prayerName} Prayer Time`;
    const body = `Namaz ka waqt ho gaya hai. (${prayerName} Prayer Time — Masjid an-Nabawi ﷺ Azaan)`;
    this.sendNotification(title, body, `azaan-${prayerKey}`);
  }

  /**
   * Trigger the authentic 15-minute Islamic Namaz reminder: "Hayya 'alas-Salah" (2x) & "Hayya 'alal-Falah" (2x)
   */
  public trigger15MinReminder(prayerName: string, prayerKey: string, eventId?: string): void {
    if (eventId) {
      if (this.triggeredEventIds.has(eventId)) return; // Duplicate protection
      this.triggeredEventIds.add(eventId);
    }

    const prefs = useNotificationStore.getState().preferences;
    const volume = prefs.reminderVolume ?? 0.7;

    // 1. Play Authentic Male Qari Reminder Audio ("Hayya 'alas-Salah" x2, "Hayya 'alal-Falah" x2)
    if (prefs.soundEnabled !== false) {
      this.playAudio('/audio/namaz_reminder.mp3', volume);
    }

    // 2. Dispatch OS / Browser Notification
    const title = `🕌 ${prayerName} — 15-Min Reminder`;
    const body = `Hayya 'alas-Salah, Hayya 'alal-Falah. (${prayerName} Prayer — 15 minutes after Azaan)`;
    this.sendNotification(title, body, `reminder15-${prayerKey}`);
  }

  /**
   * Unified single-audio controller ensuring full playback from 0:00 to natural end without loop or cuts
   */
  public playAudio(src: string, volume: number = 0.8): void {
    try {
      this.stopAudio();
      if (typeof Audio === 'undefined') return;

      const audio = new Audio(src);
      audio.currentTime = 0;
      audio.loop = false;
      audio.volume = Math.max(0.0, Math.min(1.0, volume));
      this.activeAudio = audio;

      // Handle natural end of audio without artificial timeouts
      audio.onended = () => {
        if (this.activeAudio === audio) {
          this.activeAudio = null;
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Handle browser autoplay restriction gracefully
          console.warn('[AzaanScheduler] Audio autoplay was restricted by browser policy:', err.message);
        });
      }
    } catch (err) {
      console.error('[AzaanScheduler] Error playing audio:', err);
    }
  }

  /**
   * Stop any currently playing Azaan or reminder audio
   */
  public stopAudio(): void {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {
        // Ignore pause errors
      }
      this.activeAudio = null;
    }
  }

  /**
   * Show notification via Service Worker (Web Push) or fallback Notification API
   */
  private sendNotification(title: string, body: string, tag: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const options: any = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag,
      renotify: true,
      requireInteraction: true,
      data: {
        url: '/prayer-times',
      },
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, options);
        })
        .catch(() => {
          try {
            new Notification(title, options);
          } catch {
            // Ignore notification construction errors
          }
        });
    } else {
      try {
        new Notification(title, options);
      } catch {
        // Ignore fallback errors
      }
    }
  }

  // ============================================================================
  // TEST / SIMULATION SUITE (Safely testable in development & UI)
  // ============================================================================

  /**
   * Simulate an Azaan event in N seconds for any prayer
   */
  public simulateAzaanIn(seconds: number = 10, prayerName: string = 'Dhuhr'): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.triggerAzaan(prayerName, prayerName.toLowerCase());
        resolve();
      }, seconds * 1000);
    });
  }

  /**
   * Simulate a 15-Minute Islamic Reminder event in N seconds for any prayer
   */
  public simulateReminderIn(seconds: number = 5, prayerName: string = 'Dhuhr'): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.trigger15MinReminder(prayerName, prayerName.toLowerCase());
        resolve();
      }, seconds * 1000);
    });
  }

  /**
   * Get list of currently scheduled events for diagnostic inspection
   */
  public getScheduledEvents(): ScheduledEventInfo[] {
    return [...this.currentScheduledEvents];
  }
}

export const azaanScheduler = AzaanSchedulerService.getInstance();
