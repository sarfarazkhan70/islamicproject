import { create } from 'zustand';
import { SunniMadhhab, CalculationMethod, HighLatitudeRule, LocationInfo } from '../core/prayerEngine/types.js';

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

const DEFAULT_LOCATION: LocationInfo = {
  city: 'Makkah',
  country: 'Saudi Arabia',
  latitude: 21.4225,
  longitude: 39.8262,
  timezone: 'Asia/Riyadh',
  isAutoDetected: false,
};

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
      location: state.location,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore storage save errors
  }
}

const initial = loadStoredSettings();

export const useSettingsStore = create<SettingsState>((set, get) => ({
  madhhab: initial.madhhab || 'hanafi',
  calculationMethod: initial.calculationMethod || 'Karachi',
  highLatitudeRule: initial.highLatitudeRule || 'TwilightAngle',
  timeFormat: initial.timeFormat || '12h',
  location: initial.location || DEFAULT_LOCATION,

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
    set((state) => ({
      location: { ...state.location, ...loc },
    }));
    saveStoredSettings(get());
  },
}));
