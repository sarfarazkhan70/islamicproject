import { describe, it, expect, beforeEach } from 'vitest';
import { useTrackerStore } from '../stores/useTrackerStore';

describe('Prayer History & Qaza Management Calendar Integration', () => {
  const originalDate = '2026-09-10';
  const qazaRepayDate = '2026-09-13';

  beforeEach(() => {
    // Reset tracker state
    useTrackerStore.setState({
      recordsByDate: {},
      safarQazaByDate: {},
      qazaCompletionsByDate: {},
      qazaSummary: {
        fajr: 10,
        zuhr: 8,
        asr: 12,
        maghrib: 4,
        isha: 15,
        witr: 15,
        dailyTarget: 3,
        totalCompleted: 20,
      },
      qazaLogs: [],
    });
  });

  it('1. Connects Namaz Tracker with Prayer History: logging in Tracker is immediately accessible in History', () => {
    const store = useTrackerStore.getState();

    // User logs Fajr as ADA and Zuhr as MISSED in Namaz Tracker
    store.setPrayerStatus('2026-09-13', 'fajr', 'ADA');
    store.setPrayerStatus('2026-09-13', 'zuhr', 'MISSED');

    // Verify in History queries
    expect(useTrackerStore.getState().getPrayerStatus('2026-09-13', 'fajr')).toBe('ADA');
    expect(useTrackerStore.getState().getPrayerStatus('2026-09-13', 'zuhr')).toBe('MISSED');

    const dateSum = useTrackerStore.getState().getDateSummary('2026-09-13');
    expect(dateSum.ada).toBe(1);
    expect(dateSum.missed).toBe(1);
    expect(dateSum.totalTracked).toBe(2);
  });

  it('2. Shows complete daily summary for selected date with Ada, Missed, Qaza, and Safar Mein Qaza', () => {
    const store = useTrackerStore.getState();

    store.setPrayerStatus(originalDate, 'fajr', 'ADA');
    store.setPrayerStatus(originalDate, 'zuhr', 'MISSED');
    store.setPrayerStatus(originalDate, 'asr', 'MISSED');
    store.setSafarQaza(originalDate, 'asr', true); // Safar Mein Qaza
    store.setPrayerStatus(originalDate, 'maghrib', 'QAZA');
    store.setPrayerStatus(originalDate, 'isha', 'SAFAR');

    const summary = store.getDateSummary(originalDate);
    expect(summary.ada).toBe(1);
    expect(summary.missed).toBe(1); // zuhr
    expect(summary.safarQaza).toBe(1); // asr
    expect(summary.qaza).toBe(1); // maghrib
    expect(summary.safar).toBe(1); // isha
    expect(summary.totalTracked).toBe(5);
  });

  it('3. Allows updating a previously missed/Qaza prayer directly from its original date', () => {
    const store = useTrackerStore.getState();

    // On 10 September, Fajr was Missed
    store.setPrayerStatus(originalDate, 'fajr', 'MISSED');
    expect(useTrackerStore.getState().getPrayerStatus(originalDate, 'fajr')).toBe('MISSED');

    // Later, user opens 10 September in History and updates it to Qaza
    store.setPrayerStatus(originalDate, 'fajr', 'QAZA');
    expect(useTrackerStore.getState().getPrayerStatus(originalDate, 'fajr')).toBe('QAZA');

    const summary = useTrackerStore.getState().getDateSummary(originalDate);
    expect(summary.qaza).toBe(1);
    expect(summary.missed).toBe(0);
  });

  it('4. Marking a Qaza prayer as Ada saves the Qaza completion date separately from original prayer date', () => {
    const store = useTrackerStore.getState();

    // Original Date: 10 September, Fajr: QAZA
    store.setPrayerStatus(originalDate, 'fajr', 'QAZA');
    expect(store.getPrayerStatus(originalDate, 'fajr')).toBe('QAZA');

    const initialFajrQaza = store.qazaSummary.fajr;
    const initialCompleted = store.qazaSummary.totalCompleted;

    // User repays this Qaza on 13 September
    store.markQazaAsAda(originalDate, 'fajr', qazaRepayDate);

    // 1. Original prayer date's status is now ADA
    expect(useTrackerStore.getState().getPrayerStatus(originalDate, 'fajr')).toBe('ADA');

    // 2. Qaza completion date is stored separately
    const completionInfo = useTrackerStore.getState().getQazaCompletionInfo(originalDate, 'fajr');
    expect(completionInfo).toBeDefined();
    expect(completionInfo?.completedAtDate).toBe(qazaRepayDate);

    // 3. Qaza totals are updated correctly
    expect(useTrackerStore.getState().qazaSummary.fajr).toBe(initialFajrQaza - 1);
    expect(useTrackerStore.getState().qazaSummary.totalCompleted).toBe(initialCompleted + 1);

    // 4. Daily summary for original date reflects Ada
    const updatedDateSum = useTrackerStore.getState().getDateSummary(originalDate);
    expect(updatedDateSum.ada).toBe(1);
    expect(updatedDateSum.qaza).toBe(0);
  });

  it('5. Monthly summary accurately calculates Total Ada, Missed, Safar Mein Qaza, and Qaza Remaining', () => {
    const store = useTrackerStore.getState();

    // Add prayers across September 2026
    store.setPrayerStatus('2026-09-01', 'fajr', 'ADA');
    store.setPrayerStatus('2026-09-01', 'zuhr', 'ADA');
    store.setPrayerStatus('2026-09-02', 'fajr', 'MISSED');
    store.setPrayerStatus('2026-09-03', 'asr', 'MISSED');
    store.setSafarQaza('2026-09-03', 'asr', true); // Safar Mein Qaza
    store.setPrayerStatus('2026-09-04', 'maghrib', 'QAZA');

    const monthSum = store.getMonthSummary(2026, 9);
    expect(monthSum.ada).toBe(2);
    expect(monthSum.missed).toBe(1);
    expect(monthSum.safarQaza).toBe(1);
    expect(monthSum.qaza).toBe(1);
    expect(monthSum.qazaRemaining).toBeGreaterThan(0);
  });
});
