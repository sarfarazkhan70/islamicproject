import mongoose, { Document, Schema, Types } from 'mongoose';
import { PrayerType } from './PrayerRecord.js';

export interface IQazaLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  prayer: PrayerType;
  quantity: number;
  completedAt: Date;
  localDate: string; // "YYYY-MM-DD"
  createdAt: Date;
  updatedAt: Date;
}

const qazaLogSchema = new Schema<IQazaLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prayer: {
      type: String,
      required: true,
      enum: ['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'witr'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    localDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

qazaLogSchema.index({ userId: 1, completedAt: -1 });

export const QazaLog =
  (mongoose.models.QazaLog as mongoose.Model<IQazaLog>) ||
  mongoose.model<IQazaLog>('QazaLog', qazaLogSchema);
