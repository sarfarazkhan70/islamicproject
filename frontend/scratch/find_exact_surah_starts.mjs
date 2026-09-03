import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's verify start pages for all Surahs requested by user and adjacent Surahs
// User specifically listed:
// - Al-Fatihah (1)
// - Al-Baqarah (2)
// - Aal-e-Imran (3)
// - Al-Kahf (18)
// - Ya-Sin (36)
// - Ar-Rahman (55)
// - Al-Mulk (67)
// - An-Nas (114)

async function inspectCandidateSurahs() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('scratch/surah_header_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Let's check ranges for key Surahs
  const searchTargets = [
    { surah: 1, name: 'Al-Fatihah', start: 3, end: 3 },
    { surah: 2, name: 'Al-Baqarah', start: 4, end: 5 },
    { surah: 3, name: 'Ali Imran', start: 90, end: 93 },
    { surah: 4, name: 'An-Nisa', start: 140, end: 146 },
    { surah: 5, name: 'Al-Maidah', start: 194, end: 198 },
    { surah: 6, name: 'Al-Anam', start: 236, end: 240 },
    { surah: 7, name: 'Al-Araf', start: 278, end: 282 },
    { surah: 8, name: 'Al-Anfal', start: 327, end: 331 },
    { surah: 9, name: 'At-Tawbah', start: 346, end: 350 },
    { surah: 10, name: 'Yunus', start: 384, end: 388 },
    { surah: 11, name: 'Hud', start: 407, end: 411 },
    { surah: 12, name: 'Yusuf', start: 433, end: 437 },
    { surah: 13, name: 'Ar-Rad', start: 459, end: 463 },
    { surah: 14, name: 'Ibrahim', start: 470, end: 474 },
    { surah: 15, name: 'Al-Hijr', start: 483, end: 487 },
    { surah: 16, name: 'An-Nahl', start: 492, end: 496 },
    { surah: 17, name: 'Al-Isra', start: 520, end: 524 },
    { surah: 18, name: 'Al-Kahf', start: 541, end: 545 },
    { surah: 19, name: 'Maryam', start: 562, end: 566 },
    { surah: 20, name: 'Taha', start: 575, end: 579 },
    { surah: 21, name: 'Al-Anbiya', start: 594, end: 598 },
    { surah: 22, name: 'Al-Hajj', start: 612, end: 616 },
    { surah: 23, name: 'Al-Muminun', start: 631, end: 635 },
    { surah: 24, name: 'An-Nur', start: 646, end: 650 },
    { surah: 25, name: 'Al-Furqan', start: 662, end: 666 },
    { surah: 26, name: 'Ash-Shuara', start: 676, end: 680 },
    { surah: 27, name: 'An-Naml', start: 695, end: 699 },
    { surah: 28, name: 'Al-Qasas', start: 710, end: 714 },
    { surah: 29, name: 'Al-Ankabut', start: 729, end: 733 },
    { surah: 30, name: 'Ar-Rum', start: 744, end: 748 },
    { surah: 31, name: 'Luqman', start: 757, end: 761 },
    { surah: 32, name: 'As-Sajdah', start: 764, end: 768 },
    { surah: 33, name: 'Al-Ahzab', start: 770, end: 774 },
    { surah: 34, name: 'Saba', start: 788, end: 792 },
    { surah: 35, name: 'Fatir', start: 799, end: 803 },
    { surah: 36, name: 'Ya-Sin', start: 812, end: 816 },
    { surah: 37, name: 'As-Saffat', start: 822, end: 826 },
    { surah: 38, name: 'Sad', start: 835, end: 839 },
    { surah: 39, name: 'Az-Zumar', start: 844, end: 848 },
    { surah: 40, name: 'Ghafir', start: 861, end: 865 },
    { surah: 41, name: 'Fussilat', start: 880, end: 884 },
    { surah: 42, name: 'Ash-Shura', start: 891, end: 895 },
    { surah: 43, name: 'Az-Zukhruf', start: 902, end: 906 },
    { surah: 44, name: 'Ad-Dukhan', start: 915, end: 919 },
    { surah: 45, name: 'Al-Jathiyah', start: 921, end: 925 },
    { surah: 46, name: 'Al-Ahqaf', start: 927, end: 931 },
    { surah: 47, name: 'Muhammad', start: 936, end: 940 },
    { surah: 48, name: 'Al-Fath', start: 944, end: 948 },
    { surah: 49, name: 'Al-Hujurat', start: 952, end: 956 },
    { surah: 50, name: 'Qaf', start: 958, end: 962 },
    { surah: 51, name: 'Adh-Dhariyat', start: 964, end: 968 },
    { surah: 52, name: 'At-Tur', start: 969, end: 973 },
    { surah: 53, name: 'An-Najm', start: 974, end: 978 },
    { surah: 54, name: 'Al-Qamar', start: 978, end: 982 },
    { surah: 55, name: 'Ar-Rahman', start: 982, end: 986 },
    { surah: 56, name: 'Al-Waqiah', start: 988, end: 993 },
    { surah: 57, name: 'Al-Hadid', start: 995, end: 999 },
    { surah: 58, name: 'Al-Mujadila', start: 1003, end: 1006 },
    { surah: 59, name: 'Al-Hashr', start: 1009, end: 1012 },
    { surah: 60, name: 'Al-Mumtahanah', start: 1015, end: 1018 },
    { surah: 61, name: 'As-Saff', start: 1020, end: 1023 },
    { surah: 62, name: 'Al-Jumuah', start: 1023, end: 1026 },
    { surah: 63, name: 'Al-Munafiqun', start: 1025, end: 1028 },
    { surah: 64, name: 'At-Taghabun', start: 1027, end: 1030 },
    { surah: 65, name: 'At-Talaq', start: 1031, end: 1034 },
    { surah: 66, name: 'At-Tahrim', start: 1034, end: 1037 },
    { surah: 67, name: 'Al-Mulk', start: 1043, end: 1046 },
    { surah: 68, name: 'Al-Qalam', start: 1047, end: 1050 },
    { surah: 69, name: 'Al-Haqqah', start: 1050, end: 1053 },
    { surah: 70, name: 'Al-Maarij', start: 1052, end: 1055 },
    { surah: 71, name: 'Nuh', start: 1059, end: 1062 },
    { surah: 72, name: 'Al-Jinn', start: 1061, end: 1064 },
    { surah: 73, name: 'Al-Muzzammil', start: 1064, end: 1067 },
    { surah: 74, name: 'Al-Muddaththir', start: 1066, end: 1069 },
    { surah: 75, name: 'Al-Qiyamah', start: 1072, end: 1075 },
    { surah: 76, name: 'Al-Insan', start: 1076, end: 1079 },
    { surah: 77, name: 'Al-Mursalat', start: 1080, end: 1083 },
    { surah: 78, name: 'An-Naba', start: 1084, end: 1087 },
    { surah: 79, name: 'An-Naziat', start: 1087, end: 1090 },
    { surah: 80, name: 'Abasa', start: 1089, end: 1092 },
    { surah: 81, name: 'At-Takwir', start: 1091, end: 1094 },
    { surah: 82, name: 'Al-Infitar', start: 1093, end: 1096 },
    { surah: 83, name: 'Al-Mutaffifin', start: 1097, end: 1100 },
    { surah: 84, name: 'Al-Inshiqaq', start: 1098, end: 1101 },
    { surah: 85, name: 'Al-Buruj', start: 1100, end: 1103 },
    { surah: 86, name: 'At-Tariq', start: 1101, end: 1104 },
    { surah: 87, name: 'Al-Ala', start: 1105, end: 1108 },
    { surah: 88, name: 'Al-Ghashiyah', start: 1106, end: 1109 },
    { surah: 89, name: 'Al-Fajr', start: 1108, end: 1111 },
    { surah: 90, name: 'Al-Balad', start: 1110, end: 1113 },
    { surah: 91, name: 'Ash-Shams', start: 1111, end: 1114 },
    { surah: 92, name: 'Al-Layl', start: 1112, end: 1115 },
    { surah: 93, name: 'Ad-Duha', start: 1113, end: 1116 },
    { surah: 94, name: 'Ash-Sharh', start: 1114, end: 1117 },
    { surah: 95, name: 'At-Tin', start: 1115, end: 1118 },
    { surah: 96, name: 'Al-Alaq', start: 1116, end: 1119 },
    { surah: 97, name: 'Al-Qadr', start: 1117, end: 1120 },
    { surah: 98, name: 'Al-Bayyinah', start: 1117, end: 1120 },
    { surah: 99, name: 'Az-Zalzalah', start: 1118, end: 1121 },
    { surah: 100, name: 'Al-Adiyat', start: 1119, end: 1122 },
    { surah: 101, name: 'Al-Qariah', start: 1119, end: 1122 },
    { surah: 102, name: 'At-Takathur', start: 1120, end: 1123 },
    { surah: 103, name: 'Al-Asr', start: 1120, end: 1123 },
    { surah: 104, name: 'Al-Humazah', start: 1121, end: 1124 },
    { surah: 105, name: 'Al-Fil', start: 1121, end: 1124 },
    { surah: 106, name: 'Quraysh', start: 1121, end: 1124 },
    { surah: 107, name: 'Al-Maun', start: 1122, end: 1124 },
    { surah: 108, name: 'Al-Kawthar', start: 1122, end: 1124 },
    { surah: 109, name: 'Al-Kafirun', start: 1122, end: 1124 },
    { surah: 110, name: 'An-Nasr', start: 1122, end: 1124 },
    { surah: 111, name: 'Al-Masad', start: 1122, end: 1124 },
    { surah: 112, name: 'Al-Ikhlas', start: 1122, end: 1124 },
    { surah: 113, name: 'Al-Falaq', start: 1122, end: 1124 },
    { surah: 114, name: 'An-Nas', start: 1122, end: 1124 }
  ];

  // For each target, let's extract all candidate pages
  for (const t of searchTargets) {
    for (let p = t.start; p <= t.end; p++) {
      const page = await doc.getPage(p);
      const ops = await page.getOperatorList();
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const objId = ops.argsArray[i][0];
          await new Promise((resolve) => {
            page.objs.get(objId, (img) => {
              if (img && img.data) {
                const canvas = createCanvas(img.width, img.height);
                const ctx = canvas.getContext('2d');
                const imgData = ctx.createImageData(img.width, img.height);
                let src = 0;
                let dst = 0;
                for (let y = 0; y < img.height; y++) {
                  for (let x = 0; x < img.width; x++) {
                    imgData.data[dst] = img.data[src];
                    imgData.data[dst + 1] = img.data[src + 1];
                    imgData.data[dst + 2] = img.data[src + 2];
                    imgData.data[dst + 3] = 255;
                    src += 3;
                    dst += 4;
                  }
                }
                ctx.putImageData(imgData, 0, 0);
                fs.writeFileSync(path.join(outDir, `page_${String(p).padStart(4, '0')}.png`), canvas.toBuffer('image/png'));
              }
              resolve();
            });
          });
          break;
        }
      }
    }
  }

  console.log('Extracted all target page crops.');
}

inspectCandidateSurahs().catch(console.error);
