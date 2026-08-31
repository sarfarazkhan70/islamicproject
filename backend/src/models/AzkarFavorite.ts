import mongoose, { Schema, Document } from 'mongoose';

export interface IAzkarFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  azkarId: string;
  createdAt: Date;
}

const AzkarFavoriteSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    azkarId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AzkarFavoriteSchema.index({ userId: 1, azkarId: 1 }, { unique: true });

export const AzkarFavorite = mongoose.model<IAzkarFavorite>(
  'AzkarFavorite',
  AzkarFavoriteSchema
);
