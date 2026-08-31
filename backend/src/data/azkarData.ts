export interface AzkarItem {
  id: string;
  category: 'morning' | 'evening' | 'after-salah' | 'sleep' | 'protection' | 'general';
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  repetitionTarget: number;
  virtue?: string;
}

export interface AzkarCategoryMeta {
  id: 'morning' | 'evening' | 'after-salah' | 'sleep' | 'protection' | 'general';
  title: string;
  arabicTitle: string;
  description: string;
}

export const AZKAR_CATEGORIES: AzkarCategoryMeta[] = [
  {
    id: 'morning',
    title: 'Morning Adhkar',
    arabicTitle: 'أذكار الصباح',
    description: 'Supplications recited between Fajr and sunrise for daytime protection and barakah.',
  },
  {
    id: 'evening',
    title: 'Evening Adhkar',
    arabicTitle: 'أذكار المساء',
    description: 'Supplications recited between Asr / Maghrib and Isha for nighttime safety.',
  },
  {
    id: 'after-salah',
    title: 'After Obligatory Salah',
    arabicTitle: 'أذكار بعد الصلاة المفروضة',
    description: 'Prophetic sunnah remembrances recited immediately upon concluding the Fard prayer.',
  },
  {
    id: 'sleep',
    title: 'Before Sleep',
    arabicTitle: 'أذكار النوم',
    description: 'Supplications and Surahs recited upon retiring to bed.',
  },
  {
    id: 'protection',
    title: 'Protection & Ruqyah',
    arabicTitle: 'أذكار الحفظ والتحصين',
    description: 'Ayahs and Duas seeking refuge in Allah against harm, illness, evil eye and grief.',
  },
  {
    id: 'general',
    title: 'Daily Tasbeeh & Istighfar',
    arabicTitle: 'التسبيح والاستغفار اليومي',
    description: 'Continuous remembrance, Istighfar, and Salawat on the Prophet ﷺ throughout the day.',
  },
];

