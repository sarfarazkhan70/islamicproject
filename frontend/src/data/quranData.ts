/**
 * Quran Static Metadata and Registries
 * Fully aligned with Quran.com API v4 standard
 * Mushaf PDF Mapping for Zia-ul-Quran / Subcontinent 9-Line Mushaf (1094 Printed Quran Pages, 1124 Physical PDF Pages with 30 Para Covers)
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
    "id": "indopak",
    "label": "IndoPak (Subcontinent)",
    "sublabel": "Classic Nastaleeq / South Asian Mushaf",
    "fontFamily": "'Noorehuda', 'Urdu Typesetting', 'PakType Tehreer', 'Jameel Noori Nastaleeq', serif",
    "sample": "بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ"
  },
  {
    "id": "uthmani",
    "label": "Uthmani (Madani)",
    "sublabel": "Standard King Fahd Complex Madinah Mushaf",
    "fontFamily": "'KFGQPC Uthmanic Script HAFS', 'Scheherazade New', 'Amiri', serif",
    "sample": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
  },
  {
    "id": "uthmani_tajweed",
    "label": "Uthmani Tajweed (Colored)",
    "sublabel": "Color-coded Tajweed pronunciation rules",
    "fontFamily": "'KFGQPC Uthmanic Script HAFS', 'Amiri', serif",
    "sample": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
  },
  {
    "id": "uthmani_simple",
    "label": "Simple Uthmani",
    "sublabel": "Clean Uthmani text with standard vowel marks",
    "fontFamily": "'Amiri', 'Traditional Arabic', serif",
    "sample": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
  },
  {
    "id": "imlaei",
    "label": "Imlaei (Modern)",
    "sublabel": "Modern Arabic orthography",
    "fontFamily": "'Amiri', 'Arial', sans-serif",
    "sample": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
  }
];

export const SUPPORTED_TRANSLATIONS: QuranTranslationOption[] = [
  {
    "id": 234,
    "name": "Fatah Muhammad Jalandhari",
    "author": "Fateh Muhammad Jalandhry",
    "language": "urdu",
    "languageLabel": "اردو (جالندھری)"
  },
  {
    "id": 54,
    "name": "Maulana Muhammad Junagarhi",
    "author": "Maulana Muhammad Junagarhi",
    "language": "urdu",
    "languageLabel": "اردو (جوناگڑھی)"
  },
  {
    "id": 97,
    "name": "Tafheem-ul-Quran",
    "author": "Syed Abul Ala Maududi",
    "language": "urdu",
    "languageLabel": "اردو (تفہیم القرآن - مودودی)"
  },
  {
    "id": 158,
    "name": "Bayan-ul-Quran",
    "author": "Dr. Israr Ahmad",
    "language": "urdu",
    "languageLabel": "اردو (بیان القرآن - ڈاکٹر اسرار)"
  },
  {
    "id": 831,
    "name": "Roman Urdu (Maududi)",
    "author": "Abul Ala Maududi",
    "language": "roman-urdu",
    "languageLabel": "Roman Urdu (Aasan)"
  },
  {
    "id": 20,
    "name": "Saheeh International",
    "author": "Saheeh International",
    "language": "english",
    "languageLabel": "English (Saheeh Int.)"
  },
  {
    "id": 85,
    "name": "M.A.S. Abdel Haleem",
    "author": "Oxford University Press",
    "language": "english",
    "languageLabel": "English (Abdel Haleem)"
  },
  {
    "id": 84,
    "name": "Mufti Taqi Usmani",
    "author": "Mufti Muhammad Taqi Usmani",
    "language": "english",
    "languageLabel": "English (Taqi Usmani)"
  },
  {
    "id": 22,
    "name": "Abdullah Yusuf Ali",
    "author": "A. Yusuf Ali",
    "language": "english",
    "languageLabel": "English (Yusuf Ali)"
  },
  {
    "id": 122,
    "name": "Maulana Azizul Haque al-Umari",
    "author": "Azizul Haque al-Umari",
    "language": "hindi",
    "languageLabel": "हिन्दी (अज़ीज़ुल हक़ अल-उमरी)"
  }
];

export const QURAN_COM_RECITERS: QuranReciterOption[] = [
  {
    "id": 7,
    "name": "Sheikh Mishary Rashid Alafasy",
    "style": "Murattal (Clear & Melodic)",
    "reciterSlug": "Alafasy"
  },
  {
    "id": 2,
    "name": "Sheikh AbdulBaset AbdulSamad",
    "style": "Murattal (Classic Egyptian)",
    "reciterSlug": "AbdulBaset/Murattal"
  },
  {
    "id": 1,
    "name": "Sheikh AbdulBaset AbdulSamad",
    "style": "Mujawwad (Masterful Tajweed)",
    "reciterSlug": "AbdulBaset/Mujawwad"
  },
  {
    "id": 6,
    "name": "Sheikh Mahmoud Khalil Al-Husary",
    "style": "Murattal (Authoritative)",
    "reciterSlug": "Husary"
  },
  {
    "id": 12,
    "name": "Sheikh Mahmoud Khalil Al-Husary",
    "style": "Muallim (Teacher Style)",
    "reciterSlug": "Husary/Muallim"
  },
  {
    "id": 3,
    "name": "Sheikh Abdur-Rahman as-Sudais",
    "style": "Imam of Masjid al-Haram, Makkah",
    "reciterSlug": "Sudais"
  },
  {
    "id": 9,
    "name": "Sheikh Mohamed Siddiq al-Minshawi",
    "style": "Murattal (Deep & Soulful)",
    "reciterSlug": "Minshawi/Murattal"
  },
  {
    "id": 8,
    "name": "Sheikh Mohamed Siddiq al-Minshawi",
    "style": "Mujawwad (Classical Egyptian)",
    "reciterSlug": "Minshawi/Mujawwad"
  },
  {
    "id": 4,
    "name": "Sheikh Abu Bakr al-Shatri",
    "style": "Murattal",
    "reciterSlug": "Shatri"
  },
  {
    "id": 5,
    "name": "Sheikh Hani ar-Rifai",
    "style": "Emotional & Moving",
    "reciterSlug": "Rifai"
  },
  {
    "id": 10,
    "name": "Sheikh Sa`ud ash-Shuraym",
    "style": "Imam of Masjid al-Haram, Makkah",
    "reciterSlug": "Shuraym"
  }
];

// Complete 114 Surahs Directory with exact printed Quran page starts (1 to 1094)
export const SURAHS_LIST: SurahMeta[] = [
  {
    "number": 1,
    "name": "Al-Fatihah",
    "arabicName": "الفاتحة",
    "meaning": "The Opening",
    "versesCount": 7,
    "revelationType": "Meccan",
    "juzStart": 1,
    "pageStart": 1
  },
  {
    "number": 2,
    "name": "Al-Baqarah",
    "arabicName": "البقرة",
    "meaning": "The Cow",
    "versesCount": 286,
    "revelationType": "Medinan",
    "juzStart": 1,
    "pageStart": 2
  },
  {
    "number": 3,
    "name": "Ali 'Imran",
    "arabicName": "آل عمران",
    "meaning": "Family of Imran",
    "versesCount": 200,
    "revelationType": "Medinan",
    "juzStart": 3,
    "pageStart": 89
  },
  {
    "number": 4,
    "name": "An-Nisa",
    "arabicName": "النساء",
    "meaning": "The Women",
    "versesCount": 176,
    "revelationType": "Medinan",
    "juzStart": 4,
    "pageStart": 140
  },
  {
    "number": 5,
    "name": "Al-Ma'idah",
    "arabicName": "المائدة",
    "meaning": "The Table Spread",
    "versesCount": 120,
    "revelationType": "Medinan",
    "juzStart": 6,
    "pageStart": 189
  },
  {
    "number": 6,
    "name": "Al-An'am",
    "arabicName": "الأنعام",
    "meaning": "The Cattle",
    "versesCount": 165,
    "revelationType": "Meccan",
    "juzStart": 7,
    "pageStart": 232
  },
  {
    "number": 7,
    "name": "Al-A'raf",
    "arabicName": "الأعراف",
    "meaning": "The Heights",
    "versesCount": 206,
    "revelationType": "Meccan",
    "juzStart": 8,
    "pageStart": 272
  },
  {
    "number": 8,
    "name": "Al-Anfal",
    "arabicName": "الأنفال",
    "meaning": "The Spoils of War",
    "versesCount": 75,
    "revelationType": "Medinan",
    "juzStart": 9,
    "pageStart": 319
  },
  {
    "number": 9,
    "name": "At-Tawbah",
    "arabicName": "التوبة",
    "meaning": "The Repentance",
    "versesCount": 129,
    "revelationType": "Medinan",
    "juzStart": 10,
    "pageStart": 337
  },
  {
    "number": 10,
    "name": "Yunus",
    "arabicName": "يونس",
    "meaning": "Jonah",
    "versesCount": 109,
    "revelationType": "Meccan",
    "juzStart": 11,
    "pageStart": 375
  },
  {
    "number": 11,
    "name": "Hud",
    "arabicName": "هود",
    "meaning": "Hud",
    "versesCount": 123,
    "revelationType": "Meccan",
    "juzStart": 11,
    "pageStart": 398
  },
  {
    "number": 12,
    "name": "Yusuf",
    "arabicName": "يوسف",
    "meaning": "Joseph",
    "versesCount": 111,
    "revelationType": "Meccan",
    "juzStart": 12,
    "pageStart": 424
  },
  {
    "number": 13,
    "name": "Ar-Ra'd",
    "arabicName": "الرعد",
    "meaning": "The Thunder",
    "versesCount": 43,
    "revelationType": "Medinan",
    "juzStart": 13,
    "pageStart": 449
  },
  {
    "number": 14,
    "name": "Ibrahim",
    "arabicName": "إبراهيم",
    "meaning": "Abraham",
    "versesCount": 52,
    "revelationType": "Meccan",
    "juzStart": 13,
    "pageStart": 460
  },
  {
    "number": 15,
    "name": "Al-Hijr",
    "arabicName": "الحجر",
    "meaning": "The Rocky Tract",
    "versesCount": 99,
    "revelationType": "Meccan",
    "juzStart": 14,
    "pageStart": 470
  },
  {
    "number": 16,
    "name": "An-Nahl",
    "arabicName": "النحل",
    "meaning": "The Bee",
    "versesCount": 128,
    "revelationType": "Meccan",
    "juzStart": 14,
    "pageStart": 481
  },
  {
    "number": 17,
    "name": "Al-Isra",
    "arabicName": "الإسراء",
    "meaning": "The Night Journey",
    "versesCount": 111,
    "revelationType": "Meccan",
    "juzStart": 15,
    "pageStart": 507
  },
  {
    "number": 18,
    "name": "Al-Kahf",
    "arabicName": "الكهف",
    "meaning": "The Cave",
    "versesCount": 110,
    "revelationType": "Meccan",
    "juzStart": 15,
    "pageStart": 526
  },
  {
    "number": 19,
    "name": "Maryam",
    "arabicName": "مريم",
    "meaning": "Mary",
    "versesCount": 98,
    "revelationType": "Meccan",
    "juzStart": 16,
    "pageStart": 547
  },
  {
    "number": 20,
    "name": "Taha",
    "arabicName": "طه",
    "meaning": "Ta-Ha",
    "versesCount": 135,
    "revelationType": "Meccan",
    "juzStart": 16,
    "pageStart": 560
  },
  {
    "number": 21,
    "name": "Al-Anbiya",
    "arabicName": "الأنبياء",
    "meaning": "The Prophets",
    "versesCount": 112,
    "revelationType": "Meccan",
    "juzStart": 17,
    "pageStart": 579
  },
  {
    "number": 22,
    "name": "Al-Hajj",
    "arabicName": "الحج",
    "meaning": "The Pilgrimage",
    "versesCount": 78,
    "revelationType": "Medinan",
    "juzStart": 17,
    "pageStart": 596
  },
  {
    "number": 23,
    "name": "Al-Mu'minun",
    "arabicName": "المؤمنون",
    "meaning": "The Believers",
    "versesCount": 118,
    "revelationType": "Meccan",
    "juzStart": 18,
    "pageStart": 614
  },
  {
    "number": 24,
    "name": "An-Nur",
    "arabicName": "النور",
    "meaning": "The Light",
    "versesCount": 64,
    "revelationType": "Medinan",
    "juzStart": 18,
    "pageStart": 630
  },
  {
    "number": 25,
    "name": "Al-Furqan",
    "arabicName": "الفرقان",
    "meaning": "The Criterion",
    "versesCount": 77,
    "revelationType": "Meccan",
    "juzStart": 18,
    "pageStart": 645
  },
  {
    "number": 26,
    "name": "Ash-Shu'ara",
    "arabicName": "الشعراء",
    "meaning": "The Poets",
    "versesCount": 227,
    "revelationType": "Meccan",
    "juzStart": 19,
    "pageStart": 658
  },
  {
    "number": 27,
    "name": "An-Naml",
    "arabicName": "النمل",
    "meaning": "The Ant",
    "versesCount": 93,
    "revelationType": "Meccan",
    "juzStart": 19,
    "pageStart": 677
  },
  {
    "number": 28,
    "name": "Al-Qasas",
    "arabicName": "القصص",
    "meaning": "The Stories",
    "versesCount": 88,
    "revelationType": "Meccan",
    "juzStart": 20,
    "pageStart": 691
  },
  {
    "number": 29,
    "name": "Al-'Ankabut",
    "arabicName": "العنكبوت",
    "meaning": "The Spider",
    "versesCount": 69,
    "revelationType": "Meccan",
    "juzStart": 20,
    "pageStart": 712
  },
  {
    "number": 30,
    "name": "Ar-Rum",
    "arabicName": "الروم",
    "meaning": "The Romans",
    "versesCount": 60,
    "revelationType": "Meccan",
    "juzStart": 21,
    "pageStart": 725
  },
  {
    "number": 31,
    "name": "Luqman",
    "arabicName": "لقمان",
    "meaning": "Luqman",
    "versesCount": 34,
    "revelationType": "Meccan",
    "juzStart": 21,
    "pageStart": 738
  },
  {
    "number": 32,
    "name": "As-Sajdah",
    "arabicName": "السجدة",
    "meaning": "The Prostration",
    "versesCount": 30,
    "revelationType": "Meccan",
    "juzStart": 21,
    "pageStart": 744
  },
  {
    "number": 33,
    "name": "Al-Ahzab",
    "arabicName": "الأحزاب",
    "meaning": "The Combined Forces",
    "versesCount": 73,
    "revelationType": "Medinan",
    "juzStart": 21,
    "pageStart": 750
  },
  {
    "number": 34,
    "name": "Saba",
    "arabicName": "سبأ",
    "meaning": "Sheba",
    "versesCount": 54,
    "revelationType": "Meccan",
    "juzStart": 22,
    "pageStart": 767
  },
  {
    "number": 35,
    "name": "Fatir",
    "arabicName": "فاطر",
    "meaning": "The Originator",
    "versesCount": 45,
    "revelationType": "Meccan",
    "juzStart": 22,
    "pageStart": 778
  },
  {
    "number": 36,
    "name": "Ya-Sin",
    "arabicName": "يس",
    "meaning": "Ya-Sin",
    "versesCount": 83,
    "revelationType": "Meccan",
    "juzStart": 22,
    "pageStart": 789
  },
  {
    "number": 37,
    "name": "As-Saffat",
    "arabicName": "الصافات",
    "meaning": "Those Who Set The Ranks",
    "versesCount": 182,
    "revelationType": "Meccan",
    "juzStart": 23,
    "pageStart": 802
  },
  {
    "number": 38,
    "name": "Sad",
    "arabicName": "ص",
    "meaning": "Sad",
    "versesCount": 88,
    "revelationType": "Meccan",
    "juzStart": 23,
    "pageStart": 813
  },
  {
    "number": 39,
    "name": "Az-Zumar",
    "arabicName": "الزمر",
    "meaning": "The Troops",
    "versesCount": 75,
    "revelationType": "Meccan",
    "juzStart": 23,
    "pageStart": 822
  },
  {
    "number": 40,
    "name": "Ghafir",
    "arabicName": "غافر",
    "meaning": "The Forgiver",
    "versesCount": 85,
    "revelationType": "Meccan",
    "juzStart": 24,
    "pageStart": 838
  },
  {
    "number": 41,
    "name": "Fussilat",
    "arabicName": "فصلت",
    "meaning": "Explained in Detail",
    "versesCount": 54,
    "revelationType": "Meccan",
    "juzStart": 24,
    "pageStart": 857
  },
  {
    "number": 42,
    "name": "Ash-Shura",
    "arabicName": "الشورى",
    "meaning": "The Consultation",
    "versesCount": 53,
    "revelationType": "Meccan",
    "juzStart": 25,
    "pageStart": 867
  },
  {
    "number": 43,
    "name": "Az-Zukhruf",
    "arabicName": "الزخرف",
    "meaning": "The Ornaments of Gold",
    "versesCount": 89,
    "revelationType": "Meccan",
    "juzStart": 25,
    "pageStart": 880
  },
  {
    "number": 44,
    "name": "Ad-Dukhan",
    "arabicName": "الدخان",
    "meaning": "The Smoke",
    "versesCount": 59,
    "revelationType": "Meccan",
    "juzStart": 25,
    "pageStart": 892
  },
  {
    "number": 45,
    "name": "Al-Jathiyah",
    "arabicName": "الجاثية",
    "meaning": "The Crouching",
    "versesCount": 37,
    "revelationType": "Meccan",
    "juzStart": 25,
    "pageStart": 898
  },
  {
    "number": 46,
    "name": "Al-Ahqaf",
    "arabicName": "الأحقاف",
    "meaning": "The Wind-Curved Sandhills",
    "versesCount": 35,
    "revelationType": "Meccan",
    "juzStart": 26,
    "pageStart": 903
  },
  {
    "number": 47,
    "name": "Muhammad",
    "arabicName": "محمد",
    "meaning": "Muhammad",
    "versesCount": 38,
    "revelationType": "Medinan",
    "juzStart": 26,
    "pageStart": 913
  },
  {
    "number": 48,
    "name": "Al-Fath",
    "arabicName": "الفتح",
    "meaning": "The Victory",
    "versesCount": 29,
    "revelationType": "Medinan",
    "juzStart": 26,
    "pageStart": 919
  },
  {
    "number": 49,
    "name": "Al-Hujurat",
    "arabicName": "الحجرات",
    "meaning": "The Rooms",
    "versesCount": 18,
    "revelationType": "Medinan",
    "juzStart": 26,
    "pageStart": 927
  },
  {
    "number": 50,
    "name": "Qaf",
    "arabicName": "ق",
    "meaning": "Qaf",
    "versesCount": 45,
    "revelationType": "Meccan",
    "juzStart": 26,
    "pageStart": 934
  },
  {
    "number": 51,
    "name": "Adh-Dhariyat",
    "arabicName": "الذاريات",
    "meaning": "The Winnowing Winds",
    "versesCount": 60,
    "revelationType": "Meccan",
    "juzStart": 26,
    "pageStart": 939
  },
  {
    "number": 52,
    "name": "At-Tur",
    "arabicName": "الطور",
    "meaning": "The Mount",
    "versesCount": 49,
    "revelationType": "Meccan",
    "juzStart": 27,
    "pageStart": 943
  },
  {
    "number": 53,
    "name": "An-Najm",
    "arabicName": "النجم",
    "meaning": "The Star",
    "versesCount": 62,
    "revelationType": "Meccan",
    "juzStart": 27,
    "pageStart": 950
  },
  {
    "number": 54,
    "name": "Al-Qamar",
    "arabicName": "القمر",
    "meaning": "The Moon",
    "versesCount": 55,
    "revelationType": "Meccan",
    "juzStart": 27,
    "pageStart": 952
  },
  {
    "number": 55,
    "name": "Ar-Rahman",
    "arabicName": "الرحمن",
    "meaning": "The Beneficent",
    "versesCount": 78,
    "revelationType": "Medinan",
    "juzStart": 27,
    "pageStart": 958
  },
  {
    "number": 56,
    "name": "Al-Waqi'ah",
    "arabicName": "الواقعة",
    "meaning": "The Inevitable",
    "versesCount": 96,
    "revelationType": "Meccan",
    "juzStart": 27,
    "pageStart": 965
  },
  {
    "number": 57,
    "name": "Al-Hadid",
    "arabicName": "الحديد",
    "meaning": "The Iron",
    "versesCount": 29,
    "revelationType": "Medinan",
    "juzStart": 27,
    "pageStart": 969
  },
  {
    "number": 58,
    "name": "Al-Mujadila",
    "arabicName": "المجادلة",
    "meaning": "The Pleading Woman",
    "versesCount": 22,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 975
  },
  {
    "number": 59,
    "name": "Al-Hashr",
    "arabicName": "الحشر",
    "meaning": "The Exile",
    "versesCount": 24,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 981
  },
  {
    "number": 60,
    "name": "Al-Mumtahanah",
    "arabicName": "الممتحنة",
    "meaning": "The Examined One",
    "versesCount": 13,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 989
  },
  {
    "number": 61,
    "name": "As-Saff",
    "arabicName": "الصف",
    "meaning": "The Ranks",
    "versesCount": 14,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 993
  },
  {
    "number": 62,
    "name": "Al-Jumu'ah",
    "arabicName": "الجمعة",
    "meaning": "Friday",
    "versesCount": 11,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 996
  },
  {
    "number": 63,
    "name": "Al-Munafiqun",
    "arabicName": "المنافقون",
    "meaning": "The Hypocrites",
    "versesCount": 11,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 997
  },
  {
    "number": 64,
    "name": "At-Taghabun",
    "arabicName": "التغابن",
    "meaning": "Mutual Disillusion",
    "versesCount": 18,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 1000
  },
  {
    "number": 65,
    "name": "At-Talaq",
    "arabicName": "الطلاق",
    "meaning": "The Divorce",
    "versesCount": 12,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 1004
  },
  {
    "number": 66,
    "name": "At-Tahrim",
    "arabicName": "التحريم",
    "meaning": "The Prohibition",
    "versesCount": 12,
    "revelationType": "Medinan",
    "juzStart": 28,
    "pageStart": 1006
  },
  {
    "number": 67,
    "name": "Al-Mulk",
    "arabicName": "الملك",
    "meaning": "The Sovereignty",
    "versesCount": 30,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1015
  },
  {
    "number": 68,
    "name": "Al-Qalam",
    "arabicName": "القلم",
    "meaning": "The Pen",
    "versesCount": 52,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1019
  },
  {
    "number": 69,
    "name": "Al-Haqqah",
    "arabicName": "الحاقة",
    "meaning": "The Inevitable Truth",
    "versesCount": 52,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1022
  },
  {
    "number": 70,
    "name": "Al-Ma'arij",
    "arabicName": "المعارج",
    "meaning": "The Ascending Stairways",
    "versesCount": 44,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1024
  },
  {
    "number": 71,
    "name": "Nuh",
    "arabicName": "نوح",
    "meaning": "Noah",
    "versesCount": 28,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1030
  },
  {
    "number": 72,
    "name": "Al-Jinn",
    "arabicName": "الجن",
    "meaning": "The Jinn",
    "versesCount": 28,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1033
  },
  {
    "number": 73,
    "name": "Al-Muzzammil",
    "arabicName": "المزمل",
    "meaning": "The Enshrouded One",
    "versesCount": 20,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1035
  },
  {
    "number": 74,
    "name": "Al-Muddaththir",
    "arabicName": "المدثر",
    "meaning": "The Cloaked One",
    "versesCount": 56,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1039
  },
  {
    "number": 75,
    "name": "Al-Qiyamah",
    "arabicName": "القيامة",
    "meaning": "The Resurrection",
    "versesCount": 40,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1043
  },
  {
    "number": 76,
    "name": "Al-Insan",
    "arabicName": "الإنسان",
    "meaning": "Man",
    "versesCount": 31,
    "revelationType": "Medinan",
    "juzStart": 29,
    "pageStart": 1048
  },
  {
    "number": 77,
    "name": "Al-Mursalat",
    "arabicName": "المرسلات",
    "meaning": "The Emissaries",
    "versesCount": 50,
    "revelationType": "Meccan",
    "juzStart": 29,
    "pageStart": 1052
  },
  {
    "number": 78,
    "name": "An-Naba",
    "arabicName": "النبأ",
    "meaning": "The Great News",
    "versesCount": 40,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1055
  },
  {
    "number": 79,
    "name": "An-Nazi'at",
    "arabicName": "النازعات",
    "meaning": "Those Who Drag Forth",
    "versesCount": 46,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1058
  },
  {
    "number": 80,
    "name": "'Abasa",
    "arabicName": "عبس",
    "meaning": "He Frowned",
    "versesCount": 42,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1060
  },
  {
    "number": 81,
    "name": "At-Takwir",
    "arabicName": "التكوير",
    "meaning": "The Overthrowing",
    "versesCount": 29,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1062
  },
  {
    "number": 82,
    "name": "Al-Infitar",
    "arabicName": "الانفطار",
    "meaning": "The Cleaving",
    "versesCount": 19,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1064
  },
  {
    "number": 83,
    "name": "Al-Mutaffifin",
    "arabicName": "المطففين",
    "meaning": "Those Who Deal in Fraud",
    "versesCount": 36,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1069
  },
  {
    "number": 84,
    "name": "Al-Inshiqaq",
    "arabicName": "الانشقاق",
    "meaning": "The Splitting Asunder",
    "versesCount": 25,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1069
  },
  {
    "number": 85,
    "name": "Al-Buruj",
    "arabicName": "البروج",
    "meaning": "The Mansions of the Stars",
    "versesCount": 22,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1071
  },
  {
    "number": 86,
    "name": "At-Tariq",
    "arabicName": "الطارق",
    "meaning": "The Nightcomer",
    "versesCount": 17,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1071
  },
  {
    "number": 87,
    "name": "Al-A'la",
    "arabicName": "الأعلى",
    "meaning": "The Most High",
    "versesCount": 19,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1076
  },
  {
    "number": 88,
    "name": "Al-Ghashiyah",
    "arabicName": "الغاشية",
    "meaning": "The Overwhelming Event",
    "versesCount": 26,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1076
  },
  {
    "number": 89,
    "name": "Al-Fajr",
    "arabicName": "الفجر",
    "meaning": "The Dawn",
    "versesCount": 30,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1079
  },
  {
    "number": 90,
    "name": "Al-Balad",
    "arabicName": "البلد",
    "meaning": "The City",
    "versesCount": 20,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1082
  },
  {
    "number": 91,
    "name": "Ash-Shams",
    "arabicName": "الشمس",
    "meaning": "The Sun",
    "versesCount": 15,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1082
  },
  {
    "number": 92,
    "name": "Al-Layl",
    "arabicName": "الليل",
    "meaning": "The Night",
    "versesCount": 21,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1082
  },
  {
    "number": 93,
    "name": "Ad-Duha",
    "arabicName": "الضحى",
    "meaning": "The Morning Hours",
    "versesCount": 11,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1085
  },
  {
    "number": 94,
    "name": "Ash-Sharh",
    "arabicName": "الشرح",
    "meaning": "The Relief",
    "versesCount": 8,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1085
  },
  {
    "number": 95,
    "name": "At-Tin",
    "arabicName": "التين",
    "meaning": "The Fig",
    "versesCount": 8,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1085
  },
  {
    "number": 96,
    "name": "Al-'Alaq",
    "arabicName": "العلق",
    "meaning": "The Clot",
    "versesCount": 19,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1088
  },
  {
    "number": 97,
    "name": "Al-Qadr",
    "arabicName": "القدر",
    "meaning": "The Power",
    "versesCount": 5,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1088
  },
  {
    "number": 98,
    "name": "Al-Bayyinah",
    "arabicName": "البينة",
    "meaning": "The Clear Proof",
    "versesCount": 8,
    "revelationType": "Medinan",
    "juzStart": 30,
    "pageStart": 1088
  },
  {
    "number": 99,
    "name": "Az-Zalzalah",
    "arabicName": "الزلزلة",
    "meaning": "The Earthquake",
    "versesCount": 8,
    "revelationType": "Medinan",
    "juzStart": 30,
    "pageStart": 1088
  },
  {
    "number": 100,
    "name": "Al-'Adiyat",
    "arabicName": "العاديات",
    "meaning": "The Courser",
    "versesCount": 11,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1089
  },
  {
    "number": 101,
    "name": "Al-Qari'ah",
    "arabicName": "القارعة",
    "meaning": "The Calamity",
    "versesCount": 11,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1089
  },
  {
    "number": 102,
    "name": "At-Takathur",
    "arabicName": "التكاثر",
    "meaning": "The Rivalry in World Increase",
    "versesCount": 8,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1090
  },
  {
    "number": 103,
    "name": "Al-'Asr",
    "arabicName": "العصر",
    "meaning": "The Declining Day",
    "versesCount": 3,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1090
  },
  {
    "number": 104,
    "name": "Al-Humazah",
    "arabicName": "الهمزة",
    "meaning": "The Traducer",
    "versesCount": 9,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1091
  },
  {
    "number": 105,
    "name": "Al-Fil",
    "arabicName": "الفيل",
    "meaning": "The Elephant",
    "versesCount": 5,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1091
  },
  {
    "number": 106,
    "name": "Quraysh",
    "arabicName": "قريش",
    "meaning": "Quraysh",
    "versesCount": 4,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1091
  },
  {
    "number": 107,
    "name": "Al-Ma'un",
    "arabicName": "الماعون",
    "meaning": "The Small Kindness",
    "versesCount": 7,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1093
  },
  {
    "number": 108,
    "name": "Al-Kawthar",
    "arabicName": "الکوثر",
    "meaning": "The Abundance",
    "versesCount": 3,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1093
  },
  {
    "number": 109,
    "name": "Al-Kafirun",
    "arabicName": "الكافرون",
    "meaning": "The Disbelievers",
    "versesCount": 6,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1093
  },
  {
    "number": 110,
    "name": "An-Nasr",
    "arabicName": "النصر",
    "meaning": "The Divine Support",
    "versesCount": 3,
    "revelationType": "Medinan",
    "juzStart": 30,
    "pageStart": 1093
  },
  {
    "number": 111,
    "name": "Al-Masad",
    "arabicName": "المسد",
    "meaning": "The Palm Fiber",
    "versesCount": 5,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1093
  },
  {
    "number": 112,
    "name": "Al-Ikhlas",
    "arabicName": "الإخلاص",
    "meaning": "The Sincerity",
    "versesCount": 4,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1093
  },
  {
    "number": 113,
    "name": "Al-Falaq",
    "arabicName": "الفلق",
    "meaning": "The Daybreak",
    "versesCount": 5,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1093
  },
  {
    "number": 114,
    "name": "An-Nas",
    "arabicName": "الناس",
    "meaning": "Mankind",
    "versesCount": 6,
    "revelationType": "Meccan",
    "juzStart": 30,
    "pageStart": 1093
  }
];

// 30 Paras / Juz Directory with exact printed Quran page starts (1 to 1094)
export const JUZ_LIST: JuzMeta[] = [
  {
    "number": 1,
    "name": "Juz 1 (الم)",
    "arabicName": "الجزء الأول (الم)",
    "startSurah": 1,
    "startSurahName": "Al-Fatihah",
    "startAyah": 1,
    "pageStart": 1
  },
  {
    "number": 2,
    "name": "Juz 2 (سیقول)",
    "arabicName": "الجزء الثاني (سیقول)",
    "startSurah": 2,
    "startSurahName": "Al-Baqarah",
    "startAyah": 142,
    "pageStart": 39
  },
  {
    "number": 3,
    "name": "Juz 3 (تلك الرسل)",
    "arabicName": "الجزء الثالث (تلك الرسل)",
    "startSurah": 2,
    "startSurahName": "Al-Baqarah",
    "startAyah": 253,
    "pageStart": 75
  },
  {
    "number": 4,
    "name": "Juz 4 (لن تنالوا)",
    "arabicName": "الجزء الرابع (لن تنالوا)",
    "startSurah": 3,
    "startSurahName": "Ali 'Imran",
    "startAyah": 93,
    "pageStart": 111
  },
  {
    "number": 5,
    "name": "Juz 5 (والمحصنات)",
    "arabicName": "الجزء الخامس (والمحصنات)",
    "startSurah": 4,
    "startSurahName": "An-Nisa",
    "startAyah": 24,
    "pageStart": 147
  },
  {
    "number": 6,
    "name": "Juz 6 (لا يحب الله)",
    "arabicName": "الجزء السادس (لا يحب الله)",
    "startSurah": 4,
    "startSurahName": "An-Nisa",
    "startAyah": 148,
    "pageStart": 183
  },
  {
    "number": 7,
    "name": "Juz 7 (وإذا سمعوا)",
    "arabicName": "الجزء السابع (وإذا سمعوا)",
    "startSurah": 5,
    "startSurahName": "Al-Ma'idah",
    "startAyah": 82,
    "pageStart": 219
  },
  {
    "number": 8,
    "name": "Juz 8 (ولو أننا)",
    "arabicName": "الجزء الثامن (ولو أننا)",
    "startSurah": 6,
    "startSurahName": "Al-An'am",
    "startAyah": 111,
    "pageStart": 255
  },
  {
    "number": 9,
    "name": "Juz 9 (قال الملأ)",
    "arabicName": "الجزء التاسع (قال الملأ)",
    "startSurah": 7,
    "startSurahName": "Al-A'raf",
    "startAyah": 88,
    "pageStart": 291
  },
  {
    "number": 10,
    "name": "Juz 10 (واعلموا)",
    "arabicName": "الجزء العاشر (واعلموا)",
    "startSurah": 8,
    "startSurahName": "Al-Anfal",
    "startAyah": 41,
    "pageStart": 327
  },
  {
    "number": 11,
    "name": "Juz 11 (يعتذرون)",
    "arabicName": "الجزء الحادي عشر (يعتذرون)",
    "startSurah": 9,
    "startSurahName": "At-Tawbah",
    "startAyah": 93,
    "pageStart": 363
  },
  {
    "number": 12,
    "name": "Juz 12 (وما من دابة)",
    "arabicName": "الجزء الثاني عشر (وما من دابة)",
    "startSurah": 11,
    "startSurahName": "Hud",
    "startAyah": 6,
    "pageStart": 399
  },
  {
    "number": 13,
    "name": "Juz 13 (وما أبرئ)",
    "arabicName": "الجزء الثالث عشر (وما أبرئ)",
    "startSurah": 12,
    "startSurahName": "Yusuf",
    "startAyah": 53,
    "pageStart": 435
  },
  {
    "number": 14,
    "name": "Juz 14 (ربما)",
    "arabicName": "الجزء الرابع عشر (ربما)",
    "startSurah": 15,
    "startSurahName": "Al-Hijr",
    "startAyah": 1,
    "pageStart": 471
  },
  {
    "number": 15,
    "name": "Juz 15 (سبحان الذي)",
    "arabicName": "الجزء الخامس عشر (سبحان الذي)",
    "startSurah": 17,
    "startSurahName": "Al-Isra",
    "startAyah": 1,
    "pageStart": 507
  },
  {
    "number": 16,
    "name": "Juz 16 (قال ألم)",
    "arabicName": "الجزء السادس عشر (قال ألم)",
    "startSurah": 18,
    "startSurahName": "Al-Kahf",
    "startAyah": 75,
    "pageStart": 543
  },
  {
    "number": 17,
    "name": "Juz 17 (اقترب)",
    "arabicName": "الجزء السابع عشر (اقترب)",
    "startSurah": 21,
    "startSurahName": "Al-Anbiya",
    "startAyah": 1,
    "pageStart": 579
  },
  {
    "number": 18,
    "name": "Juz 18 (قد أفلح)",
    "arabicName": "الجزء الثامن عشر (قد أفلح)",
    "startSurah": 23,
    "startSurahName": "Al-Mu'minun",
    "startAyah": 1,
    "pageStart": 615
  },
  {
    "number": 19,
    "name": "Juz 19 (وقال الذين)",
    "arabicName": "الجزء التاسع عشر (وقال الذين)",
    "startSurah": 25,
    "startSurahName": "Al-Furqan",
    "startAyah": 21,
    "pageStart": 651
  },
  {
    "number": 20,
    "name": "Juz 20 (أمن خلق)",
    "arabicName": "الجزء العشرون (أمن خلق)",
    "startSurah": 27,
    "startSurahName": "An-Naml",
    "startAyah": 56,
    "pageStart": 687
  },
  {
    "number": 21,
    "name": "Juz 21 (اتل ما أوحي)",
    "arabicName": "الجزء الحادي والعشرون (اتل ما أوحي)",
    "startSurah": 29,
    "startSurahName": "Al-'Ankabut",
    "startAyah": 46,
    "pageStart": 723
  },
  {
    "number": 22,
    "name": "Juz 22 (ومن يقنت)",
    "arabicName": "الجزء الثاني والعشرون (ومن يقنت)",
    "startSurah": 33,
    "startSurahName": "Al-Ahzab",
    "startAyah": 31,
    "pageStart": 759
  },
  {
    "number": 23,
    "name": "Juz 23 (وما أنزلنا)",
    "arabicName": "الجزء الثالث والعشرون (وما أنزلنا)",
    "startSurah": 36,
    "startSurahName": "Ya-Sin",
    "startAyah": 28,
    "pageStart": 795
  },
  {
    "number": 24,
    "name": "Juz 24 (فمن أظلم)",
    "arabicName": "الجزء الرابع والعشرون (فمن أظلم)",
    "startSurah": 39,
    "startSurahName": "Az-Zumar",
    "startAyah": 32,
    "pageStart": 831
  },
  {
    "number": 25,
    "name": "Juz 25 (إليه يرد)",
    "arabicName": "الجزء الخامس والعشرون (إليه يرد)",
    "startSurah": 41,
    "startSurahName": "Fussilat",
    "startAyah": 47,
    "pageStart": 867
  },
  {
    "number": 26,
    "name": "Juz 26 (حم)",
    "arabicName": "الجزء السادس والعشرون (حم)",
    "startSurah": 46,
    "startSurahName": "Al-Ahqaf",
    "startAyah": 1,
    "pageStart": 903
  },
  {
    "number": 27,
    "name": "Juz 27 (قال فما خطبكم)",
    "arabicName": "الجزء السابع والعشرون (قال فما خطبكم)",
    "startSurah": 51,
    "startSurahName": "Adh-Dhariyat",
    "startAyah": 31,
    "pageStart": 939
  },
  {
    "number": 28,
    "name": "Juz 28 (قد سمع الله)",
    "arabicName": "الجزء الثامن والعشرون (قد سمع الله)",
    "startSurah": 58,
    "startSurahName": "Al-Mujadila",
    "startAyah": 1,
    "pageStart": 975
  },
  {
    "number": 29,
    "name": "Juz 29 (تبارك الذي)",
    "arabicName": "الجزء التاسع والعشرون (تبارك الذي)",
    "startSurah": 67,
    "startSurahName": "Al-Mulk",
    "startAyah": 1,
    "pageStart": 1015
  },
  {
    "number": 30,
    "name": "Juz 30 (عم يتساءلون)",
    "arabicName": "الجزء الثلاثون (عم يتساءلون)",
    "startSurah": 78,
    "startSurahName": "An-Naba",
    "startAyah": 1,
    "pageStart": 1055
  }
];

export const TOTAL_MUSHAF_PDF_PAGES = 1094;
export const PDF_PHYSICAL_TOTAL_PAGES = 1124;
export const QURAN_PDF_PATH = '/quran/quran.pdf';

// 30 Para Green Cover Physical PDF Pages
export const PARA_COVER_PDF_PAGES = [
  1, 40, 77, 114, 151, 188, 225, 262, 299, 336,
  373, 410, 447, 484, 521, 558, 595, 632, 669, 706,
  743, 780, 817, 854, 891, 928, 965, 1002, 1043, 1084
];

/**
 * Convert Printed Quran Page Number (1 to 1094) into Physical PDF Page Number (1 to 1124)
 */
