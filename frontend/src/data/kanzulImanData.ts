export const KANZUL_IMAN_MIN_PAGE = 2; // Mushaf starts directly at printed Page 2 (Surah Al-Fatihah)
export const KANZUL_IMAN_MAX_PAGE = 1126;
export const KANZUL_IMAN_LEAF_OFFSET = 1; // Upper Page P maps to Archive.org Leaf P + 1 (e.g. Page 2 -> Leaf 3 [n3], Page 89 -> Leaf 90 [n90], Page 90 -> Leaf 91 [n91], Page 91 -> Leaf 92 [n92])

export interface KanzulImanVerse {
  ayahNumber: number;
  verseKey: string;
  arabicText: string;
  kanzulImanUrdu: string;
  kanzulImanEnglish: string;
  englishMeaning?: string;
  juzNumber?: number;
  pageNumber?: number;
}

/**
 * Verified Starting Upper Page Mapping for all 114 Surahs in authentic Kanz-ul-Iman
 * scanned edition (with Tafsir Khazain-ul-Irfan), sourced directly from the printed
 * Table of Contents (صفحہ ۱۱۳۰ - قرآن مجید کی سورتوں کی فہرست).
 * Note: These strictly correspond to the printed UPPER PAGE NUMBERS on each page.
 */
export const KANZUL_IMAN_SURAH_PAGE_MAP: Record<number, number> = {
  1: 2, 2: 4, 3: 102, 4: 151, 5: 205, 6: 245, 7: 285, 8: 333, 9: 353, 10: 390,
  11: 415, 12: 439, 13: 466, 14: 478, 15: 489, 16: 499, 17: 525, 18: 547, 19: 569, 20: 583,
  21: 601, 22: 617, 23: 634, 24: 648, 25: 667, 26: 680, 27: 698, 28: 714, 29: 734, 30: 748,
  31: 758, 32: 766, 33: 771, 34: 792, 35: 804, 36: 813, 37: 825, 38: 837, 39: 847, 40: 863,
  41: 878, 42: 888, 43: 899, 44: 911, 45: 916, 46: 923, 47: 931, 48: 938, 49: 947, 50: 953,
  51: 958, 52: 964, 53: 969, 54: 976, 55: 981, 56: 986, 57: 992, 58: 1001, 59: 1007, 60: 1014,
  61: 1020, 62: 1023, 63: 1025, 64: 1028, 65: 1031, 66: 1035, 67: 1040, 68: 1044, 69: 1049, 70: 1052,
  71: 1056, 72: 1059, 73: 1062, 74: 1065, 75: 1069, 76: 1072, 77: 1076, 78: 1080, 79: 1082, 80: 1085,
  81: 1087, 82: 1089, 83: 1090, 84: 1093, 85: 1095, 86: 1097, 87: 1098, 88: 1099, 89: 1101, 90: 1104,
  91: 1105, 92: 1106, 93: 1108, 94: 1110, 95: 1110, 96: 1111, 97: 1113, 98: 1114, 99: 1115, 100: 1116,
  101: 1117, 102: 1118, 103: 1118, 104: 1119, 105: 1120, 106: 1120, 107: 1121, 108: 1122, 109: 1122, 110: 1123,
  111: 1124, 112: 1124, 113: 1125, 114: 1126
};

/**
 * Verified Starting Upper Page Mapping for all 30 Paras / Juz in authentic Kanz-ul-Iman
 * scanned edition (with Tafsir Khazain-ul-Irfan), visually verified from page headings,
 * juz border demarcations, and beginning Quranic verses.
 * Note: These strictly correspond to the printed UPPER PAGE NUMBERS on each page.
 */