export const AZKAR_ITEMS: AzkarItem[] = [
  // MORNING
  {
    id: 'azkar-m-1',
    category: 'morning',
    title: 'Master Supplication for Forgiveness (Sayyid al-Istighfar)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: 'Allahumma Anta Rabbi la ilaha illa Ant, khalaqtani wa ana \'abduk, wa ana \'ala \'ahdika wa wa\'dika ma-stata\'t, a\'udhu bika min sharri ma sana\'t, abu\'u laka bi ni\'matika \'alayya, wa abu\'u bi dhanbi faghfir li, fa innahu la yaghfiru adh-dhunuba illa Ant.',
    translation: 'O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    reference: 'Sahih al-Bukhari #6306',
    repetitionTarget: 1,
    virtue: 'Whoever recites it in the morning with conviction and dies during that day will be among the people of Paradise.',
  },
  {
    id: 'azkar-m-2',
    category: 'morning',
    title: 'Entrance into the Morning (Asbahna)',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa \'ala kulli shay\'in qadeer.',
    translation: 'We have entered upon the morning and the kingdom belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner; to Him belongs all sovereignty and praise, and He is over all things competent.',
    reference: 'Sahih Muslim #2723',
    repetitionTarget: 1,
  },
  {
    id: 'azkar-m-3',
    category: 'morning',
    title: 'Seeking Health and Well-being (3 Times)',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: 'Allahumma \'afini fi badani, Allahumma \'afini fi sam\'i, Allahumma \'afini fi basari, la ilaha illa Ant.',
    translation: 'O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no deity worthy of worship except You.',
    reference: 'Sunan Abi Dawud #5090 (Hasan)',
    repetitionTarget: 3,
  },
  {
    id: 'azkar-m-4',
    category: 'morning',
    title: 'Protection with the Name of Allah (3 Times)',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ',
    transliteration: 'Bismillahil-ladhi la yadurru ma\'as-mihi shay\'un fil-ardi wa la fis-sama\'i wa Huwas-Sami\'ul-\'Aleem.',
    translation: 'In the name of Allah, with whose name nothing on earth or in the sky can cause harm, and He is the All-Hearing, the All-Knowing.',
    reference: 'Sunan Abi Dawud #5088, At-Tirmidhi #3388',
    repetitionTarget: 3,
    virtue: 'Recited 3 times in the morning and evening protects against all sudden affliction.',
  },

  // EVENING
  {
    id: 'azkar-e-1',
    category: 'evening',
    title: 'Entrance into the Evening (Amsayna)',
    arabic: 'أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa \'ala kulli shay\'in qadeer.',
    translation: 'We have reached the evening and the kingdom belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner; to Him belongs all sovereignty and praise, and He is over all things competent.',
    reference: 'Sahih Muslim #2723',
    repetitionTarget: 1,
  },
  {
    id: 'azkar-e-2',
    category: 'evening',
    title: 'Seeking Refuge from Harmful Creatures (3 Times)',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A\'udhu bi kalimatil-lahit-tammati min sharri ma khalaq.',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    reference: 'Sahih Muslim #2709',
    repetitionTarget: 3,
    virtue: 'Whoever recites it in the evening will not be harmed by poisonous stings or nighttime harm.',
  },
  {
    id: 'azkar-e-3',
    category: 'evening',
    title: 'Praise and Glorification 100 Times',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhanallahi wa bihamdih.',
    translation: 'Glory be to Allah and His is the praise.',
    reference: 'Sahih Muslim #2692',
    repetitionTarget: 100,
    virtue: 'Whoever recites it 100 times a day will have their sins forgiven even if they were like the foam of the sea.',
  },

  // AFTER SALAH
  {
    id: 'azkar-s-1',
    category: 'after-salah',
    title: 'Istighfar and Greeting of Peace',
    arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الجَلَالِ وَالإِكْرَامِ',
    transliteration: 'Astaghfirullah, Astaghfirullah, Astaghfirullah. Allahumma Antas-Salamu wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.',
    translation: 'I ask Allah for forgiveness (3x). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor.',
    reference: 'Sahih Muslim #591',
    repetitionTarget: 1,
  },
  {
    id: 'azkar-s-2',
    category: 'after-salah',
    title: 'Tasbeeh of Fatimah (33x / 33x / 33x + 1x Tahleel)',
    arabic: 'سُبْحَانَ اللَّهِ (٣٣)، الحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٣)، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x), La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa \'ala kulli shay\'in qadeer.',
    translation: 'Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (33x), None has the right to be worshipped except Allah alone, without partner; to Him belongs sovereignty and praise, and He is over all things competent.',
    reference: 'Sahih Muslim #597',
    repetitionTarget: 100,
  },
  {
    id: 'azkar-s-3',
    category: 'after-salah',
    title: 'Ayat al-Kursi (The Greatest Verse)',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الحَيُّ القَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ',
    transliteration: 'Allahu la ilaha illa Huwal-Hayyul-Qayyum, la ta\'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard...',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth...',
    reference: 'Sunan an-Nasa\'i (Al-Kubra #9928, Sahih al-Albani)',
    repetitionTarget: 1,
    virtue: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.',
  },

  // SLEEP
  {
    id: 'azkar-sl-1',
    category: 'sleep',
    title: 'Lying on the Right Side (Bismika Rabbi)',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    transliteration: 'Bismika Rabbi wada\'tu janbi, wa bika arfa\'uh, fa-in amsakta nafsi farhamha, wa in arsaltaha fahfazha bima tahfazu bihi \'ibadakas-salihin.',
    translation: 'In Your name, my Lord, I lay down my side and by You I raise it. If You take my soul, have mercy upon it, and if You release it, protect it as You protect Your righteous servants.',
    reference: 'Sahih al-Bukhari #6320, Sahih Muslim #2714',
    repetitionTarget: 1,
  },
  {
    id: 'azkar-sl-2',
    category: 'sleep',
    title: 'The Mu\'awwidhatayn & Al-Ikhlas (Cupping hands and blowing)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ • قُلْ أَعُوذُ بِرَبِّ الفَلَقِ • قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas',
    translation: 'Recite the three Surahs, blow into cupped hands, and wipe as much of the body as possible, starting with the head and face (3 times).',
    reference: 'Sahih al-Bukhari #5017',
    repetitionTarget: 3,
  },

  // PROTECTION
  {
    id: 'azkar-p-1',
    category: 'protection',
    title: 'Sufficiency with Allah (Hasbiyallahu)',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ العَرْشِ العَظِيمِ',
    transliteration: 'Hasbiyallahu la ilaha illa Huwa \'alayhi tawakkaltu wa Huwa Rabbul-\'Arshil-\'Azeem.',
    translation: 'Allah is sufficient for me; there is no deity except Him. Upon Him I have relied, and He is the Lord of the Great Throne.',
    reference: 'Sunan Abi Dawud #5081 (Sahih)',
    repetitionTarget: 7,
    virtue: 'Recited 7 times morning and evening, Allah will suffice them against whatever worries them.',
  },
  {
    id: 'azkar-p-2',
    category: 'protection',
    title: 'Supplication for Relief from Anxiety and Debt',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الهَمِّ وَالحَزَنِ، وَالعَجْزِ وَالكَسَلِ، وَالجُبْنِ وَالبُخْلِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration: 'Allahumma inni a\'udhu bika minal-hammi wal-hazan, wal-\'ajzi wal-kasal, wal-jubni wal-bukhl, wa dala\'id-dayni wa ghalabatir-rijal.',
    translation: 'O Allah, I seek refuge in You from grief and sorrow, from weakness and laziness, from cowardice and miserliness, and from the burden of debt and the oppression of men.',
    reference: 'Sahih al-Bukhari #2893',
    repetitionTarget: 1,
  },

  // GENERAL
  {
    id: 'azkar-g-1',
    category: 'general',
    title: 'Treasure of Paradise (Hawqalah)',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wa la quwwata illa billah.',
    translation: 'There is no power and no might except with Allah.',
    reference: 'Sahih al-Bukhari #4205, Sahih Muslim #2704',
    repetitionTarget: 33,
    virtue: 'A treasure from beneath the Throne of Allah.',
  },
  {
    id: 'azkar-g-2',
    category: 'general',
    title: 'Salawat on the Prophet Muhammad ﷺ',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'Allahumma salli \'ala Muhammadin wa \'ala ali Muhammad, kama sallayta \'ala Ibrahima wa \'ala ali Ibrahim, innaka Hamidun Majeed.',
    translation: 'O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Abraham and the family of Abraham. Indeed, You are Praiseworthy and Glorious.',
    reference: 'Sahih al-Bukhari #3370',
    repetitionTarget: 10,
    virtue: 'Whoever sends blessings on me once, Allah sends blessings upon him tenfold.',
  },
];
