import { create } from 'zustand';
import {
  getQiblaInfo,
  QiblaResult,
  getRelativeQiblaAngle,
  isAlignedWithQibla,
  unwrapAngle,
  smoothAngle,
  getCompassHeadingFromEvent,
} from '../utils/qibla.js';
import { useLocationStore } from './useLocationStore.js';

export type SensorPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';
export type SensorState = 'idle' | 'active' | 'unavailable' | 'calibrating';
export type HeadingSource = 'webkitCompass' | 'deviceOrientationAbsolute' | 'deviceOrientation' | null;

interface QiblaState {
  qiblaInfo: QiblaResult | null;
  deviceHeading: number | null;
  rawHeading: number | null;
  headingSource: HeadingSource;
  relativeQiblaAngle: number;
  unwrappedDialRotation: number;
  unwrappedNeedleRotation: number;
  sensorPermission: SensorPermissionStatus;
  sensorStatus: SensorState;
  isCompassAvailable: boolean;
  isAligned: boolean;
  accuracyMeters: number | null;
  isLowLocationAccuracy: boolean;
  compassAccuracyDeg: number | null;
  calibrationGuideOpen: boolean;
  isDetectingLocation: boolean;

  // Actions
  calculateForCoordinates: (latitude: number, longitude: number) => void;
  requestDeviceOrientation: () => Promise<boolean>;
  stopCompass: () => void;
  fetchHighAccuracyGPS: () => Promise<void>;
  toggleCalibrationGuide: (open?: boolean) => void;
}

let orientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;
let absoluteOrientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;
let sensorTimeoutId: ReturnType<typeof setTimeout> | null = null;
let smoothedHeadingRef: number | null = null;

function getScreenOrientationAngle(): number {
  if (typeof window === 'undefined') return 0;
  if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
    return window.screen.orientation.angle;
  }
  if (typeof window.orientation === 'number') {
    return window.orientation;
  }
  return 0;
}

const centralInitial = useLocationStore.getState();

