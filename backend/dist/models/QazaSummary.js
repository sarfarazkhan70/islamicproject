import mongoose, { Schema } from 'mongoose';
const qazaSummarySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    fajr: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    zuhr: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    asr: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    maghrib: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    isha: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    witr: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    dailyTarget: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    totalCompleted: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    lifetimeEstimate: {
        totalMonthsMissed: Number,
        startingAge: Number,
        gender: String,
        calculatedAt: Date,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            ret.id = ret._id ? ret._id.toString() : '';
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
export const QazaSummary = mongoose.models.QazaSummary ||
    mongoose.model('QazaSummary', qazaSummarySchema);
