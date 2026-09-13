import mongoose, { Document, Schema, Types } from 'mongoose';

export type PrayerType =
  | 'fajr'
  | 'zuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'tahajjud'
  | 'duha'
  | 'witr'
  | 'jumuah';

export type PrayerStatus = 'ADA' | 'MISSED' | 'SAFAR' | 'EXCUSED' | 'QAZA' | 'NONE';

export interface IPrayerRecord extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  localDate: string; // Format: "YYYY-MM-DD" to avoid UTC timezone shifting
  prayer: PrayerType;
  status: PrayerStatus;
  scheduledTime?: string; // e.g. "05:02 AM"
  markedAt: Date;
  timezone?: string; // e.g. "Asia/Riyadh"
  isVoluntary: boolean;
  isSafarQaza?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const prayerRecordSchema = new Schema<IPrayerRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    localDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    prayer: {
      type: String,
      required: true,
      enum: ['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'tahajjud', 'duha', 'witr', 'jumuah'],
    },
    status: {
      type: String,
      required: true,
      enum: ['ADA', 'MISSED', 'SAFAR', 'EXCUSED', 'QAZA', 'NONE'],
      default: 'NONE',
    },
    scheduledTime: {
      type: String,
      trim: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    isVoluntary: {
      type: Boolean,
      default: false,
    },
    isSafarQaza: {
      type: Boolean,
      default: false,
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

// Compound Unique Index: Prevent duplicate records for the same user + localDate + prayer
prayerRecordSchema.index({ userId: 1, localDate: 1, prayer: 1 }, { unique: true });

// Analytics Index
prayerRecordSchema.index({ userId: 1, localDate: 1, status: 1 });

export const PrayerRecord =
  (mongoose.models.PrayerRecord as mongoose.Model<IPrayerRecord>) ||
  mongoose.model<IPrayerRecord>('PrayerRecord', prayerRecordSchema);
