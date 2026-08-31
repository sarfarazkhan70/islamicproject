import mongoose from 'mongoose';
import { FastingRecord, IFastingRecord, FastingStatus } from '../models/FastingRecord.js';
import { RamadanProgress, IRamadanProgress } from '../models/RamadanProgress.js';

export class RamadanService {
  static async getFastingRecords(
    userId: string | mongoose.Types.ObjectId,
    hijriYear?: number
  ): Promise<IFastingRecord[]> {
    const filter: any = { userId };
    if (hijriYear) {
      filter.hijriYear = hijriYear;
    }
    return FastingRecord.find(filter).sort({ localDate: 1 });
  }

  static async updateFastingRecord(
    userId: string | mongoose.Types.ObjectId,
    localDate: string,
    hijriYear: number,
    ramadanDay: number,
    status: FastingStatus,
    notes?: string
  ): Promise<IFastingRecord> {
    const record = await FastingRecord.findOneAndUpdate(
      { userId, localDate },
      { hijriYear, ramadanDay, status, notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return record;
  }

  static async getKhatamProgress(
    userId: string | mongoose.Types.ObjectId,
    hijriYear: number
  ): Promise<IRamadanProgress | null> {
    return RamadanProgress.findOne({ userId, hijriYear });
  }

  static async updateKhatamProgress(
    userId: string | mongoose.Types.ObjectId,
    hijriYear: number,
    completedJuz: number[],
    notes?: string
  ): Promise<IRamadanProgress> {
    const progress = await RamadanProgress.findOneAndUpdate(
      { userId, hijriYear },
      { completedJuz, notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return progress;
  }
}
