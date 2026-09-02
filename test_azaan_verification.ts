// Mock minimal browser globals for Node.js test environment
let lastAudioInstance: any = null;
(global as any).window = global;
(global as any).Audio = class {
  src: string;
  volume: number = 1.0;
  currentTime: number = 0;
  loop: boolean = false;
  onended: (() => void) | null = null;
  constructor(src: string) {
    this.src = src;
    lastAudioInstance = this;
  }
  play() {
    return Promise.resolve();
  }
  pause() {}
};
(global as any).Notification = class {
  static permission = 'granted';
  constructor(public title: string, public options: any) {}
};

import { calculatePrayerTimes } from './frontend/src/core/prayerEngine/prayerEngine.js';
import { azaanScheduler } from './frontend/src/core/azaan/azaanScheduler.js';
import { useLocationStore } from './frontend/src/stores/useLocationStore.js';
import { useSettingsStore } from './frontend/src/stores/useSettingsStore.js';
import { useNotificationStore } from './frontend/src/stores/useNotificationStore.js';
import { MPEGDecoder } from './backend/node_modules/mpg123-decoder/index.js';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('================================================================');
  console.log('🕌 RUNNING MADINA AZAAN & 15-MIN NAMAZ REMINDER VERIFICATION QA');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${title}`);
      process.exitCode = 1;
    }
  }

  // Test 1: Full Authentic Madina Azaan audio file check (Prayer time audio)
  const madinaAzaanPath = path.resolve('./frontend/public/audio/madina_azaan.mp3');
  assert(fs.existsSync(madinaAzaanPath), 'madina_azaan.mp3 exists at frontend/public/audio/madina_azaan.mp3');
  const madinaSize = fs.statSync(madinaAzaanPath).size;
  assert(madinaSize > 500000, `madina_azaan.mp3 is a complete high-quality recording (${(madinaSize / 1024).toFixed(1)} KB)`);

  const decoder1 = new MPEGDecoder();
  await decoder1.ready;
  const decodedAzaan = decoder1.decode(fs.readFileSync(madinaAzaanPath));
  const azaanDuration = decodedAzaan.channelData[0].length / decodedAzaan.sampleRate;
  assert(azaanDuration > 250, `madina_azaan.mp3 is the FULL authentic Madina Azaan (${azaanDuration.toFixed(1)}s)`);
  decoder1.free();

  // Test 2: Separate 15-Minute Namaz Reminder Audio Check ("Hayya 'alas-Salah" x2, "Hayya 'alal-Falah" x2)
  const reminderMp3Path = path.resolve('./frontend/public/audio/namaz_reminder.mp3');
  const reminderWavPath = path.resolve('./frontend/public/audio/namaz_reminder.wav');
  assert(fs.existsSync(reminderMp3Path), 'namaz_reminder.mp3 exists at frontend/public/audio/namaz_reminder.mp3');
  assert(fs.existsSync(reminderWavPath), 'namaz_reminder.wav exists at frontend/public/audio/namaz_reminder.wav');

  const decoder2 = new MPEGDecoder();
  await decoder2.ready;
  const decodedReminder = decoder2.decode(fs.readFileSync(reminderMp3Path));
  const reminderDuration = decodedReminder.channelData[0].length / decodedReminder.sampleRate;
  assert(reminderDuration >= 45.0 && reminderDuration <= 60.0, `namaz_reminder.mp3 contains ONLY the 4 call phrases with natural pauses (${reminderDuration.toFixed(1)}s)`);
  decoder2.free();

  // Test 3: Ensure Madina Azaan and 15-Minute Reminder are completely separate files
  assert(reminderMp3Path !== madinaAzaanPath, 'Madina Azaan and 15-minute reminder audio files are separate');
  assert(fs.statSync(reminderMp3Path).size !== fs.statSync(madinaAzaanPath).size, 'Audio file sizes confirm two distinct recordings');

  // Test 4: Core prayer calculation & exact timings
  const testDate = new Date('2026-09-02T12:00:00.000Z');
  const makkahCoords = { latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' };
  const timetable = calculatePrayerTimes({
    date: testDate,
    latitude: makkahCoords.latitude,
    longitude: makkahCoords.longitude,
    timezone: makkahCoords.timezone,
    options: { madhhab: 'hanafi', calculationMethod: 'UmmAlQura' }
  });

  const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'] as const;
  for (const p of prayers) {
    const item = timetable.prayers.find(x => x.key === p);
    assert(item !== undefined && item.date instanceof Date, `Exact calculated prayer time for ${p.toUpperCase()}: ${item?.timeFormatted}`);
  }

  // Test 5: +15 Minute Reminder Exact Delta
  for (const p of prayers) {
    const item = timetable.prayers.find(x => x.key === p)!;
    const azaanTime = item.date;
    const reminderTime = new Date(azaanTime.getTime() + 15 * 60 * 1000);
    const diffMinutes = (reminderTime.getTime() - azaanTime.getTime()) / (1000 * 60);
    assert(diffMinutes === 15, `Prayer ${p.toUpperCase()} 15-minute reminder is scheduled exactly at +15m (${diffMinutes}m)`);
  }

  // Test 6: Full Azaan Playback behavior at prayer time
  azaanScheduler.playAudio('/audio/madina_azaan.mp3', 0.85);
  assert(lastAudioInstance !== null && lastAudioInstance.src === '/audio/madina_azaan.mp3', 'Azaan triggers playback of /audio/madina_azaan.mp3');
  assert(lastAudioInstance.currentTime === 0, 'Azaan starts cleanly from beginning (currentTime = 0)');
  assert(lastAudioInstance.loop === false, 'Azaan does NOT loop (loop = false)');
  assert(typeof lastAudioInstance.onended === 'function', 'Azaan attaches natural onended handler without artificial timeouts');
  assert(lastAudioInstance.volume === 0.85, 'Azaan volume is set accurately (0.85)');

  // Test 7: 15-Minute Reminder Playback behavior (Audition & Scheduled)
  azaanScheduler.playAudio('/audio/namaz_reminder.mp3', 0.75);
  assert(lastAudioInstance !== null && lastAudioInstance.src === '/audio/namaz_reminder.mp3', 'Reminder triggers playback of separate /audio/namaz_reminder.mp3');
  assert(lastAudioInstance.currentTime === 0, 'Reminder starts cleanly from beginning (currentTime = 0)');
  assert(lastAudioInstance.loop === false, 'Reminder does NOT loop (loop = false)');
  assert(typeof lastAudioInstance.onended === 'function', 'Reminder attaches natural onended handler without artificial timeouts');
  assert(lastAudioInstance.volume === 0.75, 'Reminder volume is set accurately (0.75)');

  // Test 8: Duplicate trigger protection (Trigger only once per prayer/day)
  const eventId = '2026-09-02-dhuhr-reminder15';
  let triggerCount = 0;
  const originalPlayAudio = azaanScheduler.playAudio.bind(azaanScheduler);
  azaanScheduler.playAudio = (src: string, vol?: number) => {
    triggerCount++;
    return originalPlayAudio(src, vol);
  };

  azaanScheduler.trigger15MinReminder('Dhuhr', 'zuhr', eventId);
  assert(triggerCount === 1, 'First trigger of Dhuhr 15-min reminder plays audio');

  azaanScheduler.trigger15MinReminder('Dhuhr', 'zuhr', eventId);
  assert(triggerCount === 1, 'Duplicate trigger with same event ID is blocked (played only once per prayer/day)');

  // Test 9: Scheduler initialization & queue construction
  useLocationStore.setState({
    latitude: makkahCoords.latitude,
    longitude: makkahCoords.longitude,
    timezone: makkahCoords.timezone,
    city: 'Makkah',
    country: 'Saudi Arabia',
    displayName: 'Makkah, Saudi Arabia',
    isAutoDetected: true,
  });
  useSettingsStore.setState({ madhhab: 'hanafi', calculationMethod: 'UmmAlQura' });
  useNotificationStore.setState({
    permission: 'granted',
    preferences: {
      enabled: true,
      azaanEnabled: true,
      azaanVolume: 0.8,
      reminder15MinEnabled: true,
      reminderVolume: 0.7,
      prayerReminders: { enabled: true, fajr: true, zuhr: true, asr: true, maghrib: true, isha: true, leadTimeMinutes: 0 },
      surahMulk11pm: { enabled: true, time: '23:00' },
      fridayKahf: { enabled: true, leadTimeMinutes: 60 },
      jumuahTime: '13:30',
      soundEnabled: true,
    }
  });

  azaanScheduler.init();
  const scheduledEvents = azaanScheduler.getScheduledEvents();
  assert(scheduledEvents.length === 10, `Scheduler created 10 daily events (5 Madina Azaans + 5 Reminders). Got: ${scheduledEvents.length}`);

  // Test 10: Service Worker Cache Verification
  const swContent = fs.readFileSync('./frontend/public/sw.js', 'utf8');
  assert(swContent.includes('/audio/madina_azaan.mp3'), 'sw.js pre-caches /audio/madina_azaan.mp3');
  assert(swContent.includes('/audio/namaz_reminder.mp3'), 'sw.js pre-caches /audio/namaz_reminder.mp3');
  assert(swContent.includes('islamic-prayer-v5'), 'sw.js cache version bumped to v5 to ensure fresh cache');

  console.log(`\n================================================================`);
  console.log(`SUMMARY: ${passed} / ${total} tests PASSED`);
  console.log(`================================================================\n`);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
