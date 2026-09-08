/**
 * Quran Static Metadata and Registries
 * Authenticated for Pakistan / Subcontinent 15-Line Standard Hafizi Mushaf (611 Pages, Pages 2 to 611)
 * High-definition Pakistani Hafizi Mushaf (Qudrat Ullah Company / Taj Company Print)
 */

export interface SurahMeta {
  number: number;
  name: string;
  arabicName: string;
  meaning: string;
  versesCount: number;
  revelationType: 'Meccan' | 'Medinan';
  juzStart: number;
  pageStart: number;
}

export interface JuzMeta {
  number: number;
  name: string;
  arabicName: string;
  startSurah: number;
  startSurahName: string;
  startAyah: number;
  endSurah?: number;
  endSurahName?: string;
  endAyah?: number;
  pageStart: number;
}

export interface QuranScriptOption {
  id: 'indopak' | 'uthmani' | 'uthmani_tajweed' | 'uthmani_simple' | 'imlaei';
  label: string;
  sublabel: string;
  fontFamily: string;
  sample: string;
}

export interface QuranTranslationOption {
  id: number;
  name: string;
  author: string;
  language: 'urdu' | 'english' | 'hindi' | 'roman-urdu';
  languageLabel: string;
}

export interface QuranReciterOption {
  id: number;
  name: string;
  style?: string;
  reciterSlug: string;
}

export const SUPPORTED_SCRIPTS: QuranScriptOption[] = [
  {
    id: 'indopak',
    label: 'IndoPak (Subcontinent)',
    sublabel: 'Classic Nastaleeq / Pakistan Standard 15-Line Mushaf',
    fontFamily: "'Noorehuda', 'Urdu Typesetting', 'PakType Tehreer', 'Jameel Noori Nastaleeq', serif",
    sample: 'بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ',
  },
  {
    id: 'uthmani',
    label: 'Uthmani (Madani)',
    sublabel: 'Standard King Fahd Complex Madinah Mushaf',
    fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Scheherazade New', 'Amiri', serif",
    sample: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  },
  {
    id: 'uthmani_tajweed',
    label: 'Uthmani Tajweed (Colored)',
    sublabel: 'Color-coded Tajweed pronunciation rules',
    fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Amiri', serif",
    sample: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
  },
  {
    id: 'uthmani_simple',
    label: 'Simple Uthmani',
    sublabel: 'Clean Uthmani text with standard vowel marks',
    fontFamily: "'Amiri', 'Traditional Arabic', serif",
    sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },
  {
    id: 'imlaei',
    label: 'Imlaei (Modern)',
    sublabel: 'Modern Arabic orthography',
    fontFamily: "'Amiri', 'Arial', sans-serif",
    sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  },
];

export const SUPPORTED_TRANSLATIONS: QuranTranslationOption[] = [
  {
    id: 234,
    name: 'Fatah Muhammad Jalandhari',
    author: 'Fateh Muhammad Jalandhry',
    language: 'urdu',
    languageLabel: 'اردو (جالندھری)',
  },
  {
    id: 158,
    name: 'Bayan-ul-Quran (Dr. Israr Ahmad)',
    author: 'Dr. Israr Ahmad',
    language: 'urdu',
    languageLabel: 'اردو (ڈاکٹر اسرار احمد)',
  },
  {
    id: 97,
    name: 'Tafheem-ul-Quran (Maududi)',
    author: 'Sayyid Abul Ala Maududi',
    language: 'urdu',
    languageLabel: 'اردو (تفہیم القرآن)',
  },
  {
    id: 151,
    name: 'Kanz-ul-Iman (Ahmed Raza Khan)',
    author: 'Ahmed Raza Khan Barelvi',
    language: 'urdu',
    languageLabel: 'اردو (کنز الایمان)',
  },
  {
    id: 156,
    name: 'Tafseer Ahsan-ul-Bayan',
    author: 'Hafiz Salahudin Yusuf',
    language: 'urdu',
    languageLabel: 'اردو (احسن البیان)',
  },
  {
    id: 84,
    name: 'Mufti Muhammad Taqi Usmani',
    author: 'Mufti Taqi Usmani',
    language: 'urdu',
    languageLabel: 'اردو (مفتی تقی عثمانی)',
  },
  {
    id: 131,
    name: 'The Clear Quran (Dr. Mustafa Khattab)',
    author: 'Dr. Mustafa Khattab',
    language: 'english',
    languageLabel: 'English (The Clear Quran)',
  },
  {
    id: 20,
    name: 'Saheeh International',
    author: 'Saheeh International',
    language: 'english',
    languageLabel: 'English (Saheeh Int.)',
  },
  {
    id: 85,
    name: 'M.A.S. Abdel Haleem',
    author: 'M.A.S. Abdel Haleem (Oxford)',
    language: 'english',
    languageLabel: 'English (Abdel Haleem)',
  },
  {
    id: 22,
    name: 'Abdullah Yusuf Ali',
    author: 'Abdullah Yusuf Ali',
    language: 'english',
    languageLabel: 'English (Yusuf Ali)',
  },
  {
    id: 19,
    name: 'Pickthall',
    author: 'Marmaduke Pickthall',
    language: 'english',
    languageLabel: 'English (Pickthall)',
  },
  {
    id: 122,
    name: 'Farooq Khan & Ahmed',
    author: 'Muhammad Farooq Khan',
    language: 'hindi',
    languageLabel: 'हिन्दी (फ़ारूक़ ख़ान)',
  },
  {
    id: 831,
    name: 'Roman Urdu (Easy Reading)',
    author: 'Roman Translation Team',
    language: 'roman-urdu',
    languageLabel: 'Roman Urdu (Romani)',
  },
];

