import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SAHIH_BUKHARI_DAILY_HADITHS,
  VERIFIED_ALA_HAZRAT_HADITHS,
  hasValidAlaHazratTranslation,
  getDailyHadith,
} from '../data/dailyHadithData';

describe('Daily Hadith Card & Dashboard Verification', () => {
  const dashboardPath = path.resolve(__dirname, '../pages/Dashboard/DashboardPage.tsx');
  const dailyHadithCardPath = path.resolve(
    __dirname,
    '../components/dashboard/DailyHadithCard.tsx'
  );
  const dataPath = path.resolve(__dirname, '../data/dailyHadithData.ts');
  const cssPath = path.resolve(__dirname, '../styles/components.css');

  it('1. Verifies authentic Sahih al-Bukhari dataset integrity with verified references and local library binding', () => {
    expect(SAHIH_BUKHARI_DAILY_HADITHS.length).toBeGreaterThanOrEqual(25);

    SAHIH_BUKHARI_DAILY_HADITHS.forEach((hadith) => {
      expect(hadith.id).toBeDefined();
      expect(hadith.reference).toContain('Sahih al-Bukhari');
      expect(hadith.libraryBookId).toBe('sahih-al-bukhari');
      expect(hadith.libraryReadUrl).toContain('/library/sahih-al-bukhari');
      expect(hadith.arabicText.trim().length).toBeGreaterThan(10);
      expect(hadith.urduTranslation.trim().length).toBeGreaterThan(10);
      expect(hadith.englishTranslation.trim().length).toBeGreaterThan(10);
      expect(hadith.narrator.trim().length).toBeGreaterThan(3);
      expect(hadith.theme.trim().length).toBeGreaterThan(3);
      expect(hadith.bookNameArabic).toBeDefined();
      expect(hadith.bookNameEnglish).toBeDefined();
    });
  });

  it('2. Verifies Urdu translations are exclusively by Ala Hazrat Imam Ahmad Raza Khan', () => {
    SAHIH_BUKHARI_DAILY_HADITHS.forEach((hadith) => {
      expect(hadith.hasAlaHazratTranslation).toBe(true);
      expect(hadith.urduTranslator).toContain('احمد رضا');
      expect(hasValidAlaHazratTranslation(hadith)).toBe(true);
    });

    expect(VERIFIED_ALA_HAZRAT_HADITHS.length).toBe(SAHIH_BUKHARI_DAILY_HADITHS.length);
  });

  it('3. Verifies zero external API calls or Google fetches in dailyHadithData.ts', () => {
    const dataCode = fs.readFileSync(dataPath, 'utf-8');
    expect(dataCode).not.toContain('fetch(');
    expect(dataCode).not.toContain('axios');
    expect(dataCode).not.toContain('http://');
    expect(dataCode).not.toContain('https://api.');
    expect(dataCode).not.toContain('googleapis.com');
  });

  it('4. Verifies Islamic Hijri date rotation maintains the same Hadith throughout one Hijri date and rotates on the next Hijri date', () => {
    // 1. Simulating two times on the SAME Hijri date (e.g. 1 Rabi' al-Awwal 1448)
    const sameHijriDate1 = { year: 1448, month: 3, day: 1 };
    const sameHijriDate2 = { year: 1448, month: 3, day: 1 };

    const hadithDay1_Morning = getDailyHadith(sameHijriDate1);
    const hadithDay1_Evening = getDailyHadith(sameHijriDate2);

    // Must be identical throughout the same Hijri date
    expect(hadithDay1_Morning.id).toBe(hadithDay1_Evening.id);
    expect(hadithDay1_Morning.reference).toBe(hadithDay1_Evening.reference);
    expect(hadithDay1_Morning.hadithNumber).toBe(hadithDay1_Evening.hadithNumber);
    expect(hadithDay1_Morning.urduTranslator).toContain('احمد رضا');

    // 2. Simulating the NEXT consecutive Hijri date (e.g. 2 Rabi' al-Awwal 1448)
    const nextHijriDate = { year: 1448, month: 3, day: 2 };
    const hadithDay2 = getDailyHadith(nextHijriDate);

    // Must be a different Hadith on the next Hijri date
    expect(hadithDay2).toBeDefined();
    expect(hadithDay2.id).not.toBe(hadithDay1_Morning.id);
    expect(hadithDay2.hadithNumber).not.toBe(hadithDay1_Morning.hadithNumber);

    // 3. Simulating month rollover (e.g. 30 Rabi' al-Awwal -> 1 Rabi' al-Thani)
    const monthEnd = { year: 1448, month: 3, day: 30 };
    const nextMonthStart = { year: 1448, month: 4, day: 1 };
    const hadithMonthEnd = getDailyHadith(monthEnd);
    const hadithNextMonth = getDailyHadith(nextMonthStart);
    expect(hadithNextMonth.id).not.toBe(hadithMonthEnd.id);

    // 4. Verifies no two consecutive Hijri days repeat the same Hadith across a full month
    for (let day = 1; day < 30; day++) {
      const h1 = getDailyHadith({ year: 1448, month: 1, day });
      const h2 = getDailyHadith({ year: 1448, month: 1, day: day + 1 });
      expect(h1.id).not.toBe(h2.id);
    }
  });

  it('5. Verifies DailyHadithCard has exact visual order: Arabic -> Urdu (Ala Hazrat) -> English -> Reference', () => {
    const code = fs.readFileSync(dailyHadithCardPath, 'utf-8');

    const arabicPos = code.indexOf('hadith-arabic-box');
    const urduPos = code.indexOf('hadith-urdu-box');
    const englishPos = code.indexOf('hadith-english-box');
    const footerPos = code.indexOf('hadith-footer-bar');

    expect(arabicPos).toBeGreaterThan(-1);
    expect(urduPos).toBeGreaterThan(-1);
    expect(englishPos).toBeGreaterThan(-1);
    expect(footerPos).toBeGreaterThan(-1);

    // Strict order: Arabic at top, Urdu below Arabic, English below Urdu, Reference at bottom
    expect(arabicPos).toBeLessThan(urduPos);
    expect(urduPos).toBeLessThan(englishPos);
    expect(englishPos).toBeLessThan(footerPos);

    // Verify Ala Hazrat attribution badge
    expect(code).toContain('hadith-translator-pill');
    expect(code).toContain('اعلیٰ حضرت امام احمد رضا خان');
  });

  it('6. Verifies Play/Listen audio controls, audio icons, and speech buttons are completely removed from DailyHadithCard', () => {
    const code = fs.readFileSync(dailyHadithCardPath, 'utf-8');

    // Verify complete removal of audio buttons and icons
    expect(code).not.toContain('Listen Hadith');
    expect(code).not.toContain('hadith-main-audio-btn');
    expect(code).not.toContain('hadith-segment-btn');
    expect(code).not.toContain('Volume2');
    expect(code).not.toContain('VolumeX');
    expect(code).not.toContain('hadithAudioService');
    expect(code).not.toContain('handleTogglePlay');
    expect(code).not.toContain('handlePlaySegment');
    expect(code).not.toContain('isArabicPlaying');
    expect(code).not.toContain('isUrduPlaying');
    expect(code).not.toContain('isEnglishPlaying');
  });

  it('7. Verifies removal of "Today\'s Namaz Progress" from Dashboard while preserving other features', () => {
    const dashboardCode = fs.readFileSync(dashboardPath, 'utf-8');

    // Content completely removed from dashboard card
    expect(dashboardCode).not.toContain("Today's Namaz Progress");
    expect(dashboardCode).not.toContain('obligatory prayers performed today');

    // Daily Hadith card is rendered
    expect(dashboardCode).toContain('<DailyHadithCard />');
    expect(dashboardCode).toContain('import { DailyHadithCard } from');

    // Preserves other features
    expect(dashboardCode).toContain('<NextPrayerHero');
    expect(dashboardCode).toContain('Qibla Finder');
    expect(dashboardCode).toContain('Noble Quran');
    expect(dashboardCode).toContain('Surah Al-Mulk');
    expect(dashboardCode).toContain('Azkar & Duas');
    expect(dashboardCode).toContain('Qaza-e-Umri Manager');
  });

  it('8. Verifies CSS styling for typography, Arabic Mushaf, Urdu Nastaliq, translator badge, and responsive layout', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');

    expect(css).toContain('.daily-hadith-card');
    expect(css).toContain('.hadith-arabic-box');
    expect(css).toContain('.hadith-arabic-text');
    expect(css).toContain('.hadith-urdu-box');
    expect(css).toContain('.hadith-urdu-text');
    expect(css).toContain('.hadith-translator-pill');
    expect(css).toContain('.hadith-english-box');
    expect(css).toContain('.hadith-english-text');
  });

  it('9. Verifies complete heading is rendered inside a styled box and center-aligned across desktop, tablet, and mobile', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');
    const componentCode = fs.readFileSync(dailyHadithCardPath, 'utf-8');

    // Component renders heading inside .hadith-heading-box with .hadith-theme-title
    expect(componentCode).toContain('className="hadith-heading-box"');
    expect(componentCode).toContain('className="hadith-theme-title"');
    expect(componentCode).toContain('{hadith.theme');

    // CSS guarantees center alignment and box styling
    expect(css).toContain('.hadith-card-header {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;');
    expect(css).toContain('.hadith-heading-box {');
    expect(css).toContain('.hadith-theme-title {');
  });

  it('10. Verifies reference is removed from top and kept below English translation with exact Hadith number and navigation', () => {
    const componentCode = fs.readFileSync(dailyHadithCardPath, 'utf-8');

    // Reference removed from top badge group above heading
    expect(componentCode).not.toContain('hadith-pill-source');

    // Reference kept below English translation in footer
    expect(componentCode).toContain('Sahih al-Bukhari — Hadith No. {hadith.hadithNumber}');
    expect(componentCode).toContain('<Link\n              to={hadith.libraryReadUrl}\n              className="hadith-ref-badge"');

    // All Hadiths have valid pageNumber, hadithNumber, and libraryReadUrl with both page and hadith query params
    SAHIH_BUKHARI_DAILY_HADITHS.forEach((hadith) => {
      expect(hadith.hadithNumber).toBeGreaterThan(0);
      expect(hadith.pageNumber).toBeGreaterThanOrEqual(1);
      expect(hadith.pageNumber).toBeLessThanOrEqual(699);
      expect(hadith.libraryReadUrl).toBe(`/library/sahih-al-bukhari/read?page=${hadith.pageNumber}&hadith=${hadith.hadithNumber}`);
    });
  });

  it('11. Verifies "Purity of the Heart (طہارتِ قلب اور باطن)" Hadith 52 exists with exact mapping', () => {
    const heartHadith = SAHIH_BUKHARI_DAILY_HADITHS.find(
      (h) => h.theme.includes('Purity of the Heart') || h.hadithNumber === 52
    );

    expect(heartHadith).toBeDefined();
    expect(heartHadith?.hadithNumber).toBe(52);
    expect(heartHadith?.theme).toBe('Purity of the Heart (طہارتِ قلب اور باطن)');
    expect(heartHadith?.pageNumber).toBe(13);
    expect(heartHadith?.libraryReadUrl).toBe('/library/sahih-al-bukhari/read?page=13&hadith=52');
    expect(heartHadith?.arabicText).toContain('أَلاَ وَهِيَ القَلْبُ');
    expect(heartHadith?.urduTranslation).toContain('وہ دل ہے');
  });
});


