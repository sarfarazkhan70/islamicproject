import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPushSubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device?: {
    userAgent?: string;
    platform?: string;
  };
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        if (ret._id) {
          ret.id = (ret._id as { toString(): string }).toString();
        }
        return ret;
      },
    },
  }
);

// Prevent duplicate subscriptions for the same user and endpoint
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

export const PushSubscription: Model<IPushSubscription> =
  mongoose.models.PushSubscription ||
  mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);
