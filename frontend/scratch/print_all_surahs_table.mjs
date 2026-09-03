import fs from 'fs';
import { SURAHS_LIST, JUZ_LIST } from '../src/data/quranData.ts';

console.log('========================================================================');
console.log('      COMPLETE VERIFIED 114 SURAH MAPPING (ZIA-UL-QURAN 9-LINE MUSHAF)  ');
console.log('========================================================================\n');

for (let i = 0; i < SURAHS_LIST.length; i++) {
  const s = SURAHS_LIST[i];
  console.log(
    `${String(s.number).padStart(3, ' ')}. ${s.name.padEnd(20, ' ')} (${s.arabicName.padEnd(12, ' ')}) | Juz: ${String(s.juzStart).padStart(2, ' ')} | Starts on PDF Page: ${String(s.pageStart).padStart(4, ' ')}`
  );
}

console.log('\n========================================================================');
console.log('                   VERIFIED 30 JUZ / PARA MAPPING                       ');
console.log('========================================================================\n');

for (let i = 0; i < JUZ_LIST.length; i++) {
  const j = JUZ_LIST[i];
  console.log(
    `Juz ${String(j.number).padStart(2, ' ')}: ${j.name.padEnd(18, ' ')} (${j.arabicName.padEnd(12, ' ')}) | Starts on PDF Page: ${String(j.pageStart).padStart(4, ' ')}`
  );
}