export const SUPPORTED_RECITERS: QuranReciterOption[] = [
  {
    id: 7,
    name: 'Mishary Rashid Alafasy',
    style: 'Murattal (Crystal Clear, World Standard)',
    reciterSlug: 'Alafasy',
  },
  {
    id: 1,
    name: 'Abdul Basit Abdul Samad',
    style: 'Murattal (Classic Pure Studio)',
    reciterSlug: 'AbdulBaset/Murattal',
  },
  {
    id: 2,
    name: 'Abdul Basit Abdul Samad (Mujawwad)',
    style: 'Mujawwad (Masterful Tajweed Maqamat)',
    reciterSlug: 'AbdulBaset/Mujawwad',
  },
  {
    id: 3,
    name: 'Abdur-Rahman as-Sudais',
    style: 'Murattal (Imam of Masjid al-Haram Makkah)',
    reciterSlug: 'Sudais',
  },
  {
    id: 4,
    name: 'Saud Ash-Shuraim',
    style: 'Murattal (Former Imam of Masjid al-Haram)',
    reciterSlug: 'Shuraym',
  },
  {
    id: 5,
    name: 'Mahmoud Khalil Al-Husary',
    style: 'Murattal (Master of Tajweed Precision)',
    reciterSlug: 'Husary',
  },
  {
    id: 12,
    name: 'Mahmoud Khalil Al-Husary (Muallim)',
    style: 'Muallim (Educational Repetition Pace)',
    reciterSlug: 'Husary/Muallim',
  },
  {
    id: 6,
    name: 'Abu Bakr Al-Shatri',
    style: 'Murattal (Emotional & Melodic)',
    reciterSlug: 'Shatri',
  },
  {
    id: 8,
    name: 'Saad Al-Ghamdi',
    style: 'Murattal (Warm & Smooth Flow)',
    reciterSlug: 'Ghamadi',
  },
  {
    id: 9,
    name: 'Maher Al-Muaiqly',
    style: 'Murattal (Imam of Masjid al-Haram)',
    reciterSlug: 'Muaiqly',
  },
  {
    id: 10,
    name: 'Yasser Al-Dosari',
    style: 'Murattal (Deep & Powerful Resonance)',
    reciterSlug: 'Dosari',
  },
  {
    id: 11,
    name: 'Muhammad Siddiq Al-Minshawi',
    style: 'Murattal (Deeply Moving & Reverent)',
    reciterSlug: 'Minshawi/Murattal',
  },
  {
    id: 13,
    name: 'Muhammad Siddiq Al-Minshawi (Mujawwad)',
    style: 'Mujawwad (Soulful Legendary)',
    reciterSlug: 'Minshawi/Mujawwad',
  },
];

export const QURAN_COM_RECITERS = SUPPORTED_RECITERS;

export const MIN_MUSHAF_PAGE = 2;
export const MAX_MUSHAF_PAGE = 611;
export const TOTAL_MUSHAF_PAGES = 611;

