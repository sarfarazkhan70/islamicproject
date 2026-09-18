import { describe, it, expect } from 'vitest';
import { ISLAMIC_BOOKS, getBookById, getBookVolumes } from '../data/libraryData';
import { BukhariPdfService } from '../services/bukhariPdfService';
import { MuslimPdfService } from '../services/muslimPdfService';
import { SharahMuslimPdfService } from '../services/sharahMuslimPdfService';
import { TirmiziPdfService } from '../services/tirmiziPdfService';
import { FatawaRazawiyyaPdfService } from '../services/fatawaRazawiyyaPdfService';
import { HadaiqPdfService } from '../services/hadaiqPdfService';
import { IslamicBook } from '../types/library.types';

describe('Sunni Islamic Digital Library - Dynamic & Local Book System', () => {
  // 1. All Required Books Must Exist in Catalog
  it('contains all required classical Sunni Hadith and Alahazrat literature books', () => {
    expect(getBookById('kanzul-iman')).toBeDefined();
    expect(getBookById('sahih-al-bukhari')).toBeDefined();
    expect(getBookById('sahih-muslim')).toBeDefined();
    expect(getBookById('sharah-sahih-muslim')).toBeDefined();
    expect(getBookById('jami-at-tirmidhi')).toBeDefined();
    expect(getBookById('fatawa-razawiyya')).toBeDefined();
    expect(getBookById('hadaiq-e-bakhshish')).toBeDefined();
  });

  // 2. Local-Only Assets: Zero External Runtime URL Dependencies
  it('ensures all reader services serve strictly from local project assets without external runtime URLs', () => {
    const checkNoExternal = (url: string) => {
      expect(url).not.toContain('drive.google.com');
      expect(url).not.toContain('archive.org');
      expect(url).not.toContain('http://');
      expect(url).not.toContain('https://');
      expect(url.startsWith('/')).toBe(true);
    };

    // Sahih al-Bukhari (Vol 1 & Vol 2)
    checkNoExternal(BukhariPdfService.getPdfUrl(1));
    checkNoExternal(BukhariPdfService.getPdfUrl(2));
    checkNoExternal(BukhariPdfService.getCoverImageUrl(1));
    checkNoExternal(BukhariPdfService.getCoverImageUrl(2));

    // Sahih Muslim (Vol 1..6)
    for (let v = 1; v <= 6; v++) {
      checkNoExternal(MuslimPdfService.getPdfUrl(v));
      checkNoExternal(MuslimPdfService.getPageImageUrl(1, v));
    }

    // Sharh Sahih Muslim (Vol 1..7)
    for (let v = 1; v <= 7; v++) {
      checkNoExternal(SharahMuslimPdfService.getPdfUrl(v));
      checkNoExternal(SharahMuslimPdfService.getPageImageUrl(1, v));
    }

    // Jami' at-Tirmidhi (Part 1..6)
    for (let p = 1; p <= 6; p++) {
      checkNoExternal(TirmiziPdfService.getPdfUrl(p));
      checkNoExternal(TirmiziPdfService.getPageImageUrl(1, p));
    }

    // Fatawa-e-Razviya (All 31 Volumes)
    const fatawaVols = [
      '1.1', '1.2', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
      '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    ];
    for (const key of fatawaVols) {
      checkNoExternal(FatawaRazawiyyaPdfService.getPdfUrl(key));
      checkNoExternal(FatawaRazawiyyaPdfService.getCoverImageUrl(key));
      checkNoExternal(FatawaRazawiyyaPdfService.getPageImageUrl(1, key));
    }

    // Hadaiq-e-Bakhshish (Urdu)
    checkNoExternal(HadaiqPdfService.getPdfUrl());
  });

  // 3. Dynamic Multi-Volume Generator for Existing Multi-Volume Collections
  it('correctly resolves volume metadata for all existing multi-volume books', () => {
    // Bukhari (2 Jilds)
    const bukhari = getBookById('sahih-al-bukhari')!;
    const bukhariVols = getBookVolumes(bukhari);
    expect(bukhariVols.length).toBe(2);
    expect(bukhariVols[0].displayTitle).toBe('Jild 1');
    expect(bukhariVols[1].displayTitle).toBe('Jild 2');
    expect(bukhariVols[0].coverImage).toBe('/bukhari/covers/cover_1.webp');

    // Fatawa-e-Razviya (31 Jilds)
    const fatawa = getBookById('fatawa-razawiyya')!;
    const fatawaVols = getBookVolumes(fatawa);
    expect(fatawaVols.length).toBe(31);
    expect(fatawaVols[0].volumeKey).toBe('1.1');
    expect(fatawaVols[1].volumeKey).toBe('1.2');
    expect(fatawaVols[2].volumeKey).toBe('2');
    expect(fatawaVols[30].volumeKey).toBe('30');

    // Sahih Muslim (6 Jilds)
    const muslim = getBookById('sahih-muslim')!;
    const muslimVols = getBookVolumes(muslim);
    expect(muslimVols.length).toBe(6);

    // Sharh Sahih Muslim (7 Jilds)
    const sharh = getBookById('sharah-sahih-muslim')!;
    const sharhVols = getBookVolumes(sharh);
    expect(sharhVols.length).toBe(7);

    // Jami' at-Tirmidhi (6 Parts)
    const tirmizi = getBookById('jami-at-tirmidhi')!;
    const tirmiziVols = getBookVolumes(tirmizi);
    expect(tirmiziVols.length).toBe(6);
  });

  // 4. Future-Proof Dynamic Book System
  it('dynamically generates volume cards, covers, and routes for any newly added future book', () => {
    const mockFutureBook: IslamicBook = {
      id: 'al-shifa-qadi-iyad',
      title: 'Kitab ash-Shifa bi Ta’rif Huquq al-Mustafa ﷺ',
      arabicTitle: 'الشفا بتعريف حقوق المصطفى',
      urduTitle: 'کتاب الشفاء',
      author: 'Qadi Iyad al-Yahsubi',
      authorArabic: 'القاضي عياض بن موسى اليحصبي السبتي',
      category: 'seerat',
      tradition: 'Classical Sunni Seerat',
      primaryLanguage: 'Arabic',
      languagesAvailable: ['Arabic', 'Urdu', 'English'],
      volumeCount: 3,
      era: 'Classical (476-544 AH / 1083-1149 CE)',
      isAvailable: true,
      description: 'The monumental classic on the rights, virtues, and reverence of the Holy Prophet Muhammad ﷺ.',
      significance: 'Celebrated across the Sunni Islamic world for the defense of Prophetic sanctity.',
      tags: ['Seerat', 'Qadi Iyad', 'Shifa', 'Huquq al-Mustafa'],
      source: 'Verified Classical Standard Edition',
      volumes: [
        {
          id: 'shifa-vol-1',
          volumeNumber: 1,
          volumeKey: '1',
          title: 'Kitab ash-Shifa – Jild 1',
          displayTitle: 'Jild 1',
          author: 'Qadi Iyad al-Yahsubi',
          isAvailable: true,
          coverImage: '/library/al-shifa-qadi-iyad/covers/cover_1.webp',
          localPdfUrl: '/pdf/shifa_vol1.pdf',
          totalPages: 420,
        },
        {
          id: 'shifa-vol-2',
          volumeNumber: 2,
          volumeKey: '2',
          title: 'Kitab ash-Shifa – Jild 2',
          displayTitle: 'Jild 2',
          author: 'Qadi Iyad al-Yahsubi',
          isAvailable: true,
          coverImage: '/library/al-shifa-qadi-iyad/covers/cover_2.webp',
          localPdfUrl: '/pdf/shifa_vol2.pdf',
          totalPages: 450,
        },
        {
          id: 'shifa-vol-3',
          volumeNumber: 3,
          volumeKey: '3',
          title: 'Kitab ash-Shifa – Jild 3',
          displayTitle: 'Jild 3',
          author: 'Qadi Iyad al-Yahsubi',
          isAvailable: true,
          coverImage: '/library/al-shifa-qadi-iyad/covers/cover_3.webp',
          localPdfUrl: '/pdf/shifa_vol3.pdf',
          totalPages: 390,
        },
      ],
    };

    const generatedVolumes = getBookVolumes(mockFutureBook);

    expect(generatedVolumes.length).toBe(3);
    expect(generatedVolumes[0].displayTitle).toBe('Jild 1');
    expect(generatedVolumes[0].author).toBe('Qadi Iyad al-Yahsubi');
    expect(generatedVolumes[0].coverImage).toBe('/library/al-shifa-qadi-iyad/covers/cover_1.webp');
    expect(generatedVolumes[0].localPdfUrl).toBe('/pdf/shifa_vol1.pdf');

    expect(generatedVolumes[1].displayTitle).toBe('Jild 2');
    expect(generatedVolumes[2].displayTitle).toBe('Jild 3');
  });

  // 5. Dynamic Book with No Explicit Volume Array
  it('automatically generates standard volume items when only volumeCount is provided', () => {
    const mockAutoBook: IslamicBook = {
      id: 'al-bahr-al-raiq',
      title: 'Al-Bahr ar-Raiq Sharh Kanz ad-Daqaiq',
      arabicTitle: 'البحر الرائق شرح كنز الدقائق',
      author: 'Ibn Nujaym al-Misri',
      category: 'fiqh',
      tradition: 'Sunni Hanafi Fiqh',
      primaryLanguage: 'Arabic',
      languagesAvailable: ['Arabic'],
      volumeCount: 8,
      era: '926-970 AH / 1520-1563 CE',
      isAvailable: true,
      description: 'Major Hanafi jurisprudential encyclopedia.',
      significance: 'Indispensable reference for Hanafi Fatwa issuing.',
      tags: ['Fiqh', 'Hanafi', 'Ibn Nujaym'],
      source: 'Verified Standard Edition',
    };

    const generatedVolumes = getBookVolumes(mockAutoBook);

    expect(generatedVolumes.length).toBe(8);
    expect(generatedVolumes[0].displayTitle).toBe('Jild 1');
    expect(generatedVolumes[0].coverImage).toBe('/library/al-bahr-al-raiq/covers/cover_1.webp');
    expect(generatedVolumes[7].displayTitle).toBe('Jild 8');
  });
});
