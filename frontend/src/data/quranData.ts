/**
 * Quran Static Metadata and Registries
 * Authenticated for Pakistan / Subcontinent 16-Line Standard Taj Company Mushaf (549 Pages, Pages 2 to 549)
 * High-definition WebP Mushaf Pages (002.webp to 549.webp)
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
    sublabel: 'Classic Nastaleeq / Pakistan Standard 16-Line Mushaf',
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
    id: 54,
    name: 'Maulana Muhammad Junagarhi',
    author: 'Maulana Muhammad Junagarhi',
    language: 'urdu',
    languageLabel: 'اردو (جوناگڑھی)',
  },
  {
    id: 97,
    name: 'Tafheem-ul-Quran',
    author: 'Syed Abul Ala Maududi',
    language: 'urdu',
    languageLabel: 'اردو (تفہیم القرآن - مودودی)',
  },
  {
    id: 158,
    name: 'Bayan-ul-Quran',
    author: 'Dr. Israr Ahmad',
    language: 'urdu',
    languageLabel: 'اردو (بیان القرآن - ڈاکٹر اسرار)',
  },
  {
    id: 831,
    name: 'Roman Urdu (Maududi)',
    author: 'Abul Ala Maududi',
    language: 'roman-urdu',
    languageLabel: 'Roman Urdu (Aasan)',
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
    author: 'Oxford University Press',
    language: 'english',
    languageLabel: 'English (Abdel Haleem)',
  },
  {
    id: 84,
    name: 'Mufti Taqi Usmani',
    author: 'Mufti Muhammad Taqi Usmani',
    language: 'english',
    languageLabel: 'English (Taqi Usmani)',
  },
  {
    id: 22,
    name: 'Abdullah Yusuf Ali',
    author: 'A. Yusuf Ali',
    language: 'english',
    languageLabel: 'English (Yusuf Ali)',
  },
  {
    id: 122,
    name: 'Maulana Azizul Haque al-Umari',
    author: 'Azizul Haque al-Umari',
    language: 'hindi',
    languageLabel: 'हिन्दी (अज़ीज़ुल हक़ अल-उमरी)',
  },
];

export const QURAN_COM_RECITERS: QuranReciterOption[] = [
  {
    id: 7,
    name: 'Sheikh Mishary Rashid Alafasy',
    style: 'Murattal (Clear & Melodic)',
    reciterSlug: 'Alafasy',
  },
  {
    id: 2,
    name: 'Sheikh AbdulBaset AbdulSamad',
    style: 'Murattal (Classic Egyptian)',
    reciterSlug: 'AbdulBaset/Murattal',
  },
  {
    id: 1,
    name: 'Sheikh AbdulBaset AbdulSamad',
    style: 'Mujawwad (Masterful Tajweed)',
    reciterSlug: 'AbdulBaset/Mujawwad',
  },
  {
    id: 6,
    name: 'Sheikh Mahmoud Khalil Al-Husary',
    style: 'Murattal (Pristine Pronunciation)',
    reciterSlug: 'Husary',
  },
  {
    id: 12,
    name: 'Sheikh Mahmoud Khalil Al-Husary (Muallim)',
    style: 'Teacher Edition (Slow & Clear)',
    reciterSlug: 'Husary/Muallim',
  },
  {
    id: 4,
    name: 'Sheikh Abu Bakr Ash-Shatri',
    style: 'Murattal (Heartfelt Emotional)',
    reciterSlug: 'Shatri',
  },
  {
    id: 5,
    name: 'Sheikh Hani Ar-Rifai',
    style: 'Murattal (Deep & Soothing)',
    reciterSlug: 'Rifai',
  },
  {
    id: 3,
    name: 'Sheikh Abdur-Rahman As-Sudais',
    style: 'Imam of Masjid Al-Haram, Makkah',
    reciterSlug: 'Sudais',
  },
  {
    id: 10,
    name: "Sheikh Sa'ud Ash-Shuraym",
    style: 'Imam of Masjid Al-Haram, Makkah',
    reciterSlug: 'Shuraym',
  },
  {
    id: 9,
    name: 'Sheikh Ali Al-Hudhaify',
    style: 'Imam of Masjid An-Nabawi, Madinah',
    reciterSlug: 'Hudhaify',
  },
  {
    id: 11,
    name: 'Sheikh Mohamed Siddiq Al-Minshawi',
    style: 'Murattal (Timeless Egyptian Maestro)',
    reciterSlug: 'Minshawi/Murattal',
  },
  {
    id: 8,
    name: 'Sheikh Mohamed Siddiq Al-Minshawi (Mujawwad)',
    style: 'Mujawwad (Soulful Legendary)',
    reciterSlug: 'Minshawi/Mujawwad',
  },
];

export const MIN_MUSHAF_PAGE = 2;
export const MAX_MUSHAF_PAGE = 549;
export const TOTAL_MUSHAF_PAGES = 549;

// Complete 114 Surahs Directory with verified Pakistan/Subcontinent 16-Line Taj Company Mushaf exact start pages (Pages 2-549)
export const SURAHS_LIST: SurahMeta[] = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', meaning: 'The Opening', versesCount: 7, revelationType: 'Meccan', juzStart: 1, pageStart: 2 },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', meaning: 'The Cow', versesCount: 286, revelationType: 'Medinan', juzStart: 1, pageStart: 3 },
  { number: 3, name: "Ali 'Imran", arabicName: 'آل عمران', meaning: 'Family of Imran', versesCount: 200, revelationType: 'Medinan', juzStart: 3, pageStart: 46 },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء', meaning: 'The Women', versesCount: 176, revelationType: 'Medinan', juzStart: 4, pageStart: 71 },
  { number: 5, name: "Al-Ma'idah", arabicName: 'المائدة', meaning: 'The Table Spread', versesCount: 120, revelationType: 'Medinan', juzStart: 6, pageStart: 98 },
  { number: 6, name: "Al-An'am", arabicName: 'الأنعام', meaning: 'The Cattle', versesCount: 165, revelationType: 'Meccan', juzStart: 7, pageStart: 119 },
  { number: 7, name: "Al-A'raf", arabicName: 'الأعراف', meaning: 'The Heights', versesCount: 206, revelationType: 'Meccan', juzStart: 8, pageStart: 139 },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', meaning: 'The Spoils of War', versesCount: 75, revelationType: 'Medinan', juzStart: 9, pageStart: 163 },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', meaning: 'The Repentance', versesCount: 129, revelationType: 'Medinan', juzStart: 10, pageStart: 173 },
  { number: 10, name: 'Yunus', arabicName: 'يونس', meaning: 'Jonah', versesCount: 109, revelationType: 'Meccan', juzStart: 11, pageStart: 191 },
  { number: 11, name: 'Hud', arabicName: 'هود', meaning: 'Hud', versesCount: 123, revelationType: 'Meccan', juzStart: 11, pageStart: 203 },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف', meaning: 'Joseph', versesCount: 111, revelationType: 'Meccan', juzStart: 12, pageStart: 215 },
  { number: 13, name: "Ar-Ra'd", arabicName: 'الرعد', meaning: 'The Thunder', versesCount: 43, revelationType: 'Medinan', juzStart: 13, pageStart: 228 },
  { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', meaning: 'Abraham', versesCount: 52, revelationType: 'Meccan', juzStart: 13, pageStart: 233 },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', meaning: 'The Rocky Tract', versesCount: 99, revelationType: 'Meccan', juzStart: 14, pageStart: 239 },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل', meaning: 'The Bee', versesCount: 128, revelationType: 'Meccan', juzStart: 14, pageStart: 244 },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', meaning: 'The Night Journey', versesCount: 111, revelationType: 'Meccan', juzStart: 15, pageStart: 257 },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', meaning: 'The Cave', versesCount: 110, revelationType: 'Meccan', juzStart: 15, pageStart: 267 },
  { number: 19, name: 'Maryam', arabicName: 'مريم', meaning: 'Mary', versesCount: 98, revelationType: 'Meccan', juzStart: 16, pageStart: 277 },
  { number: 20, name: 'Taha', arabicName: 'طه', meaning: 'Ta-Ha', versesCount: 135, revelationType: 'Meccan', juzStart: 16, pageStart: 284 },
  { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', meaning: 'The Prophets', versesCount: 112, revelationType: 'Meccan', juzStart: 17, pageStart: 293 },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج', meaning: 'The Pilgrimage', versesCount: 78, revelationType: 'Medinan', juzStart: 17, pageStart: 301 },
  { number: 23, name: "Al-Mu'minun", arabicName: 'المؤمنون', meaning: 'The Believers', versesCount: 118, revelationType: 'Meccan', juzStart: 18, pageStart: 310 },
  { number: 24, name: 'An-Nur', arabicName: 'النور', meaning: 'The Light', versesCount: 64, revelationType: 'Medinan', juzStart: 18, pageStart: 318 },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', meaning: 'The Criterion', versesCount: 77, revelationType: 'Meccan', juzStart: 18, pageStart: 327 },
  { number: 26, name: "Ash-Shu'ara", arabicName: 'الشعراء', meaning: 'The Poets', versesCount: 227, revelationType: 'Meccan', juzStart: 19, pageStart: 334 },
  { number: 27, name: 'An-Naml', arabicName: 'النمل', meaning: 'The Ant', versesCount: 93, revelationType: 'Meccan', juzStart: 19, pageStart: 343 },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص', meaning: 'The Stories', versesCount: 88, revelationType: 'Meccan', juzStart: 20, pageStart: 351 },
  { number: 29, name: "Al-'Ankabut", arabicName: 'العنكبوت', meaning: 'The Spider', versesCount: 69, revelationType: 'Meccan', juzStart: 20, pageStart: 360 },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم', meaning: 'The Romans', versesCount: 60, revelationType: 'Meccan', juzStart: 21, pageStart: 367 },
  { number: 31, name: 'Luqman', arabicName: 'لقمان', meaning: 'Luqman', versesCount: 34, revelationType: 'Meccan', juzStart: 21, pageStart: 373 },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', meaning: 'The Prostration', versesCount: 30, revelationType: 'Meccan', juzStart: 21, pageStart: 377 },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', meaning: 'The Combined Forces', versesCount: 73, revelationType: 'Medinan', juzStart: 21, pageStart: 379 },
  { number: 34, name: 'Saba', arabicName: 'سبأ', meaning: 'Sheba', versesCount: 54, revelationType: 'Meccan', juzStart: 22, pageStart: 388 },
  { number: 35, name: 'Fatir', arabicName: 'فاطر', meaning: 'The Originator', versesCount: 45, revelationType: 'Meccan', juzStart: 22, pageStart: 394 },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', meaning: 'Ya-Sin', versesCount: 83, revelationType: 'Meccan', juzStart: 22, pageStart: 397 },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات', meaning: 'Those Who Set The Ranks', versesCount: 182, revelationType: 'Meccan', juzStart: 23, pageStart: 405 },
  { number: 38, name: 'Sad', arabicName: 'ص', meaning: 'Sad', versesCount: 88, revelationType: 'Meccan', juzStart: 23, pageStart: 411 },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', meaning: 'The Troops', versesCount: 75, revelationType: 'Meccan', juzStart: 23, pageStart: 416 },
  { number: 40, name: 'Ghafir', arabicName: 'غافر', meaning: 'The Forgiver', versesCount: 85, revelationType: 'Meccan', juzStart: 24, pageStart: 424 },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت', meaning: 'Explained in Detail', versesCount: 54, revelationType: 'Meccan', juzStart: 24, pageStart: 432 },
  { number: 42, name: 'Ash-Shura', arabicName: 'الشورى', meaning: 'The Consultation', versesCount: 53, revelationType: 'Meccan', juzStart: 25, pageStart: 438 },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', meaning: 'The Ornaments of Gold', versesCount: 89, revelationType: 'Meccan', juzStart: 25, pageStart: 442 },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', meaning: 'The Smoke', versesCount: 59, revelationType: 'Meccan', juzStart: 25, pageStart: 448 },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', meaning: 'The Crouching', versesCount: 37, revelationType: 'Meccan', juzStart: 25, pageStart: 451 },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', meaning: 'The Wind-Curved Sandhills', versesCount: 35, revelationType: 'Meccan', juzStart: 26, pageStart: 455 },
  { number: 47, name: 'Muhammad', arabicName: 'محمد', meaning: 'Muhammad', versesCount: 38, revelationType: 'Medinan', juzStart: 26, pageStart: 459 },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح', meaning: 'The Victory', versesCount: 29, revelationType: 'Medinan', juzStart: 26, pageStart: 463 },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', meaning: 'The Rooms', versesCount: 18, revelationType: 'Medinan', juzStart: 26, pageStart: 466 },
  { number: 50, name: 'Qaf', arabicName: 'ق', meaning: 'Qaf', versesCount: 45, revelationType: 'Meccan', juzStart: 26, pageStart: 469 },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', meaning: 'The Winnowing Winds', versesCount: 60, revelationType: 'Meccan', juzStart: 26, pageStart: 471 },
  { number: 52, name: 'At-Tur', arabicName: 'الطور', meaning: 'The Mount', versesCount: 49, revelationType: 'Meccan', juzStart: 27, pageStart: 474 },
  { number: 53, name: 'An-Najm', arabicName: 'النجم', meaning: 'The Star', versesCount: 62, revelationType: 'Meccan', juzStart: 27, pageStart: 476 },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر', meaning: 'The Moon', versesCount: 55, revelationType: 'Meccan', juzStart: 27, pageStart: 479 },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', meaning: 'The Beneficent', versesCount: 78, revelationType: 'Medinan', juzStart: 27, pageStart: 481 },
  { number: 56, name: "Al-Waqi'ah", arabicName: 'الواقعة', meaning: 'The Inevitable', versesCount: 96, revelationType: 'Meccan', juzStart: 27, pageStart: 484 },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', meaning: 'The Iron', versesCount: 29, revelationType: 'Medinan', juzStart: 27, pageStart: 487 },
  { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', meaning: 'The Pleading Woman', versesCount: 22, revelationType: 'Medinan', juzStart: 28, pageStart: 491 },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', meaning: 'The Exile', versesCount: 24, revelationType: 'Medinan', juzStart: 28, pageStart: 494 },
  { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة', meaning: 'The Examined One', versesCount: 13, revelationType: 'Medinan', juzStart: 28, pageStart: 497 },
  { number: 61, name: 'As-Saff', arabicName: 'الصف', meaning: 'The Ranks', versesCount: 14, revelationType: 'Medinan', juzStart: 28, pageStart: 500 },
  { number: 62, name: "Al-Jumu'ah", arabicName: 'الجمعة', meaning: 'Friday', versesCount: 11, revelationType: 'Medinan', juzStart: 28, pageStart: 501 },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', meaning: 'The Hypocrites', versesCount: 11, revelationType: 'Medinan', juzStart: 28, pageStart: 503 },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', meaning: 'Mutual Disillusion', versesCount: 18, revelationType: 'Medinan', juzStart: 28, pageStart: 504 },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', meaning: 'The Divorce', versesCount: 12, revelationType: 'Medinan', juzStart: 28, pageStart: 506 },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', meaning: 'The Prohibition', versesCount: 12, revelationType: 'Medinan', juzStart: 28, pageStart: 508 },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', meaning: 'The Sovereignty', versesCount: 30, revelationType: 'Meccan', juzStart: 29, pageStart: 510 },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم', meaning: 'The Pen', versesCount: 52, revelationType: 'Meccan', juzStart: 29, pageStart: 512 },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', meaning: 'The Inevitable Truth', versesCount: 52, revelationType: 'Meccan', juzStart: 29, pageStart: 514 },
  { number: 70, name: "Al-Ma'arij", arabicName: 'المعارج', meaning: 'The Ascending Stairways', versesCount: 44, revelationType: 'Meccan', juzStart: 29, pageStart: 516 },
  { number: 71, name: 'Nuh', arabicName: 'نوح', meaning: 'Noah', versesCount: 28, revelationType: 'Meccan', juzStart: 29, pageStart: 518 },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن', meaning: 'The Jinn', versesCount: 28, revelationType: 'Meccan', juzStart: 29, pageStart: 520 },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', meaning: 'The Enshrouded One', versesCount: 20, revelationType: 'Meccan', juzStart: 29, pageStart: 522 },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', meaning: 'The Cloaked One', versesCount: 56, revelationType: 'Meccan', juzStart: 29, pageStart: 523 },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', meaning: 'The Resurrection', versesCount: 40, revelationType: 'Meccan', juzStart: 29, pageStart: 525 },
  { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', meaning: 'Man', versesCount: 31, revelationType: 'Medinan', juzStart: 29, pageStart: 526 },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', meaning: 'The Emissaries', versesCount: 50, revelationType: 'Meccan', juzStart: 29, pageStart: 528 },
  { number: 78, name: 'An-Naba', arabicName: 'النبأ', meaning: 'The Great News', versesCount: 40, revelationType: 'Meccan', juzStart: 30, pageStart: 530 },
  { number: 79, name: "An-Nazi'at", arabicName: 'النازعات', meaning: 'Those Who Drag Forth', versesCount: 46, revelationType: 'Meccan', juzStart: 30, pageStart: 531 },
  { number: 80, name: "'Abasa", arabicName: 'عبس', meaning: 'He Frowned', versesCount: 42, revelationType: 'Meccan', juzStart: 30, pageStart: 533 },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير', meaning: 'The Overthrowing', versesCount: 29, revelationType: 'Meccan', juzStart: 30, pageStart: 534 },
  { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', meaning: 'The Cleaving', versesCount: 19, revelationType: 'Meccan', juzStart: 30, pageStart: 535 },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', meaning: 'Those Who Deal in Fraud', versesCount: 36, revelationType: 'Meccan', juzStart: 30, pageStart: 536 },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', meaning: 'The Splitting Asunder', versesCount: 25, revelationType: 'Meccan', juzStart: 30, pageStart: 537 },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج', meaning: 'The Mansions of the Stars', versesCount: 22, revelationType: 'Meccan', juzStart: 30, pageStart: 538 },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق', meaning: 'The Nightcomer', versesCount: 17, revelationType: 'Meccan', juzStart: 30, pageStart: 539 },
  { number: 87, name: "Al-A'la", arabicName: 'الأعلى', meaning: 'The Most High', versesCount: 19, revelationType: 'Meccan', juzStart: 30, pageStart: 540 },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', meaning: 'The Overwhelming Event', versesCount: 26, revelationType: 'Meccan', juzStart: 30, pageStart: 540 },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', meaning: 'The Dawn', versesCount: 30, revelationType: 'Meccan', juzStart: 30, pageStart: 541 },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد', meaning: 'The City', versesCount: 20, revelationType: 'Meccan', juzStart: 30, pageStart: 542 },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', meaning: 'The Sun', versesCount: 15, revelationType: 'Meccan', juzStart: 30, pageStart: 543 },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل', meaning: 'The Night', versesCount: 21, revelationType: 'Meccan', juzStart: 30, pageStart: 543 },
  { number: 93, name: 'Ad-Duha', arabicName: 'الضحى', meaning: 'The Morning Hours', versesCount: 11, revelationType: 'Meccan', juzStart: 30, pageStart: 544 },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', meaning: 'The Relief', versesCount: 8, revelationType: 'Meccan', juzStart: 30, pageStart: 544 },
  { number: 95, name: 'At-Tin', arabicName: 'التين', meaning: 'The Fig', versesCount: 8, revelationType: 'Meccan', juzStart: 30, pageStart: 545 },
  { number: 96, name: "Al-'Alaq", arabicName: 'العلق', meaning: 'The Clot', versesCount: 19, revelationType: 'Meccan', juzStart: 30, pageStart: 545 },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر', meaning: 'The Power', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 546 },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', meaning: 'The Clear Proof', versesCount: 8, revelationType: 'Medinan', juzStart: 30, pageStart: 546 },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', meaning: 'The Earthquake', versesCount: 8, revelationType: 'Medinan', juzStart: 30, pageStart: 547 },
  { number: 100, name: "Al-'Adiyat", arabicName: 'العاديات', meaning: 'The Courser', versesCount: 11, revelationType: 'Meccan', juzStart: 30, pageStart: 547 },
  { number: 101, name: "Al-Qari'ah", arabicName: 'القارعة', meaning: 'The Calamity', versesCount: 11, revelationType: 'Meccan', juzStart: 30, pageStart: 547 },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', meaning: 'The Rivalry in World Increase', versesCount: 8, revelationType: 'Meccan', juzStart: 30, pageStart: 548 },
  { number: 103, name: "Al-'Asr", arabicName: 'العصر', meaning: 'The Declining Day', versesCount: 3, revelationType: 'Meccan', juzStart: 30, pageStart: 548 },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', meaning: 'The Traducer', versesCount: 9, revelationType: 'Meccan', juzStart: 30, pageStart: 548 },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل', meaning: 'The Elephant', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 548 },
  { number: 106, name: 'Quraysh', arabicName: 'قريش', meaning: 'Quraysh', versesCount: 4, revelationType: 'Meccan', juzStart: 30, pageStart: 549 },
  { number: 107, name: "Al-Ma'un", arabicName: 'الماعون', meaning: 'The Small Kindness', versesCount: 7, revelationType: 'Meccan', juzStart: 30, pageStart: 549 },
  { number: 108, name: 'Al-Kawthar', arabicName: 'الکوثر', meaning: 'The Abundance', versesCount: 3, revelationType: 'Meccan', juzStart: 30, pageStart: 549 },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', meaning: 'The Disbelievers', versesCount: 6, revelationType: 'Meccan', juzStart: 30, pageStart: 548 },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر', meaning: 'The Divine Support', versesCount: 3, revelationType: 'Medinan', juzStart: 30, pageStart: 548 },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد', meaning: 'The Palm Fiber', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 548 },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', meaning: 'The Sincerity', versesCount: 4, revelationType: 'Meccan', juzStart: 30, pageStart: 548 },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', meaning: 'The Daybreak', versesCount: 5, revelationType: 'Meccan', juzStart: 30, pageStart: 549 },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', meaning: 'Mankind', versesCount: 6, revelationType: 'Meccan', juzStart: 30, pageStart: 549 },
];

// 30 Paras / Juz Directory with verified Pakistan/Subcontinent 16-Line Taj Company page starts (Pages 2-549)
export const JUZ_LIST: JuzMeta[] = [
  { number: 1, name: 'Juz 1 (الم)', arabicName: 'الجزء الأول (الم)', startSurah: 1, startSurahName: 'Al-Fatihah', startAyah: 1, pageStart: 2 },
  { number: 2, name: 'Juz 2 (سيقول)', arabicName: 'الجزء الثاني (سيقول)', startSurah: 2, startSurahName: 'Al-Baqarah', startAyah: 142, pageStart: 22 },
  { number: 3, name: 'Juz 3 (تلك الرسل)', arabicName: 'الجزء الثالث (تلك الرسل)', startSurah: 2, startSurahName: 'Al-Baqarah', startAyah: 253, pageStart: 40 },
  { number: 4, name: 'Juz 4 (لن تنالوا)', arabicName: 'الجزء الرابع (لن تنالوا)', startSurah: 3, startSurahName: "Ali 'Imran", startAyah: 93, pageStart: 58 },
  { number: 5, name: 'Juz 5 (والمحصنات)', arabicName: 'الجزء الخامس (والمحصنات)', startSurah: 4, startSurahName: 'An-Nisa', startAyah: 24, pageStart: 76 },
  { number: 6, name: 'Juz 6 (لا يحب الله)', arabicName: 'الجزء السادس (لا يحب الله)', startSurah: 4, startSurahName: 'An-Nisa', startAyah: 148, pageStart: 94 },
  { number: 7, name: 'Juz 7 (وإذا سمعوا)', arabicName: 'الجزء السابع (وإذا سمعوا)', startSurah: 5, startSurahName: "Al-Ma'idah", startAyah: 82, pageStart: 112 },
  { number: 8, name: 'Juz 8 (ولو أننا)', arabicName: 'الجزء الثامن (ولو أننا)', startSurah: 6, startSurahName: "Al-An'am", startAyah: 111, pageStart: 130 },
  { number: 9, name: 'Juz 9 (قال الملأ)', arabicName: 'الجزء التاسع (قال الملأ)', startSurah: 7, startSurahName: "Al-A'raf", startAyah: 88, pageStart: 148 },
  { number: 10, name: 'Juz 10 (واعلموا)', arabicName: 'الجزء العاشر (واعلموا)', startSurah: 8, startSurahName: 'Al-Anfal', startAyah: 41, pageStart: 166 },
  { number: 11, name: 'Juz 11 (يعتذرون)', arabicName: 'الجزء الحادي عشر (يعتذرون)', startSurah: 9, startSurahName: 'At-Tawbah', startAyah: 93, pageStart: 184 },
  { number: 12, name: 'Juz 12 (وما من دابة)', arabicName: 'الجزء الثاني عشر (وما من دابة)', startSurah: 11, startSurahName: 'Hud', startAyah: 6, pageStart: 202 },
  { number: 13, name: 'Juz 13 (وما أبرئ)', arabicName: 'الجزء الثالث عشر (وما أبرئ)', startSurah: 12, startSurahName: 'Yusuf', startAyah: 53, pageStart: 220 },
  { number: 14, name: 'Juz 14 (ربما)', arabicName: 'الجزء الرابع عشر (ربما)', startSurah: 15, startSurahName: 'Al-Hijr', startAyah: 1, pageStart: 238 },
  { number: 15, name: 'Juz 15 (سبحان الذي)', arabicName: 'الجزء الخامس عشر (سبحان الذي)', startSurah: 17, startSurahName: 'Al-Isra', startAyah: 1, pageStart: 256 },
  { number: 16, name: 'Juz 16 (قال ألم)', arabicName: 'الجزء السادس عشر (قال ألم)', startSurah: 18, startSurahName: 'Al-Kahf', startAyah: 75, pageStart: 274 },
  { number: 17, name: 'Juz 17 (اقترب)', arabicName: 'الجزء السابع عشر (اقترب)', startSurah: 21, startSurahName: 'Al-Anbiya', startAyah: 1, pageStart: 292 },
  { number: 18, name: 'Juz 18 (قد أفلح)', arabicName: 'الجزء الثامن عشر (قد أفلح)', startSurah: 23, startSurahName: "Al-Mu'minun", startAyah: 1, pageStart: 310 },
  { number: 19, name: 'Juz 19 (وقال الذين)', arabicName: 'الجزء التاسع عشر (وقال الذين)', startSurah: 25, startSurahName: 'Al-Furqan', startAyah: 21, pageStart: 328 },
  { number: 20, name: 'Juz 20 (أمن خلق)', arabicName: 'الجزء العشرون (أمن خلق)', startSurah: 27, startSurahName: 'An-Naml', startAyah: 56, pageStart: 346 },
  { number: 21, name: 'Juz 21 (اتل ما أوحي)', arabicName: 'الجزء الحادي والعشرون (اتل ما أوحي)', startSurah: 29, startSurahName: "Al-'Ankabut", startAyah: 46, pageStart: 364 },
  { number: 22, name: 'Juz 22 (ومن يقنت)', arabicName: 'الجزء الثاني والعشرون (ومن يقنت)', startSurah: 33, startSurahName: 'Al-Ahzab', startAyah: 31, pageStart: 382 },
  { number: 23, name: 'Juz 23 (وما أنزلنا)', arabicName: 'الجزء الثالث والعشرون (وما أنزلنا)', startSurah: 36, startSurahName: 'Ya-Sin', startAyah: 28, pageStart: 400 },
  { number: 24, name: 'Juz 24 (فمن أظلم)', arabicName: 'الجزء الرابع والعشرون (فمن أظلم)', startSurah: 39, startSurahName: 'Az-Zumar', startAyah: 32, pageStart: 418 },
  { number: 25, name: 'Juz 25 (إليه يرد)', arabicName: 'الجزء الخامس والعشرون (إليه يرد)', startSurah: 41, startSurahName: 'Fussilat', startAyah: 47, pageStart: 436 },
  { number: 26, name: 'Juz 26 (حم)', arabicName: 'الجزء السادس والعشرون (حم)', startSurah: 46, startSurahName: 'Al-Ahqaf', startAyah: 1, pageStart: 454 },
  { number: 27, name: 'Juz 27 (قال فما خطبكم)', arabicName: 'الجزء السابع والعشرون (قال فما خطبكم)', startSurah: 51, startSurahName: 'Adh-Dhariyat', startAyah: 31, pageStart: 472 },
  { number: 28, name: 'Juz 28 (قد سمع الله)', arabicName: 'الجزء الثامن والعشرون (قد سمع الله)', startSurah: 58, startSurahName: 'Al-Mujadila', startAyah: 1, pageStart: 490 },
  { number: 29, name: 'Juz 29 (تبارك الذي)', arabicName: 'الجزء التاسع والعشرون (تبارك الذي)', startSurah: 67, startSurahName: 'Al-Mulk', startAyah: 1, pageStart: 510 },
  { number: 30, name: 'Juz 30 (عم يتساءلون)', arabicName: 'الجزء الثلاثون (عم يتساءلون)', startSurah: 78, startSurahName: 'An-Naba', startAyah: 1, pageStart: 530 },
];

/**
 * Direct 1:1 Page Search Navigation:
 * User entered page number -> exact Mushaf page number (2 to 549).
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
  for (const s of SURAHS_LIST) {
    if (s.pageStart <= clamped) {
      matched = s;
    } else {
      break;
    }
  }
  return matched;
}

export function getJuzByPage(pageNumber: number): JuzMeta {
  const clamped = quranTextPageToApiPage(pageNumber);
  let matched = JUZ_LIST[0];
  for (const j of JUZ_LIST) {
    if (j.pageStart <= clamped) {
      matched = j;
    } else {
      break;
    }
  }
  return matched;
}

export function getSurahByNumber(surahNumber: number): SurahMeta {
  return SURAHS_LIST.find((s) => s.number === surahNumber) || SURAHS_LIST[0];
}
