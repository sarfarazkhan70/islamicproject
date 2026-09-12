// ============================================================================
// HADAIQ-E-BAKHSHISH ENGLISH EDITION METADATA
// Transliteration & English Translation by Muhammad Shakeel Qadri Razavi
// للإمام المجدد أحمد رضا خان القادري رحمه الله (۱۲۷۲ - ۱۳۴۰ هـ / ۱۸۵۶ - ۱۹۲۱ م)
// Complete 319 Printed Pages Authentic English Edition from Archive.org
// Source: https://archive.org/details/HadaiqEBakhshishEnglishByMuhammadShakeelQadriRazavi
// ============================================================================

export const LOCAL_HADAIQ_ENGLISH_PDF_PATH = '/pdf/hadaiq_e_bakhshish_english.pdf';
export const HADAIQ_ENGLISH_TOTAL_PDF_PAGES = 319; // Total pages in PDF file
export const HADAIQ_ENGLISH_PRINTED_TOTAL_PAGES = 319; // Physical printed page count (1..319)
export const HADAIQ_ENGLISH_TOTAL_PAGES = 319; // Usable printed page count
export const HADAIQ_ENGLISH_ARCHIVE_URL =
  'https://archive.org/details/HadaiqEBakhshishEnglishByMuhammadShakeelQadriRazavi';

/**
 * Maps a physical printed English book page number (1..319) to the scanned PDF page number (1..319).
 * 1:1 direct authentic physical page mapping.
 */
export function getPdfPageFromPrintedPage(printedPage: number): number {
  return Math.max(1, Math.min(HADAIQ_ENGLISH_PRINTED_TOTAL_PAGES, printedPage));
}

/**
 * Maps a scanned PDF page number (1..319) to the physical printed English book page number (1..319).
 */
export function getPrintedPageFromPdfPage(pdfPage: number): number {
  return Math.max(1, Math.min(HADAIQ_ENGLISH_PRINTED_TOTAL_PAGES, pdfPage));
}

export interface HadaiqEnglishPageMapping {
  printedPage: number;
  pdfPage: number;
}

export const HADAIQ_ENGLISH_PRINTED_PAGES: HadaiqEnglishPageMapping[] = Array.from(
  { length: HADAIQ_ENGLISH_PRINTED_TOTAL_PAGES },
  (_, i) => {
    const printedPage = i + 1;
    return {
      printedPage,
      pdfPage: getPdfPageFromPrintedPage(printedPage),
    };
  }
);

export const HADAIQ_ENGLISH_PAGES = HADAIQ_ENGLISH_PRINTED_PAGES;

export interface HadaiqEnglishKalamItem {
  id: number;
  titleEnglish: string;
  titleUrdu: string;
  title: string;
  category: 'hamd' | 'naat' | 'manqabat' | 'salam' | 'munajat' | 'rubaiyat';
  categoryEnglish: string;
  categoryUrdu: string;
  pdfPage: number;
  printedPage: number;
}

