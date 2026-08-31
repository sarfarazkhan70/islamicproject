import mongoose, { Schema } from 'mongoose';
const AzkarFavoriteSchema = new Schema({
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
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
AzkarFavoriteSchema.index({ userId: 1, azkarId: 1 }, { unique: true });
export const AzkarFavorite = mongoose.model('AzkarFavorite', AzkarFavoriteSchema);
