/**
 * SUNNI ISLAMIC DIGITAL LIBRARY TYPES
 * ==============================================================================
 * Comprehensive types for Classical Sunni Hadith, Alahazrat / Ahl-e-Sunnat
 * Fiqh, Fatawa, Masail, Aqeedah, Seerat, and related Islamic literature.
 * ==============================================================================
 */

export type LibraryCategory =
  | 'all'
  | 'hadith'
  | 'fiqh'
  | 'fatawa'
  | 'alahazrat'
  | 'aqeedah'
  | 'seerat'
  | 'durood'
  | 'azkar'
  | 'tafseer'
  | 'history'
  | 'scholars'
  | 'other';

export interface CategoryMeta {
  id: LibraryCategory;
  name: string;
  arabicName: string;
  urduName: string;
  description: string;
  iconName: string;
  badgeColor?: string;
}

export interface BookSection {
  id: string;
  sectionNumber?: number | string;
  title: string;
  arabicTitle?: string;
  urduTitle?: string;
  arabicText?: string;
  urduText?: string;
  englishText?: string;
  hadithNumber?: number | string;
  narrator?: string;
  reference?: string;
  grade?: string;
  explanation?: string;
  ruling?: string;
  faida?: string;
}

export interface BookChapter {
  id: string;
  volumeNumber: number;
  chapterNumber: number;
  title: string;
  arabicTitle?: string;
  urduTitle?: string;
  description?: string;
  hadithCount?: number;
  sections?: BookSection[];
}

export interface BookVolume {
  id: string;
  volumeNumber: number;
  volumeKey?: string; // e.g. "1.1", "1.2", "2"
  title: string;
  displayTitle?: string;
  arabicTitle?: string;
  urduTitle?: string;
  author?: string;
  chaptersCount?: number;
  description?: string;
  isAvailable: boolean;
  coverImage?: string;
  localPdfUrl?: string;
  totalPages?: number;
  totalPrintedPages?: number;
  chapters?: BookChapter[];
}

export interface IslamicBook {
  id: string; // Slug identifier e.g. "sahih-al-bukhari", "fatawa-razawiyya"
  title: string;
  arabicTitle: string;
  urduTitle?: string;
  transliteration?: string;
  author: string;
  authorArabic?: string;
  authorTitle?: string;
  compiler?: string;
  category: LibraryCategory;
  subcategory?: string;
  tradition: string; // e.g. "Sunni Hadith", "Hanafi / Ahl-e-Sunnat (Alahazrat Tradition)"
  primaryLanguage: string;
  languagesAvailable: string[];
  volumeCount: number;
  description: string;
  significance: string;
  era: string; // e.g. "Classical (194-256 AH)" or "1272-1340 AH / 1856-1921 CE"
  isFeatured?: boolean;
  isAvailable: boolean; // Digital edition ready to read vs in preparation
  coverColor?: string;
  accentColor?: string;
  coverImage?: string;
  localPdfUrl?: string;
  readerType?: 'pdf' | 'pages' | 'quran' | 'custom';
  tags: string[];
  volumes?: BookVolume[];
  sampleChapters?: BookChapter[];
  source: string;
  sourceNotes?: string;
}

export interface LibraryBookmark {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  volumeNumber?: number;
  chapterId: string;
  chapterTitle: string;
  sectionId?: string;
  snippet?: string;
  createdAt: number;
}
