import { describe, it, expect } from 'vitest';
import { ISLAMIC_BOOKS, getBookById, getBookVolumes } from '../data/libraryData';

describe('Islamic Book Cards & Volume Structure Verification', () => {
  it('should have clean and verified metadata for Kanz-ul-Iman', () => {
    const kanzulIman = getBookById('kanzul-iman');
    expect(kanzulIman).toBeDefined();
    expect(kanzulIman?.title).toBe('Kanzul Iman');
    expect(kanzulIman?.author).toContain('Imam Ahmad Raza Khan');
    expect(kanzulIman?.volumeCount).toBe(1);
    expect(kanzulIman?.isAvailable).toBe(true);
    const volumes = getBookVolumes(kanzulIman!);
    expect(volumes.length).toBe(1);
    expect(volumes[0].volumeNumber).toBe(1);
  });

  it('should have clean and verified metadata for Bahar-e-Shariat with 3 Jilds', () => {
    const bahar = getBookById('bahar-e-shariat');
    expect(bahar).toBeDefined();
    expect(bahar?.title).toBe('Bahar-e-Shariat');
    expect(bahar?.author).toContain('Sadrush Shariah');
    expect(bahar?.author).toContain('Amjad Ali Azmi');
    expect(bahar?.volumeCount).toBe(3);
    expect(bahar?.category).toBe('fiqh');

    const volumes = getBookVolumes(bahar!);
    expect(volumes.length).toBe(3);
    expect(volumes.map((v) => v.volumeNumber)).toEqual([1, 2, 3]);
    expect(volumes[0].title).toContain('Jild 1');
    expect(volumes[1].title).toContain('Jild 2');
    expect(volumes[2].title).toContain('Jild 3');
    // Ensure Jild 1, 2, 3 have chapters
    expect(volumes[0].chapters && volumes[0].chapters.length).toBeGreaterThan(0);
    expect(volumes[1].chapters && volumes[1].chapters.length).toBeGreaterThan(0);
    expect(volumes[2].chapters && volumes[2].chapters.length).toBeGreaterThan(0);
  });

  it('should have clean and verified metadata for Fatawa Razawiyya with 30 Jilds', () => {
    const fatawa = getBookById('fatawa-razawiyya');
    expect(fatawa).toBeDefined();
    expect(fatawa?.title).toBe('Fatawa Razawiyya');
    expect(fatawa?.author).toContain('Imam Ahmad Raza Khan');
    expect(fatawa?.volumeCount).toBe(30);
    expect(fatawa?.category).toBe('fatawa');

    const volumes = getBookVolumes(fatawa!);
    expect(volumes.length).toBe(30);
    expect(volumes.map((v) => v.volumeNumber)).toEqual(
      Array.from({ length: 30 }, (_, i) => i + 1)
    );
  });

  it('should have clean and verified metadata for Hadaiq-e-Bakhshish', () => {
    const hadaiq = getBookById('hadaiq-e-bakhshish');
    expect(hadaiq).toBeDefined();
    expect(hadaiq?.title).toBe('Hadaiq-e-Bakhshish');
    expect(hadaiq?.author).toBe('Imam Ahmad Raza Khan (Ala Hazrat)');
  });

  it('should have clean and verified metadata for Hadith collections (Sihah Sittah)', () => {
    const bukhari = getBookById('sahih-al-bukhari');
    expect(bukhari).toBeDefined();
    expect(bukhari?.author).toContain('Bukhari');
    expect(bukhari?.category).toBe('hadith');
    expect(bukhari?.volumeCount).toBe(1);
    expect(getBookVolumes(bukhari!).length).toBe(1);

    const muslim = getBookById('sahih-muslim');
    expect(muslim).toBeDefined();
    expect(muslim?.author).toContain('Muslim');
    expect(muslim?.category).toBe('hadith');
    expect(muslim?.volumeCount).toBe(7);
    expect(getBookVolumes(muslim!).length).toBe(7);

    const tirmidhi = getBookById('jami-at-tirmidhi');
    expect(tirmidhi?.volumeCount).toBe(6);
    expect(getBookVolumes(tirmidhi!).length).toBe(6);

    const abuDawud = getBookById('sunan-abi-dawud');
    expect(abuDawud?.volumeCount).toBe(5);
    expect(getBookVolumes(abuDawud!).length).toBe(5);

    const nasai = getBookById('sunan-an-nasai');
    expect(nasai?.volumeCount).toBe(6);
    expect(getBookVolumes(nasai!).length).toBe(6);

    const ibnMajah = getBookById('sunan-ibn-majah');
    expect(ibnMajah?.volumeCount).toBe(5);
    expect(getBookVolumes(ibnMajah!).length).toBe(5);
  });

  it('should verify every book in library has matching volume count and sequential 1..N volume numbering', () => {
    for (const book of ISLAMIC_BOOKS) {
      expect(book.title.trim().length).toBeGreaterThan(0);
      expect(book.author.trim().length).toBeGreaterThan(0);
      expect(book.category.trim().length).toBeGreaterThan(0);
      expect(book.id.trim().length).toBeGreaterThan(0);
      expect(book.isAvailable).toBe(true);

      const volumes = getBookVolumes(book);
      expect(volumes.length).toBe(book.volumeCount);
      expect(volumes.length).toBeGreaterThan(0);

      // Verify numbering is strictly 1, 2, ..., N without gaps or fake numbers
      const expectedNumbers = Array.from({ length: book.volumeCount }, (_, i) => i + 1);
      const actualNumbers = volumes.map((v) => v.volumeNumber);
      expect(actualNumbers).toEqual(expectedNumbers);
    }
  });

  it('should verify Quran store navigation modes are strictly read and listen', async () => {
    const { useQuranStore } = await import('../stores/useQuranStore');
    const store = useQuranStore.getState();
    expect(store.mode).toBe('read');
    store.setMode('listen');
    expect(useQuranStore.getState().mode).toBe('listen');
    store.setMode('read');
    expect(useQuranStore.getState().mode).toBe('read');
  });
});