export const KANZUL_IMAN_JUZ_PAGE_MAP: Record<number, number> = {
  1: 2,     // 1. Alif Laam Meem (الم) -> Surah 1:1 (Al-Fatihah)
  2: 47,    // 2. Sayaqool (سيقول) -> Surah 2:142
  3: 87,    // 3. Tilkal Rusul (تلك الرسل) -> Surah 2:253
  4: 125,   // 4. Lan Tanaaloo (لن تنالوا) -> Surah 3:92
  5: 161,   // 5. Wal Muhsanaat (والمحصنات) -> Surah 4:24
  6: 198,   // 6. La Yuhibbullah (لا يحب الله) -> Surah 4:148
  7: 234,   // 7. Wa Iza Sami'oo (وإذا سمعوا) -> Surah 5:83 / 5:82
  8: 271,   // 8. Wa Law Annana (ولو أننا) -> Surah 6:111
  9: 306,   // 9. Qaalal Mala'o (قال الملأ) -> Surah 7:88
  10: 344,  // 10. Wa'lamoo (واعلموا) -> Surah 8:41
  11: 379,  // 11. Ya'taziroon (يعتذرون) -> Surah 9:94 / 9:93
  12: 417,  // 12. Wa Ma Min Da'abbah (وما من دابة) -> Surah 11:6
  13: 453,  // 13. Wa Ma Oobari'oo (وما أبرئ) -> Surah 12:53
  14: 489,  // 14. Rubama (ربما) -> Surah 15:1 / 15:2
  15: 525,  // 15. Subhanallazi (سبحان الذي) -> Surah 17:1
  16: 563,  // 16. Qala Alam (قال ألم) -> Surah 18:75
  17: 601,  // 17. Iqtaraba Linnaas (اقترب للناس) -> Surah 21:1
  18: 634,  // 18. Qad Aflaha (قد أفلح) -> Surah 23:1
  19: 672,  // 19. Wa Qaalal Lazeena (وقال الذين) -> Surah 25:21
  20: 709,  // 20. A'man Khalaqa (أمن خلق) -> Surah 27:60
  21: 743,  // 21. Utlu Ma Oohiya (اتل ما أوحي) -> Surah 29:45
  22: 780,  // 22. Wa Man Yaqnut (ومن يقنت) -> Surah 33:31
  23: 818,  // 23. Wa Maliya (وما لي) -> Surah 36:22
  24: 855,  // 24. Faman Azlamu (فمن أظلم) -> Surah 39:32
  25: 887,  // 25. Ilayhi Yuraddu (إليه يرد) -> Surah 41:47
  26: 923,  // 26. Haa Meem (حم) -> Surah 46:1
  27: 962,  // 27. Qala Fama Khatbukum (قال فما خطبكم) -> Surah 51:31
  28: 1001, // 28. Qad Sami'allah (قد سمع الله) -> Surah 58:1
  29: 1040, // 29. Tabarakallazi (تبارك الذي) -> Surah 67:1
  30: 1080  // 30. Amma (عم) -> Surah 78:1
};

export function getKanzulImanPageForSurah(surahNumber: number): number {
  return KANZUL_IMAN_SURAH_PAGE_MAP[surahNumber] || KANZUL_IMAN_MIN_PAGE;
}

export function getKanzulImanPageForJuz(juzNumber: number): number {
  return KANZUL_IMAN_JUZ_PAGE_MAP[juzNumber] || KANZUL_IMAN_MIN_PAGE;
}

export function getKanzulImanSurahByPage(pageNumber: number): number {
  const clamped = Math.max(KANZUL_IMAN_MIN_PAGE, Math.min(KANZUL_IMAN_MAX_PAGE, pageNumber));
  let matchedSurah = 1;
  for (let s = 1; s <= 114; s++) {
    if (KANZUL_IMAN_SURAH_PAGE_MAP[s] <= clamped) {
      matchedSurah = s;
    } else {
      break;
    }
  }
  return matchedSurah;
}

export function getKanzulImanJuzByPage(pageNumber: number): number {
  const clamped = Math.max(KANZUL_IMAN_MIN_PAGE, Math.min(KANZUL_IMAN_MAX_PAGE, pageNumber));
  let matchedJuz = 1;
  for (let j = 1; j <= 30; j++) {
    if (KANZUL_IMAN_JUZ_PAGE_MAP[j] <= clamped) {
      matchedJuz = j;
    } else {
      break;
    }
  }
  return matchedJuz;
}

export function kanzulImanPageToLeafIndex(pageNumber: number): number {
  const clamped = Math.max(KANZUL_IMAN_MIN_PAGE, Math.min(KANZUL_IMAN_MAX_PAGE, pageNumber));
  return clamped + KANZUL_IMAN_LEAF_OFFSET; // Upper Page 1 -> n3, Upper Page 2 -> n4, etc.
}

