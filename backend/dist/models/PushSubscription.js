import mongoose, { Schema } from 'mongoose';
const pushSubscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    endpoint: {
        type: String,
        required: true,
    },
    keys: {
        p256dh: {
            type: String,
            required: true,
        },
        auth: {
            type: String,
            required: true,
        },
    },
    device: {
        userAgent: { type: String },
        platform: { type: String },
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    lastUsedAt: {
        type: Date,
        default: Date.now,
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
// Prevent duplicate subscriptions for the same user and endpoint
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });
export const PushSubscription = mongoose.models.PushSubscription ||
    mongoose.model('PushSubscription', pushSubscriptionSchema);
