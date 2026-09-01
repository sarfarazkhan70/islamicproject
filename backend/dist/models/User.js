import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
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
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.passwordHash;
            delete ret.__v;
            if (ret._id) {
                ret.id = ret._id.toString();
            }
            return ret;
        },
    },
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);
