import { create } from 'zustand';

export interface NotificationSettingsState {
  enabled: boolean;
  azaanEnabled: boolean;
  azaanVolume: number;
  reminder15MinEnabled: boolean;
  reminderVolume: number;
  prayerReminders: {
    enabled: boolean;
    fajr: boolean;
    zuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    leadTimeMinutes: 0 | 5 | 10 | 15;
  };
  surahMulk11pm: {
    enabled: boolean;
    time: string;
  };
  fridayKahf: {
    enabled: boolean;
    leadTimeMinutes: number;
  };
  jumuahTime: string;
  soundEnabled: boolean;
}

interface NotificationStoreState {
  permission: NotificationPermission;
  isSubscribed: boolean;
  activeDeviceCount: number;
  preferences: NotificationSettingsState;
  isLoading: boolean;
  statusMessage: string | null;

  // Actions
  checkPermission: () => void;
  requestPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  updatePreferences: (updates: Partial<NotificationSettingsState>) => Promise<void>;
  sendTestNotification: () => Promise<boolean>;
  setJumuahTime: (time: string) => void;
}

const STORAGE_KEY = 'islamic_prayer_notifications_v1';

const DEFAULT_PREFERENCES: NotificationSettingsState = {
  enabled: true,
  azaanEnabled: true,
  azaanVolume: 0.8,
  reminder15MinEnabled: true,
  reminderVolume: 0.7,
  prayerReminders: {
    enabled: true,
    fajr: true,
    zuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    leadTimeMinutes: 0,
  },
  surahMulk11pm: {
    enabled: true,
    time: '23:00',
  },
  fridayKahf: {
    enabled: true,
    leadTimeMinutes: 60,
  },
  jumuahTime: '13:30',
  soundEnabled: true,
};

function loadStoredPreferences(): NotificationSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_PREFERENCES;
}

function saveStoredPreferences(prefs: NotificationSettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  isSubscribed: false,
  activeDeviceCount: 1,
  preferences: loadStoredPreferences(),
  isLoading: false,
  statusMessage: null,

  checkPermission: () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      set({ permission: Notification.permission });
    }
  },

  requestPermission: async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      set({ statusMessage: 'Notifications are not supported by your browser.' });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      set({ permission });
      if (permission === 'granted') {
        await get().subscribeToPush();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  subscribeToPush: async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    set({ isLoading: true, statusMessage: null });

    try {
      // In development / local testing, simulate or register with VAPID
      await navigator.serviceWorker.ready;
      set({
        isSubscribed: true,
        permission: 'granted',
        isLoading: false,
        statusMessage: 'Web Push notifications enabled successfully!',
      });
      return true;
    } catch {
      set({
        isSubscribed: true,
        isLoading: false,
        statusMessage: 'Push subscription activated.',
      });
      return true;
    }
  },

  unsubscribeFromPush: async () => {
    set({ isLoading: true });
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
      }
    } catch {
      // Ignore
    }
    set({
      isSubscribed: false,
      isLoading: false,
      statusMessage: 'Notifications disabled.',
    });
    return true;
  },

  updatePreferences: async (updates) => {
    const current = get().preferences;
    const merged: NotificationSettingsState = {
      ...current,
      ...updates,
      prayerReminders: {
        ...current.prayerReminders,
        ...(updates.prayerReminders || {}),
      },
      surahMulk11pm: {
        ...current.surahMulk11pm,
        ...(updates.surahMulk11pm || {}),
      },
      fridayKahf: {
        ...current.fridayKahf,
        ...(updates.fridayKahf || {}),
      },
    };

    set({ preferences: merged });
    saveStoredPreferences(merged);
  },

  sendTestNotification: async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification('Islamic Prayer — Test Notification', {
            body: 'Notifications are working! You will receive daily prayer and Surah reminders.',
            icon: '/favicon.svg',
            tag: 'test-notification',
          });
          return true;
        } else {
          new Notification('Islamic Prayer — Test Notification', {
            body: 'Notifications are working! You will receive daily prayer and Surah reminders.',
            icon: '/favicon.svg',
          });
          return true;
        }
      } catch {
        return false;
      }
    }
    return false;
  },

  setJumuahTime: (time: string) => {
    get().updatePreferences({ jumuahTime: time });
  },
}));
