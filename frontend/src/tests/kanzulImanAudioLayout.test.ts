import { describe, it, expect } from 'vitest';
import {
  getGlobalAyahNumber,
  getKanzulImanUrduAudioUrl,
  getDisplayedAyahText,
  preprocessTextForNaturalSpeech,
  buildTTSStreamUrl,
  chunkTextForTTS,
  SURAH_VERSE_COUNTS,
} from '../stores/useKanzulImanAudioStore';
import { getVerifiedKanzulImanTranslation } from '../data/kanzulImanData';
import { HURUF_E_MUQATTAAT, getHurufMuqattaatForSurah } from '../data/hurufMuqattaatData';
import { cleanAyahArabicText } from '../services/kanzulImanService';
import { SURAHS_LIST } from '../data/quranData';

describe('Kanz-ul-Iman Audio & Verse Mapping', () => {
  it('should verify total Ayahs count in Quran is 6236 across 114 Surahs', () => {
    expect(SURAH_VERSE_COUNTS.length).toBe(114);
    const totalAyahs = SURAH_VERSE_COUNTS.reduce((sum, count) => sum + count, 0);
    expect(totalAyahs).toBe(6236);
  });

  it('should map Surah and Ayah numbers to global index correctly', () => {
    // Surah 1 Al-Fatihah (7 verses) -> 1..7
    expect(getGlobalAyahNumber(1, 1)).toBe(1);
    expect(getGlobalAyahNumber(1, 7)).toBe(7);

    // Surah 2 Al-Baqarah (286 verses) -> 8..293
    expect(getGlobalAyahNumber(2, 1)).toBe(8);
    expect(getGlobalAyahNumber(2, 286)).toBe(293);

    // Surah 3 Ali Imran (200 verses) -> 294..493
    expect(getGlobalAyahNumber(3, 1)).toBe(294);

    // Surah 114 An-Nas (6 verses) -> 6231..6236
    expect(getGlobalAyahNumber(114, 1)).toBe(6231);
    expect(getGlobalAyahNumber(114, 6)).toBe(6236);
  });

  it('should generate correct audio URL for authentic Kanz-ul-Iman Urdu recitation', () => {
    expect(getKanzulImanUrduAudioUrl(1, 1)).toBe(
      'https://cdn.islamic.network/quran/audio/64/ur.khan/1.mp3'
    );
    expect(getKanzulImanUrduAudioUrl(114, 6)).toBe(
      'https://cdn.islamic.network/quran/audio/64/ur.khan/6236.mp3'
    );
  });

  it('should provide authentic verified Kanz-ul-Iman Urdu and faithful English translation of Ala Hazrat Imam Ahmad Raza Khan', () => {
    // 1. Al-Fatihah 1:1
    const fatihah1Urdu = getVerifiedKanzulImanTranslation(1, 1, 'urdu');
    const fatihah1Eng = getVerifiedKanzulImanTranslation(1, 1, 'english');
    expect(fatihah1Urdu).toBe('اللہ کے نام سے شروع جو بہت مہربان رحمت والا');
    expect(fatihah1Eng).toBe('In the name of Allah, The Most Gracious, the Most Merciful');

    // 2. Al-Fatihah 1:2
    const fatihah2Urdu = getVerifiedKanzulImanTranslation(1, 2, 'urdu');
    const fatihah2Eng = getVerifiedKanzulImanTranslation(1, 2, 'english');
    expect(fatihah2Urdu).toContain('سب خوبیاں اللہ کو جو مالک سارے جہان والوں کا');
    expect(fatihah2Eng).toBe('All praise is to Allah, the Lord Of The Creation.');

    // 3. Al-Ikhlas 112:1
    const ikhlas1Urdu = getVerifiedKanzulImanTranslation(112, 1, 'urdu');
    const ikhlas1Eng = getVerifiedKanzulImanTranslation(112, 1, 'english');
    expect(ikhlas1Urdu).toBe('تم فرماؤ وہ اللہ ہے وہ ایک ہے');
    expect(ikhlas1Eng).toContain('He is Allah, He is One');

    // 4. Ad-Duha 93:3
    const duha3Urdu = getVerifiedKanzulImanTranslation(93, 3, 'urdu');
    const duha3Eng = getVerifiedKanzulImanTranslation(93, 3, 'english');
    expect(duha3Urdu).toContain('کہ تمہیں تمہارے رب نے نہ چھوڑا');
    expect(duha3Eng).toContain('Your Lord has not forsaken you');

    // 5. Al-Kauthar 108:1
    const kauthar1Urdu = getVerifiedKanzulImanTranslation(108, 1, 'urdu');
    const kauthar1Eng = getVerifiedKanzulImanTranslation(108, 1, 'english');
    expect(kauthar1Urdu).toContain('اے محبوب! بیشک ہم نے تمہیں بے شمار خوبیاں عطا فرمائیں');
    expect(kauthar1Eng).toContain('We have bestowed upon you an abundance of good');
  });

  it('should verify Surah metadata list has 114 Surahs and proper attributions', () => {
    expect(SURAHS_LIST.length).toBe(114);
    expect(SURAHS_LIST[0].name).toBe('Al-Fatihah');
    expect(SURAHS_LIST[8].name).toBe('At-Tawbah');
    expect(SURAHS_LIST[113].name).toBe('An-Nas');
  });
});

