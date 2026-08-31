import mongoose, { Schema } from 'mongoose';
const notificationJobSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: [
            'PRAYER_REMINDER',
            'SURAH_MULK_REMINDER',
            'JUMUAH_KAHF_REMINDER',
            'TEST_NOTIFICATION',
        ],
        required: true,
    },
    prayer: {
        type: String,
        enum: ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'],
    },
    targetDate: {
        type: String,
        required: true,
        index: true,
    },
    targetTime: {
        type: String,
        required: true,
    },
    timezone: {
        type: String,
        required: true,
    },
    scheduledAt: {
        type: Date,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'FAILED', 'SKIPPED', 'CANCELLED'],
        default: 'PENDING',
        index: true,
    },
    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    sentAt: {
        type: Date,
    },
    failureReason: {
        type: String,
    },
    payload: {
        title: { type: String, required: true },
        body: { type: String, required: true },
        url: { type: String, required: true },
        tag: { type: String },
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            if (ret._id) {
                ret.id = ret._id.toString();
            }
            return ret;
        },
    },
});
// Compound indexes for fast scheduler query
notificationJobSchema.index({ status: 1, scheduledAt: 1 });
export const NotificationJob = mongoose.models.NotificationJob ||
    mongoose.model('NotificationJob', notificationJobSchema);
