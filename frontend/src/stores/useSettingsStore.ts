import { create } from 'zustand';
import { SunniMadhhab, CalculationMethod, HighLatitudeRule, LocationInfo } from '../core/prayerEngine/types.js';
import { useLocationStore } from './useLocationStore.js';

export interface ManualHijriDate {
  day: number;
  month: number;
  year: number;
}

export interface SettingsState {
  madhhab: SunniMadhhab;
  calculationMethod: CalculationMethod;
  highLatitudeRule: HighLatitudeRule;
  timeFormat: '12h' | '24h';
  location: LocationInfo;
  hijriMode: 'automatic' | 'manual';
  hijriAdjustment: number; // -1, 0, +1
  manualHijriDate: ManualHijriDate;

  setMadhhab: (madhhab: SunniMadhhab) => void;
  setCalculationMethod: (method: CalculationMethod) => void;
  setHighLatitudeRule: (rule: HighLatitudeRule) => void;
  setTimeFormat: (format: '12h' | '24h') => void;
  setLocation: (loc: Partial<LocationInfo>) => void;
  setHijriMode: (mode: 'automatic' | 'manual') => void;
  setHijriAdjustment: (adjustment: number) => void;
  setManualHijriDate: (date: ManualHijriDate) => void;
  resetHijriToAutomatic: () => void;
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
      hijriMode: state.hijriMode,
      hijriAdjustment: state.hijriAdjustment,
      manualHijriDate: state.manualHijriDate,
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
  hijriMode: initial.hijriMode || 'automatic',
  hijriAdjustment: typeof initial.hijriAdjustment === 'number' ? initial.hijriAdjustment : 0,
  manualHijriDate: initial.manualHijriDate || {
    day: 19,
    month: 3,
    year: 1448,
  },
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
  setHijriMode: (hijriMode) => {
    set({ hijriMode });
    saveStoredSettings(get());
  },
  setHijriAdjustment: (hijriAdjustment) => {
    set({ hijriAdjustment });
    saveStoredSettings(get());
  },
  setManualHijriDate: (manualHijriDate) => {
    set({ manualHijriDate, hijriMode: 'manual' });
    saveStoredSettings(get());
  },
  resetHijriToAutomatic: () => {
    set({ hijriMode: 'automatic', hijriAdjustment: 0 });
    saveStoredSettings(get());
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