describe('Huruf-e-Muqattaat & Bismillah Separation', () => {
  it('should have exactly 29 canonical Surahs with Huruf-e-Muqattaat', () => {
    const surahKeys = Object.keys(HURUF_E_MUQATTAAT).map(Number);
    expect(surahKeys.length).toBe(29);

    // Verify key Huruf-e-Muqattaat
    expect(getHurufMuqattaatForSurah(2)?.lettersArabic).toBe('الٓمٓ');
    expect(getHurufMuqattaatForSurah(2)?.transliteration).toBe('Alif Lām Mīm');

    expect(getHurufMuqattaatForSurah(19)?.lettersArabic).toBe('كٓهيعٓصٓ');
    expect(getHurufMuqattaatForSurah(19)?.transliteration).toBe('Kāf Hā Yā ʿAin Ṣād');

    expect(getHurufMuqattaatForSurah(20)?.lettersArabic).toBe('طٰهٰ');
    expect(getHurufMuqattaatForSurah(20)?.transliteration).toBe('Ṭā Hā');

    expect(getHurufMuqattaatForSurah(36)?.lettersArabic).toBe('يٰسٓ');
    expect(getHurufMuqattaatForSurah(36)?.transliteration).toBe('Yā Sīn');

    expect(getHurufMuqattaatForSurah(68)?.lettersArabic).toBe('نٓ');
    expect(getHurufMuqattaatForSurah(68)?.transliteration).toBe('Nūn');
  });

  it('should return null for Surahs without Huruf-e-Muqattaat', () => {
    expect(getHurufMuqattaatForSurah(1)).toBeNull(); // Al-Fatihah
    expect(getHurufMuqattaatForSurah(9)).toBeNull(); // At-Tawbah
    expect(getHurufMuqattaatForSurah(112)).toBeNull(); // Al-Ikhlas
  });

  it('should cleanly strip leading Bismillah from Ayah 1 of Surahs 2..114 while preserving other texts', () => {
    // Al-Baqarah 2:1 with prefixed Bismillah
    const rawBaqarah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ';
    expect(cleanAyahArabicText(rawBaqarah, 2, 1)).toBe('الٓمٓ');

    // Al-Ikhlas 112:1 with prefixed Bismillah
    const rawIkhlas = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ قُلْ هُوَ اللَّهُ أَحَدٌ';
    expect(cleanAyahArabicText(rawIkhlas, 112, 1)).toBe('قُلْ هُوَ اللَّهُ أَحَدٌ');

    // Al-Fatihah 1:1 (Bismillah IS Ayah 1) -> must NOT be stripped
    const fatihah1 = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    expect(cleanAyahArabicText(fatihah1, 1, 1)).toBe(fatihah1);

    // Ayah 2 of any Surah -> unchanged
    const baqarah2 = 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ';
    expect(cleanAyahArabicText(baqarah2, 2, 2)).toBe(baqarah2);
  });
});

