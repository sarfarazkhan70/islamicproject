import mongoose, { Schema } from 'mongoose';
const RamadanProgressSchema = new Schema({
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
}, {
    timestamps: true,
});
RamadanProgressSchema.index({ userId: 1, hijriYear: 1 }, { unique: true });
export const RamadanProgress = mongoose.model('RamadanProgress', RamadanProgressSchema);
