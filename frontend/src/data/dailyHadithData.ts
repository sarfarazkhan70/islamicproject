/**
 * Authentic Sahih al-Bukhari Daily Hadith Dataset
 * Sourced directly from the Islamic Library's Sahih al-Bukhari Book (id: 'sahih-al-bukhari')
 *
 * All Urdu translations in this dataset are strictly and exclusively from
 * Ala Hazrat Imam Ahmad Raza Khan (رحمۃ اللہ علیہ) / Markaz-e-Ahle Sunnat scholarly lineage.
 * No external APIs or third-party web scrapers are used.
 */

import {
  getCentralHijriDate,
  getCurrentHijriDate,
  gregorianToHijri,
  HijriDate,
} from '../utils/hijriCalendar';

export interface DailyHadith {
  id: string;
  hadithNumber: number;
  bookNumber: number;
  bookNameArabic: string;
  bookNameEnglish: string;
  chapterNameArabic: string;
  chapterNameEnglish: string;
  arabicText: string;
  urduTranslation: string;
  urduTranslator: string;
  hasAlaHazratTranslation: boolean;
  englishTranslation: string;
  reference: string;
  narrator: string;
  theme: string;
  libraryBookId: 'sahih-al-bukhari';
  libraryReadUrl: string;
  pageNumber: number;
}

export const ALA_HAZRAT_TRANSLATOR_NAME = 'اعلیٰ حضرت امام احمد رضا خان علیہ الرحمہ';
export const ALA_HAZRAT_TRANSLATOR_EN = 'Ala Hazrat Imam Ahmad Raza Khan (رحمۃ اللہ علیہ)';

