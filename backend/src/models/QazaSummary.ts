import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQazaSummary extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fajr: number;
  zuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
  dailyTarget: number;
  totalCompleted: number;
  lifetimeEstimate?: {
    totalMonthsMissed: number;
    startingAge: number;
    gender: string;
    calculatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const qazaSummarySchema = new Schema<IQazaSummary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fajr: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    zuhr: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    asr: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maghrib: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isha: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    witr: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    dailyTarget: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    totalCompleted: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lifetimeEstimate: {
      totalMonthsMissed: Number,
      startingAge: Number,
      gender: String,
      calculatedAt: Date,
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

export const QazaSummary =
  (mongoose.models.QazaSummary as mongoose.Model<IQazaSummary>) ||
  mongoose.model<IQazaSummary>('QazaSummary', qazaSummarySchema);
