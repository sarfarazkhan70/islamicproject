import mongoose, { Document, Schema, Model } from 'mongoose';
import { NotificationType } from './NotificationJob.js';

export interface INotificationLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  url: string;
  status: 'DELIVERED' | 'FAILED' | 'EXPIRED_SUBSCRIPTION';
  deliveredCount: number;
  failedCount: number;
  sentAt: Date;
  createdAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
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

export const NotificationLog: Model<INotificationLog> =
  mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>('NotificationLog', notificationLogSchema);
