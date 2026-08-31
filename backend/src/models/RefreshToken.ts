import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRefreshToken extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  replacedByTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatic TTL expiration by MongoDB
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    replacedByTokenHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
