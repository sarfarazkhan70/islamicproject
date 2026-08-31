import { FastingRecord } from '../models/FastingRecord.js';
import { RamadanProgress } from '../models/RamadanProgress.js';
export class RamadanService {
    static async getFastingRecords(userId, hijriYear) {
        const filter = { userId };
        if (hijriYear) {
            filter.hijriYear = hijriYear;
        }
        return FastingRecord.find(filter).sort({ localDate: 1 });
    }
    static async updateFastingRecord(userId, localDate, hijriYear, ramadanDay, status, notes) {
        const record = await FastingRecord.findOneAndUpdate({ userId, localDate }, { hijriYear, ramadanDay, status, notes }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return record;
    }
    static async getKhatamProgress(userId, hijriYear) {
        return RamadanProgress.findOne({ userId, hijriYear });
    }
    static async updateKhatamProgress(userId, hijriYear, completedJuz, notes) {
        const progress = await RamadanProgress.findOneAndUpdate({ userId, hijriYear }, { completedJuz, notes }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return progress;
    }
}
