import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// Let's find each of the 30 Juz:
// Juz 1: Alif Lam Meem -> Page 3 (or 4)
// Juz 2: Sayaqool -> starts at Baqarah 142
// Juz 3: Tilka-r-Rusul -> starts at Baqarah 253
// Juz 4: Lan Tanaaloo -> starts at Aal-Imran 93
// Juz 5: Wal Muhsanaat -> starts at An-Nisa 24
// Juz 6: La Yuhibbullah -> starts at An-Nisa 148
// Juz 7: Wa Iza Sami'oo -> starts at Al-Ma'idah 82
// Juz 8: Wa Law Annana -> starts at Al-An'am 111
// Juz 9: Qalal Mala'u -> starts at Al-A'raf 88
// Juz 10: Wa'lamoo -> starts at Al-Anfal 41
// Juz 11: Ya'taziroona -> starts at At-Tawbah 93
// Juz 12: Wa Mamin Da'abbatin -> starts at Hud 6
// Juz 13: Wa Ma Ubarri'u -> starts at Yusuf 53
// Juz 14: Rubama -> starts at Al-Hijr 1
// Juz 15: Subhanallazi -> starts at Al-Isra 1
// Juz 16: Qala Alam -> starts at Al-Kahf 75
// Juz 17: Iqtaraba -> starts at Al-Anbiya 1
// Juz 18: Qad Aflaha -> starts at Al-Mu'minun 1
// Juz 19: Wa Qalallazina -> starts at Al-Furqan 21
// Juz 20: Amman Khalaqa -> starts at An-Naml 56
// Juz 21: Utlu Ma Oohiya -> starts at Al-Ankabut 46
// Juz 22: Wa Man Yaqnut -> starts at Al-Ahzab 31
// Juz 23: Wa Maliya -> starts at Ya-Sin 28
// Juz 24: Faman Azlamu -> starts at Az-Zumar 32
// Juz 25: Ilaihi Yuraddu -> starts at Fussilat 47
// Juz 26: Ha-Meem -> starts at Al-Ahqaf 1
// Juz 27: Qala Fama Khatbukum -> starts at Adh-Dhariyat 31
// Juz 28: Qad Sami'allah -> starts at Al-Mujadilah 1
// Juz 29: Tabarakallazi -> starts at Al-Mulk 1
// Juz 30: Amma Yatasa'aloon -> starts at An-Naba 1

async function checkJuzPages() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  // Let's sample pages in increments to inspect top and side headers
  const outDir = path.resolve('juz_samples');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // In 1092 Quran pages, each Para is ~36.4 pages.
  // Approximate starting pages:
  // Juz 1: 3
  // Juz 2: ~39 (3 + 36)
  // Juz 3: ~75
  // Juz 4: ~112
  // Juz 5: ~149
  // Juz 6: ~185
  // Juz 7: ~221
  // Juz 8: ~258
  // Juz 9: ~294
  // Juz 10: ~331
  // Juz 11: ~367
  // Juz 12: ~404
  // Juz 13: ~440
  // Juz 14: ~477
  // Juz 15: ~513
  // Juz 16: ~550
  // Juz 17: ~586
  // Juz 18: ~623
  // Juz 19: ~659
  // Juz 20: ~696
  // Juz 21: ~732
  // Juz 22: ~769
  // Juz 23: ~805
  // Juz 24: ~842
  // Juz 25: ~878
  // Juz 26: ~915
  // Juz 27: ~951
  // Juz 28: ~988
  // Juz 29: ~1024
  // Juz 30: ~1061

  console.log('Juz page sampling ready.');
}

checkJuzPages().catch(console.error);
