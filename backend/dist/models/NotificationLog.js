import mongoose, { Schema } from 'mongoose';
const notificationLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'NotificationJob',
    },
    type: {
        type: String,
        required: true,
        index: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    url: { type: String, required: true },
    status: {
        type: String,
        enum: ['DELIVERED', 'FAILED', 'EXPIRED_SUBSCRIPTION'],
        required: true,
    },
    deliveredCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    sentAt: { type: Date, default: Date.now, index: true },
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
export const NotificationLog = mongoose.models.NotificationLog ||
    mongoose.model('NotificationLog', notificationLogSchema);
