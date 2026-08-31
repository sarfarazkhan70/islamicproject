import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email?: string;
  phone?: string;
  name?: string;
  passwordHash?: string;
  isAnonymous: boolean;
  guestId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // Never return password hash by default
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    guestId: {
      type: String,
      sparse: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        delete ret.__v;
        if (ret._id) {
          ret.id = (ret._id as { toString(): string }).toString();
        }
        return ret;
      },
    },
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
