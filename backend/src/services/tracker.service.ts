import { Types } from 'mongoose';
import { PrayerRecord, IPrayerRecord, PrayerType, PrayerStatus } from '../models/PrayerRecord.js';

export interface UpsertPrayerInput {
  localDate: string;
  prayer: PrayerType;
  status: PrayerStatus;
  scheduledTime?: string;
  timezone?: string;
  isVoluntary?: boolean;
}

export class TrackerService {
  /**
   * Retrieves all prayer records for a user on a specific local date (YYYY-MM-DD)
   */
  static async getDailyRecords(userId: string | Types.ObjectId, localDate: string): Promise<IPrayerRecord[]> {
    return PrayerRecord.find({
      userId: new Types.ObjectId(userId.toString()),
      localDate,
    }).sort({ createdAt: 1 });
  }

  /**
   * Idempotently creates or updates a single prayer status
   */
  static async upsertPrayerStatus(
    userId: string | Types.ObjectId,
    data: UpsertPrayerInput
  ): Promise<IPrayerRecord> {
    const userObjId = new Types.ObjectId(userId.toString());

    const record = await PrayerRecord.findOneAndUpdate(
      {
        userId: userObjId,
        localDate: data.localDate,
        prayer: data.prayer,
      },
      {
        $set: {
          status: data.status,
          scheduledTime: data.scheduledTime,
          timezone: data.timezone || 'UTC',
          isVoluntary: data.isVoluntary ?? false,
          markedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return record;
  }

  /**
   * Bulk synchronizes multiple prayer records (e.g. from local storage / offline replay)
   */
  static async bulkSync(
    userId: string | Types.ObjectId,
    records: UpsertPrayerInput[]
  ): Promise<{ syncedCount: number }> {
    const userObjId = new Types.ObjectId(userId.toString());
    const bulkOps = records.map((rec) => ({
      updateOne: {
        filter: {
          userId: userObjId,
          localDate: rec.localDate,
          prayer: rec.prayer,
        },
        update: {
          $set: {
            status: rec.status,
            scheduledTime: rec.scheduledTime,
            timezone: rec.timezone || 'UTC',
            isVoluntary: rec.isVoluntary ?? false,
            markedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length === 0) return { syncedCount: 0 };
    const res = await PrayerRecord.bulkWrite(bulkOps);
    return { syncedCount: (res.upsertedCount || 0) + (res.modifiedCount || 0) };
  }

  /**
   * Resets / undoes a prayer status
   */
  static async undoStatus(
    userId: string | Types.ObjectId,
    localDate: string,
    prayer: PrayerType
  ): Promise<{ success: boolean }> {
    const userObjId = new Types.ObjectId(userId.toString());
    await PrayerRecord.findOneAndDelete({
      userId: userObjId,
      localDate,
      prayer,
    });
    return { success: true };
  }
}
