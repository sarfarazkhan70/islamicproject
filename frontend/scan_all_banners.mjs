import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const pdfPath = path.resolve('public/quran/quran.pdf');

const SURAHS = [
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

const greenCovers = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

async function detectBanners() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const detected = [];

  // Special known start pages:
  // Surah 1 (Al-Fatihah) -> Page 3
  // Surah 2 (Al-Baqarah) -> Page 4
  detected.push({ surahIndex: 1, name: 'Al-Fatihah', page: 3, y: 0 });
  detected.push({ surahIndex: 2, name: 'Al-Baqarah', page: 4, y: 0 });

  for (let p = 5; p <= 1124; p++) {
    if (greenCovers.includes(p)) continue;
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              // Find horizontal lines
              let lineYs = [];
              for (let y = 80; y < img.height - 80; y++) {
                let dark = 0;
                for (let x = 200; x < 594; x++) {
                  const idx = (y * img.width + x) * 3;
                  if (img.data[idx] < 75 && img.data[idx + 1] < 75 && img.data[idx + 2] < 75) {
                    dark++;
                  }
                }
                if (dark > 350) {
                  lineYs.push(y);
                }
              }

              // Cluster lineYs
              // Banner has top border and bottom border (diff between 45 and 115)
              let foundBannersOnPage = [];
              for (let a = 0; a < lineYs.length; a++) {
                for (let b = a + 1; b < lineYs.length; b++) {
                  const diff = lineYs[b] - lineYs[a];
                  if (diff >= 45 && diff <= 115) {
                    // Check if not already overlapping an existing found banner
                    const topY = lineYs[a];
                    const bottomY = lineYs[b];
                    const isOverlap = foundBannersOnPage.some(f => Math.abs(f.topY - topY) < 30);
                    if (!isOverlap) {
                      foundBannersOnPage.push({ page: p, topY, bottomY, diff });
                    }
                  }
                }
              }

              for (const fb of foundBannersOnPage) {
                detected.push({ page: p, y: fb.topY, height: fb.diff });
              }
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  console.log(`Total banner locations detected: ${detected.length}`);
  fs.writeFileSync('detected_banners_raw.json', JSON.stringify(detected, null, 2));
}

detectBanners().catch(console.error);
