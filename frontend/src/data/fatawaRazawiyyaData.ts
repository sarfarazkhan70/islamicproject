// ============================================================================
// FATAWA-E-RAZVIYA: AUTHENTIC 31-VOLUME METADATA & PAGE MAPPING ENGINE
// تصنيف: إمام أهل السنة المجدد أحمد رضا خان القادري البريلوي قدس سره (۱۲۷۲ - ۱۳۴۰ هـ)
// Verified 31 Canonical Volumes (Jild 1.1, Jild 1.2, Jild 2 to Jild 30)
// Source: https://archive.org/details/fatawarazawiyajild30_201907
// ============================================================================

export interface FatawaRazawiyyaVolumeMeta {
  volumeKey: string; // '1.1' | '1.2' | '2' | '3' ... '30'
  volumeIndex: number; // 1 to 31
  id: string; // 'fatawa-vol-1-1', 'fatawa-vol-1-2', 'fatawa-vol-2', etc.
  title: string; // 'Fatawa-e-Razviya – Jild 1.1', etc.
  displayTitle: string; // 'Jild 1.1'
  urduTitle: string;
  arabicTitle: string;
  topic: string;
  totalPages: number;
  totalPrintedPages: number;
  localPdfUrl: string;
  coverAccent: string;
}

export const FATAWA_RAZAWIYYA_VOLUMES: FatawaRazawiyyaVolumeMeta[] = [
  {
    volumeKey: '1.1',
    volumeIndex: 1,
    id: 'fatawa-vol-1-1',
    title: 'Fatawa-e-Razviya – Jild 1.1',
    displayTitle: 'Jild 1.1',
    urduTitle: 'جلد ۱.۱ (کتاب الطہارۃ — میاہ، حوض، وضوء)',
    arabicTitle: 'المجلد ۱.۱ (کتاب الطهارة — المياه والأحواض)',
    topic: 'Kitab at-Taharah (Water, Purity, Ponds & Wells)',
    totalPages: 591,
    totalPrintedPages: 588,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_1_1.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '1.2',
    volumeIndex: 2,
    id: 'fatawa-vol-1-2',
    title: 'Fatawa-e-Razviya – Jild 1.2',
    displayTitle: 'Jild 1.2',
    urduTitle: 'جلد ۱.۲ (کتاب الطہارۃ — احکام وضوء و مسح)',
    arabicTitle: 'المجلد ۱.۲ (کتاب الطهارة — أحكام الوضوء والمسح)',
    topic: 'Kitab at-Taharah (Wudu, Masah & Purification Rulings)',
    totalPages: 566,
    totalPrintedPages: 560,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_1_2.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '2',
    volumeIndex: 3,
    id: 'fatawa-vol-2',
    title: 'Fatawa-e-Razviya – Jild 2',
    displayTitle: 'Jild 2',
    urduTitle: 'جلد ۲ (کتاب الطہارۃ — غسل، تیمم، نجاسات)',
    arabicTitle: 'المجلد ۲ (کتاب الطهارة — الغسل والتيمم والنجاسات)',
    topic: 'Kitab at-Taharah (Ghusl, Tayammum, Impurities & Menstruation)',
    totalPages: 566,
    totalPrintedPages: 560,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_2.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '3',
    volumeIndex: 4,
    id: 'fatawa-vol-3',
    title: 'Fatawa-e-Razviya – Jild 3',
    displayTitle: 'Jild 3',
    urduTitle: 'جلد ۳ (کتاب الطہارۃ — ازالۃ النجاسۃ، استنجاء)',
    arabicTitle: 'المجلد ۳ (کتاب الطهارة — إزالة النجاسة والاستنجاء)',
    topic: 'Kitab at-Taharah (Removal of Najasa & Istinja Rulings)',
    totalPages: 758,
    totalPrintedPages: 752,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_3.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '4',
    volumeIndex: 5,
    id: 'fatawa-vol-4',
    title: 'Fatawa-e-Razviya – Jild 4',
    displayTitle: 'Jild 4',
    urduTitle: 'جلد ۴ (کتاب الصلاۃ — اوقات نماز، فلکیاتی تحقیق)',
    arabicTitle: 'المجلد ۴ (کتاب الصلاة — أوقات الصلاة والتحقيق الفلكي)',
    topic: 'Kitab as-Salah (Prayer Times & Astronomical Calculations)',
    totalPages: 764,
    totalPrintedPages: 758,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_4.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '5',
    volumeIndex: 6,
    id: 'fatawa-vol-5',
    title: 'Fatawa-e-Razviya – Jild 5',
    displayTitle: 'Jild 5',
    urduTitle: 'جلد ۵ (کتاب الصلاۃ — شروط صلاۃ، سمت قبلہ)',
    arabicTitle: 'المجلد ۵ (کتاب الصلاة — شروط الصلاة وجهة القبلة)',
    topic: 'Kitab as-Salah (Conditions of Prayer & Qibla Verification)',
    totalPages: 699,
    totalPrintedPages: 693,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_5.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '6',
    volumeIndex: 7,
    id: 'fatawa-vol-6',
    title: 'Fatawa-e-Razviya – Jild 6',
    displayTitle: 'Jild 6',
    urduTitle: 'جلد ۶ (کتاب الصلاۃ — ارکان صلاۃ، قراءت، اذان، امامت)',
    arabicTitle: 'المجلد ۶ (کتاب الصلاة — أركان الصلاة والأذان والإمامة)',
    topic: 'Kitab as-Salah (Pillars of Prayer, Qira\'at, Azan & Imamat)',
    totalPages: 738,
    totalPrintedPages: 732,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_6.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '7',
    volumeIndex: 8,
    id: 'fatawa-vol-7',
    title: 'Fatawa-e-Razviya – Jild 7',
    displayTitle: 'Jild 7',
    urduTitle: 'جلد ۷ (کتاب الصلاۃ — جماعت، جمعہ، عیدین)',
    arabicTitle: 'المجلد ۷ (کتاب الصلاة — صلاة الجماعة والجمعة والعيدين)',
    topic: 'Kitab as-Salah (Congregational Prayer, Jumu\'ah & Eidain)',
    totalPages: 724,
    totalPrintedPages: 718,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_7.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '8',
    volumeIndex: 9,
    id: 'fatawa-vol-8',
    title: 'Fatawa-e-Razviya – Jild 8',
    displayTitle: 'Jild 8',
    urduTitle: 'جلد ۸ (کتاب الصلاۃ — صلاۃ مسافر، قضاء نمازیں، سجدہ سہو)',
    arabicTitle: 'المجلد ۸ (کتاب الصلاة — صلاة المسافر وقضاء الفوائت)',
    topic: 'Kitab as-Salah (Traveler\'s Prayer, Missed Prayers & Sajdah Sahw)',
    totalPages: 676,
    totalPrintedPages: 670,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_8.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '9',
    volumeIndex: 10,
    id: 'fatawa-vol-9',
    title: 'Fatawa-e-Razviya – Jild 9',
    displayTitle: 'Jild 9',
    urduTitle: 'جلد ۹ (کتاب الجنائز — زیارت قبور، ایصال ثواب)',
    arabicTitle: 'المجلد ۹ (کتاب الجنائز — زيارة القبور وإيصال الثواب)',
    topic: 'Kitab al-Janaiz (Funerals, Visiting Graves & Isal-e-Sawab)',
    totalPages: 952,
    totalPrintedPages: 946,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_9.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '10',
    volumeIndex: 11,
    id: 'fatawa-vol-10',
    title: 'Fatawa-e-Razviya – Jild 10',
    displayTitle: 'Jild 10',
    urduTitle: 'جلد ۱۰ (کتاب الزکاۃ — مصارف زکاۃ، صدقہ فطر)',
    arabicTitle: 'المجلد ۱۰ (کتاب الزكاة — مصارف الزكاة وصدقة الفطر)',
    topic: 'Kitab az-Zakat (Zakat Calculation, Recipients & Sadaqah Fitr)',
    totalPages: 837,
    totalPrintedPages: 831,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_10.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '11',
    volumeIndex: 12,
    id: 'fatawa-vol-11',
    title: 'Fatawa-e-Razviya – Jild 11',
    displayTitle: 'Jild 11',
    urduTitle: 'جلد ۱۱ (کتاب الصوم — رویت ہلال، اعتکاف)',
    arabicTitle: 'المجلد ۱۱ (کتاب الصوم — رؤية الهلال والاعتكاف)',
    topic: 'Kitab as-Sawm (Fasting, Moon Sighting & I\'tikaf)',
    totalPages: 742,
    totalPrintedPages: 736,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_11.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '12',
    volumeIndex: 13,
    id: 'fatawa-vol-12',
    title: 'Fatawa-e-Razviya – Jild 12',
    displayTitle: 'Jild 12',
    urduTitle: 'جلد ۱۲ (کتاب الحج — مناسک حج، زیارت مدینہ منورہ)',
    arabicTitle: 'المجلد ۱۲ (کتاب الحج — مناسك الحج وزيارة المدينة)',
    topic: 'Kitab al-Hajj (Pilgrimage Rulings, Rites & Visiting Madinah)',
    totalPages: 691,
    totalPrintedPages: 685,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_12.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '13',
    volumeIndex: 14,
    id: 'fatawa-vol-13',
    title: 'Fatawa-e-Razviya – Jild 13',
    displayTitle: 'Jild 13',
    urduTitle: 'جلد ۱۳ (کتاب النکاح — ولایت، کفاءت، مہر، ولیمہ)',
    arabicTitle: 'المجلد ۱۳ (کتاب النکاح — الولاية والكفاءة والمهر)',
    topic: 'Kitab an-Nikah (Marriage Validity, Dowry, Guardianship & Walima)',
    totalPages: 691,
    totalPrintedPages: 685,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_13.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '14',
    volumeIndex: 15,
    id: 'fatawa-vol-14',
    title: 'Fatawa-e-Razviya – Jild 14',
    displayTitle: 'Jild 14',
    urduTitle: 'جلد ۱۴ (کتاب النکاح — محرمات، رضاعت، حقوق زوجین)',
    arabicTitle: 'المجلد ۱۴ (کتاب النکاح — المحرمات والرضاع وحقوق الزوجين)',
    topic: 'Kitab an-Nikah (Prohibited Degrees, Fosterage & Spousal Rights)',
    totalPages: 715,
    totalPrintedPages: 709,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_14.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '15',
    volumeIndex: 16,
    id: 'fatawa-vol-15',
    title: 'Fatawa-e-Razviya – Jild 15',
    displayTitle: 'Jild 15',
    urduTitle: 'جلد ۱۵ (کتاب الطلاق — ایقاع طلاق، صریح و کنایات)',
    arabicTitle: 'المجلد ۱۵ (کتاب الطلاق — إيقاع الطلاق والصريح والكنايات)',
    topic: 'Kitab at-Talaq (Divorce Rulings, Explicit & Allusive Terms)',
    totalPages: 745,
    totalPrintedPages: 739,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_15.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '16',
    volumeIndex: 17,
    id: 'fatawa-vol-16',
    title: 'Fatawa-e-Razviya – Jild 16',
    displayTitle: 'Jild 16',
    urduTitle: 'جلد ۱۶ (کتاب الطلاق — عدت، نفقہ، خلع، حضانت)',
    arabicTitle: 'المجلد ۱۶ (کتاب الطلاق — العدة والنفقة والخلع والحضانة)',
    topic: 'Kitab at-Talaq (Iddah, Maintenance, Khula & Custody)',
    totalPages: 634,
    totalPrintedPages: 628,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_16.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '17',
    volumeIndex: 18,
    id: 'fatawa-vol-17',
    title: 'Fatawa-e-Razviya – Jild 17',
    displayTitle: 'Jild 17',
    urduTitle: 'جلد ۱۷ (کتاب العتاق والایمان والنذور)',
    arabicTitle: 'المجلد ۱۷ (کتاب العتاق والأيمان والنذور)',
    topic: 'Kitab al-Itq, Ayman & Nuzur (Oaths, Vows & Expiations)',
    totalPages: 718,
    totalPrintedPages: 712,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_17.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '18',
    volumeIndex: 19,
    id: 'fatawa-vol-18',
    title: 'Fatawa-e-Razviya – Jild 18',
    displayTitle: 'Jild 18',
    urduTitle: 'جلد ۱۸ (کتاب الحدود والسرقۃ والجہاد والسیر)',
    arabicTitle: 'المجلد ۱۸ (کتاب الحدود والسرقة والجهاد والسير)',
    topic: 'Kitab al-Hudud, Sariqa & Jihad (Penal Codes & International Law)',
    totalPages: 740,
    totalPrintedPages: 734,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_18.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '19',
    volumeIndex: 20,
    id: 'fatawa-vol-19',
    title: 'Fatawa-e-Razviya – Jild 19',
    displayTitle: 'Jild 19',
    urduTitle: 'جلد ۱۹ (کتاب الجزیۃ واللقطۃ والاموال الضائعۃ)',
    arabicTitle: 'المجلد ۱۹ (کتاب الجزية واللقطة والأموال الضائعة)',
    topic: 'Kitab al-Jizya & Luqta (Found Property & Public Wealth)',
    totalPages: 695,
    totalPrintedPages: 689,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_19.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '20',
    volumeIndex: 21,
    id: 'fatawa-vol-20',
    title: 'Fatawa-e-Razviya – Jild 20',
    displayTitle: 'Jild 20',
    urduTitle: 'جلد ۲۰ (کتاب الغصب والودیعۃ والعاریۃ والشراکۃ)',
    arabicTitle: 'المجلد ۲۰ (کتاب الغصب والوديعة والعارية والشركة)',
    topic: 'Kitab al-Ghasb, Wadi\'ah & Ariyah (Trusts, Loans & Usurpation)',
    totalPages: 633,
    totalPrintedPages: 627,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_20.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '21',
    volumeIndex: 22,
    id: 'fatawa-vol-21',
    title: 'Fatawa-e-Razviya – Jild 21',
    displayTitle: 'Jild 21',
    urduTitle: 'جلد ۲۱ (کتاب البیوع — شرائط بیع، خیارات، تجارت)',
    arabicTitle: 'المجلد ۲۱ (کتاب البيوع — شروط البيع والخيارات)',
    topic: 'Kitab al-Buyu (Commercial Transactions, Sales & Options)',
    totalPages: 678,
    totalPrintedPages: 672,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_21.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '22',
    volumeIndex: 23,
    id: 'fatawa-vol-22',
    title: 'Fatawa-e-Razviya – Jild 22',
    displayTitle: 'Jild 22',
    urduTitle: 'جلد ۲۲ (کتاب البیوع — بیع فاسد، ربا و سود، کرنسی نوٹ)',
    arabicTitle: 'المجلد ۲۲ (کتاب البيوع — البيع الفاسد والربا والأوراق النقدية)',
    topic: 'Kitab al-Buyu (Unlawful Trade, Interest & Paper Currency)',
    totalPages: 695,
    totalPrintedPages: 689,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_22.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '23',
    volumeIndex: 24,
    id: 'fatawa-vol-23',
    title: 'Fatawa-e-Razviya – Jild 23',
    displayTitle: 'Jild 23',
    urduTitle: 'جلد ۲۳ (کتاب الاجارۃ والکفالۃ والوکالۃ والصلح)',
    arabicTitle: 'المجلد ۲۳ (کتاب الإجارة والكفالة والوكالة والصلح)',
    topic: 'Kitab al-Ijarah (Leasing, Guarantee, Agency & Settlements)',
    totalPages: 772,
    totalPrintedPages: 766,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_23.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '24',
    volumeIndex: 25,
    id: 'fatawa-vol-24',
    title: 'Fatawa-e-Razviya – Jild 24',
    displayTitle: 'Jild 24',
    urduTitle: 'جلد ۲۴ (کتاب الشفعۃ والقسمۃ والمزارعۃ والشرب)',
    arabicTitle: 'المجلد ۲۴ (کتاب الشفعة والقسمة والمزارعة والمساقاة)',
    topic: 'Kitab ash-Shuf\'ah (Preemption, Partition & Agriculture)',
    totalPages: 724,
    totalPrintedPages: 718,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_24.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '25',
    volumeIndex: 26,
    id: 'fatawa-vol-25',
    title: 'Fatawa-e-Razviya – Jild 25',
    displayTitle: 'Jild 25',
    urduTitle: 'جلد ۲۵ (کتاب الذبائح والصید والاضحیۃ والعقیقۃ)',
    arabicTitle: 'المجلد ۲۵ (کتاب الذبائح والصيد والأضحية والعقيقة)',
    topic: 'Kitab az-Zabaih (Slaughtering, Hunting, Udhiya & Aqiqah)',
    totalPages: 661,
    totalPrintedPages: 655,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_25.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '26',
    volumeIndex: 27,
    id: 'fatawa-vol-26',
    title: 'Fatawa-e-Razviya – Jild 26',
    displayTitle: 'Jild 26',
    urduTitle: 'جلد ۲۶ (کتاب الکراہیۃ والاستحسان واللباس والادب)',
    arabicTitle: 'المجلد ۲۶ (کتاب الكراهية والاستحسان واللباس والآداب)',
    topic: 'Kitab al-Karahiyah (Permissibility, Clothing, Etiquette & Custom)',
    totalPages: 616,
    totalPrintedPages: 610,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_26.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '27',
    volumeIndex: 28,
    id: 'fatawa-vol-27',
    title: 'Fatawa-e-Razviya – Jild 27',
    displayTitle: 'Jild 27',
    urduTitle: 'جلد ۲۷ (کتاب الفرائض والوصایا والموات والوقف)',
    arabicTitle: 'المجلد ۲۷ (کتاب الفرائض والوصايا والموات والوقف)',
    topic: 'Kitab al-Faraiz (Inheritance Shares, Wills & Endowments)',
    totalPages: 686,
    totalPrintedPages: 680,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_27.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '28',
    volumeIndex: 29,
    id: 'fatawa-vol-28',
    title: 'Fatawa-e-Razviya – Jild 28',
    displayTitle: 'Jild 28',
    urduTitle: 'جلد ۲۸ (رسائل و عقائد — رد بدعات و منکرات، حفظ ایمان)',
    arabicTitle: 'المجلد ۲۸ (رسائل العقائد — رد البدع وحفظ الإيمان)',
    topic: 'Rasa\'il al-Aqa\'id (Theological Treatises & Sunni Creed)',
    totalPages: 687,
    totalPrintedPages: 681,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_28.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '29',
    volumeIndex: 30,
    id: 'fatawa-vol-29',
    title: 'Fatawa-e-Razviya – Jild 29',
    displayTitle: 'Jild 29',
    urduTitle: 'جلد ۲۹ (رسائل علمیہ و فقہیہ، مناقب و تصوف)',
    arabicTitle: 'المجلد ۲۹ (رسائل الفقه والتصوف والمناقب)',
    topic: 'Rasa\'il Fiqhiyyah (Juristic Monograms, Tasawwuf & Virtues)',
    totalPages: 754,
    totalPrintedPages: 748,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_29.pdf',
    coverAccent: '#f59e0b',
  },
  {
    volumeKey: '30',
    volumeIndex: 31,
    id: 'fatawa-vol-30',
    title: 'Fatawa-e-Razviya – Jild 30',
    displayTitle: 'Jild 30',
    urduTitle: 'جلد ۳۰ (فہارس جامعہ، رسائل متفرقہ، کتب احکام)',
    arabicTitle: 'المجلد ۳۰ (الفهارس الجامعة والرسائل المتفرقة)',
    topic: 'Faharis Jami\'ah (Comprehensive Master Index & Addenda)',
    totalPages: 776,
    totalPrintedPages: 770,
    localPdfUrl: '/pdf/fatawa/fatawa_razawiyya_vol_30.pdf',
    coverAccent: '#f59e0b',
  },
];