export const useQiblaStore = create<QiblaState>((set, get) => {
  const initialInfo = getQiblaInfo(centralInitial.latitude, centralInitial.longitude);

  return {
    qiblaInfo: initialInfo,
    deviceHeading: null,
    rawHeading: null,
    headingSource: null,
    relativeQiblaAngle: initialInfo.bearing,
    unwrappedDialRotation: 0,
    unwrappedNeedleRotation: initialInfo.bearing,
    sensorPermission:
      typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
        ? 'prompt'
        : 'unsupported',
    sensorStatus: 'idle',
    isCompassAvailable: false,
    isAligned: false,
    accuracyMeters: centralInitial.accuracy,
    isLowLocationAccuracy: centralInitial.isLowAccuracy,
    compassAccuracyDeg: null,
    calibrationGuideOpen: false,
    isDetectingLocation: false,

    calculateForCoordinates: (latitude: number, longitude: number) => {
      const info = getQiblaInfo(latitude, longitude);
      const heading = get().deviceHeading;
      const relativeAngle = heading !== null
        ? getRelativeQiblaAngle(info.bearing, heading)
        : info.bearing;
      const aligned = heading !== null
        ? isAlignedWithQibla(info.bearing, heading, 3)
        : false;

      set((state) => ({
        qiblaInfo: info,
        relativeQiblaAngle: relativeAngle,
        unwrappedNeedleRotation: unwrapAngle(relativeAngle, state.unwrappedNeedleRotation),
        isAligned: aligned,
      }));
    },

    requestDeviceOrientation: async () => {
      if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
        set({ sensorPermission: 'unsupported', sensorStatus: 'unavailable', isCompassAvailable: false });
        return false;
      }

      try {
        // Handle iOS 13+ permission request directly in user action callback
        const DOE = DeviceOrientationEvent as any;
        if (typeof DOE.requestPermission === 'function') {
          const response = await DOE.requestPermission();
          if (response !== 'granted') {
            set({ sensorPermission: 'denied', sensorStatus: 'unavailable', isCompassAvailable: false });
            return false;
          }
        }

        set({ sensorPermission: 'granted', sensorStatus: 'calibrating' });

        // Clean any existing listeners
        get().stopCompass();

        let receivedValidEvent = false;

        const processOrientationUpdate = (
          e: DeviceOrientationEvent,
          defaultSource: HeadingSource
        ) => {
          const screenAngle = getScreenOrientationAngle();
          const parsed = getCompassHeadingFromEvent(e, screenAngle);

          if (parsed && typeof parsed.heading === 'number' && !isNaN(parsed.heading)) {
            receivedValidEvent = true;
            if (sensorTimeoutId !== null) {
              clearTimeout(sensorTimeoutId);
              sensorTimeoutId = null;
            }

            // Apply exponential moving average to filter sensor noise/jitter
            const rawHeading = parsed.heading;
            let finalHeading: number;
            if (smoothedHeadingRef === null) {
              smoothedHeadingRef = rawHeading;
              finalHeading = rawHeading;
            } else {
              smoothedHeadingRef = smoothAngle(smoothedHeadingRef, rawHeading, 0.3);
              finalHeading = Math.round(smoothedHeadingRef * 10) / 10;
            }

            const qiblaBearing = get().qiblaInfo?.bearing ?? 0;
            const relativeAngle = getRelativeQiblaAngle(qiblaBearing, finalHeading);
            const aligned = isAlignedWithQibla(qiblaBearing, finalHeading, 3);

            const prevDial = get().unwrappedDialRotation;
            const prevNeedle = get().unwrappedNeedleRotation;

            const newDial = unwrapAngle(-finalHeading, prevDial);
            const newNeedle = unwrapAngle(relativeAngle, prevNeedle);

            // Optional subtle haptic buzz on alignment
            if (aligned && !get().isAligned && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(40);
              } catch {}
            }

            set({
              deviceHeading: finalHeading,
              rawHeading,
              headingSource: parsed.source || defaultSource,
              relativeQiblaAngle: relativeAngle,
              unwrappedDialRotation: newDial,
              unwrappedNeedleRotation: newNeedle,
              isAligned: aligned,
              sensorStatus: 'active',
              isCompassAvailable: true,
              compassAccuracyDeg: parsed.accuracy,
            });
          }
        };

        // 1. Android Absolute orientation listener
        if ('ondeviceorientationabsolute' in window) {
          absoluteOrientationHandler = (e: DeviceOrientationEvent) => {
            processOrientationUpdate(e, 'deviceOrientationAbsolute');
          };
          window.addEventListener(
            'deviceorientationabsolute',
            absoluteOrientationHandler,
            true
          );
        }

        // 2. Standard orientation listener (iOS and generic fallback)
        orientationHandler = (e: DeviceOrientationEvent) => {
          if (get().headingSource === 'deviceOrientationAbsolute') return;
          processOrientationUpdate(
            e,
            (e as any).webkitCompassHeading !== undefined
              ? 'webkitCompass'
              : 'deviceOrientation'
          );
        };
        window.addEventListener('deviceorientation', orientationHandler, true);

        // Liveness watchdog: if no valid events received in 1.8s (e.g. laptop/desktop), mark sensor unavailable
        sensorTimeoutId = setTimeout(() => {
          if (!receivedValidEvent) {
            set({
              sensorStatus: 'unavailable',
              isCompassAvailable: false,
              deviceHeading: null,
            });
          }
        }, 1800);

        return true;
      } catch (err) {
        console.warn('Compass permission/init error:', err);
        set({ sensorPermission: 'denied', sensorStatus: 'unavailable', isCompassAvailable: false });
        return false;
      }
    },

    stopCompass: () => {
      if (typeof window !== 'undefined') {
        if (orientationHandler) {
          window.removeEventListener('deviceorientation', orientationHandler, true);
          orientationHandler = null;
        }
        if (absoluteOrientationHandler) {
          window.removeEventListener(
            'deviceorientationabsolute',
            absoluteOrientationHandler,
            true
          );
          absoluteOrientationHandler = null;
        }
        if (sensorTimeoutId !== null) {
          clearTimeout(sensorTimeoutId);
          sensorTimeoutId = null;
        }
      }
      smoothedHeadingRef = null;
      set({ sensorStatus: 'idle' });
    },

    fetchHighAccuracyGPS: async () => {
      set({ isDetectingLocation: true });
      try {
        await useLocationStore.getState().detectLocation({ force: true });
        set({ isDetectingLocation: false });
      } catch {
        set({ isDetectingLocation: false });
      }
    },

    toggleCalibrationGuide: (open?: boolean) => {
      set((state) => ({
        calibrationGuideOpen:
          open !== undefined ? open : !state.calibrationGuideOpen,
      }));
    },
  };
});

// Automatically sync when central location updates
useLocationStore.subscribe((loc) => {
  useQiblaStore.getState().calculateForCoordinates(loc.latitude, loc.longitude);
  useQiblaStore.setState({
    accuracyMeters: loc.accuracy,
    isLowLocationAccuracy: loc.isLowAccuracy,
    isDetectingLocation: loc.status === 'detecting',
  });
});
