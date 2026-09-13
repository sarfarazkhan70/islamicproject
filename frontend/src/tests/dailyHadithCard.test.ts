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

  it('4. Verifies deterministic daily rotation maintains the same Hadith throughout the day', () => {
    const morningDate = new Date(2026, 8, 13, 8, 0, 0); // 2026-09-13 08:00 AM
    const eveningDate = new Date(2026, 8, 13, 23, 30, 0); // 2026-09-13 11:30 PM
    const nextDayDate = new Date(2026, 8, 14, 0, 1, 0); // 2026-09-14 12:01 AM

    const morningHadith = getDailyHadith(morningDate);
    const eveningHadith = getDailyHadith(eveningDate);
    const nextDayHadith = getDailyHadith(nextDayDate);

    // Must be identical throughout the same day
    expect(morningHadith.id).toBe(eveningHadith.id);
    expect(morningHadith.reference).toBe(eveningHadith.reference);
    expect(morningHadith.urduTranslator).toContain('احمد رضا');

    // Rotates on different days
    expect(morningHadith).toBeDefined();
    expect(nextDayHadith).toBeDefined();
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

  it('9. Verifies complete heading is center-aligned across desktop, tablet, and mobile', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');
    const componentCode = fs.readFileSync(dailyHadithCardPath, 'utf-8');

    // Component renders heading inside .hadith-header-left with .hadith-theme-title
    expect(componentCode).toContain('className="heading-3 hadith-theme-title"');
    expect(componentCode).toContain('{hadith.theme}');

    // CSS guarantees center alignment
    expect(css).toContain('.hadith-card-header {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;');
    expect(css).toContain('.hadith-theme-title {\n  font-size: clamp(1.1rem, 2.2vw, 1.4rem);\n  font-weight: var(--weight-bold);\n  color: var(--text-primary);\n  margin: 0;\n  line-height: 1.4;\n  text-align: center;\n  width: 100%;\n}');
  });

  it('10. Verifies clickable Hadith reference includes exact Hadith number and routes to Bukhari Library page with hadith parameter', () => {
    const componentCode = fs.readFileSync(dailyHadithCardPath, 'utf-8');

    // Both top badge and footer reference contain exact Hadith number and navigate via Link to libraryReadUrl
    expect(componentCode).toContain('Sahih al-Bukhari — Hadith No. {hadith.hadithNumber}');
    expect(componentCode).toContain('<Link\n              to={hadith.libraryReadUrl}\n              className="hadith-pill-source"');
    expect(componentCode).toContain('<Link\n              to={hadith.libraryReadUrl}\n              className="hadith-ref-badge"');

    // All Hadiths have valid pageNumber, hadithNumber, and libraryReadUrl with both page and hadith query params
    SAHIH_BUKHARI_DAILY_HADITHS.forEach((hadith) => {
      expect(hadith.hadithNumber).toBeGreaterThan(0);
      expect(hadith.pageNumber).toBeGreaterThanOrEqual(1);
      expect(hadith.pageNumber).toBeLessThanOrEqual(699);
      expect(hadith.libraryReadUrl).toBe(`/library/sahih-al-bukhari/read?page=${hadith.pageNumber}&hadith=${hadith.hadithNumber}`);
    });
  });

  it('11. Verifies "Forgiveness & Reconciliation (صلح اور سلام کی پہل)" Hadith 6077 exists with exact mapping', () => {
    const reconciliationHadith = SAHIH_BUKHARI_DAILY_HADITHS.find(
      (h) => h.theme.includes('Forgiveness & Reconciliation') || h.hadithNumber === 6077
    );

    expect(reconciliationHadith).toBeDefined();
    expect(reconciliationHadith?.hadithNumber).toBe(6077);
    expect(reconciliationHadith?.theme).toBe('Forgiveness & Reconciliation (صلح اور سلام کی پہل)');
    expect(reconciliationHadith?.pageNumber).toBe(578);
    expect(reconciliationHadith?.libraryReadUrl).toBe('/library/sahih-al-bukhari/read?page=578&hadith=6077');
  });
});


