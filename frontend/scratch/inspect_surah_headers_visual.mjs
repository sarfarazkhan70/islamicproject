import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Let's render and inspect specific pages to find the exact pages for Surah 1, 2, 3, 18, 36, 55, 67, 114
async function checkSurahs() {
  const data = new Uint8Array(fs.readFileSync('public/quran/quran.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const outDir = path.resolve('scratch/surah_test_crops');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Let's check pages around:
  // Fatihah: 3
  // Baqarah: 4
  // Ali Imran: 85..95
  // Al-Kahf: 535..545
  // Ya-Sin: 805..820
  // Ar-Rahman: 980..990
  // Al-Mulk: 1040..1050
  // An-Nas: 1120..1124
  
  const testRanges = [
    { name: 'Fatihah_Baqarah', pages: [3, 4, 5] },
    { name: 'Ali_Imran', pages: [88, 89, 90, 91, 92, 93, 94] },
    { name: 'Al_Kahf', pages: [538, 539, 540, 541, 542, 543, 544, 545] },
    { name: 'Ya_Sin', pages: [810, 811, 812, 813, 814, 815, 816] },
    { name: 'Ar_Rahman', pages: [982, 983, 984, 985, 986, 987, 988] },
    { name: 'Al_Mulk', pages: [1043, 1044, 1045, 1046] },
    { name: 'An_Nas', pages: [1122, 1123, 1124] }
  ];

  for (const group of testRanges) {
    for (const p of group.pages) {
      const page = await doc.getPage(p);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      fs.writeFileSync(path.join(outDir, `p${p}_${group.name}.png`), canvas.toBuffer('image/png'));
    }
  }

  console.log('Rendered test pages for Surah verification');
}

checkSurahs().catch(console.error);
