import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotificationPreferences {
  enabled: boolean;
  prayerReminders: {
    enabled: boolean;
    fajr: boolean;
    zuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    leadTimeMinutes: number; // 0, 5, 10, 15
  };
  surahMulk11pm: {
    enabled: boolean;
    time: string; // "23:00"
  };
  fridayKahf: {
    enabled: boolean;
    leadTimeMinutes: number; // 60 minutes before Jumu'ah
  };
  jumuahTime: string; // e.g. "13:30" (User's configured local congregation time)
  soundEnabled: boolean;
}

export interface IUserPreferences extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [Longitude, Latitude]
    city: string;
    country: string;
    timezone: string;
    isAutoDetected: boolean;
  };
  madhhab: 'hanafi' | 'shafii' | 'maliki' | 'hanbali';
  calculationMethod:
    | 'Karachi'
    | 'MWL'
    | 'ISNA'
    | 'Egypt'
    | 'Makkah'
    | 'Tehran'
    | 'Gulf'
    | 'Moonsighting';
  highLatitudeRule: 'MiddleOfTheNight' | 'SeventhOfTheNight' | 'TwilightAngle' | 'None';
  timeFormat: '12h' | '24h';
  theme: 'emerald-dark' | 'desert-light' | 'oled-black';
  adhanSound: string;
  hijriDateAdjustment: number;
  notifications: INotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        if (ret._id) {
          ret.id = (ret._id as { toString(): string }).toString();
        }
        return ret;
      },
    },
  }
);

export const UserPreferences: Model<IUserPreferences> =
  mongoose.models.UserPreferences ||
  mongoose.model<IUserPreferences>('UserPreferences', userPreferencesSchema);