export const HADAIQ_ENGLISH_KALAMS_INDEX: HadaiqEnglishKalamItem[] = [
  {
    "id": 1,
    "titleEnglish": "Foreword & Compiler Note",
    "titleUrdu": "مقدمہ و تعارف",
    "title": "Foreword & Compiler Note (Introduction)",
    "category": "munajat",
    "categoryEnglish": "Foreword",
    "categoryUrdu": "مقدمہ",
    "pdfPage": 3,
    "printedPage": 3
  },
  {
    "id": 2,
    "titleEnglish": "Table of Contents (Index of Kalams)",
    "titleUrdu": "فہرستِ کلام",
    "title": "Table of Contents (Index)",
    "category": "munajat",
    "categoryEnglish": "Contents",
    "categoryUrdu": "فہرست",
    "pdfPage": 6,
    "printedPage": 6
  },
  {
    "id": 3,
    "titleEnglish": "Waah Kya Jood-o-karam Hay Shah-e-batha Teraa",
    "titleUrdu": "",
    "title": "Waah Kya Jood-o-karam Hay Shah-e-batha Teraa",
    "category": "hamd",
    "categoryEnglish": "Hamd & Naat",
    "categoryUrdu": "حمد و نعت",
    "pdfPage": 11,
    "printedPage": 11
  },
  {
    "id": 4,
    "titleEnglish": "Waah Kya Martaba Aay Ghaus Hay Baala Tera",
    "titleUrdu": "",
    "title": "Waah Kya Martaba Aay Ghaus Hay Baala Tera",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 14,
    "printedPage": 14
  },
  {
    "id": 5,
    "titleEnglish": "Tu Hay Woh Ghaus Key Har Ghaus Hay Shaida Teraa",
    "titleUrdu": "",
    "title": "Tu Hay Woh Ghaus Key Har Ghaus Hay Shaida Teraa",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 17,
    "printedPage": 17
  },
  {
    "id": 6,
    "titleEnglish": "Al Amaan Qeher Hay Aay Ghaus Woh Teekha Teraa",
    "titleUrdu": "",
    "title": "Al Amaan Qeher Hay Aay Ghaus Woh Teekha Teraa",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 20,
    "printedPage": 20
  },
  {
    "id": 7,
    "titleEnglish": "Hum Khaak Hain Aur Khaak Hi Maawa Hay Hamara",
    "titleUrdu": "",
    "title": "Hum Khaak Hain Aur Khaak Hi Maawa Hay Hamara",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 23,
    "printedPage": 23
  },
  {
    "id": 8,
    "titleEnglish": "Gham Ho Gaye Beshumaar Aaqa",
    "titleUrdu": "",
    "title": "Gham Ho Gaye Beshumaar Aaqa",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 24,
    "printedPage": 24
  },
  {
    "id": 9,
    "titleEnglish": "Muhammad Mazhar-e-kaamil",
    "titleUrdu": "",
    "title": "Muhammad Mazhar-e-kaamil",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 26,
    "printedPage": 26
  },
  {
    "id": 10,
    "titleEnglish": "Lutf Unka Aam Ho Hi Jaayega",
    "titleUrdu": "",
    "title": "Lutf Unka Aam Ho Hi Jaayega",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 28,
    "printedPage": 28
  },
  {
    "id": 11,
    "titleEnglish": "Lam Yaati Nazeeruka Fee Nazarin",
    "titleUrdu": "",
    "title": "Lam Yaati Nazeeruka Fee Nazarin",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 30,
    "printedPage": 30
  },
  {
    "id": 12,
    "titleEnglish": "na Aasmaan ko Yoon Sar Kasheedah Hona Tha",
    "titleUrdu": "",
    "title": "na Aasmaan ko Yoon Sar Kasheedah Hona Tha",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 31,
    "printedPage": 31
  },
  {
    "id": 13,
    "titleEnglish": "Shor-e-mah-e-nau Sun Kar Tujh Tak Main Dawaan Aaya",
    "titleUrdu": "",
    "title": "Shor-e-mah-e-nau Sun Kar Tujh Tak Main Dawaan Aaya",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 33,
    "printedPage": 33
  },
  {
    "id": 14,
    "titleEnglish": "Kharaab Haal Kiya Dil ko Pur Malaal Kiya",
    "titleUrdu": "",
    "title": "Kharaab Haal Kiya Dil ko Pur Malaal Kiya",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 35,
    "printedPage": 35
  },
  {
    "id": 15,
    "titleEnglish": "Bandah Milne ko Qareeb-e-hazrat-e-qaadir Gaya",
    "titleUrdu": "",
    "title": "Bandah Milne ko Qareeb-e-hazrat-e-qaadir Gaya",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 37,
    "printedPage": 37
  },
  {
    "id": 16,
    "titleEnglish": "Taab-e-miraat-e-saher Gard-e-bayabaan-e-arab",
    "titleUrdu": "",
    "title": "Taab-e-miraat-e-saher Gard-e-bayabaan-e-arab",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 40,
    "printedPage": 40
  },
  {
    "id": 17,
    "titleEnglish": "Phir Utha Walwala-e-yaad-e- Mugheelaan-e-arab",
    "titleUrdu": "",
    "title": "Phir Utha Walwala-e-yaad-e- Mugheelaan-e-arab",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 42,
    "printedPage": 42
  },
  {
    "id": 18,
    "titleEnglish": "Jo Banon Par Hay Bahaar-e-chaman Aarai-e-dost",
    "titleUrdu": "",
    "title": "Jo Banon Par Hay Bahaar-e-chaman Aarai-e-dost",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 44,
    "printedPage": 44
  },
  {
    "id": 19,
    "titleEnglish": "Tooba Mein Jo Sab Sey Oonchi Naazuk Seedhi Nikli Shaakh",
    "titleUrdu": "",
    "title": "Tooba Mein Jo Sab Sey Oonchi Naazuk Seedhi Nikli Shaakh",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 46,
    "printedPage": 46
  },
  {
    "id": 20,
    "titleEnglish": "Bandah Qaadir ka Bhi Qaadir Bhi Hay Abdul Qaadir",
    "titleUrdu": "",
    "title": "Bandah Qaadir ka Bhi Qaadir Bhi Hay Abdul Qaadir",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 51,
    "printedPage": 51
  },
  {
    "id": 21,
    "titleEnglish": "Guzre Jis Raah Sey Wo Sayyid-e-waala Ho Kar",
    "titleUrdu": "",
    "title": "Guzre Jis Raah Sey Wo Sayyid-e-waala Ho Kar",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 52,
    "printedPage": 52
  },
  {
    "id": 22,
    "titleEnglish": "Naar-e-dozakh ko Chaman Kar De Bahaar-e-aariz",
    "titleUrdu": "",
    "title": "Naar-e-dozakh ko Chaman Kar De Bahaar-e-aariz",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 53,
    "printedPage": 53
  },
  {
    "id": 23,
    "titleEnglish": "Tumhaare Zarre Key Par To Sitaar Haaye Falak",
    "titleUrdu": "",
    "title": "Tumhaare Zarre Key Par To Sitaar Haaye Falak",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 55,
    "printedPage": 55
  },
  {
    "id": 24,
    "titleEnglish": "Kya Theek Ho Rukh-e-nabwi Par Misaal-e-gul",
    "titleUrdu": "",
    "title": "Kya Theek Ho Rukh-e-nabwi Par Misaal-e-gul",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 57,
    "printedPage": 57
  },
  {
    "id": 25,
    "titleEnglish": "Sar Ta Ba Qadam Hay Tan-e-sultaan-e-zaman Phool",
    "titleUrdu": "",
    "title": "Sar Ta Ba Qadam Hay Tan-e-sultaan-e-zaman Phool",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 59,
    "printedPage": 59
  },
  {
    "id": 26,
    "titleEnglish": "Hay Kalaam-e-ilaahi Mein Shams-o-duhaa Tere Chehra-e-noor Fiza ki Qasam",
    "titleUrdu": "",
    "title": "Hay Kalaam-e-ilaahi Mein Shams-o-duhaa Tere Chehra-e-noor Fiza ki Qasam",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 61,
    "printedPage": 61
  },
  {
    "id": 27,
    "titleEnglish": "Paat Wo Kuch Dhaar Ye Kuch Zaar Ham",
    "titleUrdu": "",
    "title": "Paat Wo Kuch Dhaar Ye Kuch Zaar Ham",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 62,
    "printedPage": 62
  },
  {
    "id": 28,
    "titleEnglish": "Aariz-e-shams-o-qamar Sey Bhi Hain Anwar Aeriyan",
    "titleUrdu": "",
    "title": "Aariz-e-shams-o-qamar Sey Bhi Hain Anwar Aeriyan",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 65,
    "printedPage": 65
  },
  {
    "id": 29,
    "titleEnglish": "Ishq-e-mawla Mein Hoon Khoon Baar Kinaar-e-daaman",
    "titleUrdu": "",
    "title": "Ishq-e-mawla Mein Hoon Khoon Baar Kinaar-e-daaman",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 66,
    "printedPage": 66
  },
  {
    "id": 30,
    "titleEnglish": "Rashke Qamar Hoon",
    "titleUrdu": "",
    "title": "Rashke Qamar Hoon",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 67,
    "printedPage": 67
  },
  {
    "id": 31,
    "titleEnglish": "Poochte Kya Ho Arsh Par Yoon Gaye Mustafa Key Yoon",
    "titleUrdu": "",
    "title": "Poochte Kya Ho Arsh Par Yoon Gaye Mustafa Key Yoon",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 69,
    "printedPage": 69
  },
  {
    "id": 32,
    "titleEnglish": "Phir Key Gali Gali Tabaah Thokarein Sabki Khaayein Kyoon",
    "titleUrdu": "",
    "title": "Phir Key Gali Gali Tabaah Thokarein Sabki Khaayein Kyoon",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 70,
    "printedPage": 70
  },
  {
    "id": 33,
    "titleEnglish": "Yaad-e-watan Sitam Kiya Dasht-e-haram Sey Laayi Kyoon",
    "titleUrdu": "",
    "title": "Yaad-e-watan Sitam Kiya Dasht-e-haram Sey Laayi Kyoon",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 72,
    "printedPage": 72
  },
  {
    "id": 34,
    "titleEnglish": "Ahle Siraat Rooh-e-ameen ko Khabar Kare(n)",
    "titleUrdu": "",
    "title": "Ahle Siraat Rooh-e-ameen ko Khabar Kare(n)",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 74,
    "printedPage": 74
  },
  {
    "id": 35,
    "titleEnglish": "Unki Mahek Ne Dil Key Ghunchey Khila Diye Hain",
    "titleUrdu": "",
    "title": "Unki Mahek Ne Dil Key Ghunchey Khila Diye Hain",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 77,
    "printedPage": 77
  },
  {
    "id": 36,
    "titleEnglish": "Hay Lab-e-isaa Sey Jaan Bakhshi Niraali Haath Mein",
    "titleUrdu": "",
    "title": "Hay Lab-e-isaa Sey Jaan Bakhshi Niraali Haath Mein",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 78,
    "printedPage": 78
  },
  {
    "id": 37,
    "titleEnglish": "Raah-e-irfan Sey Jo Hum Naa Deedah Ru Mahram Nahin",
    "titleUrdu": "",
    "title": "Raah-e-irfan Sey Jo Hum Naa Deedah Ru Mahram Nahin",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 80,
    "printedPage": 80
  },
  {
    "id": 38,
    "titleEnglish": "Woh Kamaal-e-husne Huzoor Hay ki Gumaane Naqs Jahaan Nahin",
    "titleUrdu": "",
    "title": "Woh Kamaal-e-husne Huzoor Hay ki Gumaane Naqs Jahaan Nahin",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 81,
    "printedPage": 81
  },
  {
    "id": 39,
    "titleEnglish": "Rukh Din Hay Yaa Mehre Samaa, Ye Bhi Nahi Wo Bhi Nahi",
    "titleUrdu": "",
    "title": "Rukh Din Hay Yaa Mehre Samaa, Ye Bhi Nahi Wo Bhi Nahi",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 83,
    "printedPage": 83
  },
  {
    "id": 40,
    "titleEnglish": "Wasfe Rukh Unka Kiya Karte Hain",
    "titleUrdu": "",
    "title": "Wasfe Rukh Unka Kiya Karte Hain",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 84,
    "printedPage": 84
  },
  {
    "id": 41,
    "titleEnglish": "Bar Tar Qayaas Sey Hay Maqaam-e-abul Hussain",
    "titleUrdu": "",
    "title": "Bar Tar Qayaas Sey Hay Maqaam-e-abul Hussain",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 86,
    "printedPage": 86
  },
  {
    "id": 42,
    "titleEnglish": "Zairo Paas-e-adab Rakho Hawas Jaane Do",
    "titleUrdu": "",
    "title": "Zairo Paas-e-adab Rakho Hawas Jaane Do",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 89,
    "printedPage": 89
  },
  {
    "id": 43,
    "titleEnglish": "Chamane Taybah Mein Sumbul Jo Sawaare Gesu",
    "titleUrdu": "",
    "title": "Chamane Taybah Mein Sumbul Jo Sawaare Gesu",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 90,
    "printedPage": 90
  },
  {
    "id": 44,
    "titleEnglish": "Zamaana Hajj ka Hay Jalwa Diya Hay Shaahide Gul ko",
    "titleUrdu": "",
    "title": "Zamaana Hajj ka Hay Jalwa Diya Hay Shaahide Gul ko",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 92,
    "printedPage": 92
  },
  {
    "id": 45,
    "titleEnglish": "Yaad Mein Jiski Nahin Hosh-e-tan-o-jaan Humko",
    "titleUrdu": "",
    "title": "Yaad Mein Jiski Nahin Hosh-e-tan-o-jaan Humko",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 93,
    "printedPage": 93
  },
  {
    "id": 46,
    "titleEnglish": "Haajiyo Aao Shahenshaah ka Roza Dekho",
    "titleUrdu": "",
    "title": "Haajiyo Aao Shahenshaah ka Roza Dekho",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 95,
    "printedPage": 95
  },
  {
    "id": 47,
    "titleEnglish": "Pul Say Utaaro Raah Ghuzar ko Khabar na Ho",
    "titleUrdu": "",
    "title": "Pul Say Utaaro Raah Ghuzar ko Khabar na Ho",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 97,
    "printedPage": 97
  },
  {
    "id": 48,
    "titleEnglish": "Yaa Ilaahi Har Jagah Teri ‘ataa ka Saath Ho",
    "titleUrdu": "",
    "title": "Yaa Ilaahi Har Jagah Teri ‘ataa ka Saath Ho",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 98,
    "printedPage": 98
  },
  {
    "id": 49,
    "titleEnglish": "Rounaq-e-bazme Jahaan Hay Aashiqan-e-sokhta",
    "titleUrdu": "",
    "title": "Rounaq-e-bazme Jahaan Hay Aashiqan-e-sokhta",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 102,
    "printedPage": 102
  },
  {
    "id": 50,
    "titleEnglish": "Dil ko Unse Khuda Judaa na Kare",
    "titleUrdu": "",
    "title": "Dil ko Unse Khuda Judaa na Kare",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 107,
    "printedPage": 107
  },
  {
    "id": 51,
    "titleEnglish": "Momin Woh Hay Jo Unki Izzat pe Mare Dil Sey",
    "titleUrdu": "",
    "title": "Momin Woh Hay Jo Unki Izzat pe Mare Dil Sey",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 109,
    "printedPage": 109
  },
  {
    "id": 52,
    "titleEnglish": "Allah Allah Key Nabi Sey",
    "titleUrdu": "",
    "title": "Allah Allah Key Nabi Sey",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 110,
    "printedPage": 110
  },
  {
    "id": 53,
    "titleEnglish": "Qaafile Ne Soo-e-taibah Kamar Arayi ki",
    "titleUrdu": "",
    "title": "Qaafile Ne Soo-e-taibah Kamar Arayi ki",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 116,
    "printedPage": 116
  },
  {
    "id": 54,
    "titleEnglish": "Chamak Tujhse Paate Hain Sab Paane Waale",
    "titleUrdu": "",
    "title": "Chamak Tujhse Paate Hain Sab Paane Waale",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 119,
    "printedPage": 119
  },
  {
    "id": 55,
    "titleEnglish": "Aankhein Ro Ro Key Sujaane Waale",
    "titleUrdu": "",
    "title": "Aankhein Ro Ro Key Sujaane Waale",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 120,
    "printedPage": 120
  },
  {
    "id": 56,
    "titleEnglish": "Kya Mahektay Hain Mehekney Waley",
    "titleUrdu": "",
    "title": "Kya Mahektay Hain Mehekney Waley",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 122,
    "printedPage": 122
  },
  {
    "id": 57,
    "titleEnglish": "Raah Pur Khaar Hay Kya Hona Hay",
    "titleUrdu": "",
    "title": "Raah Pur Khaar Hay Kya Hona Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 124,
    "printedPage": 124
  },
  {
    "id": 58,
    "titleEnglish": "Kis Key Jalwe ki Jhalak Hay Yeh Ujaala Kya Hay",
    "titleUrdu": "",
    "title": "Kis Key Jalwe ki Jhalak Hay Yeh Ujaala Kya Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 128,
    "printedPage": 128
  },
  {
    "id": 59,
    "titleEnglish": "Sarwar Kahoon Key Maalik-o-maula Kahoon Tujhe",
    "titleUrdu": "",
    "title": "Sarwar Kahoon Key Maalik-o-maula Kahoon Tujhe",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 131,
    "printedPage": 131
  },
  {
    "id": 60,
    "titleEnglish": "‘arsh ki Aql Dang Hay Charkh Mein Aasmaan Hay",
    "titleUrdu": "",
    "title": "‘arsh ki Aql Dang Hay Charkh Mein Aasmaan Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 133,
    "printedPage": 133
  },
  {
    "id": 61,
    "titleEnglish": "Uthaa Do Parda Dikhaa Do Chehra",
    "titleUrdu": "",
    "title": "Uthaa Do Parda Dikhaa Do Chehra",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 135,
    "printedPage": 135
  },
  {
    "id": 62,
    "titleEnglish": "Andheri Raat Hay Gham ki Ghataa ‘isyaan ki Kaali Hay",
    "titleUrdu": "",
    "title": "Andheri Raat Hay Gham ki Ghataa ‘isyaan ki Kaali Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 137,
    "printedPage": 137
  },
  {
    "id": 63,
    "titleEnglish": "Soona Jungle Raat Andheri Chaayi Badli Kaali Hay",
    "titleUrdu": "",
    "title": "Soona Jungle Raat Andheri Chaayi Badli Kaali Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 139,
    "printedPage": 139
  },
  {
    "id": 64,
    "titleEnglish": "Nabi Sarware Har Rasool-o-wali Hay",
    "titleUrdu": "",
    "title": "Nabi Sarware Har Rasool-o-wali Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 141,
    "printedPage": 141
  },
  {
    "id": 65,
    "titleEnglish": "na ‘arsh-e-ayman na Inni Zaahibun Mein Meyhmaani Hay",
    "titleUrdu": "",
    "title": "na ‘arsh-e-ayman na Inni Zaahibun Mein Meyhmaani Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 143,
    "printedPage": 143
  },
  {
    "id": 66,
    "titleEnglish": "Suntey Hain Keh Mehshar Mein",
    "titleUrdu": "",
    "title": "Suntey Hain Keh Mehshar Mein",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 145,
    "printedPage": 145
  },
  {
    "id": 67,
    "titleEnglish": "Dushman-e-ahmad pe Shiddat Kijiye",
    "titleUrdu": "",
    "title": "Dushman-e-ahmad pe Shiddat Kijiye",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 150,
    "printedPage": 150
  },
  {
    "id": 68,
    "titleEnglish": "Shukr-e-khuda Key Aaj Gharri Uss Safar ki Hay",
    "titleUrdu": "",
    "title": "Shukr-e-khuda Key Aaj Gharri Uss Safar ki Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 152,
    "printedPage": 152
  },
  {
    "id": 69,
    "titleEnglish": "Bheeni Suhaani Subha Mein Thandak Jigar ki Hay",
    "titleUrdu": "",
    "title": "Bheeni Suhaani Subha Mein Thandak Jigar ki Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 158,
    "printedPage": 158
  },
  {
    "id": 70,
    "titleEnglish": "Woh Sarwar-e-kishwar-e-risaalat",
    "titleUrdu": "",
    "title": "Woh Sarwar-e-kishwar-e-risaalat",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 163,
    "printedPage": 163
  },
  {
    "id": 71,
    "titleEnglish": "Sachi Baat Sikhatay Yeh Hain",
    "titleUrdu": "",
    "title": "Sachi Baat Sikhatay Yeh Hain",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 169,
    "printedPage": 169
  },
  {
    "id": 72,
    "titleEnglish": "Subha Taibah Mein Hui Bat-taa Hay Baara Noor Kaa",
    "titleUrdu": "",
    "title": "Subha Taibah Mein Hui Bat-taa Hay Baara Noor Kaa",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 175,
    "printedPage": 175
  },
  {
    "id": 73,
    "titleEnglish": "Ummataan-o-siyaah Kaarehaa",
    "titleUrdu": "",
    "title": "Ummataan-o-siyaah Kaarehaa",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 180,
    "printedPage": 180
  },
  {
    "id": 74,
    "titleEnglish": "Tera Zarrah Mahe Kaamil Hay Yaa Ghaus",
    "titleUrdu": "",
    "title": "Tera Zarrah Mahe Kaamil Hay Yaa Ghaus",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 181,
    "printedPage": 181
  },
  {
    "id": 75,
    "titleEnglish": "Jo Tera Tifl Hay Kaamil Hay Yaa Ghaus",
    "titleUrdu": "",
    "title": "Jo Tera Tifl Hay Kaamil Hay Yaa Ghaus",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 183,
    "printedPage": 183
  },
  {
    "id": 76,
    "titleEnglish": "Badal Yaa Fard Jo Kaamil Hay Yaa Ghaus",
    "titleUrdu": "",
    "title": "Badal Yaa Fard Jo Kaamil Hay Yaa Ghaus",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 185,
    "printedPage": 185
  },
  {
    "id": 77,
    "titleEnglish": "Talab Kaa Moonh To Kis Qaabil Hay Yaa Ghaus",
    "titleUrdu": "",
    "title": "Talab Kaa Moonh To Kis Qaabil Hay Yaa Ghaus",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 187,
    "printedPage": 187
  },
  {
    "id": 78,
    "titleEnglish": "Ze ‘aksat Maahe Taabaan Aafreedand Ze Booe Tu Gulsitaan",
    "titleUrdu": "",
    "title": "Ze ‘aksat Maahe Taabaan Aafreedand Ze Booe Tu Gulsitaan",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 194,
    "printedPage": 194
  },
  {
    "id": 79,
    "titleEnglish": "Wazeefa-e-qaadiriyya",
    "titleUrdu": "",
    "title": "Wazeefa-e-qaadiriyya",
    "category": "munajat",
    "categoryEnglish": "Munajat & Dua",
    "categoryUrdu": "مناجات و دعا",
    "pdfPage": 195,
    "printedPage": 195
  },
  {
    "id": 80,
    "titleEnglish": "Khushaa Dile Keh Dihindash Wilaa-e-aal-e-rasool",
    "titleUrdu": "",
    "title": "Khushaa Dile Keh Dihindash Wilaa-e-aal-e-rasool",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 204,
    "printedPage": 204
  },
  {
    "id": 81,
    "titleEnglish": "Mustafa Jaan-e-rahmat pe Laakhon Salaam",
    "titleUrdu": "",
    "title": "Mustafa Jaan-e-rahmat pe Laakhon Salaam",
    "category": "salam",
    "categoryEnglish": "Salam-e-Raza",
    "categoryUrdu": "سلامِ رضا",
    "pdfPage": 208,
    "printedPage": 208
  },
  {
    "id": 82,
    "titleEnglish": "Yaa Khuda Beher-e-janaab-e-mustafa Imdaad Kun",
    "titleUrdu": "",
    "title": "Yaa Khuda Beher-e-janaab-e-mustafa Imdaad Kun",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 224,
    "printedPage": 224
  },
  {
    "id": 83,
    "titleEnglish": "Murtaza Sher-e-khuda Marhab Kushaa Khaibar-e-kashaa",
    "titleUrdu": "",
    "title": "Murtaza Sher-e-khuda Marhab Kushaa Khaibar-e-kashaa",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 227,
    "printedPage": 227
  },
  {
    "id": 84,
    "titleEnglish": "Baaqi Asiyaad Ya Sajjad Yaa Shaah-e-jawwad",
    "titleUrdu": "",
    "title": "Baaqi Asiyaad Ya Sajjad Yaa Shaah-e-jawwad",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 230,
    "printedPage": 230
  },
  {
    "id": 85,
    "titleEnglish": "Yalalley Khush Aamadam Dar Kooye Baghdaad Aamadam",
    "titleUrdu": "",
    "title": "Yalalley Khush Aamadam Dar Kooye Baghdaad Aamadam",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 232,
    "printedPage": 232
  },
  {
    "id": 86,
    "titleEnglish": "Aah Yaa Ghausaah Yaa Ghaisaah Yaa Imdaad Kun",
    "titleUrdu": "",
    "title": "Aah Yaa Ghausaah Yaa Ghaisaah Yaa Imdaad Kun",
    "category": "manqabat",
    "categoryEnglish": "Manqabat",
    "categoryUrdu": "منقبت",
    "pdfPage": 233,
    "printedPage": 233
  },
  {
    "id": 87,
    "titleEnglish": "Yaa Ibn-e-haza Al Murtajaa Yaa Abda Razzaq Il Wara",
    "titleUrdu": "",
    "title": "Yaa Ibn-e-haza Al Murtajaa Yaa Abda Razzaq Il Wara",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 234,
    "printedPage": 234
  },
  {
    "id": 88,
    "titleEnglish": "Shaah-e-barkaat Aye Abul Barkaat Aye Sultaan-e-jood",
    "titleUrdu": "",
    "title": "Shaah-e-barkaat Aye Abul Barkaat Aye Sultaan-e-jood",
    "category": "hamd",
    "categoryEnglish": "Hamd & Naat",
    "categoryUrdu": "حمد و نعت",
    "pdfPage": 235,
    "printedPage": 235
  },
  {
    "id": 89,
    "titleEnglish": "Bandah Amm Wal Amru Amruk Aanche Daani Kun Ba Man",
    "titleUrdu": "",
    "title": "Bandah Amm Wal Amru Amruk Aanche Daani Kun Ba Man",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 237,
    "printedPage": 237
  },
  {
    "id": 90,
    "titleEnglish": "Yaa Ilahi Zel Een Sheraan Giraftam Bandah Raa",
    "titleUrdu": "",
    "title": "Yaa Ilahi Zel Een Sheraan Giraftam Bandah Raa",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 238,
    "printedPage": 238
  },
  {
    "id": 91,
    "titleEnglish": "Mustafa Khair-ul-waraa Ho",
    "titleUrdu": "",
    "title": "Mustafa Khair-ul-waraa Ho",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 239,
    "printedPage": 239
  },
  {
    "id": 92,
    "titleEnglish": "Milk-e-khaas-e-kibriyaa Ho",
    "titleUrdu": "",
    "title": "Milk-e-khaas-e-kibriyaa Ho",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 242,
    "printedPage": 242
  },
  {
    "id": 93,
    "titleEnglish": "As Salaam Aay Ahmadat Sihr-o-baradar Aamdah",
    "titleUrdu": "",
    "title": "As Salaam Aay Ahmadat Sihr-o-baradar Aamdah",
    "category": "salam",
    "categoryEnglish": "Salam-e-Raza",
    "categoryUrdu": "سلامِ رضا",
    "pdfPage": 244,
    "printedPage": 244
  },
  {
    "id": 94,
    "titleEnglish": "Aay Badaur-e-khud Imaam-e-ehle Eeqaan Aamadah.",
    "titleUrdu": "",
    "title": "Aay Badaur-e-khud Imaam-e-ehle Eeqaan Aamadah.",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 246,
    "printedPage": 246
  },
  {
    "id": 95,
    "titleEnglish": "Zameen-o-zamaa(n) Tumhaare Liye",
    "titleUrdu": "",
    "title": "Zameen-o-zamaa(n) Tumhaare Liye",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 248,
    "printedPage": 248
  },
  {
    "id": 96,
    "titleEnglish": "Nazar Ik Chaman Sey Do Chaar Hay",
    "titleUrdu": "",
    "title": "Nazar Ik Chaman Sey Do Chaar Hay",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 250,
    "printedPage": 250
  },
  {
    "id": 97,
    "titleEnglish": "Imaan Hay Qaal-e-mustafaayi",
    "titleUrdu": "",
    "title": "Imaan Hay Qaal-e-mustafaayi",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 253,
    "printedPage": 253
  },
  {
    "id": 98,
    "titleEnglish": "Zarre Jhar Kar Teri Pezaaro(n) Key",
    "titleUrdu": "",
    "title": "Zarre Jhar Kar Teri Pezaaro(n) Key",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 256,
    "printedPage": 256
  },
  {
    "id": 99,
    "titleEnglish": "Sar Sooye Rauza Jhuka Phir Tujh ko Kya",
    "titleUrdu": "",
    "title": "Sar Sooye Rauza Jhuka Phir Tujh ko Kya",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 257,
    "printedPage": 257
  },
  {
    "id": 100,
    "titleEnglish": "Wohi Rab Hay Jisne Tujh ko Hamatan Karam Banaaya",
    "titleUrdu": "",
    "title": "Wohi Rab Hay Jisne Tujh ko Hamatan Karam Banaaya",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 259,
    "printedPage": 259
  },
  {
    "id": 101,
    "titleEnglish": "Bakaar-e-khaish Hairaanam Aghisni Ya Rasoolallah",
    "titleUrdu": "",
    "title": "Bakaar-e-khaish Hairaanam Aghisni Ya Rasoolallah",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 261,
    "printedPage": 261
  },
  {
    "id": 102,
    "titleEnglish": "Lahad Mein Ishq-e-rukh-e-shah Kaa Daagh Le Key Chale",
    "titleUrdu": "",
    "title": "Lahad Mein Ishq-e-rukh-e-shah Kaa Daagh Le Key Chale",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 263,
    "printedPage": 263
  },
  {
    "id": 103,
    "titleEnglish": "Akseer-e-‘azam",
    "titleUrdu": "",
    "title": "Akseer-e-‘azam",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 285,
    "printedPage": 285
  },
  {
    "id": 104,
    "titleEnglish": "Mathnawi Radd Imthaaliyah",
    "titleUrdu": "",
    "title": "Mathnawi Radd Imthaaliyah",
    "category": "naat",
    "categoryEnglish": "Naat Sharif",
    "categoryUrdu": "نعتِ پاک",
    "pdfPage": 297,
    "printedPage": 297
  }
];
