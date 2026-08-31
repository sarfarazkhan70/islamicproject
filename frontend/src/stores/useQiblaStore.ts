import { create } from 'zustand';
import { getQiblaInfo, QiblaResult } from '../utils/qibla.js';

interface QiblaState {
  qiblaInfo: QiblaResult | null;
  deviceHeading: number | null;
  sensorPermission: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isAligned: boolean;
  calibrationGuideOpen: boolean;
  accuracyDeg: number | null;

  // Actions
  calculateForCoordinates: (latitude: number, longitude: number) => void;
  requestDeviceOrientation: () => Promise<boolean>;
  stopCompass: () => void;
  toggleCalibrationGuide: (open?: boolean) => void;
}

let orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;

export const useQiblaStore = create<QiblaState>((set, get) => ({
  qiblaInfo: getQiblaInfo(19.076, 72.8777), // Default initial
  deviceHeading: null,
  sensorPermission:
    typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
      ? 'prompt'
      : 'unsupported',
  isAligned: false,
  calibrationGuideOpen: false,
  accuracyDeg: null,

  calculateForCoordinates: (latitude: number, longitude: number) => {
    const info = getQiblaInfo(latitude, longitude);
    set({ qiblaInfo: info });
  },

  requestDeviceOrientation: async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      set({ sensorPermission: 'unsupported' });
      return false;
    }

    try {
      // Handle iOS 13+ permission request
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === 'function') {
        const response = await DOE.requestPermission();
        if (response !== 'granted') {
          set({ sensorPermission: 'denied' });
          return false;
        }
      }

      set({ sensorPermission: 'granted' });

      // Clean old listener
      if (orientationListener) {
        window.removeEventListener('deviceorientation', orientationListener);
      }

      orientationListener = (e: DeviceOrientationEvent) => {
        let heading: number | null = null;

        // iOS webkitCompassHeading (True North = 0)
        if ((e as any).webkitCompassHeading !== undefined) {
          heading = (e as any).webkitCompassHeading;
        } else if (e.alpha !== null) {
          // Android orientation (compass heading approximate)
          heading = (360 - e.alpha) % 360;
        }

        if (heading !== null) {
          const qiblaBearing = get().qiblaInfo?.bearing || 0;
          // Device is considered aligned when heading is within ±3 degrees of Qibla
          const diff = Math.abs(heading - qiblaBearing);
          const isAligned = diff <= 3 || diff >= 357;

          set({
            deviceHeading: Math.round(heading * 10) / 10,
            isAligned,
          });
        }
      };

      window.addEventListener('deviceorientation', orientationListener, true);
      return true;
    } catch {
      set({ sensorPermission: 'denied' });
      return false;
    }
  },

  stopCompass: () => {
    if (orientationListener && typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', orientationListener);
      orientationListener = null;
    }
  },

  toggleCalibrationGuide: (open?: boolean) => {
    set((state) => ({
      calibrationGuideOpen: open !== undefined ? open : !state.calibrationGuideOpen,
    }));
  },
}));
