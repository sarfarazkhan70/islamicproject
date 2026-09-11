// ============================================================================
// HADAIQ-E-BAKHSHISH: AUTHENTIC ARCHIVE.ORG EDITION METADATA & NAAT INDEX
// للإمام المجدد أحمد رضا خان القادري رحمه الله (۱۲۷۲ - ۱۳۴۰ هـ / ۱۸۵۶ - ۱۹۲۱ م)
// Complete Diwan Collection with Accurate Index & Page-by-Page Navigation
// ============================================================================

export const LOCAL_HADAIQ_PDF_PATH = '/pdf/hadaiq_e_bakhshish.pdf';
export const HADAIQ_TOTAL_PAGES = 454;
export const HADAIQ_VISIBLE_TOTAL_PAGES = 444; // 454 pages minus 10 skipped pages (2..11)
export const HADAIQ_SKIPPED_PDF_PAGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/**
 * Maps a visible reader page number (1..444) to the original authentic PDF page number (1, 12..454).
 * - Visible Page 1 -> Original PDF Page 1
 * - Visible Page 2 -> Original PDF Page 12
 * - Visible Page 3 -> Original PDF Page 13
 * - Visible Page 444 -> Original PDF Page 454
 */
export function getPdfPageFromVisiblePage(visiblePage: number): number {
  const clamped = Math.max(1, Math.min(HADAIQ_VISIBLE_TOTAL_PAGES, visiblePage));
  if (clamped === 1) return 1;
  return clamped + 10;
}

/**
 * Maps an original authentic PDF page number (1..454) to the visible reader page number (1..444).
 * If the PDF page falls within the skipped range (2..11), it safely resolves to page 1.
 */
export function getVisiblePageFromPdfPage(pdfPage: number): number {
  if (pdfPage <= 1) return 1;
  if (pdfPage >= 2 && pdfPage <= 11) {
    return 1;
  }
  const visible = pdfPage - 10;
  return Math.max(1, Math.min(HADAIQ_VISIBLE_TOTAL_PAGES, visible));
}

export interface HadaiqPageMapping {
  visiblePage: number;
  pdfPage: number;
}

export const HADAIQ_VISIBLE_PAGES: HadaiqPageMapping[] = Array.from(
  { length: HADAIQ_VISIBLE_TOTAL_PAGES },
  (_, i) => {
    const visiblePage = i + 1;
    return {
      visiblePage,
      pdfPage: getPdfPageFromVisiblePage(visiblePage),
    };
  }
);

export interface HadaiqKalamItem {
  id: number;
  title: string;
  category: 'hamd' | 'naat' | 'manqabat' | 'salam' | 'munajat' | 'rubaiyat';
  categoryUrdu: string;
  pdfPage: number;
  printedPage: number;
}