describe('Exact Text-to-Audio Payload Matching', () => {
  const sampleAyahs = [
    {
      ayahNumber: 1,
      kanzulImanUrdu: 'اللہ کے نام سے شروع جو بہت مہربان رحمت والا',
      kanzulImanEnglish: 'In the name of Allah, The Most Gracious, the Most Merciful',
      englishMeaning: 'In the name of Allah, The Most Gracious, the Most Merciful',
    },
    {
      ayahNumber: 2,
      kanzulImanUrdu: 'سب خوبیاں اللہ کو جو مالک سارے جہان والوں کا،',
      kanzulImanEnglish: 'All praise is to Allah, the Lord Of The Creation.',
      englishMeaning: 'All praise is to Allah, the Lord Of The Creation.',
    },
  ];

  it('should deliver the EXACT displayed Kanz-ul-Iman Urdu string to the audio engine with zero changes', () => {
    const ayah1UrduAudioText = getDisplayedAyahText(1, 1, 'urdu', sampleAyahs);
    expect(ayah1UrduAudioText).toBe('اللہ کے نام سے شروع جو بہت مہربان رحمت والا');
    expect(ayah1UrduAudioText).toBe(sampleAyahs[0].kanzulImanUrdu);

    const ayah2UrduAudioText = getDisplayedAyahText(1, 2, 'urdu', sampleAyahs);
    expect(ayah2UrduAudioText).toBe('سب خوبیاں اللہ کو جو مالک سارے جہان والوں کا،');
    expect(ayah2UrduAudioText).toBe(sampleAyahs[1].kanzulImanUrdu);
  });

  it('should deliver the EXACT displayed Kanz-ul-Iman English string to the audio engine with zero changes', () => {
    const ayah1EnglishAudioText = getDisplayedAyahText(1, 1, 'english', sampleAyahs);
    expect(ayah1EnglishAudioText).toBe('In the name of Allah, The Most Gracious, the Most Merciful');
    expect(ayah1EnglishAudioText).toBe(sampleAyahs[0].kanzulImanEnglish);

    const ayah2EnglishAudioText = getDisplayedAyahText(1, 2, 'english', sampleAyahs);
    expect(ayah2EnglishAudioText).toBe('All praise is to Allah, the Lord Of The Creation.');
    expect(ayah2EnglishAudioText).toBe(sampleAyahs[1].kanzulImanEnglish);
  });
});

