import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Let's create an exact mapping script:
// We know all 114 Surahs in standard Islamic order:
// 1. Al-Fatihah, 2. Al-Baqarah, 3. Ali 'Imran, 4. An-Nisa, 5. Al-Ma'idah, 6. Al-An'am, 7. Al-A'raf, ...
// We know:
// - Surah 1 start: Page 3
// - Surah 2 start: Page 4
// Let's inspect where every single Surah starts by checking all 114 Surahs!

const SURAHS = [
  { n: 1, name: 'Al-Fatihah' }, { n: 2, name: 'Al-Baqarah' }, { n: 3, name: "Ali 'Imran" },
  { n: 4, name: 'An-Nisa' }, { n: 5, name: "Al-Ma'idah" }, { n: 6, name: "Al-An'am" },
  { n: 7, name: "Al-A'raf" }, { n: 8, name: 'Al-Anfal' }, { n: 9, name: 'At-Tawbah' },
  { n: 10, name: 'Yunus' }, { n: 11, name: 'Hud' }, { n: 12, name: 'Yusuf' },
  { n: 13, name: "Ar-Ra'd" }, { n: 14, name: 'Ibrahim' }, { n: 15, name: 'Al-Hijr' },
  { n: 16, name: 'An-Nahl' }, { n: 17, name: 'Al-Isra' }, { n: 18, name: 'Al-Kahf' },
  { n: 19, name: 'Maryam' }, { n: 20, name: 'Taha' }, { n: 21, name: 'Al-Anbiya' },
  { n: 22, name: 'Al-Hajj' }, { n: 23, name: "Al-Mu'minun" }, { n: 24, name: 'An-Nur' },
  { n: 25, name: 'Al-Furqan' }, { n: 26, name: "Ash-Shu'ara" }, { n: 27, name: 'An-Naml' },
  { n: 28, name: 'Al-Qasas' }, { n: 29, name: "Al-'Ankabut" }, { n: 30, name: 'Ar-Rum' },
  { n: 31, name: 'Luqman' }, { n: 32, name: 'As-Sajdah' }, { n: 33, name: 'Al-Ahzab' },
  { n: 34, name: 'Saba' }, { n: 35, name: 'Fatir' }, { n: 36, name: 'Ya-Sin' },
  { n: 37, name: 'As-Saffat' }, { n: 38, name: 'Sad' }, { n: 39, name: 'Az-Zumar' },
  { n: 40, name: 'Ghafir' }, { n: 41, name: 'Fussilat' }, { n: 42, name: 'Ash-Shura' },
  { n: 43, name: 'Az-Zukhruf' }, { n: 44, name: 'Ad-Dukhan' }, { n: 45, name: 'Al-Jathiyah' },
  { n: 46, name: 'Al-Ahqaf' }, { n: 47, name: 'Muhammad' }, { n: 48, name: 'Al-Fath' },
  { n: 49, name: 'Al-Hujurat' }, { n: 50, name: 'Qaf' }, { n: 51, name: 'Adh-Dhariyat' },
  { n: 52, name: 'At-Tur' }, { n: 53, name: 'An-Najm' }, { n: 54, name: 'Al-Qamar' },
  { n: 55, name: 'Ar-Rahman' }, { n: 56, name: "Al-Waqi'ah" }, { n: 57, name: 'Al-Hadid' },
  { n: 58, name: 'Al-Mujadila' }, { n: 59, name: 'Al-Hashr' }, { n: 60, name: 'Al-Mumtahanah' },
  { n: 61, name: 'As-Saff' }, { n: 62, name: "Al-Jumu'ah" }, { n: 63, name: 'Al-Munafiqun' },
  { n: 64, name: 'At-Taghabun' }, { n: 65, name: 'At-Talaq' }, { n: 66, name: 'At-Tahrim' },
  { n: 67, name: 'Al-Mulk' }, { n: 68, name: 'Al-Qalam' }, { n: 69, name: 'Al-Haqqah' },
  { n: 70, name: "Al-Ma'arij" }, { n: 71, name: 'Nuh' }, { n: 72, name: 'Al-Jinn' },
  { n: 73, name: 'Al-Muzzammil' }, { n: 74, name: 'Al-Muddaththir' }, { n: 75, name: 'Al-Qiyamah' },
  { n: 76, name: 'Al-Insan' }, { n: 77, name: 'Al-Mursalat' }, { n: 78, name: 'An-Naba' },
  { n: 79, name: "An-Nazi'at" }, { n: 80, name: "'Abasa" }, { n: 81, name: 'At-Takwir' },
  { n: 82, name: 'Al-Infitar' }, { n: 83, name: 'Al-Mutaffifin' }, { n: 84, name: 'Al-Inshiqaq' },
  { n: 85, name: 'Al-Buruj' }, { n: 86, name: 'At-Tariq' }, { n: 87, name: "Al-A'la" },
  { n: 88, name: 'Al-Ghashiyah' }, { n: 89, name: 'Al-Fajr' }, { n: 90, name: 'Al-Balad' },
  { n: 91, name: 'Ash-Shams' }, { n: 92, name: 'Al-Layl' }, { n: 93, name: 'Ad-Duha' },
  { n: 94, name: 'Ash-Sharh' }, { n: 95, name: 'At-Tin' }, { n: 96, name: "Al-'Alaq" },
  { n: 97, name: 'Al-Qadr' }, { n: 98, name: 'Al-Bayyinah' }, { n: 99, name: 'Az-Zalzalah' },
  { n: 100, name: "Al-'Adiyat" }, { n: 101, name: "Al-Qari'ah" }, { n: 102, name: 'At-Takathur' },
  { n: 103, name: "Al-'Asr" }, { n: 104, name: 'Al-Humazah' }, { n: 105, name: 'Al-Fil' },
  { n: 106, name: 'Quraysh' }, { n: 107, name: "Al-Ma'un" }, { n: 108, name: 'Al-Kawthar' },
  { n: 109, name: 'Al-Kafirun' }, { n: 110, name: 'An-Nasr' }, { n: 111, name: 'Al-Masad' },
  { n: 112, name: 'Al-Ikhlas' }, { n: 113, name: 'Al-Falaq' }, { n: 114, name: 'An-Nas' }
];

console.log(`Total 114 Surahs defined.`);
