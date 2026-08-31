import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType =
  | 'PRAYER_REMINDER'
  | 'SURAH_MULK_REMINDER'
  | 'JUMUAH_KAHF_REMINDER'
  | 'TEST_NOTIFICATION';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED' | 'CANCELLED';

export interface INotificationJob extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  prayer?: 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha';
  targetDate: string; // YYYY-MM-DD
  targetTime: string; // HH:mm
  timezone: string;
  scheduledAt: Date; // UTC scheduled timestamp
  status: NotificationStatus;
  idempotencyKey: string; // userId_type_prayer_targetDate
  sentAt?: Date;
  failureReason?: string;
  payload: {
    title: string;
    body: string;
    url: string;
    tag?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationJobSchema = new Schema<INotificationJob>(
  {
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

// Compound indexes for fast scheduler query
notificationJobSchema.index({ status: 1, scheduledAt: 1 });

export const NotificationJob: Model<INotificationJob> =
  mongoose.models.NotificationJob ||
  mongoose.model<INotificationJob>('NotificationJob', notificationJobSchema);