describe('Audio Preprocessing Layer for Natural Male Voice Narration', () => {
  it('should cleanly strip bracket delimiters and trailing dashes for English speech while retaining 100% of the words', () => {
    const input1 = '[All] praise is [due] to Allah, Lord of the worlds -';
    const speech1 = preprocessTextForNaturalSpeech(input1, 'english');
    expect(speech1).toBe('All praise is due to Allah, Lord of the worlds.');

    const input2 = 'Indeed, We have granted you, [O Muhammad], al-Kawthar.';
    const speech2 = preprocessTextForNaturalSpeech(input2, 'english');
    expect(speech2).toBe('Indeed, We have granted you, O Muhammad, al-Kawthar.');

    const input3 = 'Say, "He is Allah, [who is] One,';
    const speech3 = preprocessTextForNaturalSpeech(input3, 'english');
    expect(speech3).toBe('Say, He is Allah, who is One,');
  });

  it('should process Urdu text cleanly for speech synthesis without changing words or honorifics', () => {
    const urduInput = 'اللہ کے نام سے شروع جو بہت مہربان رحمت والا';
    const urduSpeech = preprocessTextForNaturalSpeech(urduInput, 'urdu');
    expect(urduSpeech).toBe('اللہ کے نام سے شروع جو بہت مہربان رحمت والا');
  });

  it('should build valid TTS audio stream URLs for Urdu and English', () => {
    const urduUrl = buildTTSStreamUrl('اللہ کے نام سے شروع', 'urdu');
    expect(urduUrl).toContain('tl=ur');
    expect(urduUrl).toContain(encodeURIComponent('اللہ کے نام سے شروع'));

    const enUrl = buildTTSStreamUrl('In the name of Allah', 'english');
    expect(enUrl).toContain('tl=en');
    expect(enUrl).toContain(encodeURIComponent('In the name of Allah'));
  });

  it('should chunk long text cleanly at sentence and clause delimiters', () => {
    const shortText = 'Short sentence.';
    expect(chunkTextForTTS(shortText, 180)).toEqual(['Short sentence.']);

    const longUrdu = 'اللہ ہے جس کے سوا کوئی معبود نہیں وہ آپ زندہ اور اوروں کا قائم رکھنے والا ہے، نہ اسے اونگھ آئے نہ نیند، اسی کا ہے جو کچھ آسمانوں میں ہے اور جو کچھ زمین میں ہے، کون ہے جو اس کے یہاں سفارش کرے بے اس کے حکم کے';
    const chunks = chunkTextForTTS(longUrdu, 100);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(180);
    });
  });
});

