import mongoose, { Schema, Document } from 'mongoose';

export interface IRamadanProgress extends Document {
  userId: mongoose.Types.ObjectId;
  hijriYear: number;
  completedJuz: number[];
  targetKhatamDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RamadanProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hijriYear: {
      type: Number,
      required: true,
    },
    completedJuz: {
      type: [Number],
      default: [],
    },
    targetKhatamDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

RamadanProgressSchema.index({ userId: 1, hijriYear: 1 }, { unique: true });

export const RamadanProgress = mongoose.model<IRamadanProgress>(
  'RamadanProgress',
  RamadanProgressSchema
);
