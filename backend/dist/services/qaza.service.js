import { Types } from 'mongoose';
import { QazaSummary } from '../models/QazaSummary.js';
import { QazaLog } from '../models/QazaLog.js';
import { AppError } from '../middleware/error.middleware.js';
export class QazaService {
    /**
     * Retrieves or initializes Qaza summary for a user
     */
    static async getOrCreateSummary(userId) {
        const userObjId = new Types.ObjectId(userId.toString());
        let summary = await QazaSummary.findOne({ userId: userObjId });
        if (!summary) {
            summary = await QazaSummary.create({
                userId: userObjId,
                fajr: 0,
                zuhr: 0,
                asr: 0,
                maghrib: 0,
                isha: 0,
                witr: 0,
                dailyTarget: 1,
                totalCompleted: 0,
            });
        }
        return summary;
    }
    /**
     * Updates baseline Qaza counts or lifetime estimate
     */
    static async updateCounts(userId, data) {
        const userObjId = new Types.ObjectId(userId.toString());
        const summary = await this.getOrCreateSummary(userObjId);
        if (data.fajr !== undefined)
            summary.fajr = Math.max(0, data.fajr);
        if (data.zuhr !== undefined)
            summary.zuhr = Math.max(0, data.zuhr);
        if (data.asr !== undefined)
            summary.asr = Math.max(0, data.asr);
        if (data.maghrib !== undefined)
            summary.maghrib = Math.max(0, data.maghrib);
        if (data.isha !== undefined)
            summary.isha = Math.max(0, data.isha);
        if (data.witr !== undefined)
            summary.witr = Math.max(0, data.witr);
        if (data.dailyTarget !== undefined)
            summary.dailyTarget = Math.max(1, data.dailyTarget);
        if (data.lifetimeEstimate !== undefined) {
            summary.lifetimeEstimate = {
                ...data.lifetimeEstimate,
                calculatedAt: new Date(),
            };
        }
        await summary.save();
        return summary;
    }
    /**
     * Increments outstanding Qaza count (+1, +5, +10)
     */
    static async incrementCount(userId, prayer, amount = 1) {
        const userObjId = new Types.ObjectId(userId.toString());
        const summary = await QazaSummary.findOneAndUpdate({ userId: userObjId }, { $inc: { [prayer]: amount } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        return summary;
    }
    /**
     * Records repayment of a Qaza prayer (decrements count and logs event)
     */
    static async repayQaza(userId, prayer, quantity = 1, localDate) {
        const userObjId = new Types.ObjectId(userId.toString());
        const summary = await this.getOrCreateSummary(userObjId);
        const currentCount = summary[prayer] || 0;
        if (currentCount < quantity) {
            throw new AppError(`Cannot repay ${quantity} ${prayer} Qaza prayers. Current count is ${currentCount}.`, 400, 'INSUFFICIENT_QAZA_COUNT');
        }
        summary[prayer] = Math.max(0, currentCount - quantity);
        summary.totalCompleted = (summary.totalCompleted || 0) + quantity;
        await summary.save();
        const dateStr = localDate || new Date().toISOString().split('T')[0];
        const log = await QazaLog.create({
            userId: userObjId,
            prayer,
            quantity,
            completedAt: new Date(),
            localDate: dateStr,
        });
        return { summary, log };
    }
    /**
     * Retrieves user's Qaza repayment logs
     */
    static async getLogs(userId, limit = 30) {
        const userObjId = new Types.ObjectId(userId.toString());
        return QazaLog.find({ userId: userObjId })
            .sort({ completedAt: -1 })
            .limit(limit);
    }
    /**
     * Updates user's daily Qaza repayment target
     */
    static async updateTarget(userId, dailyTarget) {
        const userObjId = new Types.ObjectId(userId.toString());
        const summary = await QazaSummary.findOneAndUpdate({ userId: userObjId }, { $set: { dailyTarget: Math.max(1, dailyTarget) } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        return summary;
    }
}
