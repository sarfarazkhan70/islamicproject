import mongoose, { Schema, Document } from 'mongoose';

export type FastingStatus = 'FASTED' | 'MISSED' | 'EXCUSED' | 'QAZA';

export interface IFastingRecord extends Document {
  userId: mongoose.Types.ObjectId;
  localDate: string; // YYYY-MM-DD
  hijriYear: number;
  ramadanDay: number;
  status: FastingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FastingRecordSchema: Schema = new Schema(
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
    },
    hijriYear: {
      type: Number,
      required: true,
    },
    ramadanDay: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    status: {
      type: String,
      enum: ['FASTED', 'MISSED', 'EXCUSED', 'QAZA'],
      default: 'FASTED',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring idempotent record per date for user
FastingRecordSchema.index({ userId: 1, localDate: 1 }, { unique: true });

export const FastingRecord = mongoose.model<IFastingRecord>(
  'FastingRecord',
  FastingRecordSchema
);
