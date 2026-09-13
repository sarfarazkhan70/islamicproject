import { describe, it, expect, beforeEach } from 'vitest';
import { useTrackerStore } from '../stores/useTrackerStore';

describe('Namaz Tracker — Safar and Safar Mein Qaza Functionality', () => {
  const testDate = '2026-09-13';

  beforeEach(() => {
    // Reset store state before each test
    useTrackerStore.setState({
      recordsByDate: {
        [testDate]: {
          fajr: 'NONE',
          zuhr: 'NONE',
          asr: 'NONE',
          maghrib: 'NONE',
          isha: 'NONE',
        },
      },
      safarQazaByDate: {},
    });
  });

  it('1. Setting prayer status to ADA, MISSED, SAFAR, and QAZA works as expected', () => {
    const store = useTrackerStore.getState();

    // Mark Fajr as ADA
    store.setPrayerStatus(testDate, 'fajr', 'ADA');
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'fajr')).toBe('ADA');

    // Mark Zuhr as MISSED
    store.setPrayerStatus(testDate, 'zuhr', 'MISSED');
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'zuhr')).toBe('MISSED');

    // Mark Asr as SAFAR (replacing Excused)
    store.setPrayerStatus(testDate, 'asr', 'SAFAR');
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'asr')).toBe('SAFAR');

    // Mark Maghrib as QAZA
    store.setPrayerStatus(testDate, 'maghrib', 'QAZA');
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'maghrib')).toBe('QAZA');
  });

  it('2. Checking "Safar Mein Qaza" marks the prayer as a Safar-related Qaza prayer', () => {
    const store = useTrackerStore.getState();

    // Mark Zuhr as MISSED first
    store.setPrayerStatus(testDate, 'zuhr', 'MISSED');
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'zuhr')).toBe('MISSED');
    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'zuhr')).toBe(false);

    // Check Safar Mein Qaza
    store.setSafarQaza(testDate, 'zuhr', true);
    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'zuhr')).toBe(true);
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'zuhr')).toBe('MISSED');
  });

  it('3. Unchecking "Safar Mein Qaza" removes the Safar marking without deleting the prayer record', () => {
    const store = useTrackerStore.getState();

    // Mark Zuhr as MISSED with Safar Mein Qaza
    store.setPrayerStatus(testDate, 'zuhr', 'MISSED');
    store.setSafarQaza(testDate, 'zuhr', true);

    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'zuhr')).toBe('MISSED');
    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'zuhr')).toBe(true);

    // Uncheck Safar Mein Qaza
    store.setSafarQaza(testDate, 'zuhr', false);

    // Verify Safar marking is removed, BUT the prayer record remains MISSED (not deleted!)
    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'zuhr')).toBe(false);
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'zuhr')).toBe('MISSED');
  });

  it('4. Checking "Safar Mein Qaza" on an unrecorded prayer automatically initializes it as MISSED', () => {
    const store = useTrackerStore.getState();

    expect(store.getPrayerStatus(testDate, 'asr')).toBe('NONE');
    expect(store.isPrayerSafarQaza(testDate, 'asr')).toBe(false);

    // Check Safar Mein Qaza directly
    store.setSafarQaza(testDate, 'asr', true);

    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'asr')).toBe(true);
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'asr')).toBe('MISSED');
  });

  it('5. Undo / reset clears both the prayer record and Safar Mein Qaza flag', () => {
    const store = useTrackerStore.getState();

    store.setPrayerStatus(testDate, 'isha', 'MISSED');
    store.setSafarQaza(testDate, 'isha', true);

    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'isha')).toBe(true);

    // Undo prayer
    store.undoPrayerStatus(testDate, 'isha');

    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'isha')).toBe('NONE');
    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'isha')).toBe(false);
  });

  it('6. Changing status from MISSED to ADA clears Safar Qaza flag', () => {
    const store = useTrackerStore.getState();

    store.setPrayerStatus(testDate, 'fajr', 'MISSED');
    store.setSafarQaza(testDate, 'fajr', true);
    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'fajr')).toBe(true);

    // User marks Fajr as ADA
    store.setPrayerStatus(testDate, 'fajr', 'ADA');
    expect(useTrackerStore.getState().getPrayerStatus(testDate, 'fajr')).toBe('ADA');
    expect(useTrackerStore.getState().isPrayerSafarQaza(testDate, 'fajr')).toBe(false);
  });
});