describe('Kanz-ul-Iman Authentic Full Page Scan Service & Image Resolvers', () => {
  it('should verify page count and boundary definitions (1 to 1124)', async () => {
    const {
      KANZUL_IMAN_MIN_PAGE,
      KANZUL_IMAN_MAX_PAGE,
      getKanzulImanPageForSurah,
      getKanzulImanPageForJuz,
      getKanzulImanSurahByPage,
      getKanzulImanJuzByPage,
      kanzulImanPageToLeafIndex,
    } = await import('../data/kanzulImanData');

    expect(KANZUL_IMAN_MIN_PAGE).toBe(2);
    expect(KANZUL_IMAN_MAX_PAGE).toBe(1126);

    // Page to Leaf Index exact 1:1 offset mapping (Page P -> Leaf P + 1)
    expect(kanzulImanPageToLeafIndex(89)).toBe(90);
    expect(kanzulImanPageToLeafIndex(90)).toBe(91);
    expect(kanzulImanPageToLeafIndex(91)).toBe(92);
    expect(kanzulImanPageToLeafIndex(100)).toBe(101);
    expect(kanzulImanPageToLeafIndex(500)).toBe(501);
    expect(kanzulImanPageToLeafIndex(1000)).toBe(1001);

    // Verified Surah Starting Page Mappings
    expect(getKanzulImanPageForSurah(1)).toBe(2);   // Al-Fatihah
    expect(getKanzulImanPageForSurah(2)).toBe(4);   // Al-Baqarah
    expect(getKanzulImanPageForSurah(3)).toBe(102); // Aal-e-Imran
    expect(getKanzulImanPageForSurah(4)).toBe(151); // An-Nisa
    expect(getKanzulImanPageForSurah(5)).toBe(205); // Al-Ma'idah
    expect(getKanzulImanPageForSurah(6)).toBe(245); // Al-An'am
    expect(getKanzulImanPageForSurah(7)).toBe(285); // Al-A'raf
    expect(getKanzulImanPageForSurah(8)).toBe(333); // Al-Anfal
    expect(getKanzulImanPageForSurah(9)).toBe(353); // At-Tawbah
    expect(getKanzulImanPageForSurah(10)).toBe(390);// Yunus
    expect(getKanzulImanPageForSurah(18)).toBe(547);// Al-Kahf
    expect(getKanzulImanPageForSurah(19)).toBe(569);// Maryam
    expect(getKanzulImanPageForSurah(36)).toBe(813);// Ya-Sin
    expect(getKanzulImanPageForSurah(55)).toBe(981);// Ar-Rahman
    expect(getKanzulImanPageForSurah(67)).toBe(1040);// Al-Mulk
    expect(getKanzulImanPageForSurah(78)).toBe(1080);// An-Naba
    expect(getKanzulImanPageForSurah(112)).toBe(1124);// Al-Ikhlas
    expect(getKanzulImanPageForSurah(113)).toBe(1125);// Al-Falaq
    expect(getKanzulImanPageForSurah(114)).toBe(1126);// An-Nas

    // Page to Surah reverse lookups
    expect(getKanzulImanSurahByPage(2)).toBe(1);
    expect(getKanzulImanSurahByPage(3)).toBe(1);
    expect(getKanzulImanSurahByPage(4)).toBe(2);
    expect(getKanzulImanSurahByPage(102)).toBe(3);
    expect(getKanzulImanSurahByPage(1126)).toBe(114);
  });

  it('should verify all 30 Paras (Juz) map to exact verified starting upper pages in Kanz-ul-Iman', async () => {
    const { getKanzulImanPageForJuz, getKanzulImanJuzByPage } = await import('../data/kanzulImanData');

    const expectedParaPages: Record<number, number> = {
      1: 2,     // Alif Laam Meem
      2: 47,    // Sayaqool
      3: 87,    // Tilkal Rusul
      4: 125,   // Lan Tanaaloo
      5: 161,   // Wal Muhsanaat
      6: 198,   // La Yuhibbullah
      7: 234,   // Wa Iza Sami'oo
      8: 271,   // Wa Law Annana
      9: 306,   // Qaalal Mala'o
      10: 344,  // Wa'lamoo
      11: 379,  // Ya'taziroon
      12: 417,  // Wa Ma Min Da'abbah
      13: 453,  // Wa Ma Oobari'oo
      14: 489,  // Rubama
      15: 525,  // Subhanallazi
      16: 563,  // Qala Alam
      17: 601,  // Iqtaraba Linnaas
      18: 634,  // Qad Aflaha
      19: 672,  // Wa Qaalal Lazeena
      20: 709,  // A'man Khalaqa
      21: 743,  // Utlu Ma Oohiya
      22: 780,  // Wa Man Yaqnut
      23: 818,  // Wa Maliya
      24: 855,  // Faman Azlamu
      25: 887,  // Ilayhi Yuraddu
      26: 923,  // Haa Meem
      27: 962,  // Qala Fama Khatbukum
      28: 1001, // Qad Sami'allah
      29: 1040, // Tabarakallazi
      30: 1080, // Amma
    };

    // 1. Verify exact starting page for each of the 30 Paras
    for (let j = 1; j <= 30; j++) {
      expect(getKanzulImanPageForJuz(j)).toBe(expectedParaPages[j]);
    }

    // 2. Verify reverse lookup from page to active Juz
    expect(getKanzulImanJuzByPage(2)).toBe(1);
    expect(getKanzulImanJuzByPage(46)).toBe(1);
    expect(getKanzulImanJuzByPage(47)).toBe(2);
    expect(getKanzulImanJuzByPage(86)).toBe(2);
    expect(getKanzulImanJuzByPage(87)).toBe(3);
    expect(getKanzulImanJuzByPage(124)).toBe(3);
    expect(getKanzulImanJuzByPage(125)).toBe(4);
    expect(getKanzulImanJuzByPage(161)).toBe(5);
    expect(getKanzulImanJuzByPage(198)).toBe(6);
    expect(getKanzulImanJuzByPage(234)).toBe(7);
    expect(getKanzulImanJuzByPage(271)).toBe(8);
    expect(getKanzulImanJuzByPage(306)).toBe(9);
    expect(getKanzulImanJuzByPage(344)).toBe(10);
    expect(getKanzulImanJuzByPage(379)).toBe(11);
    expect(getKanzulImanJuzByPage(417)).toBe(12);
    expect(getKanzulImanJuzByPage(453)).toBe(13);
    expect(getKanzulImanJuzByPage(489)).toBe(14);
    expect(getKanzulImanJuzByPage(525)).toBe(15);
    expect(getKanzulImanJuzByPage(563)).toBe(16);
    expect(getKanzulImanJuzByPage(601)).toBe(17);
    expect(getKanzulImanJuzByPage(634)).toBe(18);
    expect(getKanzulImanJuzByPage(672)).toBe(19);
    expect(getKanzulImanJuzByPage(709)).toBe(20);
    expect(getKanzulImanJuzByPage(743)).toBe(21);
    expect(getKanzulImanJuzByPage(780)).toBe(22);
    expect(getKanzulImanJuzByPage(818)).toBe(23);
    expect(getKanzulImanJuzByPage(855)).toBe(24);
    expect(getKanzulImanJuzByPage(887)).toBe(25);
    expect(getKanzulImanJuzByPage(923)).toBe(26);
    expect(getKanzulImanJuzByPage(962)).toBe(27);
    expect(getKanzulImanJuzByPage(1001)).toBe(28);
    expect(getKanzulImanJuzByPage(1040)).toBe(29);
    expect(getKanzulImanJuzByPage(1080)).toBe(30);
    expect(getKanzulImanJuzByPage(1126)).toBe(30);
  });

  it('should generate valid archive.org responsive image URLs and BookReader fallbacks without offset bug', async () => {
    const { KanzulImanService } = await import('../services/kanzulImanService');

    // Verify Page 89, 90, 91, 100, 500, 1000 URLs
    expect(KanzulImanService.getKanzulImanPageImageUrl(89, 'desktop')).toBe(
      'https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n90_w1200.jpg'
    );
    expect(KanzulImanService.getKanzulImanPageImageUrl(90, 'desktop')).toBe(
      'https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n91_w1200.jpg'
    );
    expect(KanzulImanService.getKanzulImanPageImageUrl(91, 'desktop')).toBe(
      'https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n92_w1200.jpg'
    );
    expect(KanzulImanService.getKanzulImanPageImageUrl(100, 'desktop')).toBe(
      'https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n101_w1200.jpg'
    );
    expect(KanzulImanService.getKanzulImanPageImageUrl(500, 'desktop')).toBe(
      'https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n501_w1200.jpg'
    );
    expect(KanzulImanService.getKanzulImanPageImageUrl(1000, 'desktop')).toBe(
      'https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n1001_w1200.jpg'
    );

    const page89Mobile = KanzulImanService.getKanzulImanPageImageUrl(89, 'mobile');
    expect(page89Mobile).toBe(
      'https://archive.org/download/quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan/page/n90_w800.jpg'
    );

    const page89SrcSet = KanzulImanPageServiceSrcSet(KanzulImanService, 89);
    expect(page89SrcSet).toContain('800w');
    expect(page89SrcSet).toContain('1200w');

    const page89Fallback = KanzulImanService.getKanzulImanPageFallbackUrl(89);
    expect(page89Fallback).toContain('quran-kanzul-iman-urdu-with-tafsir-khazain-ul-irfan_0090.jp2');
  });

  it('should generate valid Arabic Ayah recitation audio URL', async () => {
    const { getArabicAyahAudioUrl } = await import('../stores/useKanzulImanAudioStore');

    expect(getArabicAyahAudioUrl(1, 1, 'Alafasy')).toBe(
      'https://verses.quran.com/Alafasy/mp3/001001.mp3'
    );
    expect(getArabicAyahAudioUrl(114, 6, 'Alafasy')).toBe(
      'https://verses.quran.com/Alafasy/mp3/114006.mp3'
    );
  });
});

function KanzulImanPageServiceSrcSet(service: any, page: number): string {
  return service.getKanzulImanPageSrcSet(page);
}