/**
 * Get volume metadata by volume key string (e.g. '1.1', '1.2', '2', '3', ..., '30')
 */
export function getFatawaVolume(volumeKey: string = '1.1'): FatawaRazawiyyaVolumeMeta {
  const normalizedKey = (volumeKey || '1.1')
    .trim()
    .replace(/^vol-?/, '')
    .replace(/^jild-?/, '');
  
  const found = FATAWA_RAZAWIYYA_VOLUMES.find(
    (v) => v.volumeKey === normalizedKey || v.id === `fatawa-vol-${normalizedKey.replace('.', '-')}`
  );
  return found || FATAWA_RAZAWIYYA_VOLUMES[0];
}

/**
 * Get volume metadata by numeric index (1 to 31)
 */
export function getFatawaVolumeByIndex(index: number = 1): FatawaRazawiyyaVolumeMeta {
  const safeIndex = Math.max(1, Math.min(FATAWA_RAZAWIYYA_VOLUMES.length, index));
  return FATAWA_RAZAWIYYA_VOLUMES[safeIndex - 1];
}

/**
 * Accurate Printed Book Page to PDF Scan Index conversion
 */
export function getFatawaPdfPage(volumeKey: string, printedPage: number): number {
  const vol = getFatawaVolume(volumeKey);
  const validPrinted = Math.max(1, Math.min(vol.totalPrintedPages, printedPage));
  const offset = Math.max(0, vol.totalPages - vol.totalPrintedPages);
  const calculatedPdf = validPrinted + offset;
  return Math.min(vol.totalPages, Math.max(1, calculatedPdf));
}

/**
 * PDF Scan Index to Printed Book Page conversion
 */
export function getFatawaPrintedPage(volumeKey: string, pdfPage: number): number {
  const vol = getFatawaVolume(volumeKey);
  const validPdf = Math.max(1, Math.min(vol.totalPages, pdfPage));
  const offset = Math.max(0, vol.totalPages - vol.totalPrintedPages);
  if (validPdf <= offset) {
    return 1;
  }
  const calculatedPrinted = validPdf - offset;
  return Math.min(vol.totalPrintedPages, Math.max(1, calculatedPrinted));
}
