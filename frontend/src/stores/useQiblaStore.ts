import { create } from 'zustand';
import {
  getQiblaInfo,
  QiblaResult,
  getRelativeQiblaAngle,
  isAlignedWithQibla,
  unwrapAngle,
} from '../utils/qibla.js';
import { useLocationStore } from './useLocationStore.js';

export type SensorPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';
export type SensorState = 'idle' | 'active' | 'unavailable' | 'calibrating';
export type HeadingSource = 'webkitCompass' | 'deviceOrientationAbsolute' | 'deviceOrientation' | null;

interface QiblaState {
  qiblaInfo: QiblaResult | null;
  deviceHeading: number | null;
  headingSource: HeadingSource;
  relativeQiblaAngle: number;
  unwrappedDialRotation: number;
  unwrappedNeedleRotation: number;
  sensorPermission: SensorPermissionStatus;
  sensorStatus: SensorState;
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
let sensorTimeoutId: number | null = null;

/**
 * Tilt-compensated compass heading from 3D Euler angles (alpha, beta, gamma)
 */
function computeCompassHeading(
  alpha: number | null,
  beta: number | null,
  gamma: number | null,
  webkitHeading?: number
): number | null {
  if (webkitHeading !== undefined && !isNaN(webkitHeading)) {
    return ((webkitHeading % 360) + 360) % 360;
  }

  if (alpha === null || isNaN(alpha)) {
    return null;
  }

  const degToRad = Math.PI / 180;
  const a = alpha * degToRad;
  const b = (beta || 0) * degToRad;
  const g = (gamma || 0) * degToRad;

  const cA = Math.cos(a);
  const sA = Math.sin(a);
  const sB = Math.sin(b);
  const cG = Math.cos(g);
  const sG = Math.sin(g);

  // Unit vector of device top (Y-axis) in Earth reference frame (East, North, Up)
  const rA = -cA * sG - sA * sB * cG;
  const rB = -sA * sG + cA * sB * cG;

  let heading: number;
  if (Math.abs(rA) < 1e-4 && Math.abs(rB) < 1e-4) {
    // When held flat or pitch only
    heading = (360 - alpha) % 360;
  } else {
    let headingRad = Math.atan2(-rA, rB);
    if (headingRad < 0) headingRad += 2 * Math.PI;
    heading = headingRad * (180 / Math.PI);
  }

  return Math.round((((heading % 360) + 360) % 360) * 10) / 10;
}

const centralInitial = useLocationStore.getState();

export const useQiblaStore = create<QiblaState>((set, get) => {
  const initialInfo = getQiblaInfo(centralInitial.latitude, centralInitial.longitude);

  return {
    qiblaInfo: initialInfo,
    deviceHeading: null,
    headingSource: null,
    relativeQiblaAngle: initialInfo.bearing,
    unwrappedDialRotation: 0,
    unwrappedNeedleRotation: initialInfo.bearing,
    sensorPermission:
      typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
        ? 'prompt'
        : 'unsupported',
    sensorStatus: 'idle',
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
        set({ sensorPermission: 'unsupported', sensorStatus: 'unavailable' });
        return false;
      }

      try {
        // Handle iOS 13+ permission request
        const DOE = DeviceOrientationEvent as any;
        if (typeof DOE.requestPermission === 'function') {
          const response = await DOE.requestPermission();
          if (response !== 'granted') {
            set({ sensorPermission: 'denied', sensorStatus: 'unavailable' });
            return false;
          }
        }

        set({ sensorPermission: 'granted', sensorStatus: 'calibrating' });

        // Clean any existing listeners
        get().stopCompass();

        let receivedValidEvent = false;

        const handleOrientationUpdate = (
          e: DeviceOrientationEvent,
          source: HeadingSource
        ) => {
          const webkitHeading = (e as any).webkitCompassHeading;
          const webkitAccuracy = (e as any).webkitCompassAccuracy;

          const heading = computeCompassHeading(
            e.alpha,
            e.beta,
            e.gamma,
            webkitHeading
          );

          if (heading !== null) {
            receivedValidEvent = true;
            if (sensorTimeoutId !== null) {
              clearTimeout(sensorTimeoutId);
              sensorTimeoutId = null;
            }

            const qiblaBearing = get().qiblaInfo?.bearing || 0;
            const relativeAngle = getRelativeQiblaAngle(qiblaBearing, heading);
            const aligned = isAlignedWithQibla(qiblaBearing, heading, 3);

            const prevDial = get().unwrappedDialRotation;
            const prevNeedle = get().unwrappedNeedleRotation;

            const newDial = unwrapAngle(-heading, prevDial);
            const newNeedle = unwrapAngle(relativeAngle, prevNeedle);

            set({
              deviceHeading: heading,
              headingSource: source,
              relativeQiblaAngle: relativeAngle,
              unwrappedDialRotation: newDial,
              unwrappedNeedleRotation: newNeedle,
              isAligned: aligned,
              sensorStatus: 'active',
              compassAccuracyDeg:
                webkitAccuracy !== undefined && webkitAccuracy >= 0
                  ? Math.round(webkitAccuracy)
                  : null,
            });
          }
        };

        // 1. Listen to Android Absolute orientation if available
        if ('ondeviceorientationabsolute' in window) {
          absoluteOrientationHandler = (e: DeviceOrientationEvent) => {
            handleOrientationUpdate(e, 'deviceOrientationAbsolute');
          };
          window.addEventListener(
            'deviceorientationabsolute',
            absoluteOrientationHandler,
            true
          );
        }

        // 2. Standard device orientation listener (for iOS and fallback)
        orientationHandler = (e: DeviceOrientationEvent) => {
          if (get().headingSource === 'deviceOrientationAbsolute') return;
          handleOrientationUpdate(
            e,
            (e as any).webkitCompassHeading !== undefined
              ? 'webkitCompass'
              : 'deviceOrientation'
          );
        };
        window.addEventListener('deviceorientation', orientationHandler, true);

        // Liveness watchdog: if no valid orientation events are received after 2.5s (e.g. desktop), mark unavailable
        sensorTimeoutId = window.setTimeout(() => {
          if (!receivedValidEvent) {
            set({ sensorStatus: 'unavailable', deviceHeading: null });
          }
        }, 2500);

        return true;
      } catch {
        set({ sensorPermission: 'denied', sensorStatus: 'unavailable' });
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

// Automatically sync when central location changes
useLocationStore.subscribe((loc) => {
  useQiblaStore.getState().calculateForCoordinates(loc.latitude, loc.longitude);
  useQiblaStore.setState({
    accuracyMeters: loc.accuracy,
    isLowLocationAccuracy: loc.isLowAccuracy,
    isDetectingLocation: loc.status === 'detecting',
  });
});