export const KANZUL_IMAN_FEATURED_SURAHS: Record<number, KanzulImanVerse[]> = {
  // Surah Al-Fatihah (1)
  1: [
    {
      ayahNumber: 1,
      verseKey: '1:1',
      arabicText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      kanzulImanUrdu: 'اللہ کے نام سے شروع جو بہت مہربان رحمت والا',
      kanzulImanEnglish: 'In the name of Allah, The Most Gracious, the Most Merciful',
      englishMeaning: 'In the name of Allah, The Most Gracious, the Most Merciful',
    },
    {
      ayahNumber: 2,
      verseKey: '1:2',
      arabicText: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      kanzulImanUrdu: 'سب خوبیاں اللہ کو جو مالک سارے جہان والوں کا،',
      kanzulImanEnglish: 'All praise is to Allah, the Lord Of The Creation.',
      englishMeaning: 'All praise is to Allah, the Lord Of The Creation.',
    },
    {
      ayahNumber: 3,
      verseKey: '1:3',
      arabicText: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      kanzulImanUrdu: 'بہت مہربان رحمت والا،',
      kanzulImanEnglish: 'The Most Gracious, the Most Merciful',
      englishMeaning: 'The Most Gracious, the Most Merciful',
    },
    {
      ayahNumber: 4,
      verseKey: '1:4',
      arabicText: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
      kanzulImanUrdu: 'روز جزا کا مالک،',
      kanzulImanEnglish: 'Owner of the Day of Recompense',
      englishMeaning: 'Owner of the Day of Recompense',
    },
    {
      ayahNumber: 5,
      verseKey: '1:5',
      arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      kanzulImanUrdu: 'ہم تجھی کو پوجیں اور تجھی سے مدد چاہیں،',
      kanzulImanEnglish: 'You alone we worship and from You alone we seek help (and may we always).',
      englishMeaning: 'You alone we worship and from You alone we seek help (and may we always).',
    },
    {
      ayahNumber: 6,
      verseKey: '1:6',
      arabicText: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      kanzulImanUrdu: 'ہم کو سیدھا راستہ چلا،',
      kanzulImanEnglish: 'Guide us on the Straight Path.',
      englishMeaning: 'Guide us on the Straight Path.',
    },
    {
      ayahNumber: 7,
      verseKey: '1:7',
      arabicText: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      kanzulImanUrdu: 'راستہ ان کا جن پر تو نے احسان کیا، نہ ان کا جن پر غضب ہوا اور نہ بہکے ہوؤں کا',
      kanzulImanEnglish: 'The path of those whom You have favoured – Not the path of those who earned Your anger – nor of those who are astray.',
      englishMeaning: 'The path of those whom You have favoured – Not the path of those who earned Your anger – nor of those who are astray.',
    },
  ],

  // Surah Al-Ikhlas (112)
  112: [
    {
      ayahNumber: 1,
      verseKey: '112:1',
      arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      kanzulImanUrdu: 'تم فرماؤ وہ اللہ ہے وہ ایک ہے',
      kanzulImanEnglish: 'Proclaim (O dear Prophet Mohammed – peace and blessings be upon him), “He is Allah, He is One.”',
      englishMeaning: 'Proclaim (O dear Prophet Mohammed – peace and blessings be upon him), “He is Allah, He is One.”',
    },
    {
      ayahNumber: 2,
      verseKey: '112:2',
      arabicText: 'اللَّهُ الصَّمَدُ',
      kanzulImanUrdu: 'اللہ بے نیاز ہے',
      kanzulImanEnglish: '“Allah is the Un-wanting.” (Perfect, does not require anything.)',
      englishMeaning: '“Allah is the Un-wanting.” (Perfect, does not require anything.)',
    },
    {
      ayahNumber: 3,
      verseKey: '112:3',
      arabicText: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      kanzulImanUrdu: 'نہ اس کی کوئی اولاد اور نہ وہ کسی سے پیدا ہوا',
      kanzulImanEnglish: '“He has no offspring, nor is He born from anything.”',
      englishMeaning: '“He has no offspring, nor is He born from anything.”',
    },
    {
      ayahNumber: 4,
      verseKey: '112:4',
      arabicText: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      kanzulImanUrdu: 'اور نہ کوئی اس کے جوڑ کا ہے',
      kanzulImanEnglish: '“And there is none equal to Him.”',
      englishMeaning: '“And there is none equal to Him.”',
    },
  ],

  // Surah Al-Falaq (113)
  113: [
    {
      ayahNumber: 1,
      verseKey: '113:1',
      arabicText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      kanzulImanUrdu: 'تم فرماؤ میں اس کی پناہ لیتا ہوں جو صبح کا پیدا کرنے والا ہے',
      kanzulImanEnglish: 'Proclaim (O dear Prophet Mohammed – peace and blessings be upon him), “I take refuge of the One Who creates the daybreak.”',
      englishMeaning: 'Proclaim (O dear Prophet Mohammed – peace and blessings be upon him), “I take refuge of the One Who creates the daybreak.”',
    },
    {
      ayahNumber: 2,
      verseKey: '113:2',
      arabicText: 'مِن شَرِّ مَا خَلَقَ',
      kanzulImanUrdu: 'اس کی سب مخلوق کی برائی سے',
      kanzulImanEnglish: '“From the evil of all His creation.”',
      englishMeaning: '“From the evil of all His creation.”',
    },
    {
      ayahNumber: 3,
      verseKey: '113:3',
      arabicText: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      kanzulImanUrdu: 'اور اندھیری ڈالنے والے کے شر سے جب وہ ڈوبے',
      kanzulImanEnglish: '“And from the evil of the darkening night when it covers.”',
      englishMeaning: 'And from the evil of the darkening night when it covers.',
    },
    {
      ayahNumber: 4,
      verseKey: '113:4',
      arabicText: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
      kanzulImanUrdu: 'اور ان عورتوں کے شر سے جو گرہوں میں پھونکتی ہیں',
      kanzulImanEnglish: '“And from the evil of the women who blow on knots.”',
      englishMeaning: '“And from the evil of the women who blow on knots.”',
    },
    {
      ayahNumber: 5,
      verseKey: '113:5',
      arabicText: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      kanzulImanUrdu: 'اور حسد والے کے شر سے جب وہ مجھ سے جلے',
      kanzulImanEnglish: '“And from the evil of the envier when he envies.”',
      englishMeaning: '“And from the evil of the envier when he envies.”',
    },
  ],

  // Surah An-Nas (114)
  114: [
    {
      ayahNumber: 1,
      verseKey: '114:1',
      arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
      kanzulImanUrdu: 'تم فرماؤ میں اس کی پناہ میں آیا جو سب لوگوں کا رب',
      kanzulImanEnglish: 'Proclaim (O dear Prophet Mohammed – peace and blessings be upon him), “I take refuge of the One Who is the Lord of all mankind.”',
      englishMeaning: 'Proclaim (O dear Prophet Mohammed – peace and blessings be upon him), “I take refuge of the One Who is the Lord of all mankind.”',
    },
    {
      ayahNumber: 2,
      verseKey: '114:2',
      arabicText: 'مَلِكِ النَّاسِ',
      kanzulImanUrdu: 'سب لوگوں کا بادشاہ',
      kanzulImanEnglish: '“The King of all mankind.”',
      englishMeaning: '“The King of all mankind.”',
    },
    {
      ayahNumber: 3,
      verseKey: '114:3',
      arabicText: 'إِلَٰهِ النَّاسِ',
      kanzulImanUrdu: 'سب لوگوں کا معبود',
      kanzulImanEnglish: '“The God of all mankind.”',
      englishMeaning: '“The God of all mankind.”',
    },
    {
      ayahNumber: 4,
      verseKey: '114:4',
      arabicText: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      kanzulImanUrdu: 'اس کے شر سے جو دل میں برے خطرے ڈالے اور دبک رہے',
      kanzulImanEnglish: '“From the evil of the one who whispers evil doubts in the heart and slinks away.”',
      englishMeaning: '“From the evil of the one who whispers evil doubts in the heart and slinks away.”',
    },
    {
      ayahNumber: 5,
      verseKey: '114:5',
      arabicText: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
      kanzulImanUrdu: 'وہ جو لوگوں کے دلوں میں وسوسے ڈالتا ہے',
      kanzulImanEnglish: '“Who whispers in the hearts of mankind.”',
      englishMeaning: '“Who whispers in the hearts of mankind.”',
    },
    {
      ayahNumber: 6,
      verseKey: '114:6',
      arabicText: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
      kanzulImanUrdu: 'جن اور آدمی',
      kanzulImanEnglish: '“Among the jinn and mankind.”',
      englishMeaning: '“Among the jinn and mankind.”',
    },
  ],

  // Surah Al-Kauthar (108)
  108: [
    {
      ayahNumber: 1,
      verseKey: '108:1',
      arabicText: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      kanzulImanUrdu: 'اے محبوب! بیشک ہم نے تمہیں بے شمار خوبیاں عطا فرمائیں',
      kanzulImanEnglish: 'Indeed (O dear Prophet Mohammed – peace and blessings be upon him), We have bestowed upon you an abundance of good (Al-Kauthar).',
      englishMeaning: 'Indeed (O dear Prophet Mohammed – peace and blessings be upon him), We have bestowed upon you an abundance of good (Al-Kauthar).',
    },
    {
      ayahNumber: 2,
      verseKey: '108:2',
      arabicText: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
      kanzulImanUrdu: 'تو تم اپنے رب کے لیے نماز پڑھو اور قربانی کرو',
      kanzulImanEnglish: 'So offer prayer for your Lord and sacrifice.',
      englishMeaning: 'So offer prayer for your Lord and sacrifice.',
    },
    {
      ayahNumber: 3,
      verseKey: '108:3',
      arabicText: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
      kanzulImanUrdu: 'بیشک جو تمہارا دشمن ہے وہی ہر خیر سے محروم ہے',
      kanzulImanEnglish: 'Indeed, your enemy is the one cut off from all good.',
      englishMeaning: 'Indeed, your enemy is the one cut off from all good.',
    },
  ],

  // Surah Ad-Duha (93)
  93: [
    {
      ayahNumber: 1,
      verseKey: '93:1',
      arabicText: 'وَالضُّحَىٰ',
      kanzulImanUrdu: 'چاشت کی قسم',
      kanzulImanEnglish: 'By the late morning bright hours,',
      englishMeaning: 'By the late morning bright hours,',
    },
    {
      ayahNumber: 2,
      verseKey: '93:2',
      arabicText: 'وَاللَّيْلِ إِذَا سَجَىٰ',
      kanzulImanUrdu: 'اور رات کی جب پردہ ڈالے',
      kanzulImanEnglish: 'And by the night when it covers with darkness,',
      englishMeaning: 'And by the night when it covers with darkness,',
    },
    {
      ayahNumber: 3,
      verseKey: '93:3',
      arabicText: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
      kanzulImanUrdu: 'کہ تمہیں تمہارے رب نے نہ چھوڑا، اور نہ مکروہ جانا،',
      kanzulImanEnglish: 'Your Lord has not forsaken you (O dear Prophet Mohammed – peace and blessings be upon him), nor has He become displeased.',
      englishMeaning: 'Your Lord has not forsaken you (O dear Prophet Mohammed – peace and blessings be upon him), nor has He become displeased.',
    },
    {
      ayahNumber: 4,
      verseKey: '93:4',
      arabicText: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ',
      kanzulImanUrdu: 'اور بیشک پچھلی تمہارے لیے پہلی سے بہتر ہے',
      kanzulImanEnglish: 'And indeed the subsequent is far better for you than the previous.',
      englishMeaning: 'And indeed the subsequent is far better for you than the previous.',
    },
    {
      ayahNumber: 5,
      verseKey: '93:5',
      arabicText: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
      kanzulImanUrdu: 'اور بیشک قریب ہے کہ تمہارا رب تمہیں اتنا دے گا کہ تم راضی ہوجاؤ گے',
      kanzulImanEnglish: 'And indeed soon your Lord will give you so much that you will be well pleased.',
      englishMeaning: 'And indeed soon your Lord will give you so much that you will be well pleased.',
    },
    {
      ayahNumber: 6,
      verseKey: '93:6',
      arabicText: 'أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ',
      kanzulImanUrdu: 'کیا اس نے تمہیں یتیم نہ پایا پھر جگہ دی',
      kanzulImanEnglish: 'Did He not find you an orphan and provide shelter?',
      englishMeaning: 'Did He not find you an orphan and provide shelter?',
    },
    {
      ayahNumber: 7,
      verseKey: '93:7',
      arabicText: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ',
      kanzulImanUrdu: 'اور تمہیں اپنی محبت میں خود رفتہ پایا تو اپنی طرف راہ دی',
      kanzulImanEnglish: 'And He found you engrossed in His love, so He showed the way towards Himself.',
      englishMeaning: 'And He found you engrossed in His love, so He showed the way towards Himself.',
    },
    {
      ayahNumber: 8,
      verseKey: '93:8',
      arabicText: 'وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ',
      kanzulImanUrdu: 'اور تمہیں حاجت مند پایا پھر غنی کردیا',
      kanzulImanEnglish: 'And He found you in need, so He made you self-sufficient.',
      englishMeaning: 'And He found you in need, so He made you self-sufficient.',
    },
    {
      ayahNumber: 9,
      verseKey: '93:9',
      arabicText: 'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ',
      kanzulImanUrdu: 'تو یتیم پر دباؤ نہ ڈالو',
      kanzulImanEnglish: 'So do not oppress the orphan.',
      englishMeaning: 'So do not oppress the orphan.',
    },
    {
      ayahNumber: 10,
      verseKey: '93:10',
      arabicText: 'وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ',
      kanzulImanUrdu: 'اور منگتا کو نہ جھڑکو',
      kanzulImanEnglish: 'And do not chide the petitioner.',
      englishMeaning: 'And do not chide the petitioner.',
    },
    {
      ayahNumber: 11,
      verseKey: '93:11',
      arabicText: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
      kanzulImanUrdu: 'اور اپنے رب کی نعمت کا خوب چرچا کرو',
      kanzulImanEnglish: 'And abundantly publicize the blessings of your Lord.',
      englishMeaning: 'And abundantly publicize the blessings of your Lord.',
    },
  ],

  // Surah Al-Mulk (67)
  67: [
    {
      ayahNumber: 1,
      verseKey: '67:1',
      arabicText: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      kanzulImanUrdu: 'بڑی برکت والا ہے وہ جس کے دست قدرت میں تمام ملک ہے اور وہ ہر چیز پر قادر ہے',
      kanzulImanEnglish: 'Most Blessed is He in Whose Hand is the Kingdom (Dominion), and He has power over all things.',
      englishMeaning: 'Most Blessed is He in Whose Hand is the Kingdom (Dominion), and He has power over all things.',
    },
    {
      ayahNumber: 2,
      verseKey: '67:2',
      arabicText: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ',
      kanzulImanUrdu: 'جس نے موت اور زندگی کو پیدا کیا تاکہ تمہاری آزمائش کرے کہ تم میں سے کس کے عمل اچھے ہیں، اور وہی عزت والا بخشنے والا ہے',
      kanzulImanEnglish: 'The One Who created death and life to test you as to who among you has the best deeds; and He is the Almighty, the Oft-Forgiving.',
      englishMeaning: 'The One Who created death and life to test you as to who among you has the best deeds; and He is the Almighty, the Oft-Forgiving.',
    },
    {
      ayahNumber: 3,
      verseKey: '67:3',
      arabicText: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ',
      kanzulImanUrdu: 'جس نے سات آسمان اوپر تلے بنائے، تو رحمن کی کاریگری میں کوئی نقص نہ دیکھے گا، تو پھر نگاہ دوڑا کیا تجھے کوئی شگاف نظر آتا ہے',
      kanzulImanEnglish: 'The One Who created seven heavens layered one above another; you will see no flaw in the creation of the Most Gracious; so turn your gaze again — do you see any fault?',
      englishMeaning: 'The One Who created seven heavens layered one above another; you will see no flaw in the creation of the Most Gracious; so turn your gaze again — do you see any fault?',
    },
  ],
};

/**
 * Helper to get verified Kanzul Iman translation for a specific Surah & Ayah
 */
export function getVerifiedKanzulImanTranslation(
  surahNumber: number,
  ayahNumber: number,
  language: 'urdu' | 'english' = 'urdu'
): string | null {
  const verses = KANZUL_IMAN_FEATURED_SURAHS[surahNumber];
  if (!verses) return null;
  const match = verses.find((v) => v.ayahNumber === ayahNumber);
  if (!match) return null;
  return language === 'urdu'
    ? match.kanzulImanUrdu
    : (match.kanzulImanEnglish || match.englishMeaning || null);
}
