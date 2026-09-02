export * from './duaData.js';

export interface AzkarItem {
  id: string;
  category: 'namaz-ke-baad' | 'qurani-duain' | 'morning' | 'evening' | 'after-salah' | 'sleep' | 'protection' | 'general';
  title: string;
  arabic: string;
  reference: string;
  transliteration?: string;
  translation?: string;
  repetitionTarget?: number;
  virtue?: string;
  surahName?: string;
  ayahReference?: string;
}

export interface AzkarCategoryMeta {
  id: string;
  title: string;
  arabicTitle: string;
  description?: string;
  count?: number;
}

export const AZKAR_CATEGORIES: AzkarCategoryMeta[] = [
  {
    id: 'all',
    title: 'All Duas',
    arabicTitle: 'جميع الأدعية',
    description: 'Complete collection of verified Masnoon & Quranic supplications.',
  },
  {
    id: 'namaz-ke-baad',
    title: 'Namaz Ke Baad Ki Dua',
    arabicTitle: 'دعاء ما بعد الصلاة',
    description: 'Masnoon supplication recited after obligatory prayer.',
  },
  {
    id: 'qurani-duain',
    title: '20 Qurani Duain',
    arabicTitle: '٢٠ دعاء قرآني',
    description: '20 Invocations from the Noble Quran with Surah and Ayat references.',
  },
];

