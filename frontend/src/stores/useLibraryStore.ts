import { create } from 'zustand';
import {
  ISLAMIC_BOOKS,
  LIBRARY_CATEGORIES,
  searchBooks,
} from '../data/libraryData';
import {
  IslamicBook,
  CategoryMeta,
  LibraryCategory,
  LibraryBookmark,
} from '../types/library.types';

export type ReaderFontSize = 'sm' | 'base' | 'lg' | 'xl';

interface ReadingProgressItem {
  volumeNumber?: number;
  chapterId?: string;
  lastReadAt: number;
}

interface LibraryState {
  books: IslamicBook[];
  categories: CategoryMeta[];
  selectedCategory: LibraryCategory;
  searchQuery: string;
  selectedLanguage: string;
  activeBookId: string | null;
  activeVolumeNumber: number | null;
  activeChapterId: string | null;
  readerFontSize: ReaderFontSize;
  showArabic: boolean;
  showUrdu: boolean;
  showEnglish: boolean;
  bookmarks: LibraryBookmark[];
  readingProgress: Record<string, ReadingProgressItem>;

  // Actions
  setSelectedCategory: (category: LibraryCategory) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLanguage: (language: string) => void;
  setActiveBook: (bookId: string | null, volumeNumber?: number, chapterId?: string) => void;
  setReaderFontSize: (size: ReaderFontSize) => void;
  toggleArabic: () => void;
  toggleUrdu: () => void;
  toggleEnglish: () => void;
  addBookmark: (bookmark: Omit<LibraryBookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (bookmarkId: string) => void;
  isBookmarked: (bookId: string, chapterId: string, sectionId?: string) => boolean;
  saveReadingProgress: (bookId: string, volumeNumber?: number, chapterId?: string) => void;
  clearSearch: () => void;
  getFilteredBooks: () => IslamicBook[];
}

const STORAGE_BOOKMARKS_KEY = 'islamic_prayer_library_bookmarks_v1';
const STORAGE_PROGRESS_KEY = 'islamic_prayer_library_progress_v1';
const STORAGE_FONT_SIZE_KEY = 'islamic_prayer_library_font_size';

function getStoredBookmarks(): LibraryBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredProgress(): Record<string, ReadingProgressItem> {
  try {
    const raw = localStorage.getItem(STORAGE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getStoredFontSize(): ReaderFontSize {
  try {
    const raw = localStorage.getItem(STORAGE_FONT_SIZE_KEY);
    if (raw === 'sm' || raw === 'base' || raw === 'lg' || raw === 'xl') {
      return raw;
    }
    return 'base';
  } catch {
    return 'base';
  }
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: ISLAMIC_BOOKS,
  categories: LIBRARY_CATEGORIES,
  selectedCategory: 'all',
  searchQuery: '',
  selectedLanguage: 'all',
  activeBookId: null,
  activeVolumeNumber: null,
  activeChapterId: null,
  readerFontSize: getStoredFontSize(),
  showArabic: true,
  showUrdu: true,
  showEnglish: true,
  bookmarks: getStoredBookmarks(),
  readingProgress: getStoredProgress(),

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSelectedLanguage: (language) => {
    set({ selectedLanguage: language });
  },

  setActiveBook: (bookId, volumeNumber, chapterId) => {
    set({
      activeBookId: bookId,
      activeVolumeNumber: volumeNumber ?? null,
      activeChapterId: chapterId ?? null,
    });
  },

  setReaderFontSize: (size) => {
    try {
      localStorage.setItem(STORAGE_FONT_SIZE_KEY, size);
    } catch {
      // ignore storage error
    }
    set({ readerFontSize: size });
  },

  toggleArabic: () => set((state) => ({ showArabic: !state.showArabic })),
  toggleUrdu: () => set((state) => ({ showUrdu: !state.showUrdu })),
  toggleEnglish: () => set((state) => ({ showEnglish: !state.showEnglish })),

  addBookmark: (bookmarkData) => {
    const id = `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBookmark: LibraryBookmark = {
      ...bookmarkData,
      id,
      createdAt: Date.now(),
    };
    const updated = [newBookmark, ...get().bookmarks];
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({ bookmarks: updated });
  },

  removeBookmark: (bookmarkId) => {
    const updated = get().bookmarks.filter((b) => b.id !== bookmarkId);
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({ bookmarks: updated });
  },

  isBookmarked: (bookId, chapterId, sectionId) => {
    return get().bookmarks.some(
      (b) =>
        b.bookId === bookId &&
        b.chapterId === chapterId &&
        (sectionId ? b.sectionId === sectionId : true)
    );
  },

  saveReadingProgress: (bookId, volumeNumber, chapterId) => {
    const current = get().readingProgress;
    const updated = {
      ...current,
      [bookId]: {
        volumeNumber,
        chapterId,
        lastReadAt: Date.now(),
      },
    };
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    set({ readingProgress: updated });
  },

  clearSearch: () => {
    set({ searchQuery: '', selectedCategory: 'all', selectedLanguage: 'all' });
  },

  getFilteredBooks: () => {
    const { searchQuery, selectedCategory, selectedLanguage } = get();
    return searchBooks(searchQuery, selectedCategory, selectedLanguage);
  },
}));