export function quranTextPageToPdfPage(textPageNumber: number): number {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, Math.floor(textPageNumber) || 1));
  let pdfPage = clamped;
  for (const coverPdfPage of PARA_COVER_PDF_PAGES) {
    if (pdfPage >= coverPdfPage) {
      pdfPage++;
    } else {
      break;
    }
  }
  return pdfPage;
}

/**
 * Convert Physical PDF Page Number (1 to 1124) into Printed Quran Page Number (1 to 1094)
 */
export function pdfPageToQuranTextPage(physicalPdfPage: number): number {
  const clamped = Math.max(1, Math.min(PDF_PHYSICAL_TOTAL_PAGES, Math.floor(physicalPdfPage) || 1));
  const precedingCovers = PARA_COVER_PDF_PAGES.filter((c) => c <= clamped).length;
  return Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, clamped - precedingCovers));
}

export function isCoverPage(physicalPdfPage: number): boolean {
  return PARA_COVER_PDF_PAGES.includes(physicalPdfPage);
}

export function getPrintedPageLabel(textPageNumber: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, textPageNumber));
  return `Page ${clamped} / ${TOTAL_MUSHAF_PDF_PAGES}`;
}

export function getMushafPageUrl(pageNumber: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pageNumber));
  const padded = String(clamped).padStart(4, '0');
  return 'https://android.quran.com/data/width_1260/page' + padded + '.png';
}

export function getMushafPageFallbackUrl(pageNumber: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pageNumber));
  const padded = String(clamped).padStart(4, '0');
  return 'https://raw.githubusercontent.com/thetruerevival/quran-images/master/images/page' + padded + '.png';
}

export function getSurahByPage(textPageNumber: number): SurahMeta {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, textPageNumber));
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

export function getJuzByPage(textPageNumber: number): JuzMeta {
  const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, textPageNumber));
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