export const HADAIQ_KALAMS_INDEX: HadaiqKalamItem[] = [
  // Front Matter
  {
    id: 1,
    title: 'مقدمہ و فضائلِ نعت شریف (تعارفِ کلام)',
    category: 'munajat',
    categoryUrdu: 'مقدمہ',
    pdfPage: 3,
    printedPage: 1,
  },
  {
    id: 2,
    title: 'فہرستِ کلام و مندرجاتِ دیوان',
    category: 'munajat',
    categoryUrdu: 'فہرست',
    pdfPage: 11,
    printedPage: 9,
  },
  // Part 1: Hamd & Naat Sharif
  {
    id: 3,
    title: 'حمدِ باری تعالیٰ: واہ کیا جود و کرم ہے شہ بطحا تیرا (آغازِ کلام)',
    category: 'hamd',
    categoryUrdu: 'حمد و نعت',
    pdfPage: 21,
    printedPage: 15,
  },
  {
    id: 4,
    title: 'منقبتِ غوثِ اعظم: واہ کیا مرتبہ اے غوث ہے بالا تیرا',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 25,
    printedPage: 19,
  },
  {
    id: 5,
    title: 'پڑھے درود کہ ہر روز عید ہو جس کی',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 29,
    printedPage: 23,
  },
  {
    id: 6,
    title: 'الاماں قہر ہے اے غوث وہ تیکھا تیرا',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 34,
    printedPage: 28,
  },
  {
    id: 7,
    title: 'ہم خاک ہیں اور خاک ہی ماوا ہے ہمارا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 38,
    printedPage: 32,
  },
  {
    id: 8,
    title: 'مٹ گئے مٹتے ہیں مٹ جائیں گے اعدا تیرے',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 40,
    printedPage: 34,
  },
  {
    id: 9,
    title: 'اے مظہرِ کامل ترے اعجاز و کمالات',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 43,
    printedPage: 37,
  },
  {
    id: 10,
    title: 'لطف ان کا عام ہو ہی جائے گا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 46,
    printedPage: 40,
  },
  {
    id: 11,
    title: 'لم یات نظیرک فی نظر مثل تو نہ شد پیدا جانا (عربی، فارسی، ہندی و اردو)',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 49,
    printedPage: 43,
  },
  {
    id: 12,
    title: 'فلک کو عرش کو یوں سر کشیدہ ہونا تھا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 52,
    printedPage: 46,
  },
  {
    id: 13,
    title: 'صبحِ طیبہ میں ہوئی بٹتا ہے باڑا نور کا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 54,
    printedPage: 48,
  },
  {
    id: 14,
    title: 'خراب حال کیا دل کو پر ملال کیا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 56,
    printedPage: 50,
  },
  {
    id: 15,
    title: 'بندہ ملنے کو قریبِ حضرتِ قادر گیا',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 58,
    printedPage: 52,
  },
  {
    id: 16,
    title: 'تیری بارگاہ سے جس کو سرفرازی ملی',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 61,
    printedPage: 55,
  },
  {
    id: 17,
    title: 'پھر اٹھا تجر گردِ بابِ عرب',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 63,
    printedPage: 57,
  },
  {
    id: 18,
    title: 'پھر اٹھا ولولہ یادِ شہِ ابرار',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 66,
    printedPage: 60,
  },
  {
    id: 19,
    title: 'جرم پر ہے بہارین آرائی دوست',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 68,
    printedPage: 62,
  },
  {
    id: 20,
    title: 'انبیا میں جو سب سے اونچی شان والا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 70,
    printedPage: 64,
  },
  {
    id: 21,
    title: 'زہے عزت و اعتلاۓ محمد ﷺ',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 71,
    printedPage: 65,
  },
  {
    id: 22,
    title: 'اے شافعِ امم شہِ ذی جاہ لے خبر',
    category: 'naat',
    categoryUrdu: 'استغاثہ',
    pdfPage: 73,
    printedPage: 67,
  },
  {
    id: 23,
    title: 'ابنِ قادر کا بھی قادری بھی ہے بالقدر',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 75,
    printedPage: 69,
  },
  {
    id: 24,
    title: 'گزرے جس راہ سے وہ سالار ہو کر',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 76,
    printedPage: 70,
  },
  {
    id: 25,
    title: 'نارِ دوزخ کو چمن کر دے بہارِ عارض',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 77,
    printedPage: 71,
  },
  {
    id: 26,
    title: 'تمہارے ذرے کے آگے تو ستارہ لالک',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 79,
    printedPage: 73,
  },
  {
    id: 27,
    title: 'اک آنسو کا قطرہ بھی پلٹ دے گا عذاب',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 81,
    printedPage: 75,
  },
  {
    id: 28,
    title: 'سر تا بقدم تن سلطانِ زمن پھول',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 84,
    printedPage: 78,
  },
  {
    id: 29,
    title: 'ہے کلام الہی میں شمس و ضحی',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 86,
    printedPage: 80,
  },
  {
    id: 30,
    title: 'پاٹ وہ راحت فزا پائے سرِ بالینِ یار',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 88,
    printedPage: 82,
  },
  {
    id: 31,
    title: 'عالمِ قدس کی افروزی ہیں انوار بیٹیاں',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 92,
    printedPage: 86,
  },
  {
    id: 32,
    title: 'جشنِ مولود میں یوں خونِ جگر کھایا جائے',
    category: 'naat',
    categoryUrdu: 'میلاد شریف',
    pdfPage: 94,
    printedPage: 88,
  },
  {
    id: 33,
    title: 'حرفِ توحید کی ہے فضا عیاں',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 96,
    printedPage: 90,
  },
  {
    id: 34,
    title: 'اوج کیا ہو فرشِ بریں کے مصطفےٰ',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 99,
    printedPage: 93,
  },
  {
    id: 35,
    title: 'ہے شفاعت کی حامی',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 100,
    printedPage: 94,
  },
  {
    id: 36,
    title: 'یادِ وطن ستائے تو دشتِ عدم کو جائیں کیوں',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 102,
    printedPage: 96,
  },
  {
    id: 37,
    title: 'اہلِ صراط روح الامین کو خبر کریں',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 104,
    printedPage: 98,
  },
  {
    id: 38,
    title: 'وہ سوئے لالہ زار پھرتے ہیں',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 105,
    printedPage: 99,
  },
  {
    id: 39,
    title: 'الہی آبرو رکھ لے دل کے ٹوٹے پیالے کی',
    category: 'munajat',
    categoryUrdu: 'مناجات',
    pdfPage: 107,
    printedPage: 101,
  },
  {
    id: 40,
    title: 'دل کو ان سے خدا کرے نہ جدا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 109,
    printedPage: 103,
  },
  {
    id: 41,
    title: 'راحتِ جاں ہے جو ان نادیدہ رشتوں میں',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 111,
    printedPage: 105,
  },
  {
    id: 42,
    title: 'وہ کمالِ حسنِ حضور ہے کہ گمانِ باطل نہیں رہا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 113,
    printedPage: 107,
  },
  {
    id: 43,
    title: 'دشمنِ احمد پہ شدت کیجئے',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 116,
    printedPage: 110,
  },
  {
    id: 44,
    title: 'وصفِ رخ ان کا کیا کرتے ہیں',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 118,
    printedPage: 112,
  },
  {
    id: 45,
    title: 'چمک تجھ سے پاتے ہیں سب پانے والے',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 159,
    printedPage: 153,
  },
  {
    id: 46,
    title: 'تو شمعِ رسالت ہے عالم تیرا پروانہ',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 163,
    printedPage: 157,
  },
  {
    id: 47,
    title: 'کیا ہی ذوق افزا شفاعت ہے تمہاری یا رسول اللہ',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 183,
    printedPage: 177,
  },
  {
    id: 48,
    title: 'سب سے اولیٰ و اعلیٰ ہمارا نبی',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 191,
    printedPage: 185,
  },
  {
    id: 49,
    title: 'نعمتیں بانٹتا جس سمت وہ ذیشان گیا',
    category: 'naat',
    categoryUrdu: 'نعتِ پاک',
    pdfPage: 197,
    printedPage: 191,
  },
  {
    id: 50,
    title: 'کعبے کے بدر الدجیٰ تم پہ کروڑوں درود',
    category: 'naat',
    categoryUrdu: 'درود شریف',
    pdfPage: 270,
    printedPage: 264,
  },
  {
    id: 51,
    title: 'قصیدہ معراجیہ: وہ سرورِ کشورِ رسالت جو عرش پر جلوہ گر ہوئے تھے',
    category: 'naat',
    categoryUrdu: 'قصیدہ معراجیہ',
    pdfPage: 279,
    printedPage: 273,
  },
  {
    id: 52,
    title: 'سلامِ رضا: مصطفیٰ جانِ رحمت پہ لاکھوں سلام',
    category: 'salam',
    categoryUrdu: 'سلامِ رضا',
    pdfPage: 302,
    printedPage: 295,
  },
  {
    id: 53,
    title: 'اے شافعِ امم شہِ ذی جاہ لے خبر (استغاثہ)',
    category: 'naat',
    categoryUrdu: 'استغاثہ',
    pdfPage: 324,
    printedPage: 317,
  },
  {
    id: 54,
    title: 'منقبت مولائے کائنات: شیرِ خدا حیدرِ کرار مشکل کشا',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 330,
    printedPage: 323,
  },
  {
    id: 55,
    title: 'شہدائے کربلا یا دشتِ کرب و بلا',
    category: 'manqabat',
    categoryUrdu: 'منقبتِ شہدا',
    pdfPage: 333,
    printedPage: 326,
  },
  {
    id: 56,
    title: 'السید السادات شاہ جیلان (منقبتِ غوثیہ)',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 335,
    printedPage: 328,
  },
  {
    id: 57,
    title: 'منقبت خواجہ غریب نواز: اجمیر کے والی شاہِ سنجر',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 337,
    printedPage: 330,
  },
  {
    id: 58,
    title: 'یا ابن ہذا المرتبے یا عبد الرزاق الوریٰ',
    category: 'manqabat',
    categoryUrdu: 'منقبت',
    pdfPage: 340,
    printedPage: 333,
  },
  {
    id: 59,
    title: 'رباعیات، قطعات و مناجاتِ اعلیٰ حضرت',
    category: 'rubaiyat',
    categoryUrdu: 'رباعیات',
    pdfPage: 352,
    printedPage: 345,
  },
];
