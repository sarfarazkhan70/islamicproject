import { create } from 'zustand';
import { SunniMadhhab, CalculationMethod, HighLatitudeRule, LocationInfo } from '../core/prayerEngine/types.js';
import { useLocationStore } from './useLocationStore.js';

interface SettingsState {
  madhhab: SunniMadhhab;
  calculationMethod: CalculationMethod;
  highLatitudeRule: HighLatitudeRule;
  timeFormat: '12h' | '24h';
  location: LocationInfo;
  setMadhhab: (madhhab: SunniMadhhab) => void;
  setCalculationMethod: (method: CalculationMethod) => void;
  setHighLatitudeRule: (rule: HighLatitudeRule) => void;
  setTimeFormat: (format: '12h' | '24h') => void;
  setLocation: (loc: Partial<LocationInfo>) => void;
}

const STORAGE_KEY = 'islamic_prayer_settings_v1';

function loadStoredSettings(): Partial<SettingsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage parse errors
  }
  return {};
}

function saveStoredSettings(state: SettingsState) {
  try {
    const toSave = {
      madhhab: state.madhhab,
      calculationMethod: state.calculationMethod,
      highLatitudeRule: state.highLatitudeRule,
      timeFormat: state.timeFormat,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore storage save errors
  }
}

const initial = loadStoredSettings();
const centralLocationInitial = useLocationStore.getState();

export const useSettingsStore = create<SettingsState>((set, get) => ({
  madhhab: initial.madhhab || 'hanafi',
  calculationMethod: initial.calculationMethod || 'Karachi',
  highLatitudeRule: initial.highLatitudeRule || 'TwilightAngle',
  timeFormat: initial.timeFormat || '12h',
  location: {
    city: centralLocationInitial.city,
    country: centralLocationInitial.country,
    latitude: centralLocationInitial.latitude,
    longitude: centralLocationInitial.longitude,
    timezone: centralLocationInitial.timezone,
    isAutoDetected: centralLocationInitial.isAutoDetected,
  },

  setMadhhab: (madhhab) => {
    set({ madhhab });
    saveStoredSettings(get());
  },
  setCalculationMethod: (calculationMethod) => {
    set({ calculationMethod });
    saveStoredSettings(get());
  },
  setHighLatitudeRule: (highLatitudeRule) => {
    set({ highLatitudeRule });
    saveStoredSettings(get());
  },
  setTimeFormat: (timeFormat) => {
    set({ timeFormat });
    saveStoredSettings(get());
  },
  setLocation: (loc) => {
    useLocationStore.getState().setManualLocation(loc);
    set((state) => ({
      location: { ...state.location, ...loc },
    }));
  },
}));

// Sync changes from central useLocationStore into useSettingsStore
useLocationStore.subscribe((state) => {
  useSettingsStore.setState({
    location: {
      city: state.city,
      country: state.country,
      latitude: state.latitude,
      longitude: state.longitude,
      timezone: state.timezone,
      isAutoDetected: state.isAutoDetected,
    },
  });
});