// Complete 114 Surahs Directory with verified Pakistan/Subcontinent 15-Line Hafizi Mushaf exact start pages (Pages 2-611)
export const SURAHS_LIST: SurahMeta[] = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', meaning: 'The Opening', versesCount: 7, revelationType: 'Meccan', juzStart: 1, pageStart: 2 },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', meaning: 'The Cow', versesCount: 286, revelationType: 'Medinan', juzStart: 1, pageStart: 3 },
  { number: 3, name: "Ali 'Imran", arabicName: 'آل عمران', meaning: 'Family of Imran', versesCount: 200, revelationType: 'Medinan', juzStart: 3, pageStart: 51 },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء', meaning: 'The Women', versesCount: 176, revelationType: 'Medinan', juzStart: 4, pageStart: 78 },
  { number: 5, name: "Al-Ma'idah", arabicName: 'المائدة', meaning: 'The Table Spread', versesCount: 120, revelationType: 'Medinan', juzStart: 6, pageStart: 107 },
  { number: 6, name: "Al-An'am", arabicName: 'الأنعام', meaning: 'The Cattle', versesCount: 165, revelationType: 'Meccan', juzStart: 7, pageStart: 129 },
  { number: 7, name: "Al-A'raf", arabicName: 'الأعراف', meaning: 'The Heights', versesCount: 206, revelationType: 'Meccan', juzStart: 8, pageStart: 152 },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', meaning: 'The Spoils of War', versesCount: 75, revelationType: 'Medinan', juzStart: 9, pageStart: 178 },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', meaning: 'The Repentance', versesCount: 129, revelationType: 'Medinan', juzStart: 10, pageStart: 188 },
  { number: 10, name: 'Yunus', arabicName: 'يونس', meaning: 'Jonah', versesCount: 109, revelationType: 'Meccan', juzStart: 11, pageStart: 209 },
  { number: 11, name: 'Hud', arabicName: 'هود', meaning: 'Hud', versesCount: 123, revelationType: 'Meccan', juzStart: 11, pageStart: 222 },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف', meaning: 'Joseph', versesCount: 111, revelationType: 'Meccan', juzStart: 12, pageStart: 236 },
  { number: 13, name: "Ar-Ra'd", arabicName: 'الرعد', meaning: 'The Thunder', versesCount: 43, revelationType: 'Medinan', juzStart: 13, pageStart: 250 },
  { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', meaning: 'Abraham', versesCount: 52, revelationType: 'Meccan', juzStart: 13, pageStart: 256 },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', meaning: 'The Rocky Tract', versesCount: 99, revelationType: 'Meccan', juzStart: 14, pageStart: 262 },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل', meaning: 'The Bee', versesCount: 128, revelationType: 'Meccan', juzStart: 14, pageStart: 268 },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', meaning: 'The Night Journey', versesCount: 111, revelationType: 'Meccan', juzStart: 15, pageStart: 282 },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', meaning: 'The Cave', versesCount: 110, revelationType: 'Meccan', juzStart: 15, pageStart: 294 },
  { number: 19, name: 'Maryam', arabicName: 'مريم', meaning: 'Mary', versesCount: 98, revelationType: 'Meccan', juzStart: 16, pageStart: 306 },
  { number: 20, name: 'Taha', arabicName: 'طه', meaning: 'Ta-Ha', versesCount: 135, revelationType: 'Meccan', juzStart: 16, pageStart: 313 },
  { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', meaning: 'The Prophets', versesCount: 112, revelationType: 'Meccan', juzStart: 17, pageStart: 323 },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج', meaning: 'The Pilgrimage', versesCount: 78, revelationType: 'Medinan', juzStart: 17, pageStart: 332 },
  { number: 23, name: "Al-Mu'minun", arabicName: 'المؤمنون', meaning: 'The Believers', versesCount: 118, revelationType: 'Meccan', juzStart: 18, pageStart: 343 },
  { number: 24, name: 'An-Nur', arabicName: 'النور', meaning: 'The Light', versesCount: 64, revelationType: 'Medinan', juzStart: 18, pageStart: 351 },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', meaning: 'The Criterion', versesCount: 77, revelationType: 'Meccan', juzStart: 18, pageStart: 360 },
  { number: 26, name: "Ash-Shu'ara", arabicName: 'الشعراء', meaning: 'The Poets', versesCount: 227, revelationType: 'Meccan', juzStart: 19, pageStart: 367 },
  { number: 27, name: 'An-Naml', arabicName: 'النمل', meaning: 'The Ant', versesCount: 93, revelationType: 'Meccan', juzStart: 19, pageStart: 377 },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص', meaning: 'The Stories', versesCount: 88, revelationType: 'Meccan', juzStart: 20, pageStart: 386 },
  { number: 29, name: "Al-'Ankabut", arabicName: 'العنكبوت', meaning: 'The Spider', versesCount: 69, revelationType: 'Meccan', juzStart: 20, pageStart: 396 },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم', meaning: 'The Romans', versesCount: 60, revelationType: 'Meccan', juzStart: 21, pageStart: 405 },
  { number: 31, name: 'Luqman', arabicName: 'لقمان', meaning: 'Luqman', versesCount: 34, revelationType: 'Meccan', juzStart: 21, pageStart: 412 },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', meaning: 'The Prostration', versesCount: 30, revelationType: 'Meccan', juzStart: 21, pageStart: 416 },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', meaning: 'The Combined Forces', versesCount: 73, revelationType: 'Medinan', juzStart: 21, pageStart: 419 },
  { number: 34, name: 'Saba', arabicName: 'سبأ', meaning: 'Sheba', versesCount: 54, revelationType: 'Meccan', juzStart: 22, pageStart: 429 },
  { number: 35, name: 'Fatir', arabicName: 'فاطر', meaning: 'The Originator', versesCount: 45, revelationType: 'Meccan', juzStart: 22, pageStart: 435 },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', meaning: 'Ya-Sin', versesCount: 83, revelationType: 'Meccan', juzStart: 22, pageStart: 441 },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات', meaning: 'Those Who Set The Ranks', versesCount: 182, revelationType: 'Meccan', juzStart: 23, pageStart: 446 },
  { number: 38, name: 'Sad', arabicName: 'ص', meaning: 'Sad', versesCount: 88, revelationType: 'Meccan', juzStart: 23, pageStart: 453 },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', meaning: 'The Troops', versesCount: 75, revelationType: 'Meccan', juzStart: 23, pageStart: 459 },
  { number: 40, name: 'Ghafir', arabicName: 'غافر', meaning: 'The Forgiver', versesCount: 85, revelationType: 'Meccan', juzStart: 24, pageStart: 468 },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت', meaning: 'Explained in Detail', versesCount: 54, revelationType: 'Meccan', juzStart: 24, pageStart: 478 },
  { number: 42, name: 'Ash-Shura', arabicName: 'الشورى', meaning: 'The Consultation', versesCount: 53, revelationType: 'Meccan', juzStart: 25, pageStart: 483 },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', meaning: 'The Ornaments of Gold', versesCount: 89, revelationType: 'Meccan', juzStart: 25, pageStart: 490 },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', meaning: 'The Smoke', versesCount: 59, revelationType: 'Meccan', juzStart: 25, pageStart: 496 },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', meaning: 'The Crouching', versesCount: 37, revelationType: 'Meccan', juzStart: 25, pageStart: 499 },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', meaning: 'The Wind-Curved Sandhills', versesCount: 35, revelationType: 'Meccan', juzStart: 26, pageStart: 502 },
  { number: 47, name: 'Muhammad', arabicName: 'محمد', meaning: 'Muhammad', versesCount: 38, revelationType: 'Medinan', juzStart: 26, pageStart: 506 },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح', meaning: 'The Victory', versesCount: 29, revelationType: 'Medinan', juzStart: 26, pageStart: 512 },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', meaning: 'The Rooms', versesCount: 18, revelationType: 'Medinan', juzStart: 26, pageStart: 516 },
  { number: 50, name: 'Qaf', arabicName: 'ق', meaning: 'Qaf', versesCount: 45, revelationType: 'Meccan', juzStart: 26, pageStart: 519 },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', meaning: 'The Winnowing Winds', versesCount: 60, revelationType: 'Meccan', juzStart: 26, pageStart: 521 },
  { number: 52, name: 'At-Tur', arabicName: 'الطور', meaning: 'The Mount', versesCount: 49, revelationType: 'Meccan', juzStart: 27, pageStart: 524 },
  { number: 53, name: 'An-Najm', arabicName: 'النجم', meaning: 'The Star', versesCount: 62, revelationType: 'Meccan', juzStart: 27, pageStart: 526 },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر', meaning: 'The Moon', versesCount: 55, revelationType: 'Meccan', juzStart: 27, pageStart: 529 },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', meaning: 'The Beneficent', versesCount: 78, revelationType: 'Medinan', juzStart: 27, pageStart: 532 },
  { number: 56, name: "Al-Waqi'ah", arabicName: 'الواقعة', meaning: 'The Inevitable', versesCount: 96, revelationType: 'Meccan', juzStart: 27, pageStart: 535 },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', meaning: 'The Iron', versesCount: 29, revelationType: 'Medinan', juzStart: 27, pageStart: 538 },
  { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', meaning: 'The Pleading Woman', versesCount: 22, revelationType: 'Medinan', juzStart: 28, pageStart: 543 },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', meaning: 'The Exile', versesCount: 24, revelationType: 'Medinan', juzStart: 28, pageStart: 546 },
  { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', meaning: 'The Examined One', versesCount: 13, revelationType: 'Medinan', juzStart: 28, pageStart: 550 },
  { number: 61, name: 'As-Saff', arabicName: 'الصف', meaning: 'The Ranks', versesCount: 14, revelationType: 'Medinan', juzStart: 28, pageStart: 552 },
  { number: 62, name: "Al-Jumu'ah", arabicName: 'الجمعة', meaning: 'Friday', versesCount: 11, revelationType: 'Medinan', juzStart: 28, pageStart: 554 },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', meaning: 'The Hypocrites', versesCount: 11, revelationType: 'Medinan', juzStart: 28, pageStart: 555 },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', meaning: 'Mutual Disillusion', versesCount: 18, revelationType: 'Medinan', juzStart: 28, pageStart: 557 },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', meaning: 'The Divorce', versesCount: 12, revelationType: 'Medinan', juzStart: 28, pageStart: 559 },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', meaning: 'The Prohibition', versesCount: 12, revelationType: 'Medinan', juzStart: 28, pageStart: 561 },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', meaning: 'The Sovereignty', versesCount: 30, revelationType: 'Meccan', juzStart: 29, pageStart: 563 },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم', meaning: 'The Pen', versesCount: 52, revelationType: 'Meccan', juzStart: 29, pageStart: 565 },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', meaning: 'The Inevitable Truth', versesCount: 52, revelationType: 'Meccan', juzStart: 29, pageStart: 568 },
  { number: 70, name: "Al-Ma'arij", arabicName: 'المعارج', meaning: 'The Ascending Stairways', versesCount: 44, revelationType: 'Meccan', juzStart: 29, pageStart: 570 },
  { number: 71, name: 'Nuh', arabicName: 'نوح', meaning: 'Noah', versesCount: 28, revelationType: 'Meccan', juzStart: 29, pageStart: 572 },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن', meaning: 'The Jinn', versesCount: 28, revelationType: 'Meccan', juzStart: 29, pageStart: 574 },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', meaning: 'The Enshrouded One', versesCount: 20, revelationType: 'Meccan', juzStart: 29, pageStart: 576 },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', meaning: 'The Cloaked One', versesCount: 56, revelationType: 'Meccan', juzStart: 29, pageStart: 579 },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', meaning: 'The Resurrection', versesCount: 40, revelationType: 'Meccan', juzStart: 29, pageStart: 581 },
  { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', meaning: 'Man', versesCount: 31, revelationType: 'Medinan', juzStart: 29, pageStart: 583 },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', meaning: 'The Emissaries', versesCount: 50, revelationType: 'Meccan', juzStart: 29, pageStart: 585 },
  { number: 78, name: 'An-Naba', arabicName: 'النبأ', meaning: 'The Great News', versesCount: 40, revelationType: 'Meccan', juzStart: 30, pageStart: 587 },
  { number: 79, name: "An-Nazi'at", arabicName: 'النازعات', meaning: 'Those Who Drag Forth', versesCount: 46, revelationType: 'Meccan', juzStart: 30, pageStart: 588 },
  { number: 80, name: "'Abasa", arabicName: 'عبس', meaning: 'He Frowned', versesCount: 42, revelationType: 'Meccan', juzStart: 30, pageStart: 590 },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير', meaning: 'The Overthrowing', versesCount: 29, revelationType: 'Meccan', juzStart: 30, pageStart: 591 },
  { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', meaning: 'The Cleaving', versesCount: 19, revelationType: 'Meccan', juzStart: 30, pageStart: 592 },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', meaning: 'Those Who Deal in Fraud', versesCount: 36, revelationType: 'Meccan', juzStart: 30, pageStart: 593 },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', meaning: 'The Splitting Asunder', versesCount: 25, revelationType: 'Meccan', juzStart: 30, pageStart: 595 },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج', meaning: 'The Mansions of the Stars', versesCount: 22, revelationType: 'Meccan', juzStart: 30, pageStart: 596 },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق', meaning: 'The Nightcomer', versesCount: 17, revelationType: 'Meccan', juzStart: 30, pageStart: 597 },
  { number: 87, name: "Al-A'la", arabicName: 'الأعلى', meaning: 'The Most High', versesCount: 19, revelationType: 'Meccan', juzStart: 30, pageStart: 598 },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', meaning: 'The Overwhelming Event', versesCount: 26, revelationType: 'Meccan', juzStart: 30, pageStart: 598 },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', meaning: 'The Dawn', versesCount: 30, revelationType: 'Meccan', juzStart: 30, pageStart: 599 },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد', meaning: 'The City', versesCount: 20, revelationType: 'Meccan', juzStart: 30, pageStart: 601 },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', meaning: 'The Sun', versesCount: 15, revelationType: 'Meccan', juzStart: 30, pageStart: 601 },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل', meaning: 'The Night', versesCount: 21, revelationType: 'Meccan', juzStart: 30, pageStart: 602 },
  { number: 93, name: 'Ad-Duha', arabicName: 'الضحى', meaning: 'The Morning Hours', versesCount: 11, revelationType: 'Meccan', juzStart: 30, pageStart: 603 },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', meaning: 'The Relief', versesCount: 8, revelationType: 'Meccan', juzStart: 30, pageStart: 603 },
  { number: 95, name: 'At-Tin', arabicName: 'التين', meaning: 'The Fig', versesCount: 8, revelationType: 'Meccan', juzStart: 30, pageStart: 604 },
  { number: 96, name: "Al-'Alaq", arabicName: 'العلق', meaning: 'The Clot', versesCount: 19, revelationType: 'Meccan', juzStart: 30, pageStart: 604 },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر', meaning: 'The Power', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 605 },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', meaning: 'The Clear Proof', versesCount: 8, revelationType: 'Medinan', juzStart: 30, pageStart: 605 },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', meaning: 'The Earthquake', versesCount: 8, revelationType: 'Medinan', juzStart: 30, pageStart: 606 },
  { number: 100, name: "Al-'Adiyat", arabicName: 'العاديات', meaning: 'The Courser', versesCount: 11, revelationType: 'Meccan', juzStart: 30, pageStart: 606 },
  { number: 101, name: "Al-Qari'ah", arabicName: 'القارعة', meaning: 'The Calamity', versesCount: 11, revelationType: 'Meccan', juzStart: 30, pageStart: 607 },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', meaning: 'The Rivalry in World Increase', versesCount: 8, revelationType: 'Meccan', juzStart: 30, pageStart: 607 },
  { number: 103, name: "Al-'Asr", arabicName: 'العصر', meaning: 'The Declining Day', versesCount: 3, revelationType: 'Meccan', juzStart: 30, pageStart: 608 },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', meaning: 'The Traducer', versesCount: 9, revelationType: 'Meccan', juzStart: 30, pageStart: 608 },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل', meaning: 'The Elephant', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 608 },
  { number: 106, name: 'Quraysh', arabicName: 'قريش', meaning: 'Quraysh', versesCount: 4, revelationType: 'Meccan', juzStart: 30, pageStart: 609 },
  { number: 107, name: "Al-Ma'un", arabicName: 'الماعون', meaning: 'The Small Kindness', versesCount: 7, revelationType: 'Meccan', juzStart: 30, pageStart: 609 },
  { number: 108, name: 'Al-Kawthar', arabicName: 'الکوثر', meaning: 'The Abundance', versesCount: 3, revelationType: 'Meccan', juzStart: 30, pageStart: 609 },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', meaning: 'The Disbelievers', versesCount: 6, revelationType: 'Meccan', juzStart: 30, pageStart: 609 },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر', meaning: 'The Divine Support', versesCount: 3, revelationType: 'Medinan', juzStart: 30, pageStart: 610 },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد', meaning: 'The Palm Fiber', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 610 },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', meaning: 'The Sincerity', versesCount: 4, revelationType: 'Meccan', juzStart: 30, pageStart: 610 },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', meaning: 'The Daybreak', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 611 },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', meaning: 'Mankind', versesCount: 6, revelationType: 'Meccan', juzStart: 30, pageStart: 611 },
];

