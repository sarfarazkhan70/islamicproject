import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

async function checkBoundaries() {
  const quranData = await import('./src/data/quranData.ts');
  const surahs = quranData.SURAHS_LIST;
  const rawBanners = JSON.parse(fs.readFileSync('detected_banners_raw.json'));

  const bannerPages = Array.from(new Set(rawBanners.map(b => b.page))).sort((a, b) => a - b);
  console.log('Unique pages with detected banners:', bannerPages.length);

  console.log('\n--- Checking Surah mappings against detected banner pages ---');
  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    const p = s.pageStart;
    const hasBannerOnPage = bannerPages.includes(p);
    const hasBannerPrev = bannerPages.includes(p - 1);
    const hasBannerNext = bannerPages.includes(p + 1);

    if (!hasBannerOnPage && s.number > 2) {
      console.log(`[ALERT] Surah ${s.number} (${s.name}) pageStart=${p} has NO detected banner! (prev=${hasBannerPrev ? p-1 : 'no'}, next=${hasBannerNext ? p+1 : 'no'})`);
    } else {
      // Check if there are other banner pages between this surah and the next surah
      const nextSurah = surahs[i + 1];
      if (nextSurah) {
        const intermediate = bannerPages.filter(bp => bp > p && bp < nextSurah.pageStart);
        if (intermediate.length > 0) {
          console.log(`[NOTE] Between Surah ${s.number} (p.${p}) and Surah ${nextSurah.number} (p.${nextSurah.pageStart}), extra banner pages found: ${intermediate.join(', ')}`);
        }
      }
    }
  }
}

checkBoundaries().catch(console.error);
