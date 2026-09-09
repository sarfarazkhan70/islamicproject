import { describe, it, expect } from 'vitest';
import { ISLAMIC_BOOKS, getBookById } from '../data/libraryData';

describe('Islamic Book Cards Verification', () => {
  it('should have clean and verified metadata for Kanz-ul-Iman', () => {
    const kanzulIman = getBookById('kanzul-iman');
    expect(kanzulIman).toBeDefined();
    expect(kanzulIman?.title).toBe('Kanzul Iman');
    expect(kanzulIman?.author).toContain('Imam Ahmad Raza Khan');
    expect(kanzulIman?.volumeCount).toBe(1);
    expect(kanzulIman?.isAvailable).toBe(true);
  });

  it('should have clean and verified metadata for Bahar-e-Shariat', () => {
    const bahar = getBookById('bahar-e-shariat');
    expect(bahar).toBeDefined();
    expect(bahar?.title).toBe('Bahar-e-Shariat');
    expect(bahar?.author).toContain('Sadrush Shariah');
    expect(bahar?.author).toContain('Amjad Ali Azmi');
    expect(bahar?.volumeCount).toBe(3);
    expect(bahar?.category).toBe('fiqh');
  });

  it('should have clean and verified metadata for Fatawa Razawiyya', () => {
    const fatawa = getBookById('fatawa-razawiyya');
    expect(fatawa).toBeDefined();
    expect(fatawa?.title).toBe('Fatawa Razawiyya');
    expect(fatawa?.author).toContain('Imam Ahmad Raza Khan');
    expect(fatawa?.volumeCount).toBe(30);
    expect(fatawa?.category).toBe('fatawa');
  });

  it('should have clean and verified metadata for Hadith collections', () => {
    const bukhari = getBookById('sahih-al-bukhari');
    expect(bukhari).toBeDefined();
    expect(bukhari?.author).toContain('Bukhari');
    expect(bukhari?.category).toBe('hadith');
    expect(bukhari?.volumeCount).toBe(9);

    const muslim = getBookById('sahih-muslim');
    expect(muslim).toBeDefined();
    expect(muslim?.author).toContain('Muslim');
    expect(muslim?.category).toBe('hadith');
    expect(muslim?.volumeCount).toBe(7);
  });

  it('should verify all books have valid titles, authors, and non-empty categories', () => {
    for (const book of ISLAMIC_BOOKS) {
      expect(book.title.trim().length).toBeGreaterThan(0);
      expect(book.author.trim().length).toBeGreaterThan(0);
      expect(book.category.trim().length).toBeGreaterThan(0);
      expect(book.id.trim().length).toBeGreaterThan(0);
      expect(book.isAvailable).toBe(true);
    }
  });
});
