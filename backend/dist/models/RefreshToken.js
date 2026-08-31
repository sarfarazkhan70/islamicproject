import mongoose, { Schema } from 'mongoose';
const refreshTokenSchema = new Schema({
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
}, {
    timestamps: true,
});
export const RefreshToken = mongoose.models.RefreshToken ||
    mongoose.model('RefreshToken', refreshTokenSchema);