// 30 Paras / Juz Directory with verified Pakistan/Subcontinent 15-Line Hafizi Mushaf page starts (Pages 2-611)
export const JUZ_LIST: JuzMeta[] = [
  { number: 1, name: 'Alif Laam Meem', arabicName: 'الم', startSurah: 1, startSurahName: 'Al-Fatihah', startAyah: 1, pageStart: 2 },
  { number: 2, name: 'Sayaqool', arabicName: 'سيقول', startSurah: 2, startSurahName: 'Al-Baqarah', startAyah: 142, pageStart: 22 },
  { number: 3, name: 'Tilkal Rusul', arabicName: 'تلك الرسل', startSurah: 2, startSurahName: 'Al-Baqarah', startAyah: 253, pageStart: 42 },
  { number: 4, name: 'Lan Tanaaloo', arabicName: 'لن تنالوا', startSurah: 3, startSurahName: "Ali 'Imran", startAyah: 93, pageStart: 62 },
  { number: 5, name: 'Wal Muhsanaat', arabicName: 'والمحصنات', startSurah: 4, startSurahName: 'An-Nisa', startAyah: 24, pageStart: 83 },
  { number: 6, name: 'La Yuhibbullah', arabicName: 'لا يحب الله', startSurah: 4, startSurahName: 'An-Nisa', startAyah: 148, pageStart: 103 },
  { number: 7, name: "Wa Iza Sami'oo", arabicName: 'وإذا سمعوا', startSurah: 5, startSurahName: "Al-Ma'idah", startAyah: 82, pageStart: 123 },
  { number: 8, name: 'Wa Law Annana', arabicName: 'ولو أننا', startSurah: 6, startSurahName: "Al-An'am", startAyah: 111, pageStart: 143 },
  { number: 9, name: "Qaalal Mala'o", arabicName: 'قال الملأ', startSurah: 7, startSurahName: "Al-A'raf", startAyah: 88, pageStart: 163 },
  { number: 10, name: "Wa'lamoo", arabicName: 'واعلموا', startSurah: 8, startSurahName: 'Al-Anfal', startAyah: 41, pageStart: 183 },
  { number: 11, name: "Ya'taziroon", arabicName: 'يعتذرون', startSurah: 9, startSurahName: 'At-Tawbah', startAyah: 93, pageStart: 203 },
  { number: 12, name: "Wa Ma Min Da'abbah", arabicName: 'وما من دابة', startSurah: 11, startSurahName: 'Hud', startAyah: 6, pageStart: 223 },
  { number: 13, name: "Wa Ma Oobari'oo", arabicName: 'وما أبرئ', startSurah: 12, startSurahName: 'Yusuf', startAyah: 53, pageStart: 243 },
  { number: 14, name: 'Rubama', arabicName: 'ربما', startSurah: 15, startSurahName: 'Al-Hijr', startAyah: 1, pageStart: 263 },
  { number: 15, name: 'Subhanallazi', arabicName: 'سبحان الذي', startSurah: 17, startSurahName: 'Al-Isra', startAyah: 1, pageStart: 283 },
  { number: 16, name: 'Qala Alam', arabicName: 'قال ألم', startSurah: 18, startSurahName: 'Al-Kahf', startAyah: 75, pageStart: 303 },
  { number: 17, name: 'Iqtaraba Linnaas', arabicName: 'اقترب للناس', startSurah: 21, startSurahName: 'Al-Anbiya', startAyah: 1, pageStart: 323 },
  { number: 18, name: 'Qad Aflaha', arabicName: 'قد أفلح', startSurah: 23, startSurahName: "Al-Mu'minun", startAyah: 1, pageStart: 343 },
  { number: 19, name: 'Wa Qaalal Lazeena', arabicName: 'وقال الذين', startSurah: 25, startSurahName: 'Al-Furqan', startAyah: 21, pageStart: 363 },
  { number: 20, name: "A'man Khalaqa", arabicName: 'أمن خلق', startSurah: 27, startSurahName: 'An-Naml', startAyah: 60, pageStart: 383 },
  { number: 21, name: 'Utlu Ma Oohiya', arabicName: 'اتل ما أوحي', startSurah: 29, startSurahName: "Al-'Ankabut", startAyah: 45, pageStart: 403 },
  { number: 22, name: 'Wa Man Yaqnut', arabicName: 'ومن يقنت', startSurah: 33, startSurahName: 'Al-Ahzab', startAyah: 31, pageStart: 423 },
  { number: 23, name: 'Wa Maliya', arabicName: 'وما لي', startSurah: 36, startSurahName: 'Ya-Sin', startAyah: 22, pageStart: 443 },
  { number: 24, name: 'Faman Azlamu', arabicName: 'فمن أظلم', startSurah: 39, startSurahName: 'Az-Zumar', startAyah: 32, pageStart: 463 },
  { number: 25, name: 'Ilayhi Yuraddu', arabicName: 'إليه يرد', startSurah: 41, startSurahName: 'Fussilat', startAyah: 47, pageStart: 483 },
  { number: 26, name: 'Haa Meem', arabicName: 'حم', startSurah: 46, startSurahName: 'Al-Ahqaf', startAyah: 1, pageStart: 503 },
  { number: 27, name: 'Qala Fama Khatbukum', arabicName: 'قال فما خطبكم', startSurah: 51, startSurahName: 'Adh-Dhariyat', startAyah: 31, pageStart: 523 },
  { number: 28, name: "Qad Sami'allah", arabicName: 'قد سمع الله', startSurah: 58, startSurahName: 'Al-Mujadila', startAyah: 1, pageStart: 543 },
  { number: 29, name: 'Tabarakallazi', arabicName: 'تبارك الذي', startSurah: 67, startSurahName: 'Al-Mulk', startAyah: 1, pageStart: 563 },
  { number: 30, name: 'Amma', arabicName: 'عمّ', startSurah: 78, startSurahName: 'An-Naba', startAyah: 1, pageStart: 587 },
];