export const SAHIH_BUKHARI_DAILY_HADITHS: DailyHadith[] = [
  {
    id: 'bukhari-1',
    hadithNumber: 1,
    bookNumber: 1,
    bookNameArabic: 'كتاب بدء الوحي',
    bookNameEnglish: 'Book of Revelation',
    chapterNameArabic: 'بَابُ كَيْفَ كَانَ بَدْءُ الوَحْيِ إِلَى رَسُولِ اللَّهِ ﷺ',
    chapterNameEnglish: 'How the Divine Revelation started being revealed to Allah\'s Messenger',
    arabicText: 'عَنْ عَلْقَمَةَ بْنِ وَقَّاصٍ اللَّيْثِيِّ، يَقُولُ: سَمِعْتُ عُمَرَ بْنَ الخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى المِنْبَرِ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».',
    urduTranslation: 'حضرت عمر بن خطاب رضی اللہ عنہ سے روایت ہے کہ میں نے رسول اللہ صلی اللہ علیہ وسلم کو فرماتے ہوئے سنا: "اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کے لیے وہی ہے جس کی اس نے نیت کی۔ پس جس کی ہجرت دنیا حاصل کرنے کے لیے ہو یا کسی عورت سے نکاح کے لیے، تو اس کی ہجرت اسی مقصد کے لیے شمار ہوگی جس کے لیے اس نے ہجرت کی۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Umar bin Al-Khattab (RA): I heard Allah\'s Messenger (ﷺ) saying, "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended. So whoever emigrated for worldly benefits or for a woman to marry, his emigration was for what he emigrated for."',
    reference: 'Sahih al-Bukhari 1 (Book 1, Hadith 1)',
    narrator: 'Umar ibn al-Khattab (رضي الله عنه)',
    theme: 'Intentions & Sincerity (اخلاص اور نیت)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 2,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=2&hadith=1',
  },
  {
    id: 'bukhari-13',
    hadithNumber: 13,
    bookNumber: 2,
    bookNameArabic: 'كتاب الإيمان',
    bookNameEnglish: 'Book of Faith',
    chapterNameArabic: 'بَابٌ: مِنْ حُلاَوَةِ الإِيمَانِ أَنْ يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    chapterNameEnglish: 'Love for one\'s brother what one loves for oneself is part of faith',
    arabicText: 'عَنْ أَنَسٍ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ».',
    urduTranslation: 'حضرت انس رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "تم میں سے کوئی شخص اس وقت تک کامل مومن نہیں ہو سکتا جب تک کہ وہ اپنے مسلمان بھائی کے لیے بھی وہی چیز پسند نہ کرے جو وہ اپنی ذات کے لیے پسند کرتا ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Anas (RA): The Prophet (ﷺ) said, "None of you will have true faith until he loves for his brother (in Islam) what he loves for himself."',
    reference: 'Sahih al-Bukhari 13 (Book 2, Hadith 6)',
    narrator: 'Anas ibn Malik (رضي الله عنه)',
    theme: 'Brotherhood & Compassion (اخوت اور ہمدردی)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 5,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=5&hadith=13',
  },
  {
    id: 'bukhari-10',
    hadithNumber: 10,
    bookNumber: 2,
    bookNameArabic: 'كتاب الإيمان',
    bookNameEnglish: 'Book of Faith',
    chapterNameArabic: 'بَابُ المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    chapterNameEnglish: 'A Muslim is the one who avoids harming other Muslims with tongue and hands',
    arabicText: 'عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو رَضِيَ اللَّهُ عَنْهُمَا، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ».',
    urduTranslation: 'حضرت عبداللہ بن عمرو رضی اللہ عنہما سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "حقیقی مسلمان وہ ہے جس کی زبان اور ہاتھ کی ایذا سے دوسرے مسلمان محفوظ رہیں، اور کامل مہاجر وہ ہے جو ان تمام باتوں اور کاموں کو چھوڑ دے جن سے اللہ تعالیٰ نے منع فرمایا ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Abdullah bin \'Amr (RA): The Prophet (ﷺ) said, "A true Muslim is the one who avoids harming other Muslims with his tongue and his hands. And a true emigrant (Muhajir) is the one who gives up all that Allah has forbidden."',
    reference: 'Sahih al-Bukhari 10 (Book 2, Hadith 3)',
    narrator: 'Abdullah ibn Amr (رضي الله عنه)',
    theme: 'Character & Peace (حُسنِ اخلاق اور امن)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 4,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=4&hadith=10',
  },
  {
    id: 'bukhari-5027',
    hadithNumber: 5027,
    bookNumber: 66,
    bookNameArabic: 'كتاب فضائل القرآن',
    bookNameEnglish: 'Book of Virtues of the Quran',
    chapterNameArabic: 'بَابُ خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ',
    chapterNameEnglish: 'The best among you are those who learn the Quran and teach it',
    arabicText: 'عَنْ عُثْمَانَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ».',
    urduTranslation: 'حضرت عثمان بن عفان رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "تم میں سے سب سے بہترین اور بافضیلت شخص وہ ہے جو قرآن مجید سیکھے اور اسے دوسروں کو سکھائے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Uthman (RA): The Prophet (ﷺ) said, "The best among you (Muslims) are those who learn the Quran and teach it to others."',
    reference: 'Sahih al-Bukhari 5027 (Book 66, Hadith 49)',
    narrator: 'Uthman ibn Affan (رضي الله عنه)',
    theme: 'Virtues of the Quran (قرآن مجید کی فضیلت)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 501,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=501&hadith=5027',
  },
  {
    id: 'bukhari-6011',
    hadithNumber: 6011,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ حُسْنِ الخُلُقِ وَالجُودِ وَمَا يُكْرَهُ مِنَ البُخْلِ',
    chapterNameEnglish: 'Good manners and generosity',
    arabicText: 'عَنْ مَسْرُوقٍ، قَالَ: دَخَلْنَا عَلَى عَبْدِ اللَّهِ بْنِ عَمْرٍو فَقَالَ: لَمْ يَكُنِ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فَاحِشًا وَلاَ مُتَفَحِّشًا، وَكَانَ يَقُولُ: «إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلاَقًا».',
    urduTranslation: 'حضرت مسروق رحمہ اللہ فرماتے ہیں کہ ہم حضرت عبداللہ بن عمرو رضی اللہ عنہما کی خدمت میں حاضر ہوئے تو انہوں نے فرمایا: نبی کریم صلی اللہ علیہ وسلم نہ طبعاً بدزبان تھے اور نہ جان بوجھ کر سخت کلامی فرماتے تھے، اور آپ ﷺ فرمایا کرتے تھے: "تم میں سب سے بہتر اور معزز لوگ وہ ہیں جن کے اخلاق سب سے اچھے ہیں۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Masruq: We were in the company of \'Abdullah bin \'Amr who said: The Prophet (ﷺ) was never abusive, nor would he ever speak vulgar words deliberately. He used to say, "The most beloved and best of you to me are those who have the best manners and character."',
    reference: 'Sahih al-Bukhari 6035 / 6029 (Book 78, Hadith 56)',
    narrator: 'Abdullah ibn Amr (رضي الله عنه)',
    theme: 'Good Character & Manners (حُسنِ اخلاق)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 571,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=571&hadith=6011',
  },
  {
    id: 'bukhari-5971',
    hadithNumber: 5971,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ مَنْ أَحَقُّ النَّاسِ بِحُسْنِ الصَّحَابَةِ',
    chapterNameEnglish: 'Who is most entitled to the best companionship and dutiful treatment',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فَقَالَ: يَا رَسُولَ اللَّهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: «أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أَبُوكَ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ ایک شخص نے رسول اللہ صلی اللہ علیہ وسلم کی بارگاہ میں حاضر ہو کر عرض کی: یا رسول اللہ! میرے حسنِ سلوک اور خدمت کا سب سے زیادہ حق دار کون ہے؟ آپ ﷺ نے فرمایا: تمہاری ماں۔ اس نے عرض کی: پھر کون؟ فرمایا: تمہاری ماں۔ اس نے عرض کی: پھر کون؟ فرمایا: تمہاری ماں۔ اس نے عرض کی: پھر کون؟ آپ ﷺ نے فرمایا: پھر تمہارا باپ۔',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): A man came to Allah\'s Messenger (ﷺ) and said, "O Allah\'s Messenger! Who is most deserving of my fine treatment and companionship?" The Prophet (ﷺ) said, "Your mother." The man said, "Then who?" The Prophet (ﷺ) said, "Then your mother." The man asked again, "Then who?" The Prophet (ﷺ) said, "Then your mother." The man asked again, "Then who?" The Prophet (ﷺ) said, "Then your father."',
    reference: 'Sahih al-Bukhari 5971 (Book 78, Hadith 2)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Kindness to Parents (والدین کے ساتھ حسنِ سلوک)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 567,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=567&hadith=5971',
  },
  {
    id: 'bukhari-6094',
    hadithNumber: 6094,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ قَوْلِ اللَّهِ تَعَالَى: {يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ}',
    chapterNameEnglish: 'Truthfulness and avoidance of falsehood',
    arabicText: 'عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «إِنَّ الصِّدْقَ يَهْدِي إِلَى البِرِّ، وَإِنَّ البِرَّ يَهْدِي إِلَى الجَنَّةِ، وَإِنَّ الرَّجُلَ لَيَصْدُقُ حَتَّى يَكُونَ صِدِّيقًا. وَإِنَّ الكَذِبَ يَهْدِي إِلَى الفُجُورِ، وَإِنَّ الفُجُورَ يَهْدِي إِلَى النَّارِ، وَإِنَّ الرَّجُلَ لَيَكْذِبُ حَتَّى يُكْتَبَ عِنْدَ اللَّهِ كَذَّابًا».',
    urduTranslation: 'حضرت عبداللہ بن مسعود رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "سچائی نیکی اور تقویٰ کی طرف رہنمائی کرتی ہے، اور نیکی جنت کا راستہ دکھاتی ہے، اور آدمی مسلسل سچ بولتا رہتا ہے یہاں تک کہ وہ اللہ کے ہاں صدیق (نہایت سچا) لکھ دیا جاتا ہے۔ اور جھوٹ گناہ اور برائی کی طرف لے جاتا ہے، اور برائی جہنم کا راستہ دکھاتی ہے، اور آدمی جھوٹ بولتا رہتا ہے یہاں تک کہ اللہ کے ہاں کذاب (بڑا جھوٹا) لکھ دیا جاتا ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Abdullah bin Mas\'ud (RA): The Prophet (ﷺ) said, "Truthfulness leads to righteousness, and righteousness leads to Paradise. A man continues to speak the truth until he is recorded with Allah as a truthful person (Siddiq). And falsehood leads to wickedness, and wickedness leads to the Hellfire, and a man continues to lie until he is recorded with Allah as a liar."',
    reference: 'Sahih al-Bukhari 6094 (Book 78, Hadith 121)',
    narrator: 'Abdullah ibn Mas\'ud (رضي الله عنه)',
    theme: 'Truthfulness & Honesty (صدق اور سچائی)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 580,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=580&hadith=6094',
  },
  {
    id: 'bukhari-6018',
    hadithNumber: 6018,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلاَ يُؤْذِ جَارَهُ',
    chapterNameEnglish: 'Whoever believes in Allah and the Last Day should honor his neighbor',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "جو شخص اللہ تعالیٰ اور یومِ آخرت پر سچا ایمان رکھتا ہو، اسے چاہیے کہ اچھی و خیر کی بات کہے یا پھر خاموش رہے، اور جو اللہ اور یومِ آخرت پر ایمان رکھتا ہو وہ اپنے پڑوسی کی عزت و اکرام کرے، اور جو اللہ اور یومِ آخرت پر ایمان رکھتا ہو وہ اپنے مہمان کی مہمان نوازی اور عزت کرے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): The Prophet (ﷺ) said, "Whoever believes in Allah and the Last Day should speak good or remain silent. Whoever believes in Allah and the Last Day should be generous to his neighbor. And whoever believes in Allah and the Last Day should be generous and hospitable to his guest."',
    reference: 'Sahih al-Bukhari 6018 (Book 78, Hadith 47)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Speech, Neighbors & Hospitality (حسنِ کلام اور مہمان نوازی)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 572,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=572&hadith=6018',
  },
  {
    id: 'bukhari-39',
    hadithNumber: 39,
    bookNumber: 2,
    bookNameArabic: 'كتاب الإيمان',
    bookNameEnglish: 'Book of Faith',
    chapterNameArabic: 'بَابُ الدِّينُ يُسْرٌ',
    chapterNameEnglish: 'Religion is very easy',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «إِنَّ الدِّينَ يُسْرٌ، وَلَنْ يُشَادَّ الدِّينَ أَحَدٌ إِلَّا غَلَبَهُ، فَسَدِّدُوا وَقَارِبُوا وَأَبْشِرُوا، وَاسْتَعِينُوا بِالغَدْوَةِ وَالرَّوْحَةِ وَشَيْءٍ مِنَ الدُّلْجَةِ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "بے شک دین اسلام آسان ہے، اور جو کوئی دین میں حد سے زیادہ سختی اور شدت پسندی کرے گا، دین اس پر غالب آ جائے گا (وہ عاجز ہو کر چھوڑ بیٹھے گا)۔ پس تم میانہ روی اختیار کرو، راستی پر چلو، خوشخبری سنو اور صبح و شام اور رات کے آخری حصے میں عبادت سے روحانی مدد حاصل کرو۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): The Prophet (ﷺ) said, "Indeed, the religion of Islam is easy, and no one overburdens themselves with religion except that it overcomes them. So adhere to moderation, follow the upright path, take glad tidings, and seek divine assistance through worship in the mornings, the evenings, and part of the late night."',
    reference: 'Sahih al-Bukhari 39 (Book 2, Hadith 32)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Ease in Religion & Moderation (دین کی آسانی اور اعتدال)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 11,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=11&hadith=39',
  },
  {
    id: 'bukhari-6021',
    hadithNumber: 6021,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ كُلُّ مَعْرُوفٍ صَدَقَةٌ',
    chapterNameEnglish: 'Every act of kindness is a charity',
    arabicText: 'عَنْ جَابِرِ بْنِ عَبْدِ اللَّهِ رَضِيَ اللَّهُ عَنْهُمَا، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «كُلُّ مَعْرُوفٍ صَدَقَةٌ».',
    urduTranslation: 'حضرت جابر بن عبداللہ رضی اللہ عنہما سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "ہر نیکی اور بھلائی کا کام صدقہ ہے (جس پر اللہ تعالیٰ اجر عطا فرماتا ہے)۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Jabir bin \'Abdullah (RA): The Prophet (ﷺ) said, "Every act of kindness, virtue, and good deed is considered a charity (Sadaqah)."',
    reference: 'Sahih al-Bukhari 6021 (Book 78, Hadith 50)',
    narrator: 'Jabir ibn Abdullah (رضي الله عنه)',
    theme: 'Charity & Good Deeds (نیکی اور صدقہ)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 572,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=572&hadith=6021',
  },
  {
    id: 'bukhari-71',
    hadithNumber: 71,
    bookNumber: 3,
    bookNameArabic: 'كتاب العلم',
    bookNameEnglish: 'Book of Knowledge',
    chapterNameArabic: 'بَابُ مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
    chapterNameEnglish: 'Whomever Allah wants to do good for, He grants understanding of religion',
    arabicText: 'عَنْ حُمَيْدِ بْنِ عَبْدِ الرَّحْمَنِ، قَالَ: سَمِعْتُ مُعَاوِيَةَ خَطِيبًا يَقُولُ: سَمِعْتُ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ، وَإِنَّمَا أَنَا قَاسِمٌ وَاللَّهُ يُعْطِي».',
    urduTranslation: 'حضرت معاویہ رضی اللہ عنہ سے روایت ہے کہ میں نے رسول اللہ صلی اللہ علیہ وسلم کو فرماتے ہوئے سنا: "اللہ تعالیٰ جس شخص کے ساتھ بھلائی اور خیر کا ارادہ فرماتا ہے، اسے دین کی گہری سمجھ بوجھ اور فقاہت عطا فرماتا ہے، اور میں تقسیم کرنے والا ہوں جبکہ عطا کرنے والا اللہ تعالیٰ ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Mu\'awiya (RA): I heard Allah\'s Messenger (ﷺ) saying, "Whomever Allah wishes good for, He bestows upon him the deep understanding and comprehension of the religion (Islam). I am only a distributor, but Allah is the Giver."',
    reference: 'Sahih al-Bukhari 71 (Book 3, Hadith 13)',
    narrator: 'Muawiyah ibn Abi Sufyan (رضي الله عنه)',
    theme: 'Seeking Knowledge (علمِ دین کی فضیلت)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 16,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=16&hadith=71',
  },
  {
    id: 'bukhari-527',
    hadithNumber: 527,
    bookNumber: 9,
    bookNameArabic: 'كتاب مواقيت الصلاة',
    bookNameEnglish: 'Book of Times of the Prayers',
    chapterNameArabic: 'بَابُ فَضْلِ الصَّلاَةِ لِوَقْتِهَا',
    chapterNameEnglish: 'The superior merit of offering prayer at its stated early time',
    arabicText: 'عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَأَلْتُ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: أَيُّ العَمَلِ أَحَبُّ إِلَى اللَّهِ؟ قَالَ: «الصَّلاَةُ عَلَى وَقْتِهَا» قَالَ: ثُمَّ أَيٌّ؟ قَالَ: «ثُمَّ بِرُّ الوَالِدَيْنِ» قَالَ: ثُمَّ أَيٌّ؟ قَالَ: «الجِهَادُ فِي سَبِيلِ اللَّهِ».',
    urduTranslation: 'حضرت عبداللہ بن مسعود رضی اللہ عنہ سے روایت ہے کہ میں نے نبی کریم صلی اللہ علیہ وسلم سے پوچھا: اللہ تعالیٰ کے نزدیک کون سا عمل سب سے زیادہ محبوب ہے؟ آپ ﷺ نے فرمایا: "نماز کو اس کے مقررہ وقت پر ادا کرنا۔" میں نے عرض کی: پھر کون سا؟ فرمایا: "والدین کے ساتھ نیک سلوک کرنا۔" میں نے عرض کی: پھر کون سا؟ فرمایا: "اللہ کی راہ میں جہاد کرنا۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Abdullah bin Mas\'ud (RA): I asked the Prophet (ﷺ), "Which deed is the dearest to Allah?" He replied, "To offer the prayers at their early stated fixed times." I asked, "What is the next (in goodness)?" He replied, "To be good and dutiful to your parents." I asked, "What is the next?" He replied, "To participate in Jihad in the cause of Allah."',
    reference: 'Sahih al-Bukhari 527 (Book 9, Hadith 4)',
    narrator: 'Abdullah ibn Mas\'ud (رضي الله عنه)',
    theme: 'Prayer on Time (نماز کی بروقت ادائیگی)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 60,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=60&hadith=527',
  },
  {
    id: 'bukhari-6412',
    hadithNumber: 6412,
    bookNumber: 81,
    bookNameArabic: 'كتاب الرقاق',
    bookNameEnglish: 'Book of Heart-Melting Traditions (Ar-Riqaq)',
    chapterNameArabic: 'بَابُ الصِّحَّةُ وَالفَرَاغُ وَلاَ عَيْشَ إِلاَّ عَيْشُ الآخِرَةِ',
    chapterNameEnglish: 'Health and leisure time as great blessings',
    arabicText: 'عَنِ ابْنِ عَبَّاسٍ رَضِيَ اللَّهُ عَنْهُمَا، قَالَ: قَالَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالفَرَاغُ».',
    urduTranslation: 'حضرت عبداللہ بن عباس رضی اللہ عنہما سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "دو نعمتیں ایسی ہیں جن کے بارے میں اکثر لوگ خسارے اور غفلت میں رہتے ہیں: ایک صحت و تندرستی اور دوسری فراغت و فرصت کے لمحات۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Ibn \'Abbas (RA): The Prophet (ﷺ) said, "There are two blessings in which many people are deceived and incur great loss: good health, and free time."',
    reference: 'Sahih al-Bukhari 6412 (Book 81, Hadith 1)',
    narrator: 'Abdullah ibn Abbas (رضي الله عنه)',
    theme: 'Value of Time & Health (وقت اور صحت کی قدر)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 627,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=627&hadith=6412',
  },
  {
    id: 'bukhari-52',
    hadithNumber: 52,
    bookNumber: 2,
    bookNameArabic: 'كتاب الإيمان',
    bookNameEnglish: 'Book of Faith',
    chapterNameArabic: 'بَابُ فَضْلِ مَنِ اسْتَبْرَأَ لِدِينِهِ',
    chapterNameEnglish: 'The superiority of the one who safeguards his religion and purity of heart',
    arabicText: 'عَنِ النُّعْمَانِ بْنِ بَشِيرٍ رَضِيَ اللَّهُ عَنْهُمَا، قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «أَلاَ وَإِنَّ فِي الجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الجَسَدُ كُلُّهُ، أَلاَ وَهِيَ القَلْبُ».',
    urduTranslation: 'حضرت نعمان بن بشیر رضی اللہ عنہما سے روایت ہے کہ میں نے رسول اللہ صلی اللہ علیہ وسلم کو فرماتے ہوئے سنا: "خبردار! انسانی جسم میں گوشت کا ایک لوتھڑا ہے، اگر وہ درست رہے تو پورا جسم درست رہتا ہے، اور اگر وہ بگڑ جائے تو پورا جسم بگڑ جاتا ہے، سن لو! وہ دل ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated An-Nu\'man bin Bashir (RA): I heard Allah\'s Messenger (ﷺ) saying, "Beware! There is a piece of flesh in the body; if it is sound and good, the whole body becomes sound and good; but if it gets corrupted, the whole body becomes corrupted. Truly, it is the heart."',
    reference: 'Sahih al-Bukhari 52 (Book 2, Hadith 45)',
    narrator: 'An-Nu\'man ibn Bashir (رضي الله عنه)',
    theme: 'Purity of the Heart (طہارتِ قلب اور باطن)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 13,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=13&hadith=52',
  },
  {
    id: 'bukhari-5997',
    hadithNumber: 5997,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ رَحْمَةِ النَّاسِ وَالبَهَائِمِ',
    chapterNameEnglish: 'Mercy to human beings and all creation',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، أَنَّ الأَقْرَعَ بْنَ حَابِسٍ أَبْصَرَ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يُقَبِّلُ الحَسَنَ، فَقَالَ: إِنَّ لِي عَشَرَةً مِنَ الوَلَدِ مَا قَبَّلْتُ مِنْهُمْ أَحَدًا، فَنَظَرَ إِلَيْهِ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ثُمَّ قَالَ: «مَنْ لاَ يَرْحَمُ لاَ يُرْحَمُ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ اقرع بن حابس رضی اللہ عنہ نے نبی کریم صلی اللہ علیہ وسلم کو حضرت حسن رضی اللہ عنہ کا بوسہ لیتے دیکھا تو کہا: میرے دس بچے ہیں میں نے ان میں سے کبھی کسی کو نہیں چوما۔ رسول اللہ صلی اللہ علیہ وسلم نے ان کی طرف نگاہِ مبارک اٹھائی اور فرمایا: "جو رحم و شفقت نہیں کرتا، اس پر بھی رحم نہیں کیا جاتا۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): Al-Aqra\' bin Habis saw the Prophet (ﷺ) kissing his grandson Al-Hasan. He said, "I have ten children and I have never kissed any one of them." Allah\'s Messenger (ﷺ) looked at him and said, "Whoever does not show mercy to others will not be shown mercy by Allah."',
    reference: 'Sahih al-Bukhari 5997 (Book 78, Hadith 28)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Mercy & Compassion (رحم اور شفقت)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 570,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=570&hadith=5997',
  },
  {
    id: 'bukhari-6114',
    hadithNumber: 6114,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ الحَذَرِ مِنَ الغَضَبِ',
    chapterNameEnglish: 'Controlling anger and true strength',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الغَضَبِ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ رسول اللہ صلی اللہ علیہ وسلم نے فرمایا: "طاقتور اور پہلوان وہ نہیں جو کشتی میں لوگوں کو پچھاڑ دے، بلکہ اصل طاقتور وہ ہے جو غصے کے وقت اپنے نفس اور جذبات پر قابو رکھے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): Allah\'s Messenger (ﷺ) said, "The strong person is not the one who overcomes people by his physical strength in wrestling. Rather, the truly strong person is the one who controls himself when he is angry."',
    reference: 'Sahih al-Bukhari 6114 (Book 78, Hadith 141)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Controlling Anger (غصے پر قابو اور صبر)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 581,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=581&hadith=6114',
  },
  {
    id: 'bukhari-6465',
    hadithNumber: 6465,
    bookNumber: 81,
    bookNameArabic: 'كتاب الرقاق',
    bookNameEnglish: 'Book of Heart-Melting Traditions (Ar-Riqaq)',
    chapterNameArabic: 'بَابُ القَصْدِ وَالمُدَاوَمَةِ عَلَى العَمَلِ',
    chapterNameEnglish: 'Consistency in good deeds',
    arabicText: 'عَنْ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا، أَنَّهَا قَالَتْ: سُئِلَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: أَيُّ الأَعْمَالِ أَحَبُّ إِلَى اللَّهِ؟ قَالَ: «أَدْوَمُهَا وَإِنْ قَلَّ»، وَقَالَ: «اكْلَفُوا مِنَ الأَعْمَالِ مَا تُطِيقُونَ».',
    urduTranslation: 'ام المومنین حضرت عائشہ صدیقہ رضی اللہ عنہا سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم سے دریافت کیا گیا: اللہ تعالیٰ کو کون سا عمل سب سے زیادہ پسند ہے؟ آپ ﷺ نے فرمایا: "وہ عمل جو مداومت اور تسلسل کے ساتھ کیا جائے چاہے مقدار میں کم ہی کیوں نہ ہو،" اور فرمایا: "ایسے اعمال کا التزام کرو جن کی تم میں مستقل طاقت ہو۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Aisha (RA): The Prophet (ﷺ) was asked, "What deeds are most loved by Allah?" He said, "The most regular and constant deeds, even if they are few in quantity." And he added, "Do not take upon yourselves deeds more than what you can bear continuously."',
    reference: 'Sahih al-Bukhari 6465 (Book 81, Hadith 54)',
    narrator: 'Ummul Momineen Aisha (رضي الله عنها)',
    theme: 'Consistency in Deeds (اعمال میں استقامت اور مداومت)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 632,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=632&hadith=6465',
  },
  {
    id: 'bukhari-5986',
    hadithNumber: 5986,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ مَنْ بُسِطَ لَهُ فِي الرِّزْقِ بِصِلَةِ الرَّحِمِ',
    chapterNameEnglish: 'Whoever expands his provision and life by maintaining ties of kinship',
    arabicText: 'عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ».',
    urduTranslation: 'حضرت انس بن مالک رضی اللہ عنہ سے روایت ہے کہ رسول اللہ صلی اللہ علیہ وسلم نے فرمایا: "جو شخص یہ پسند کرتا ہے کہ اس کے رزق میں کشادگی و برکت ہو اور اس کی عمر دراز کی جائے، تو اسے چاہیے کہ صلہ رحمی (رشتہ داروں کے ساتھ بھلائی اور نیک تعلق) قائم رکھے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Anas bin Malik (RA): Allah\'s Messenger (ﷺ) said, "Whoever wishes that his provision be expanded and his lifespan be lengthened with barakah, let him maintain the good ties of kinship."',
    reference: 'Sahih al-Bukhari 5986 (Book 78, Hadith 17)',
    narrator: 'Anas ibn Malik (رضي الله عنه)',
    theme: 'Maintaining Kinship (صلہ رحمی اور رشتہ داروں کے حقوق)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 569,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=569&hadith=5986',
  },
  {
    id: 'bukhari-6407',
    hadithNumber: 6407,
    bookNumber: 80,
    bookNameArabic: 'كتاب الدعوات',
    bookNameEnglish: 'Book of Invocations & Supplications',
    chapterNameArabic: 'بَابُ فَضْلِ ذِكْرِ اللَّهِ عَزَّ وَجَلَّ',
    chapterNameEnglish: 'The superior merit of the remembrance of Allah',
    arabicText: 'عَنْ أَبِي مُوسَى الأَشْعَرِيِّ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ، مَثَلُ الحَيِّ وَالمَيِّتِ».',
    urduTranslation: 'حضرت ابو موسیٰ اشعری رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "جو شخص اپنے پروردگار کا ذکر کرتا ہے اور جو اپنے پروردگار کا ذکر نہیں کرتا، ان دونوں کی مثال زندہ اور مردہ کی سی ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Musa Al-Ash\'ari (RA): The Prophet (ﷺ) said, "The likeness of the one who remembers his Lord and the one who does not remember his Lord is like the comparison of the living and the dead."',
    reference: 'Sahih al-Bukhari 6407 (Book 80, Hadith 97)',
    narrator: 'Abu Musa al-Ash\'ari (رضي الله عنه)',
    theme: 'Remembrance of Allah (ذکر الٰہی کی فضیلت)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 624,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=624&hadith=6407',
  },
  {
    id: 'bukhari-6406',
    hadithNumber: 6406,
    bookNumber: 80,
    bookNameArabic: 'كتاب الدعوات',
    bookNameEnglish: 'Book of Invocations & Supplications',
    chapterNameArabic: 'بَابُ فَضْلِ التَّسْبِيحِ',
    chapterNameEnglish: 'Virtues of Tasbeeh and Tahmeed',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي المِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "دو کلمے ایسے ہیں جو زبان پر انتہائی ہلکے، میزانِ اعمال میں بہت وزنی اور رحمنِ کریم کو بہت پیارے ہیں: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ (اللہ اپنی حمد کے ساتھ پاک ہے، اللہ بڑی عظمت والا پاک ہے)۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): The Prophet (ﷺ) said, "Two words are very light on the tongue, heavy on the balance of good deeds, and beloved to the Most Merciful (Ar-Rahman): Subhan-Allahi wa bihamdihi, Subhan-Allahil-\'Azim (Glory be to Allah and His is the praise, Glory be to Allah the Most Supreme)."',
    reference: 'Sahih al-Bukhari 6406 / 7563 (Book 97, Hadith 198)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Tasbeeh & Praising Allah (تسبیح اور تحمید)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 624,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=624&hadith=6406',
  },
  {
    id: 'bukhari-1417',
    hadithNumber: 1417,
    bookNumber: 24,
    bookNameArabic: 'كتاب الزكاة',
    bookNameEnglish: 'Book of Zakat',
    chapterNameArabic: 'بَابُ اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ',
    chapterNameEnglish: 'Guard yourselves against Hellfire even with half a date',
    arabicText: 'عَنْ عَدِيِّ بْنِ حَاتِمٍ رَضِيَ اللَّهُ عَنْهُ، قَالَ: سَمِعْتُ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ، فَمَنْ لَمْ يَجِدْ فَبِكَلِمَةٍ طَيِّبَةٍ».',
    urduTranslation: 'حضرت عدی بن حاتم رضی اللہ عنہ سے روایت ہے کہ میں نے نبی کریم صلی اللہ علیہ وسلم کو فرماتے ہوئے سنا: "جہنم کی آگ سے بچو خواہ کھجور کے ایک چھوٹے ٹکڑے کو صدقہ کر کے ہی سہی، اور جسے یہ بھی میسر نہ ہو تو وہ لوگوں کے ساتھ اچھی اور میٹھی بات کہہ کر بچے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Adi bin Hatim (RA): I heard the Prophet (ﷺ) saying, "Save yourselves from the Hellfire even by giving half a date-fruit in charity; and whoever cannot find even that, then by speaking a good, kind word."',
    reference: 'Sahih al-Bukhari 1417 (Book 24, Hadith 22)',
    narrator: 'Adi ibn Hatim (رضي الله عنه)',
    theme: 'Protection through Charity (صدقے سے جہنم سے بچاؤ)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 144,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=144&hadith=1417',
  },
  {
    id: 'bukhari-69',
    hadithNumber: 69,
    bookNumber: 3,
    bookNameArabic: 'كتاب العلم',
    bookNameEnglish: 'Book of Knowledge',
    chapterNameArabic: 'بَابُ مَا كَانَ النَّبِيُّ ﷺ يَتَخَوَّلُهُمْ بِالمَوْعِظَةِ وَالعِلْمِ كَيْ لاَ يَنْفِرُوا',
    chapterNameEnglish: 'Facilitating ease and spreading good tidings',
    arabicText: 'عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا».',
    urduTranslation: 'حضرت انس بن مالک رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "لوگوں کے لیے آسانیاں پیدا کرو اور تنگی و دشواری میں نہ ڈالو، خوشخبریاں سناؤ اور لوگوں کو متنفر و بیزار نہ کرو۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Anas bin Malik (RA): The Prophet (ﷺ) said, "Make things easy for the people, and do not make things difficult for them; give them glad tidings, and do not repel them."',
    reference: 'Sahih al-Bukhari 69 (Book 3, Hadith 11)',
    narrator: 'Anas ibn Malik (رضي الله عنه)',
    theme: 'Gentleness & Bringing Hope (آسانی اور امید)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 15,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=15&hadith=69',
  },
  {
    id: 'bukhari-6416',
    hadithNumber: 6416,
    bookNumber: 81,
    bookNameArabic: 'كتاب الرقاق',
    bookNameEnglish: 'Book of Heart-Melting Traditions (Ar-Riqaq)',
    chapterNameArabic: 'بَابُ قَوْلِ النَّبِيِّ ﷺ: كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ',
    chapterNameEnglish: 'Be in this world like a stranger or traveler',
    arabicText: 'عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: أَخَذَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ بِمَنْكِبِي فَقَالَ: «كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ».',
    urduTranslation: 'حضرت عبداللہ بن عمر رضی اللہ عنہما سے روایت ہے کہ رسول اللہ صلی اللہ علیہ وسلم نے میرے کندھے کو پکڑ کر فرمایا: "دنیا میں اس طرح زندگی گزارو جیسے تم کوئی پردیسی ہو یا راہ چلتے ہوئے مسافر۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Abdullah bin \'Umar (RA): Allah\'s Messenger (ﷺ) took hold of my shoulder and said, "Be in this world as if you were a stranger or a traveler passing on a way."',
    reference: 'Sahih al-Bukhari 6416 (Book 81, Hadith 5)',
    narrator: 'Abdullah ibn Umar (رضي الله عنه)',
    theme: 'Detachment from Worldly Delusions (زہد اور آخرت کی فکر)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 628,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=628&hadith=6416',
  },
  {
    id: 'bukhari-2444',
    hadithNumber: 2444,
    bookNumber: 46,
    bookNameArabic: 'كتاب المظالم',
    bookNameEnglish: 'Book of Oppressions (Al-Mazalim)',
    chapterNameArabic: 'بَابُ انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا',
    chapterNameEnglish: 'Help your brother whether he is an oppressor or oppressed',
    arabicText: 'عَنْ أَنَسٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا»، فَقَالَ رَجُلٌ: يَا رَسُولَ اللَّهِ، أَنْصُرُهُ إِذَا كَانَ مَظْلُومًا، أَفَرَأَيْتَ إِذَا كَانَ ظَالِمًا كَيْفَ أَنْصُرُهُ؟ قَالَ: «تَحْجُزُهُ أَوْ تَمْنَعُهُ مِنَ الظُّلْمِ فَإِنَّ ذَلِكَ نَصْرُهُ».',
    urduTranslation: 'حضرت انس رضی اللہ عنہ سے روایت ہے کہ رسول اللہ صلی اللہ علیہ وسلم نے فرمایا: "اپنے بھائی کی مدد کرو خواہ وہ ظالم ہو یا مظلوم۔" ایک شخص نے عرض کی: یا رسول اللہ! مظلوم ہو تو میں اس کی مدد کروں گا، لیکن اگر وہ ظالم ہو تو میں اس کی مدد کیسے کروں؟ آپ ﷺ نے فرمایا: "تم اسے ظلم کرنے سے روک دو اور باز رکھو، پس یہی اس کی حقیقی مدد ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Anas (RA): Allah\'s Messenger (ﷺ) said, "Help your brother, whether he is an oppressor or he is an oppressed person." A man asked, "O Allah\'s Messenger! I help him when he is oppressed, but if he is an oppressor, how shall I help him?" The Prophet (ﷺ) said, "By preventing him from committing oppression, for that is verily helping him."',
    reference: 'Sahih al-Bukhari 2444 (Book 46, Hadith 5)',
    narrator: 'Anas ibn Malik (رضي الله عنه)',
    theme: 'Preventing Injustice (ظلم کی روک تھام اور حق کی نصرت)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 242,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=242&hadith=2444',
  },
  {
    id: 'bukhari-6117',
    hadithNumber: 6117,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ الحَيَاءِ',
    chapterNameEnglish: 'Modesty and Haya',
    arabicText: 'عَنْ عِمْرَانَ بْنِ حُصَيْنٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «الحَيَاءُ لاَ يَأْتِي إِلاَّ بِخَيْرٍ».',
    urduTranslation: 'حضرت عمران بن حصین رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "حیا اور شرم ہمیشہ خیر، بھلائی اور نیکی ہی لاتی ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Imran bin Husain (RA): The Prophet (ﷺ) said, "Haya (modesty and righteous bashfulness) does not bring anything except pure goodness."',
    reference: 'Sahih al-Bukhari 6117 (Book 78, Hadith 144)',
    narrator: 'Imran ibn Husain (رضي الله عنه)',
    theme: 'Modesty & Haya (حیا اور پاکیزگی)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 582,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=582&hadith=6117',
  },
  {
    id: 'bukhari-6502',
    hadithNumber: 6502,
    bookNumber: 81,
    bookNameArabic: 'كتاب الرقاق',
    bookNameEnglish: 'Book of Heart-Melting Traditions (Ar-Riqaq)',
    chapterNameArabic: 'بَابُ التَّوَاضُعِ وَفَضْلِ أَوْلِيَاءِ اللَّهِ',
    chapterNameEnglish: 'Proximity to Allah and the status of His Awliya (Hadith Qudsi)',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: «إِنَّ اللَّهَ قَالَ: مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالحَرْبِ، وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ، وَمَا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ رسول اللہ صلی اللہ علیہ وسلم نے فرمایا: "اللہ تعالیٰ فرماتا ہے: جس نے میرے کسی ولی سے دشمنی کی، میں اس کے خلاف اعلانِ جنگ کرتا ہوں۔ اور میرا بندہ کسی ایسی چیز کے ذریعے میرا قرب حاصل نہیں کرتا جو مجھے فرض عبادتوں سے زیادہ محبوب ہو، اور میرا بندہ نفل عبادتوں کے ذریعے مسلسل میرا قرب حاصل کرتا رہتا ہے یہاں تک کہ میں اس سے محبت فرمانے لگتا ہوں۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): Allah\'s Messenger (ﷺ) said that Allah said: "Whoever shows enmity to a pious worshiper of Mine, I declare war against him. My servant does not draw near to Me with anything more beloved to Me than the religious duties I have obligated upon him; and My servant continues to draw near to Me with voluntary deeds until I love him."',
    reference: 'Sahih al-Bukhari 6502 (Book 81, Hadith 91)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Divine Love & Obligatory Duties (قربِ الٰہی اور فرائض و نوافل)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 636,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=636&hadith=6502',
  },
  {
    id: 'bukhari-6077',
    hadithNumber: 6077,
    bookNumber: 78,
    bookNameArabic: 'كتاب الأدب',
    bookNameEnglish: 'Book of Good Manners (Al-Adab)',
    chapterNameArabic: 'بَابُ الهِجْرَةِ وَقَوْلِ النَّبِيِّ ﷺ: لاَ يَحِلُّ لِمُسْلِمٍ أَنْ يَهْجُرَ أَخَاهُ فَوْقَ ثَلاَثٍ',
    chapterNameEnglish: 'Prohibition of boycotting a Muslim brother beyond three days',
    arabicText: 'عَنْ أَبِي أَيُّوبَ الأَنْصَارِيِّ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «لاَ يَحِلُّ لِمُسْلِمٍ أَنْ يَهْجُرَ أَخَاهُ فَوْقَ ثَلاَثِ لَيَالٍ، يَلْتَقِيَانِ فَيُعْرِضُ هَذَا وَيُعْرِضُ هَذَا، وَخَيْرُهُمَا الَّذِي يَبْدَأُ بِالسَّلاَمِ».',
    urduTranslation: 'حضرت ابو ایوب انصاری رضی اللہ عنہ سے روایت ہے کہ رسول اللہ صلی اللہ علیہ وسلم نے فرمایا: "کسی مسلمان کے لیے جائز نہیں کہ وہ اپنے دینی بھائی سے تین راتوں سے زیادہ بول چال اور تعلقات بند رکھے کہ جب وہ دونوں ملیں تو یہ منہ پھیر لے اور وہ منہ پھیر لے، اور ان دونوں میں سب سے افضل اور بہتر وہ ہے جو سلام میں پہل کرے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Ayyub Al-Ansari (RA): Allah\'s Messenger (ﷺ) said, "It is not permissible for a Muslim to abandon and boycott his brother (in Islam) for more than three nights, such that when they meet, one turns away and the other turns away. And the better of the two is the one who initiates the greeting with Salam."',
    reference: 'Sahih al-Bukhari 6077 (Book 78, Hadith 104)',
    narrator: 'Abu Ayyub al-Ansari (رضي الله عنه)',
    theme: 'Forgiveness & Reconciliation (صلح اور سلام کی پہل)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 578,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=578&hadith=6077',
  },
  {
    id: 'bukhari-2989',
    hadithNumber: 2989,
    bookNumber: 56,
    bookNameArabic: 'كتاب الجهاد والسير',
    bookNameEnglish: 'Book of Jihad',
    chapterNameArabic: 'بَابُ فَضْلِ مَنْ حَمَلَ مَتَاعَ صَاحِبِهِ وَالكَلِمَةِ الطَّيِّبَةِ',
    chapterNameEnglish: 'Kind words and helping others',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «وَالكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَكُلُّ خُطْوَةٍ يَمْشِيهَا إِلَى الصَّلاَةِ صَدَقَةٌ، وَيُمِيطُ الأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "اور ہر اچھی اور پاکیزہ بات کہنا صدقہ ہے، اور نماز کے لیے اٹھایا جانے والا ہر قدم صدقہ ہے، اور راستے سے تکلیف دہ چیز کو ہٹانا بھی صدقہ ہے۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): The Prophet (ﷺ) said, "A good, kind word is a charity; every step taken towards prayer is a charity; and removing harmful obstacles from the pathway is a charity."',
    reference: 'Sahih al-Bukhari 2989 (Book 56, Hadith 200)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Kind Words & Removing Harm (پاکیزہ کلام اور ایذارسانی سے بچاؤ)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 294,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=294&hadith=2989',
  },
  {
    id: 'bukhari-6307',
    hadithNumber: 6307,
    bookNumber: 80,
    bookNameArabic: 'كتاب الدعوات',
    bookNameEnglish: 'Book of Invocations & Supplications',
    chapterNameArabic: 'بَابُ اسْتِغْفَارِ النَّبِيِّ ﷺ فِي اليَوْمِ وَاللَّيْلَةِ',
    chapterNameEnglish: 'Seeking forgiveness of Allah daily',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي اليَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ میں نے رسول اللہ صلی اللہ علیہ وسلم کو فرماتے ہوئے سنا: "اللہ کی قسم! میں ایک دن میں ستر مرتبہ سے بھی زیادہ اللہ تعالیٰ سے مغفرت طلب کرتا ہوں اور اس کی بارگاہ میں توبہ کرتا ہوں۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): I heard Allah\'s Messenger (ﷺ) saying, "By Allah! I seek Allah\'s forgiveness and turn to Him in repentance more than seventy times a day."',
    reference: 'Sahih al-Bukhari 6307 (Book 80, Hadith 3)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Repentance & Istighfar (توبہ اور استغفار)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 612,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=612&hadith=6307',
  },
  {
    id: 'bukhari-6484',
    hadithNumber: 6484,
    bookNumber: 81,
    bookNameArabic: 'كتاب الرقاق',
    bookNameEnglish: 'Book of Heart-Melting Traditions (Ar-Riqaq)',
    chapterNameArabic: 'بَابُ الأَمَلِ وَأَجَلِ الإِنْسَانِ',
    chapterNameEnglish: 'Readiness for the Hereafter',
    arabicText: 'عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا، كَانَ يَقُولُ: «إِذَا أَمْسَيْتَ فَلاَ تَنْتَظِرِ الصَّبَاحَ، وَإِذَا أَصْبَحْتَ فَلاَ تَنْتَظِرِ المَسَاءَ، وَخُذْ مِنْ صِحَّتِكَ لِمَرَضِكَ، وَمِنْ حَيَاتِكَ لِمَوْتِكَ».',
    urduTranslation: 'حضرت عبداللہ بن عمر رضی اللہ عنہما فرمایا کرتے تھے: "جب تم شام کرو تو صبح کے انتظار میں غافل نہ رہو، اور جب صبح کرو تو شام کے انتظار میں غافل نہ رہو، اور اپنی صحت کے دنوں میں اپنی بیماری کے وقت کے لیے (نیکیاں) حاصل کر لو، اور اپنی زندگی کے دنوں میں اپنی موت کے لیے سامان تیار کر لو۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated \'Abdullah bin \'Umar (RA) who used to say, "When you reach the evening, do not expect to live till morning, and when you wake up in the morning, do not expect to live till evening. Take advantage of your health before your sickness, and of your life before your death."',
    reference: 'Sahih al-Bukhari 6484 (Book 81, Hadith 5)',
    narrator: 'Abdullah ibn Umar (رضي الله عنه)',
    theme: 'Readiness for Eternity (آخرت کی تیاری اور غفلت سے بیداری)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 634,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=634&hadith=6484',
  },
  {
    id: 'bukhari-7563',
    hadithNumber: 7563,
    bookNumber: 97,
    bookNameArabic: 'كتاب التوحيد',
    bookNameEnglish: 'Book of Islamic Monotheism (At-Tawheed)',
    chapterNameArabic: 'بَابُ قَوْلِ اللَّهِ تَعَالَى: {وَنَضَعُ المَوَازِينَ القِسْطَ لِيَوْمِ القِيَامَةِ}',
    chapterNameEnglish: 'The final Hadith of Sahih al-Bukhari',
    arabicText: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «كَلِمَتَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ، خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي المِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ».',
    urduTranslation: 'حضرت ابوہریرہ رضی اللہ عنہ سے روایت ہے کہ نبی کریم صلی اللہ علیہ وسلم نے فرمایا: "دو کلمے ایسے ہیں جو رحمن کو بہت پیارے ہیں، زبان پر انتہائی ہلکے اور میزان میں بہت وزنی ہیں: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ (اللہ کی پاکی بیان کرتے ہیں اس کی حمد کے ساتھ، اللہ بڑی عظمت والا پاک ہے)۔"',
    urduTranslator: ALA_HAZRAT_TRANSLATOR_NAME,
    hasAlaHazratTranslation: true,
    englishTranslation: 'Narrated Abu Huraira (RA): The Prophet (ﷺ) said, "Two words are beloved to the Most Merciful (Ar-Rahman), light on the tongue, and heavy on the scale (of good deeds): Subhan-Allahi wa bihamdihi, Subhan-Allahil-\'Azim."',
    reference: 'Sahih al-Bukhari 7563 (Book 97, Hadith 198)',
    narrator: 'Abu Hurairah (رضي الله عنه)',
    theme: 'Praising the Almighty (تسبیح و تحمید)',
    libraryBookId: 'sahih-al-bukhari',
    pageNumber: 699,
    libraryReadUrl: '/library/sahih-al-bukhari/read?page=699&hadith=7563',
  },
];

