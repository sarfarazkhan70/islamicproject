import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

// Standard 114 Surahs list
const SURAH_NAMES = [
  'Al-Fatihah', 'Al-Baqarah', "Ali 'Imran", 'An-Nisa', "Al-Ma'idah", "Al-An'am",
  "Al-A'raf", 'Al-Anfal', 'At-Tawbah', 'Yunus', 'Hud', 'Yusuf', "Ar-Ra'd", 'Ibrahim',
  'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha', 'Al-Anbiya', 'Al-Hajj',
  "Al-Mu'minun", 'An-Nur', 'Al-Furqan', "Ash-Shu'ara", 'An-Naml', 'Al-Qasas',
  "Al-'Ankabut", 'Ar-Rum', 'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin',
  'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf',
  'Ad-Dukhan', 'Al-Jathiyah', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', "Al-Waqi'ah", 'Al-Hadid',
  'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah', 'As-Saff', "Al-Jumu'ah", 'Al-Munafiqun',
  'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', "Al-Ma'arij",
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah', 'Al-Insan',
  'Al-Mursalat', 'An-Naba', "An-Nazi'at", "'Abasa", 'At-Takwir', 'Al-Infitar',
  'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', "Al-A'la", 'Al-Ghashiyah',
  'Al-Fajr', 'Al-Balad', 'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
  "Al-'Alaq", 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', "Al-'Adiyat", "Al-Qari'ah",
  'At-Takathur', "Al-'Asr", 'Al-Humazah', 'Al-Fil', 'Quraysh', "Al-Ma'un", 'Al-Kawthar',
  'Al-Kafirun', 'An-Nasr', 'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
];

async function scanAllBanners() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const greenCovers = [
    1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
    373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
    743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
  ];

  const found = [];

  for (let p = 3; p <= 1123; p++) {
    if (greenCovers.includes(p)) continue;

    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const objId = ops.argsArray[i][0];
        await new Promise((resolve) => {
          page.objs.get(objId, (img) => {
            if (img && img.data) {
              if (p === 3) {
                found.push({ page: 3, surah: 1, name: 'Al-Fatihah' });
              } else if (p === 4) {
                found.push({ page: 4, surah: 2, name: 'Al-Baqarah' });
              } else {
                // Check if page contains dark horizontal banner bars in middle
                let bannerDetected = false;
                for (let y = 80; y < img.height - 80; y += 4) {
                  let darkCount = 0;
                  for (let x = 180; x < 620; x += 4) {
                    const idx = (y * img.width + x) * 3;
                    const r = img.data[idx];
                    const g = img.data[idx + 1];
                    const b = img.data[idx + 2];
                    if (r < 75 && g < 75 && b < 75) darkCount++;
                  }
                  if (darkCount > 85) { // dense dark horizontal strip
                    bannerDetected = true;
                    break;
                  }
                }
                if (bannerDetected) {
                  found.push({ page: p });
                }
              }
            }
            resolve();
          });
        });
        break;
      }
    }
  }

  console.log(`Detected banners on ${found.length} pages.`);
  fs.writeFileSync('scratch/detected_raw_banners.json', JSON.stringify(found, null, 2));
}

scanAllBanners().catch(console.error);