export const AZKAR_ITEMS: AzkarItem[] = [
  {
    id: 'dua-namaz-baad-1',
    category: 'namaz-ke-baad',
    title: 'Namaz Ke Baad Ki Dua',
    arabic:
      'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، وَإِلَيْكَ يَرْجِعُ السَّلَامُ، أَدْخِلْنَا دَارَ السَّلَامِ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ، يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، اللَّهُمَّ رَبَّنَا سَمِعْنَا وَأَطَعْنَا، غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ، بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ.',
    reference: 'Namaz ke baad ki Masnoon Dua',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-1',
    category: 'qurani-duain',
    title: 'Rabbana Atina Fid-Dunya',
    arabic:
      'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةًۭ وَفِى ٱلْءَاخِرَةِ حَسَنَةًۭ وَقِنَا عَذَابَ ٱلنَّارِ',
    reference: 'Surah Al-Baqarah — 2:201',
    surahName: 'Surah Al-Baqarah',
    ayahReference: '2:201',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-2',
    category: 'qurani-duain',
    title: 'Rabbana Afrigh Alayna Sabran',
    arabic:
      'رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًۭا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ',
    reference: 'Surah Al-Baqarah — 2:250',
    surahName: 'Surah Al-Baqarah',
    ayahReference: '2:250',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-3',
    category: 'qurani-duain',
    title: "Rabbana La Tu'akhidhna",
    arabic:
      'رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًۭا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ',
    reference: 'Surah Al-Baqarah — 2:286',
    surahName: 'Surah Al-Baqarah',
    ayahReference: '2:286',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-4',
    category: 'qurani-duain',
    title: 'Rabbana La Tuzigh Qulubana',
    arabic:
      'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ',
    reference: 'Surah Aal-e-Imran — 3:8',
    surahName: 'Surah Aal-e-Imran',
    ayahReference: '3:8',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-5',
    category: 'qurani-duain',
    title: 'Rabbana Innana Amanna',
    arabic:
      'رَبَّنَآ إِنَّنَآ ءَامَنَّا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ ٱلنَّارِ',
    reference: 'Surah Aal-e-Imran — 3:16',
    surahName: 'Surah Aal-e-Imran',
    ayahReference: '3:16',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-6',
    category: 'qurani-duain',
    title: 'Rabbana Amanna Bima Anzalta',
    arabic:
      'رَبَّنَآ ءَامَنَّا بِمَآ أَنزَلْتَ وَٱتَّبَعْنَا ٱلرَّسُولَ فَٱكْتُبْنَا مَعَ ٱلشَّٰهِدِينَ',
    reference: 'Surah Aal-e-Imran — 3:53',
    surahName: 'Surah Aal-e-Imran',
    ayahReference: '3:53',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-7',
    category: 'qurani-duain',
    title: 'Rabbana Ighfir Lana',
    arabic:
      'رَبَّنَا ٱغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِىٓ أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَٰفِرِينَ',
    reference: 'Surah Aal-e-Imran — 3:147',
    surahName: 'Surah Aal-e-Imran',
    ayahReference: '3:147',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-8',
    category: 'qurani-duain',
    title: 'Rabbana Ma Khalaqta',
    arabic:
      'رَبَّنَا مَا خَلَقْتَ هَٰذَا بَٰطِلًۭا سُبْحَٰنَكَ فَقِنَا عَذَابَ ٱلنَّارِ',
    reference: 'Surah Aal-e-Imran — 3:191',
    surahName: 'Surah Aal-e-Imran',
    ayahReference: '3:191',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-9',
    category: 'qurani-duain',
    title: "Rabbana Innana Sami'na",
    arabic:
      'رَّبَّنَآ إِنَّنَا سَمِعْنَا مُنَادِيًۭا يُنَادِى لِلْإِيمَٰنِ أَنْ ءَامِنُوا۟ بِرَبِّكُمْ فَـَٔامَنَّا ۚ رَبَّنَا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّـَٔاتِنَا وَتَوَفَّنَا مَعَ ٱلْأَبْرَارِ ۦ رَبَّنَا وَءَاتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ ٱلْقِيَٰمَةِ ۗ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ',
    reference: 'Surah Aal-e-Imran — 3:193–194',
    surahName: 'Surah Aal-e-Imran',
    ayahReference: '3:193–194',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-10',
    category: 'qurani-duain',
    title: "Rabbana La Taj'alna",
    arabic:
      'رَبَّنَا لَا تَجْعَلْنَا مَعَ ٱلْقَوْمِ ٱلظَّٰلِمِينَ',
    reference: "Surah Al-A'raf — 7:47",
    surahName: "Surah Al-A'raf",
    ayahReference: '7:47',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-11',
    category: 'qurani-duain',
    title: 'Rabbana Zalamna Anfusana',
    arabic:
      'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَٰسِرِينَ',
    reference: "Surah Al-A'raf — 7:23",
    surahName: "Surah Al-A'raf",
    ayahReference: '7:23',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-12',
    category: 'qurani-duain',
    title: 'Rabbana Afrigh Alayna Sabran',
    arabic:
      'رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًۭا وَتَوَفَّنَا مُسْلِمِينَ',
    reference: "Surah Al-A'raf — 7:126",
    surahName: "Surah Al-A'raf",
    ayahReference: '7:126',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-13',
    category: 'qurani-duain',
    title: 'Rabbana Alayka Tawakkalna',
    arabic:
      'رَّبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ ٱلْمَصِيرُ',
    reference: 'Surah Al-Mumtahanah — 60:4',
    surahName: 'Surah Al-Mumtahanah',
    ayahReference: '60:4',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-14',
    category: 'qurani-duain',
    title: "Rabbana La Taj'alna Fitnatan",
    arabic:
      'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةًۭ لِّلَّذِينَ كَفَرُوا۟ وَٱغْفِرْ لَنَا رَبَّنَآ ۖ إِنَّكَ أَنتَ ٱلْعَزِيزُ ٱلْحَكِيمُ',
    reference: 'Surah Al-Mumtahanah — 60:5',
    surahName: 'Surah Al-Mumtahanah',
    ayahReference: '60:5',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-15',
    category: 'qurani-duain',
    title: 'Rabbana Hab Lana Min Azwajina',
    arabic:
      'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّٰتِنَا قُرَّةَ أَعْيُنٍۢ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    reference: 'Surah Al-Furqan — 25:74',
    surahName: 'Surah Al-Furqan',
    ayahReference: '25:74',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-16',
    category: 'qurani-duain',
    title: 'Rabbana Isrif Anna Adhaba Jahannam',
    arabic:
      'رَبَّنَا ٱصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ ۖ إِنَّ عَذَابَهَا كَانَ غَرَامًا ۦ إِنَّهَا سَآءَتْ مُسْتَقَرًّۭا وَمُقَامًۭا',
    reference: 'Surah Al-Furqan — 25:65–66',
    surahName: 'Surah Al-Furqan',
    ayahReference: '25:65–66',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-17',
    category: 'qurani-duain',
    title: 'Rabbana Atina Min Ladunka',
    arabic:
      'رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةًۭ وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًۭا',
    reference: 'Surah Al-Kahf — 18:10',
    surahName: 'Surah Al-Kahf',
    ayahReference: '18:10',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-18',
    category: 'qurani-duain',
    title: 'Rabbana Ighfir Lana Wa Li Ikhwanina',
    arabic:
      'رَبَّنَا ٱغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ',
    reference: 'Surah Al-Hashr — 59:10',
    surahName: 'Surah Al-Hashr',
    ayahReference: '59:10',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-19',
    category: 'qurani-duain',
    title: 'Rabbana Waghfir Li Walidayya',
    arabic:
      'رَبَّنَا ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ ٱلْحِسَابُ',
    reference: 'Surah Ibrahim — 14:41',
    surahName: 'Surah Ibrahim',
    ayahReference: '14:41',
    repetitionTarget: 1,
  },
  {
    id: 'qurani-dua-20',
    category: 'qurani-duain',
    title: 'Rabbana Wa Adkhilhum Jannati Adn',
    arabic:
      'رَبَّنَا وَأَدْخِلْهُمْ جَنَّٰتِ عَدْنٍ ٱلَّتِى وَعَدتَّهُمْ وَمَن صَلَحَ مِنْ ءَابَآئِهِمْ وَأَزْوَٰجِهِمْ وَذُرِّيَّٰتِهِمْ ۚ إِنَّكَ أَنتَ ٱلْعَزِيزُ ٱلْحَكِيمُ ۦ وَقِهِمُ ٱلسَّيِّـَٔاتِ ۚ وَمَن تَقِ ٱلسَّيِّـَٔاتِ يَوْمَئِذٍۢ فَقَدْ رَحِمْتَهُۥ ۚ وَذَٰلِكَ هُوَ ٱلْفَوْزُ ٱلْعَظِيمُ',
    reference: 'Surah Ghafir — 40:8–9',
    surahName: 'Surah Ghafir',
    ayahReference: '40:8–9',
    repetitionTarget: 1,
  },
];