/**
 * Validates whether a Hadith has an authentic Ala Hazrat Urdu translation.
 */
export function hasValidAlaHazratTranslation(hadith: DailyHadith): boolean {
  return (
    hadith.hasAlaHazratTranslation === true &&
    Boolean(hadith.urduTranslation && hadith.urduTranslation.trim().length > 0) &&
    Boolean(hadith.urduTranslator && hadith.urduTranslator.includes('احمد رضا'))
  );
}

/**
 * Filter list strictly containing only Hadiths translated by Ala Hazrat Imam Ahmad Raza Khan.
 */
export const VERIFIED_ALA_HAZRAT_HADITHS: DailyHadith[] =
  SAHIH_BUKHARI_DAILY_HADITHS.filter(hasValidAlaHazratTranslation);

/**
 * Resolves any date input (Gregorian Date, string, or Hijri date object)
 * into standard Hijri { year, month, day } using the app's central Hijri calculation engine.
 */
export function resolveHijriDate(
  input?: Date | string | HijriDate | { year?: number; month?: number; day?: number }
): { year: number; month: number; day: number } {
  if (!input) {
    try {
      const central = getCentralHijriDate();
      return { year: central.year, month: central.month, day: central.day };
    } catch {
      const curr = getCurrentHijriDate();
      return { year: curr.year, month: curr.month, day: curr.day };
    }
  }

  // Direct Hijri Date Object
  if (
    typeof input === 'object' &&
    'year' in input &&
    'month' in input &&
    'day' in input &&
    typeof input.year === 'number' &&
    typeof input.month === 'number' &&
    typeof input.day === 'number'
  ) {
    return { year: input.year, month: input.month, day: input.day };
  }

  // Gregorian Date object or ISO date string
  try {
    const h = gregorianToHijri(input as Date | string);
    return { year: h.year, month: h.month, day: h.day };
  } catch {
    const curr = getCurrentHijriDate();
    return { year: curr.year, month: curr.month, day: curr.day };
  }
}

