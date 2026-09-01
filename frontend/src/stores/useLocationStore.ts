/**
 * CENTRAL AUTO LOCATION STORE
 * ==============================================================================
 * Single source of truth for user location across Prayer Times & Qibla Finder.
 * Manages high-accuracy GPS detection, reverse geocoding, localStorage persistence,
 * and permission states.
 * ==============================================================================
 */

import { create } from 'zustand';
import {
  requestCurrentAutoLocation,
  checkGeolocationPermission,
  CentralLocationData,
} from '../utils/geolocation.js';
import { formatLocationDisplayName } from '../utils/reverseGeocoding.js';
import { getSystemTimezone } from '../utils/timezone.js';

export interface LocationStoreState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  city: string;
  locality?: string;
  district?: string;
  state?: string;
  country: string;
  displayName: string;
  timezone: string;
  timestamp: number;
  isAutoDetected: boolean;
  isLowAccuracy: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  status: 'idle' | 'detecting' | 'ready' | 'error';
  errorMessage: string | null;
  isPermissionBannerDismissed: boolean;

  // Actions
  detectLocation: (options?: { force?: boolean }) => Promise<boolean>;
  refreshLocation: () => Promise<boolean>;
  setManualLocation: (loc: Partial<CentralLocationData>) => void;
  checkPermissionStatus: () => Promise<void>;
  dismissPermissionBanner: () => void;
}

const STORAGE_KEY = 'islamic_prayer_central_location_v1';

// Initial fallback location (Delhi baseline if no GPS yet)
const DEFAULT_INITIAL_LOCATION: CentralLocationData = {
  city: 'Delhi',
  country: 'India',
  state: 'Delhi',
  displayName: 'Delhi, India',
  latitude: 28.6139,
  longitude: 77.209,
  accuracy: null,
  timezone: 'Asia/Kolkata',
  timestamp: Date.now(),
  isAutoDetected: false,
  isLowAccuracy: false,
};

function loadStoredLocation(): Partial<CentralLocationData> {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage parse errors
  }
  return {};
}

function saveStoredLocation(data: CentralLocationData) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage save errors
  }
}

const initialSaved = loadStoredLocation();

export const useLocationStore = create<LocationStoreState>((set, get) => {
  const initialLat = initialSaved.latitude ?? DEFAULT_INITIAL_LOCATION.latitude;
  const initialLng = initialSaved.longitude ?? DEFAULT_INITIAL_LOCATION.longitude;
  const initialCity = initialSaved.city ?? DEFAULT_INITIAL_LOCATION.city;
  const initialCountry = initialSaved.country ?? DEFAULT_INITIAL_LOCATION.country;
  const initialDisplay =
    initialSaved.displayName ||
    formatLocationDisplayName({
      locality: initialSaved.locality,
      city: initialCity,
      district: initialSaved.district,
      state: initialSaved.state,
      country: initialCountry,
    });
  const initialTz = initialSaved.timezone || getSystemTimezone() || 'Asia/Kolkata';

  return {
    latitude: initialLat,
    longitude: initialLng,
    accuracy: initialSaved.accuracy ?? null,
    city: initialCity,
    locality: initialSaved.locality,
    district: initialSaved.district,
    state: initialSaved.state,
    country: initialCountry,
    displayName: initialDisplay,
    timezone: initialTz,
    timestamp: initialSaved.timestamp ?? Date.now(),
    isAutoDetected: initialSaved.isAutoDetected ?? false,
    isLowAccuracy: initialSaved.isLowAccuracy ?? false,
    permissionStatus: 'prompt',
    status: 'idle',
    errorMessage: null,
    isPermissionBannerDismissed: false,

    checkPermissionStatus: async () => {
      const perm = await checkGeolocationPermission();
      set({ permissionStatus: perm });
    },

    detectLocation: async (options?: { force?: boolean }) => {
      set({ status: 'detecting', errorMessage: null });

      const result = await requestCurrentAutoLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: options?.force ? 0 : 60000,
      });

      if (result.success && result.data) {
        const data = result.data;
        set({
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          city: data.city,
          locality: data.locality,
          district: data.district,
          state: data.state,
          country: data.country,
          displayName: data.displayName,
          timezone: data.timezone,
          timestamp: data.timestamp,
          isAutoDetected: true,
          isLowAccuracy: data.isLowAccuracy,
          permissionStatus: 'granted',
          status: 'ready',
          errorMessage: null,
          isPermissionBannerDismissed: true,
        });

        saveStoredLocation(data);
        return true;
      } else {
        const perm = await checkGeolocationPermission();
        set({
          status: 'error',
          permissionStatus: perm,
          errorMessage: result.errorMessage || 'Unable to obtain GPS location.',
        });
        return false;
      }
    },

    refreshLocation: async () => {
      return get().detectLocation({ force: true });
    },

    setManualLocation: (loc: Partial<CentralLocationData>) => {
      const current = get();
      const newCity = loc.city ?? current.city;
      const newCountry = loc.country ?? current.country;
      const newLat = loc.latitude ?? current.latitude;
      const newLng = loc.longitude ?? current.longitude;
      const newLocality = loc.locality ?? (loc.city ? undefined : current.locality);
      const newDistrict = loc.district ?? (loc.city ? undefined : current.district);
      const newState = loc.state ?? (loc.city ? undefined : current.state);

      const displayName =
        loc.displayName ||
        formatLocationDisplayName({
          locality: newLocality,
          city: newCity,
          district: newDistrict,
          state: newState,
          country: newCountry,
        });

      const updatedData: CentralLocationData = {
        city: newCity,
        country: newCountry,
        locality: newLocality,
        district: newDistrict,
        state: newState,
        latitude: newLat,
        longitude: newLng,
        displayName,
        timezone: loc.timezone ?? current.timezone,
        accuracy: null,
        timestamp: Date.now(),
        isAutoDetected: false,
        isLowAccuracy: false,
      };

      set({
        ...updatedData,
        status: 'ready',
        errorMessage: null,
        isPermissionBannerDismissed: true,
      });

      saveStoredLocation(updatedData);
    },

    dismissPermissionBanner: () => {
      set({ isPermissionBannerDismissed: true });
    },
  };
});
