import mongoose, { Schema } from 'mongoose';
const userPreferencesSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [lng, lat]
            default: [39.8262, 21.4225], // Makkah coordinates
        },
        city: {
            type: String,
            default: 'Makkah',
        },
        country: {
            type: String,
            default: 'Saudi Arabia',
        },
        timezone: {
            type: String,
            default: 'Asia/Riyadh',
        },
        isAutoDetected: {
            type: Boolean,
            default: true,
        },
    },
    madhhab: {
        type: String,
        enum: ['hanafi', 'shafii', 'maliki', 'hanbali'],
        default: 'hanafi',
    },
    calculationMethod: {
        type: String,
        enum: [
            'Karachi',
            'MWL',
            'ISNA',
            'Egypt',
            'Makkah',
            'Tehran',
            'Gulf',
            'Moonsighting',
        ],
        default: 'Karachi',
    },
    highLatitudeRule: {
        type: String,
        enum: ['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle', 'None'],
        default: 'TwilightAngle',
    },
    timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h',
    },
    theme: {
        type: String,
        enum: ['emerald-dark', 'desert-light', 'oled-black'],
        default: 'emerald-dark',
    },
    adhanSound: {
        type: String,
        default: 'makkah',
    },
    hijriDateAdjustment: {
        type: Number,
        min: -2,
        max: 2,
        default: 0,
    },
    notifications: {
        enabled: {
            type: Boolean,
            default: true,
        },
        prayerReminders: {
            enabled: { type: Boolean, default: true },
            fajr: { type: Boolean, default: true },
            zuhr: { type: Boolean, default: true },
            asr: { type: Boolean, default: true },
            maghrib: { type: Boolean, default: true },
            isha: { type: Boolean, default: true },
            leadTimeMinutes: { type: Number, enum: [0, 5, 10, 15], default: 0 },
        },
        surahMulk11pm: {
            enabled: { type: Boolean, default: true },
            time: { type: String, default: '23:00' },
        },
        fridayKahf: {
            enabled: { type: Boolean, default: true },
            leadTimeMinutes: { type: Number, default: 60 },
        },
        jumuahTime: {
            type: String,
            default: '13:30',
        },
        soundEnabled: {
            type: Boolean,
            default: true,
        },
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            if (ret._id) {
                ret.id = ret._id.toString();
            }
            return ret;
        },
    },
});
export const UserPreferences = mongoose.models.UserPreferences ||
    mongoose.model('UserPreferences', userPreferencesSchema);
