import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from 'vitest';

// Minimal browser mocks for frontend engine tests running in Node
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}
if (typeof (globalThis as any).Audio === 'undefined') {
  (globalThis as any).Audio = class {
    src: string;
    volume: number = 1.0;
    currentTime: number = 0;
    loop: boolean = false;
    onended: (() => void) | null = null;
    constructor(src: string) {
      this.src = src;
    }
    play() {
      return Promise.resolve();
    }
    pause() {}
  };
}
if (typeof (globalThis as any).Notification === 'undefined') {
  (globalThis as any).Notification = class {
    static permission = 'granted';
    constructor(public title: string, public options: any) {}
  };
}

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_long_12345';
  process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_minimum_32_characters_long_12345';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

import { User } from '../src/models/User.js';
import { UserPreferences } from '../src/models/UserPreferences.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { PrayerRecord } from '../src/models/PrayerRecord.js';
import { QazaSummary } from '../src/models/QazaSummary.js';
import { QazaLog } from '../src/models/QazaLog.js';
import { PushSubscription } from '../src/models/PushSubscription.js';
import { NotificationJob } from '../src/models/NotificationJob.js';
import { NotificationLog } from '../src/models/NotificationLog.js';
import { Bookmark } from '../src/models/Bookmark.js';
import { ReadingProgress } from '../src/models/ReadingProgress.js';
import { AzkarFavorite } from '../src/models/AzkarFavorite.js';
import { FastingRecord } from '../src/models/FastingRecord.js';
import { RamadanProgress } from '../src/models/RamadanProgress.js';

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    UserPreferences.deleteMany({}),
    RefreshToken.deleteMany({}),
    PrayerRecord.deleteMany({}),
    QazaSummary.deleteMany({}),
    QazaLog.deleteMany({}),
    PushSubscription.deleteMany({}),
    NotificationJob.deleteMany({}),
    NotificationLog.deleteMany({}),
    Bookmark.deleteMany({}),
    ReadingProgress.deleteMany({}),
    AzkarFavorite.deleteMany({}),
    FastingRecord.deleteMany({}),
    RamadanProgress.deleteMany({}),
  ]);
});
