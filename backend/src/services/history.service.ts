import { Types } from 'mongoose';
import { PrayerRecord } from '../models/PrayerRecord.js';

export interface PrayerStats {
  totalTracked: number;
  ada: number;
  missed: number;
  excused: number;
  qaza: number;
  adaPercentage: number;
  currentStreak: number;
  longestStreak: number;
  prayerBreakdown: {
    fajr: { ada: number; total: number; percentage: number };
    zuhr: { ada: number; total: number; percentage: number };
    asr: { ada: number; total: number; percentage: number };
    maghrib: { ada: number; total: number; percentage: number };
    isha: { ada: number; total: number; percentage: number };
  };
}

export class HistoryService {
  /**
   * Computes overall prayer statistics and streaks for a user
   */
  static async getOverallSummary(userId: string | Types.ObjectId): Promise<PrayerStats> {
    const userObjId = new Types.ObjectId(userId.toString());
    const records = await PrayerRecord.find({
      userId: userObjId,
      status: { $ne: 'NONE' },
    }).sort({ localDate: 1 });

    let ada = 0;
    let missed = 0;
    let excused = 0;
    let qaza = 0;

    const breakdown = {
      fajr: { ada: 0, total: 0, percentage: 0 },
      zuhr: { ada: 0, total: 0, percentage: 0 },
      asr: { ada: 0, total: 0, percentage: 0 },
      maghrib: { ada: 0, total: 0, percentage: 0 },
      isha: { ada: 0, total: 0, percentage: 0 },
    };

    // Group by localDate for streak calculation
    const daysMap = new Map<string, { fardAda: number; fardExcused: number; fardTotal: number }>();

    for (const r of records) {
      if (r.status === 'ADA') ada++;
      else if (r.status === 'MISSED') missed++;
      else if (r.status === 'SAFAR' || r.status === 'EXCUSED') excused++;
      else if (r.status === 'QAZA') qaza++;

      if (['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].includes(r.prayer)) {
        const pKey = r.prayer as 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha';
        breakdown[pKey].total++;
        if (r.status === 'ADA') breakdown[pKey].ada++;

        // Track per-day fard completion
        if (!daysMap.has(r.localDate)) {
          daysMap.set(r.localDate, { fardAda: 0, fardExcused: 0, fardTotal: 0 });
        }
        const d = daysMap.get(r.localDate)!;
        d.fardTotal++;
        if (r.status === 'ADA') d.fardAda++;
        if (r.status === 'SAFAR' || r.status === 'EXCUSED') d.fardExcused++;
      }
    }

    // Calculate prayer breakdown percentages
    for (const k of ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'] as const) {
      const b = breakdown[k];
      b.percentage = b.total > 0 ? Math.round((b.ada / b.total) * 100) : 0;
    }

    const eligibleTracked = ada + missed + qaza;
    const adaPercentage = eligibleTracked > 0 ? Math.round((ada / eligibleTracked) * 100) : 0;

    // Calculate Streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(daysMap);

    return {
      totalTracked: records.length,
      ada,
      missed,
      excused,
      qaza,
      adaPercentage,
      currentStreak,
      longestStreak,
      prayerBreakdown: breakdown,
    };
  }

  /**
   * Helper: Calculates current and longest streaks from daily completion map
   */
  private static calculateStreaks(
    daysMap: Map<string, { fardAda: number; fardExcused: number; fardTotal: number }>
  ): { currentStreak: number; longestStreak: number } {
    const sortedDates = Array.from(daysMap.keys()).sort();
    if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const d = daysMap.get(dateStr)!;
      // Successful day: all 5 prayers accounted for and all are ADA or EXCUSED
      const isSuccessful = (d.fardAda + d.fardExcused >= 5);
      const currDate = new Date(dateStr + 'T00:00:00Z');

      if (isSuccessful) {
        if (prevDate) {
          const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        prevDate = currDate;
      } else {
        tempStreak = 0;
        prevDate = null;
      }

      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // Check if current streak extends to today or yesterday
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (daysMap.has(todayStr)) {
      const d = daysMap.get(todayStr)!;
      if (d.fardAda + d.fardExcused >= 5) {
        currentStreak = tempStreak;
      } else if (daysMap.has(yesterdayStr)) {
        // Today is in-progress, preserve streak from yesterday
        currentStreak = tempStreak;
      }
    } else if (daysMap.has(yesterdayStr)) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Retrieves daily prayer breakdown for a specific month
   */
  static async getMonthlyBreakdown(
    userId: string | Types.ObjectId,
    year: number,
    month: number
  ) {
    const userObjId = new Types.ObjectId(userId.toString());
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const prefix = `${year}-${monthStr}`;

    const records = await PrayerRecord.find({
      userId: userObjId,
      localDate: { $regex: `^${prefix}` },
    }).sort({ localDate: 1 });

    const daysMap: Record<string, Record<string, string>> = {};
    for (const r of records) {
      if (!daysMap[r.localDate]) daysMap[r.localDate] = {};
      daysMap[r.localDate][r.prayer] = r.status;
    }

    return {
      year,
      month,
      days: daysMap,
      totalRecords: records.length,
    };
  }

  /**
   * Retrieves yearly heatmap contribution data
   */
  static async getYearlyHeatmap(userId: string | Types.ObjectId, year: number) {
    const userObjId = new Types.ObjectId(userId.toString());
    const prefix = `${year}-`;

    const records = await PrayerRecord.find({
      userId: userObjId,
      localDate: { $regex: `^${prefix}` },
      status: { $in: ['ADA', 'SAFAR', 'EXCUSED'] },
      prayer: { $in: ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'] },
    });

    const dayCounts: Record<string, number> = {};
    for (const r of records) {
      dayCounts[r.localDate] = (dayCounts[r.localDate] || 0) + 1;
    }

    const heatmap = Object.entries(dayCounts).map(([date, count]) => {
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;
      return { date, count, level };
    });

    return { year, heatmap };
  }
}
