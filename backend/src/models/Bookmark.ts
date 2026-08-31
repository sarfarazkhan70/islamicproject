import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText?: string;
  createdAt: Date;
}

const BookmarkSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    ayahText: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent duplicate bookmark on the exact same ayah for a user
BookmarkSchema.index({ userId: 1, surahNumber: 1, ayahNumber: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