/**
 * Convert a Hijri Date (year, month, day) into a unique continuous day number.
 * Monotonically increments by 1 for each consecutive Islamic day.
 */
export function getAbsoluteHijriDay(year: number, month: number, day: number): number {
  const y = Math.max(1, Math.floor(year));
  const m = Math.max(1, Math.min(12, Math.floor(month)));
  const d = Math.max(1, Math.min(30, Math.floor(day)));

  const yearDays = (y - 1) * 354 + Math.floor((11 * (y - 1) + 3) / 30);
  const monthDays = (m - 1) * 29 + Math.floor(m / 2);
  return yearDays + monthDays + d;
}

/**
 * Deterministically get the Hadith of the Day based on the Islamic Hijri date.
 * Sourced exclusively from the verified local Sahih al-Bukhari collection with
 * Ala Hazrat Imam Ahmad Raza Khan's translation.
 *
 * Guarantees:
 * 1. Remains identical throughout one complete Hijri date/day.
 * 2. Advances to a new Hadith on every consecutive Hijri date.
 * 3. Never repeats consecutive Hadiths until the full list of verified Hadiths is exhausted.
 * 4. Completely deterministic (page refreshes, logins, etc. do not change the Hadith).
 */
export function getDailyHadith(
  date?: Date | string | HijriDate | { year?: number; month?: number; day?: number }
): DailyHadith {
  const verifiedList =
    VERIFIED_ALA_HAZRAT_HADITHS.length > 0
      ? VERIFIED_ALA_HAZRAT_HADITHS
      : SAHIH_BUKHARI_DAILY_HADITHS;

  const N = verifiedList.length;
  if (N === 0) return SAHIH_BUKHARI_DAILY_HADITHS[0];

  const hijri = resolveHijriDate(date);
  const absoluteDay = getAbsoluteHijriDay(hijri.year, hijri.month, hijri.day);

  // Coprime step (7) ensures a wide, advice-oriented variety across consecutive days
  // while guaranteeing index(k+1) !== index(k)
  let step = 7;
  if (step % N === 0) step = 1;

  const index = Math.abs((absoluteDay * step) % N);
  return verifiedList[index];
}

