import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ASMA_UL_HUSNA } from '../../frontend/src/data/islamic/asmaUlHusnaData.js';
import { ASMA_E_MUSTAFA } from '../../frontend/src/data/islamic/asmaEMustafaData.js';
import { IslamicNameItem, normalizeArabicText } from '../../frontend/src/data/islamic/types.js';

describe('Islamic Names Feature — Asma-ul-Husna & Asma-e-Mustafa ﷺ', () => {
  describe('1. Asma-ul-Husna (99 Names of Allah Ta\'ala) Verification', () => {
    it('should contain exactly 99 verified Names of Allah', () => {
      expect(ASMA_UL_HUSNA).toHaveLength(99);
    });

    it('should have contiguous sequential numbering from 1 to 99 with no duplicates', () => {
      const numbers = ASMA_UL_HUSNA.map((n) => n.number);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(99);

      for (let i = 1; i <= 99; i++) {
        expect(numbers[i - 1]).toBe(i);
        expect(ASMA_UL_HUSNA[i - 1].id).toBe(`allah-${String(i).padStart(2, '0')}`);
      }
    });

    it('should have complete, non-empty fields for every single Allah Name', () => {
      for (const item of ASMA_UL_HUSNA) {
        expect(item.arabic.trim().length).toBeGreaterThan(0);
        expect(item.transliteration.trim().length).toBeGreaterThan(0);
        expect(item.romanUrdu.trim().length).toBeGreaterThan(0);
        expect(item.urdu.trim().length).toBeGreaterThan(0);
        expect(item.english.trim().length).toBeGreaterThan(0);
        expect(item.explanation.trim().length).toBeGreaterThan(0);
        expect(item.reference.trim().length).toBeGreaterThan(0);
        expect(item.audioUrl).toMatch(/^\/audio\/allah\/allah-\d{2}\.wav$/);
        expect(item.category).toBe('allah');
      }
    });

    it('should verify physical audio file existence and size in public assets', () => {
      const audioPath = path.resolve(__dirname, '../../frontend/public/audio/allah/allah-01.wav');
      expect(fs.existsSync(audioPath)).toBe(true);
      const stats = fs.statSync(audioPath);
      expect(stats.size).toBeGreaterThan(200 * 1024); // Greater than 200 KB
    });

    it('should verify key reference names against authentic Qur\'anic and Hadith citations and audio mapping', () => {
      const rahman = ASMA_UL_HUSNA.find((n) => n.number === 1);
      expect(rahman?.transliteration).toBe('Ar-Rahman');
      expect(rahman?.arabic).toBe('الرَّحْمَنُ');
      expect(rahman?.reference).toContain('Surah Al-Fatihah');
      expect(rahman?.audioUrl).toBe('/audio/allah/allah-01.wav');

      const malik = ASMA_UL_HUSNA.find((n) => n.number === 3);
      expect(malik?.transliteration).toBe('Al-Malik');
      expect(malik?.reference).toContain('Surah Al-Hashr 59:23');
      expect(malik?.audioUrl).toBe('/audio/allah/allah-03.wav');

      const ahad = ASMA_UL_HUSNA.find((n) => n.number === 67);
      expect(ahad?.transliteration).toBe('Al-Ahad');
      expect(ahad?.reference).toContain('Surah Al-Ikhlas 112:1');
      expect(ahad?.audioUrl).toBe('/audio/allah/allah-67.wav');

      const samad = ASMA_UL_HUSNA.find((n) => n.number === 68);
      expect(samad?.transliteration).toBe('As-Samad');
      expect(samad?.reference).toContain('Surah Al-Ikhlas 112:2');
      expect(samad?.audioUrl).toBe('/audio/allah/allah-68.wav');

      const sabur = ASMA_UL_HUSNA.find((n) => n.number === 99);
      expect(sabur?.transliteration).toBe('As-Sabur');
      expect(sabur?.arabic).toBe('الصَّبُورُ');
      expect(sabur?.audioUrl).toBe('/audio/allah/allah-99.wav');
    });

    it('should not contain any placeholder or test strings', () => {
      for (const item of ASMA_UL_HUSNA) {
        const fullString = `${item.arabic} ${item.transliteration} ${item.romanUrdu} ${item.urdu} ${item.english} ${item.explanation} ${item.reference}`.toLowerCase();
        expect(fullString).not.toContain('lorem');
        expect(fullString).not.toContain('placeholder');
        expect(fullString).not.toContain('sample');
        expect(fullString).not.toContain('todo');
      }
    });
  });

  describe('2. Asma-e-Mustafa ﷺ (Verified Prophetic Names & Titles) Verification', () => {
    it('should contain authentic verified Prophetic Names and Titles', () => {
      expect(ASMA_E_MUSTAFA.length).toBeGreaterThanOrEqual(30);
    });

    it('should have unique IDs and sequential numbering with no duplicates', () => {
      const ids = ASMA_E_MUSTAFA.map((n) => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ASMA_E_MUSTAFA.length);

      for (let i = 0; i < ASMA_E_MUSTAFA.length; i++) {
        expect(ASMA_E_MUSTAFA[i].number).toBe(i + 1);
      }
    });

    it('should have authentic Qur\'an or Sahih Hadith citation for every single Prophetic name', () => {
      for (const item of ASMA_E_MUSTAFA) {
        expect(item.arabic.trim().length).toBeGreaterThan(0);
        expect(item.transliteration.trim().length).toBeGreaterThan(0);
        expect(item.romanUrdu.trim().length).toBeGreaterThan(0);
        expect(item.urdu.trim().length).toBeGreaterThan(0);
        expect(item.english.trim().length).toBeGreaterThan(0);
        expect(item.explanation.trim().length).toBeGreaterThan(0);
        expect(item.reference.trim().length).toBeGreaterThan(0);

        const refLower = item.reference.toLowerCase();
        const hasValidSource =
          refLower.includes("qur'an") ||
          refLower.includes('bukhari') ||
          refLower.includes('muslim') ||
          refLower.includes('tirmidhi') ||
          refLower.includes('dawud') ||
          refLower.includes('ahmad') ||
          refLower.includes('sirah');
        expect(hasValidSource).toBe(true);
      }
    });

    it('should verify specific authenticated Prophetic names and titles', () => {
      const muhammad = ASMA_E_MUSTAFA.find((n) => n.number === 1);
      expect(muhammad?.transliteration).toContain('Muhammad');
      expect(muhammad?.reference).toContain('Surah Al-Imran 3:144');

      const ahmad = ASMA_E_MUSTAFA.find((n) => n.number === 2);
      expect(ahmad?.transliteration).toContain('Ahmad');
      expect(ahmad?.reference).toContain('Surah As-Saff 61:6');

      const mahi = ASMA_E_MUSTAFA.find((n) => n.number === 3);
      expect(mahi?.transliteration).toContain('Al-Mahi');
      expect(mahi?.reference).toContain('Sahih al-Bukhari 4896');

      const khatam = ASMA_E_MUSTAFA.find((n) => n.transliteration.includes('Khatam an-Nabiyyin'));
      expect(khatam).toBeDefined();
      expect(khatam?.reference).toContain('Surah Al-Ahzab 33:40');

      const rahmat = ASMA_E_MUSTAFA.find((n) => n.transliteration.includes("Rahmatun lil-'Alamin"));
      expect(rahmat).toBeDefined();
      expect(rahmat?.reference).toContain('Surah Al-Anbiya 21:107');
    });
  });

  describe('3. Multi-Lingual Search & Filter Algorithms', () => {
    const searchNames = (list: IslamicNameItem[], query: string) => {
      const q = query.trim().toLowerCase();
      const qArabic = normalizeArabicText(query);
      if (!q) return list;
      return list.filter((item) => {
        const matchTranslit = item.transliteration.toLowerCase().includes(q);
        const matchEnglish = item.english.toLowerCase().includes(q);
        const matchRomanUrdu = item.romanUrdu.toLowerCase().includes(q);
        const matchArabic =
          item.arabic.includes(q) || (qArabic && normalizeArabicText(item.arabic).includes(qArabic));
        const matchUrdu = item.urdu.includes(q);
        const matchNum = String(item.number) === q;
        return matchTranslit || matchEnglish || matchRomanUrdu || matchArabic || matchUrdu || matchNum;
      });
    };

    it('should accurately search by Arabic substring', () => {
      const results = searchNames(ASMA_UL_HUSNA, 'الرحمن');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].transliteration).toBe('Ar-Rahman');
    });

    it('should accurately search by English meaning substring', () => {
      const results = searchNames(ASMA_UL_HUSNA, 'Merciful');
      expect(results.length).toBeGreaterThanOrEqual(2);
      const translits = results.map((r) => r.transliteration);
      expect(translits).toContain('Ar-Rahman');
      expect(translits).toContain('Ar-Rahim');
    });

    it('should accurately search by Roman Urdu substring', () => {
      const results = searchNames(ASMA_UL_HUSNA, 'Reham');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should accurately search by transliteration', () => {
      const results = searchNames(ASMA_UL_HUSNA, 'Quddus');
      expect(results).toHaveLength(1);
      expect(results[0].number).toBe(4);
    });

    it('should accurately search by item number', () => {
      const results = searchNames(ASMA_UL_HUSNA, '5');
      expect(results.some((r) => r.number === 5)).toBe(true);
    });

    it('should accurately search Prophetic names by title keyword', () => {
      const results = searchNames(ASMA_E_MUSTAFA, 'Seal');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].transliteration).toContain('Khatam');
    });
  });
});
