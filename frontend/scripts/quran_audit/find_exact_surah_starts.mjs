import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

// 114 Surahs in Quranic sequence
const SURAH_NAMES = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am",
  "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim",
  "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Taha", "Al-Anbiya", "Al-Hajj",
  "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas",
  "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin",
  "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf",
  "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid",
  "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun",
  "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan",
  "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar",
  "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah",
  "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin",
  "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah",
  "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar",
  "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

// Green Cover Pages (1 per Para/Juz, exactly 30 covers):
const GREEN_COVERS = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

async function scanDocument() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const foundBanners = [];

  // Special start pages:
  // Surah 1 (Al-Fatihah) -> Page 3
  // Surah 2 (Al-Baqarah) -> Page 4
  foundBanners.push({ surahNum: 1, name: 'Al-Fatihah', page: 3, y: 0 });
  foundBanners.push({ surahNum: 2, name: 'Al-Baqarah', page: 4, y: 0 });

  for (let p = 5; p <= 1124; p++) {
    if (GREEN_COVERS.includes(p)) continue;
    if (p === 1124) continue; // Dua Khatam

    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              // Measure dark pixel count across horizontal lines inside text margins (x: 200..600)
              let lineYs = [];
              for (let y = 80; y < img.height - 80; y++) {
                let dark = 0;
                for (let x = 200; x < 594; x++) {
                  const idx = (y * img.width + x) * 3;
                  if (img.data[idx] < 70 && img.data[idx + 1] < 70 && img.data[idx + 2] < 70) {
                    dark++;
                  }
                }
                if (dark > 350) {
                  lineYs.push(y);
                }
              }

              // In Zia-ul-Quran Mushaf, a Surah banner has a top border and bottom border (45 to 110px apart)
              let detectedBannersOnPage = [];
              for (let a = 0; a < lineYs.length; a++) {
                for (let b = a + 1; b < lineYs.length; b++) {
                  const diff = lineYs[b] - lineYs[a];
                  if (diff >= 45 && diff <= 110) {
                    const topY = lineYs[a];
                    if (!detectedBannersOnPage.some(db => Math.abs(db.topY - topY) < 35)) {
                      detectedBannersOnPage.push({ topY, bottomY: lineYs[b], diff });
                    }
                  }
                }
              }

              for (const b of detectedBannersOnPage) {
                foundBanners.push({ page: p, topY: b.topY, height: b.diff });
              }
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  console.log(`Scan completed. Detected ${foundBanners.length} banner objects.`);
  fs.writeFileSync('detected_banners_full.json', JSON.stringify(foundBanners, null, 2));
}

scanDocument().catch(console.error);
