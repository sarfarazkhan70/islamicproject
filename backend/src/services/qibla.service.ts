import { getQiblaInfo, QiblaResult } from '../utils/qibla.js';

export class QiblaService {
  static calculate(latitude: number, longitude: number): QiblaResult {
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and +90 degrees.');
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and +180 degrees.');
    }
    return getQiblaInfo(latitude, longitude);
  }
}