/**
 * Direct 1:1 Page Search Navigation:
 * User entered page number -> exact Mushaf page number (2 to 611).
 * If user enters 1 or 2, open first page (2).
 */
export function quranTextPageToApiPage(pageNumber: number): number {
  const num = Math.floor(pageNumber) || MIN_MUSHAF_PAGE;
  if (num < MIN_MUSHAF_PAGE) return MIN_MUSHAF_PAGE;
  return Math.min(MAX_MUSHAF_PAGE, num);
}

export function getPrintedPageLabel(pageNumber: number): string {
  const clamped = quranTextPageToApiPage(pageNumber);
  return `Page ${clamped} / ${TOTAL_MUSHAF_PAGES}`;
}

export function getSurahByPage(pageNumber: number): SurahMeta {
  const clamped = quranTextPageToApiPage(pageNumber);
  let matched = SURAHS_LIST[0];
  for (let i = 0; i < SURAHS_LIST.length; i++) {
    const s = SURAHS_LIST[i];
    if (s.pageStart === clamped) {
      return s;
    }
    if (s.pageStart < clamped) {
      matched = s;
    }
  }
  return matched;
}

export function getJuzByPage(pageNumber: number): JuzMeta {
  const clamped = quranTextPageToApiPage(pageNumber);
  let matched = JUZ_LIST[0];
  for (let i = 0; i < JUZ_LIST.length; i++) {
    const j = JUZ_LIST[i];
    if (j.pageStart === clamped) {
      return j;
    }
    if (j.pageStart < clamped) {
      matched = j;
    }
  }
  return matched;
}

export function getJuzByNumber(juzNumber: number): JuzMeta {
  const clamped = Math.max(1, Math.min(30, Math.floor(juzNumber) || 1));
  return JUZ_LIST.find((j) => j.number === clamped) || JUZ_LIST[0];
}

export function getSurahByNumber(surahNumber: number): SurahMeta {
  return SURAHS_LIST.find((s) => s.number === surahNumber) || SURAHS_LIST[0];
}