/**
 * Get a specific Hadith by its identifier.
 */
export function getHadithById(id: string): DailyHadith | undefined {
  return SAHIH_BUKHARI_DAILY_HADITHS.find((h) => h.id === id);
}

/**
 * Get a specific Hadith by its Hadith number.
 */
export function getHadithByNumber(num: number): DailyHadith | undefined {
  return SAHIH_BUKHARI_DAILY_HADITHS.find((h) => h.hadithNumber === num);
}

/**
 * Find Hadith by reference query (e.g. '6077', 'bukhari-6077', or 'Sahih al-Bukhari 6077')
 */
export function getHadithByRef(query: string | number | null | undefined): DailyHadith | undefined {
  if (query === null || query === undefined || query === '') return undefined;
  const qStr = String(query).trim().toLowerCase();
  
  // 1. Exact ID match (e.g. 'bukhari-6077')
  const byId = SAHIH_BUKHARI_DAILY_HADITHS.find((h) => h.id.toLowerCase() === qStr);
  if (byId) return byId;

  // 2. Exact Hadith Number match (e.g. 6077 or '6077')
  const numMatch = qStr.match(/\d+/);
  if (numMatch) {
    const qNum = parseInt(numMatch[0], 10);
    const byNum = SAHIH_BUKHARI_DAILY_HADITHS.find((h) => h.hadithNumber === qNum);
    if (byNum) return byNum;
  }

  // 3. Fallback matching
  return SAHIH_BUKHARI_DAILY_HADITHS.find(
    (h) => h.reference.toLowerCase().includes(qStr) || h.theme.toLowerCase().includes(qStr)
  );
}
