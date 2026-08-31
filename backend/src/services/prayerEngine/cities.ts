/**
 * MAJOR GLOBAL ISLAMIC CITIES DATABASE
 * ==============================================================================
 * Curated offline coordinates and IANA timezones for major cities.
 * ==============================================================================
 */

import { LocationInfo } from './types.js';

export const GLOBAL_CITIES: LocationInfo[] = [
  { city: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  { city: 'Madinah', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6111, timezone: 'Asia/Riyadh' },
  { city: 'Jerusalem (Al-Quds)', country: 'Palestine', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem' },
  { city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { city: 'Lahore', country: 'Pakistan', latitude: 31.5497, longitude: 74.3436, timezone: 'Asia/Karachi' },
  { city: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479, timezone: 'Asia/Karachi' },
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { city: 'Birmingham', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904, timezone: 'Europe/London' },
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { city: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
  { city: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.531, timezone: 'Asia/Qatar' },
  { city: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
  { city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { city: 'Ankara', country: 'Turkey', latitude: 39.9334, longitude: 32.8597, timezone: 'Europe/Istanbul' },
  { city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { city: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
  { city: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { city: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata' },
  { city: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { city: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne' },
  { city: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522, timezone: 'Europe/Oslo' },
];

export function findCityByName(query: string): LocationInfo | undefined {
  const q = query.toLowerCase().trim();
  return GLOBAL_CITIES.find(
    (c) => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  );
}
