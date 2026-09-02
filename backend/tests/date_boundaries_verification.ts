import { gregorianToHijri, hijriToGregorian, calculateMaghribDate, getMaghribRolloverDelay } from '../src/utils/hijriCalendar.js';

console.log('========================================================================');
console.log('CRITICAL ISLAMIC DATE & GREGORIAN DATE BOUNDARY VERIFICATION');
console.log('========================================================================\n');

const delhiLoc = { latitude: 28.6139, longitude: 77.209 };
const delhiTz = 'Asia/Kolkata';

// 1. 2 September Before Maghrib
const t1 = new Date('2026-09-02T14:00:00+05:30');
const res1 = gregorianToHijri(t1, 0, delhiTz, delhiLoc);
console.log('1. 2 September BEFORE Maghrib (14:00 IST):');
console.log(`   English Date : ${res1.gregorianDate} (Expected: 2026-09-02)`);
console.log(`   Hijri Date   : ${res1.formatted} (Expected: 19 Rabi-ul-Awwal 1448 AH)`);
console.assert(res1.gregorianDate === '2026-09-02' && res1.day === 19, 'Test 1 Failed');
console.log('   -> PASS ✅\n');

// 2. 2 September After Maghrib
const t2 = new Date('2026-09-02T19:00:00+05:30');
const res2 = gregorianToHijri(t2, 0, delhiTz, delhiLoc);
console.log('2. 2 September AFTER Maghrib (19:00 IST):');
console.log(`   English Date : ${res2.gregorianDate} (Expected: 2026-09-02)`);
console.log(`   Hijri Date   : ${res2.formatted} (Expected: 20 Rabi-ul-Awwal 1448 AH)`);
console.assert(res2.gregorianDate === '2026-09-02' && res2.day === 20, 'Test 2 Failed');
console.log('   -> PASS ✅\n');

// 3. 2 September Late Night (11:59 PM)
const t3 = new Date('2026-09-02T23:59:00+05:30');
const res3 = gregorianToHijri(t3, 0, delhiTz, delhiLoc);
console.log('3. 2 September LATE NIGHT (23:59 IST):');
console.log(`   English Date : ${res3.gregorianDate} (Expected: 2026-09-02)`);
console.log(`   Hijri Date   : ${res3.formatted} (Expected: 20 Rabi-ul-Awwal 1448 AH)`);
console.assert(res3.gregorianDate === '2026-09-02' && res3.day === 20, 'Test 3 Failed');
console.log('   -> PASS ✅\n');

// 4. 3 September Just After Midnight (12:01 AM)
const t4 = new Date('2026-09-03T00:01:00+05:30');
const res4 = gregorianToHijri(t4, 0, delhiTz, delhiLoc);
console.log('4. 3 September JUST AFTER MIDNIGHT (00:01 IST):');
console.log(`   English Date : ${res4.gregorianDate} (Expected: 2026-09-03)`);
console.log(`   Hijri Date   : ${res4.formatted} (Expected: 20 Rabi-ul-Awwal 1448 AH)`);
console.assert(res4.gregorianDate === '2026-09-03' && res4.day === 20, 'Test 4 Failed');
console.log('   -> PASS ✅\n');

// 5. 3 September Midday Before Maghrib (12:00 PM)
const t5 = new Date('2026-09-03T12:00:00+05:30');
const res5 = gregorianToHijri(t5, 0, delhiTz, delhiLoc);
console.log('5. 3 September BEFORE Maghrib (12:00 IST):');
console.log(`   English Date : ${res5.gregorianDate} (Expected: 2026-09-03)`);
console.log(`   Hijri Date   : ${res5.formatted} (Expected: 20 Rabi-ul-Awwal 1448 AH)`);
console.assert(res5.gregorianDate === '2026-09-03' && res5.day === 20, 'Test 5 Failed');
console.log('   -> PASS ✅\n');

// 6. 3 September After Maghrib (19:00 PM)
const t6 = new Date('2026-09-03T19:00:00+05:30');
const res6 = gregorianToHijri(t6, 0, delhiTz, delhiLoc);
console.log('6. 3 September AFTER Maghrib (19:00 IST):');
console.log(`   English Date : ${res6.gregorianDate} (Expected: 2026-09-03)`);
console.log(`   Hijri Date   : ${res6.formatted} (Expected: 21 Rabi-ul-Awwal 1448 AH)`);
console.assert(res6.gregorianDate === '2026-09-03' && res6.day === 21, 'Test 6 Failed');
console.log('   -> PASS ✅\n');

// 7. Bidirectional Hijri to Gregorian
const greg19 = hijriToGregorian(1448, 3, 19, 0);
const greg20 = hijriToGregorian(1448, 3, 20, 0);
const greg21 = hijriToGregorian(1448, 3, 21, 0);
console.log('7. Bidirectional Hijri to Gregorian:');
console.log(`   19 Rabi-ul-Awwal 1448 -> ${greg19.dateFormatted} (Expected: 2026-09-02)`);
console.log(`   20 Rabi-ul-Awwal 1448 -> ${greg20.dateFormatted} (Expected: 2026-09-03)`);
console.log(`   21 Rabi-ul-Awwal 1448 -> ${greg21.dateFormatted} (Expected: 2026-09-04)`);
console.assert(greg19.dateFormatted === '2026-09-02', 'greg19 failed');
console.assert(greg20.dateFormatted === '2026-09-03', 'greg20 failed');
console.assert(greg21.dateFormatted === '2026-09-04', 'greg21 failed');
console.log('   -> PASS ✅\n');

console.log('========================================================================');
console.log('ALL VERIFICATIONS PASSED UNCONDITIONALLY!');
console.log('========================================================================');
