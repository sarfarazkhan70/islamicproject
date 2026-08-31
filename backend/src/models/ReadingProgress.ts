import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingProgress extends Document {
  userId: mongoose.Types.ObjectId;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  pageNumber?: number;
  updatedAt: Date;
}

const ReadingProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    surahNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 114,
    },
    ayahNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    surahName: {
      type: String,
      required: true,
      trim: true,
    },
    pageNumber: {
      type: Number,
      min: 1,
      max: 604,
    },
  },
  {
    timestamps: true,
  }
);

export const ReadingProgress = mongoose.model<IReadingProgress>(
  'ReadingProgress',
  ReadingProgressSchema
);
