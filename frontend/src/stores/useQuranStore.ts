import { create } from 'zustand';
import {
  SURAHS_LIST,
  JUZ_LIST,
  TOTAL_MUSHAF_PAGES,
  SurahMeta,
  JuzMeta,
  getSurahByPage,
  getJuzByPage,
  getSurahByNumber,
} from '../data/quranData';
import {
  QuranApiService,
  QuranVerseApi,
  QuranChapterInfo,
} from '../services/quranApiService';

export interface QuranBookmark {
  surahNumber: number;
  ayahNumber: number;
  verseKey: string;
  surahName: string;
  arabicText?: string;
  translationText?: string;
  createdAt: string;
}

export interface QuranReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  verseKey: string;
  surahName: string;
  pageNumber: number;
  updatedAt: string;
}

export type QuranMode = 'read' | 'listen';
export type QuranReadViewType = 'surah' | 'mushaf';

interface QuranState {
  mode: QuranMode;
  readViewType: QuranReadViewType;
  surahs: SurahMeta[];
  juzList: JuzMeta[];
  currentSurahNumber: number;
  currentSurahMeta: SurahMeta;
  currentSurahVerses: QuranVerseApi[];
  currentSurahInfo: QuranChapterInfo | null;
  isVersesLoading: boolean;
  isInfoLoading: boolean;
  versesError: string | null;

  // Typography & Script state
  selectedScript: 'indopak' | 'uthmani' | 'uthmani_tajweed' | 'uthmani_simple' | 'imlaei';
  showTajweedColors: boolean;
  arabicFontSize: number;
  translationFontSize: number;

  // Translations
  showTranslation: boolean;
  selectedTranslationIds: number[]; // e.g. [234] (Jalandhari), [20] (Saheeh)

  // Mushaf Page Reader State (1-604)
  mushafPage: number;
  selectedPara: number;
  zoomLevel: number;

  // Audio Playback State
  activeAudioSurah: number;
  selectedReciterId: number; // Quran.com Reciter ID (default 7 Mishary Rashid)
  audioRecitationUrl: string | null;
  audioPlaybackPhase: 'idle' | 'taawwuz' | 'bismillah' | 'surah';
  isPlaying: boolean;
  playbackTime: number;
  playbackDuration: number;
  audioVolume: number;
  playbackSpeed: number;
  isLooping: boolean;
  autoPlayNext: boolean;
  seekTarget: number | null;
  hasUserStartedAudio: boolean;

  // Individual Ayah Audio
  playingAyahKey: string | null;
  isAyahAudioPlaying: boolean;

  // Bookmarks & Reading Progress
  bookmarks: QuranBookmark[];
  readingProgress: QuranReadingProgress | null;
  searchTerm: string;
  activeTab: 'surahs' | 'juz' | 'bookmarks' | 'info';

  // State setters & actions
  setMode: (mode: QuranMode) => void;
  setReadViewType: (viewType: QuranReadViewType) => void;
  setSelectedScript: (script: 'indopak' | 'uthmani' | 'uthmani_tajweed' | 'uthmani_simple' | 'imlaei') => void;
  setShowTajweedColors: (show: boolean) => void;
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  setShowTranslation: (show: boolean) => void;
  setSelectedTranslationIds: (ids: number[]) => void;
  toggleTranslationId: (id: number) => void;

  // Async Loaders
  loadSurah: (surahNumber: number) => Promise<void>;
  loadSurahInfo: (surahNumber: number) => Promise<void>;

  // Mushaf navigation
  goToQuranPage: (page: number) => void;
  setMushafPage: (page: number) => void;
  jumpToSurahPage: (surahNumber: number) => void;
  jumpToJuzPage: (juzNumber: number) => void;
  nextMushafPage: () => void;
  prevMushafPage: () => void;
  setZoomLevel: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Audio actions
  playSurahAudio: (surahNumber?: number, reciterId?: number) => Promise<void>;
  playNextSurahAudio: () => void;
  playPrevSurahAudio: () => void;
  toggleAudioPlay: () => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  seekAudio: (seconds: number) => void;
  clearSeekTarget: () => void;
  setSelectedReciterId: (reciterId: number) => void;
  setPlaybackTime: (time: number) => void;
  setPlaybackDuration: (duration: number) => void;
  setAudioVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setAudioPlaybackPhase: (phase: 'idle' | 'taawwuz' | 'bismillah' | 'surah') => void;
  setIsLooping: (loop: boolean) => void;
  setAutoPlayNext: (auto: boolean) => void;

  // Ayah Audio
  setPlayingAyahKey: (key: string | null) => void;
  setIsAyahAudioPlaying: (playing: boolean) => void;
  playAyahAudio: (verseKey: string) => Promise<void>;
  toggleAyahAudio: (verseKey: string) => void;

  // Bookmarks & Progress
  toggleBookmark: (bookmark: Omit<QuranBookmark, 'createdAt'>) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  updateReadingProgress: (
    surahNumber: number,
    ayahNumber: number,
    verseKey: string,
    surahName: string,
    pageNumber: number
  ) => void;

  // UI
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: 'surahs' | 'juz' | 'bookmarks' | 'info') => void;
}

// Local storage keys
const BOOKMARKS_STORAGE_KEY = 'islamic_quran_bookmarks_v4';
const PROGRESS_STORAGE_KEY = 'islamic_quran_progress_v4';
const SCRIPT_STORAGE_KEY = 'islamic_quran_script_v4';
const TRANSLATIONS_STORAGE_KEY = 'islamic_quran_translations_v4';
const FONT_SIZE_STORAGE_KEY = 'islamic_quran_font_size_v4';

function loadInitialBookmarks(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadInitialProgress(): QuranReadingProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadInitialScript(): 'indopak' | 'uthmani' | 'uthmani_tajweed' | 'uthmani_simple' | 'imlaei' {
  try {
    const raw = localStorage.getItem(SCRIPT_STORAGE_KEY);
    if (raw && ['indopak', 'uthmani', 'uthmani_tajweed', 'uthmani_simple', 'imlaei'].includes(raw)) {
      return raw as any;
    }
  } catch {}
  return 'indopak'; // Default to popular IndoPak script for subcontinent users
}

function loadInitialTranslations(): number[] {
  try {
    const raw = localStorage.getItem(TRANSLATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [234, 20]; // Default: Urdu Jalandhari (234) + English Saheeh (20)
}

function loadInitialArabicFontSize(): number {
  try {
    const raw = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (raw) {
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= 20 && num <= 60) return num;
    }
  } catch {}
  return 32;
}

export const useQuranStore = create<QuranState>((set, get) => ({
  mode: 'read',
  readViewType: 'mushaf',
  surahs: SURAHS_LIST,
  juzList: JUZ_LIST,
  currentSurahNumber: 1,
  currentSurahMeta: SURAHS_LIST[0],
  currentSurahVerses: [],
  currentSurahInfo: null,
  isVersesLoading: false,
  isInfoLoading: false,
  versesError: null,

  selectedScript: loadInitialScript(),
  showTajweedColors: true,
  arabicFontSize: loadInitialArabicFontSize(),
  translationFontSize: 16,

  showTranslation: true,
  selectedTranslationIds: loadInitialTranslations(),

  mushafPage: 2,
  selectedPara: 1,
  zoomLevel: 1.0,

  activeAudioSurah: 1,
  selectedReciterId: 7, // Mishary Rashid Alafasy
  audioRecitationUrl: null,
  audioPlaybackPhase: 'idle',
  isPlaying: false,
  playbackTime: 0,
  playbackDuration: 0,
  audioVolume: 0.9,
  playbackSpeed: 1.0,
  isLooping: false,
  autoPlayNext: true,
  seekTarget: null,
  hasUserStartedAudio: false,

  playingAyahKey: null,
  isAyahAudioPlaying: false,

  bookmarks: loadInitialBookmarks(),
  readingProgress: loadInitialProgress(),
  searchTerm: '',
  activeTab: 'surahs',

  setMode: (mode) => set({ mode }),
  setReadViewType: (readViewType) => set({ readViewType }),

  setSelectedScript: (script) => {
    try {
      localStorage.setItem(SCRIPT_STORAGE_KEY, script);
    } catch {}
    set({ selectedScript: script });
  },

  setShowTajweedColors: (showTajweedColors) => set({ showTajweedColors }),

  setArabicFontSize: (size) => {
    const clamped = Math.max(20, Math.min(56, size));
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(clamped));
    } catch {}
    set({ arabicFontSize: clamped });
  },

  setTranslationFontSize: (size) => {
    const clamped = Math.max(12, Math.min(28, size));
    set({ translationFontSize: clamped });
  },

  setShowTranslation: (showTranslation) => set({ showTranslation }),

  setSelectedTranslationIds: (ids) => {
    try {
      localStorage.setItem(TRANSLATIONS_STORAGE_KEY, JSON.stringify(ids));
    } catch {}
    set({ selectedTranslationIds: ids });
    const { currentSurahNumber } = get();
    get().loadSurah(currentSurahNumber);
  },

  toggleTranslationId: (id) => {
    const { selectedTranslationIds, currentSurahNumber } = get();
    let updated: number[];
    if (selectedTranslationIds.includes(id)) {
      if (selectedTranslationIds.length === 1) return; // keep at least 1
      updated = selectedTranslationIds.filter((t) => t !== id);
    } else {
      updated = [...selectedTranslationIds, id];
    }
    try {
      localStorage.setItem(TRANSLATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ selectedTranslationIds: updated });
    get().loadSurah(currentSurahNumber);
  },

  loadSurah: async (surahNumber: number) => {
    const validNumber = Math.max(1, Math.min(114, surahNumber));
    const meta = getSurahByNumber(validNumber);
    const { selectedTranslationIds } = get();

    set({
      currentSurahNumber: validNumber,
      currentSurahMeta: meta,
      isVersesLoading: true,
      versesError: null,
      mushafPage: meta.pageStart,
      selectedPara: meta.juzStart,
    });

    try {
      const verses = await QuranApiService.getVersesByChapter(validNumber, selectedTranslationIds);
      set({
        currentSurahVerses: verses,
        isVersesLoading: false,
      });
      // Also asynchronously fetch Surah historical context info in background
      get().loadSurahInfo(validNumber);
    } catch (err: any) {
      console.error(`Failed to load verses for Surah ${validNumber}:`, err);
      set({
        isVersesLoading: false,
        versesError: err?.message || 'Failed to load verses. Please check internet connection.',
      });
    }
  },

  loadSurahInfo: async (surahNumber: number) => {
    set({ isInfoLoading: true });
    try {
      const info = await QuranApiService.getChapterInfo(surahNumber);
      set({ currentSurahInfo: info, isInfoLoading: false });
    } catch {
      set({ isInfoLoading: false });
    }
  },

  // Central Quran page navigation function (1 to 604)
  goToQuranPage: (pageNumber: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, Math.floor(pageNumber) || 1));
    const meta = getSurahByPage(clamped);
    const juz = getJuzByPage(clamped);
    set({
      mushafPage: clamped,
      currentSurahNumber: meta.number,
      currentSurahMeta: meta,
      selectedPara: juz.number,
    });
  },

  setMushafPage: (page) => {
    get().goToQuranPage(page);
  },

  jumpToSurahPage: (surahNumber) => {
    const validNumber = Math.max(1, Math.min(114, surahNumber));
    const meta = getSurahByNumber(validNumber);
    get().goToQuranPage(meta.pageStart);
    // Explicitly set the selected Surah in case multiple surahs start on this page (e.g. 112, 113, 114)
    set({
      currentSurahNumber: validNumber,
      currentSurahMeta: meta,
    });
  },

  jumpToJuzPage: (juzNumber) => {
    const clamped = Math.max(1, Math.min(30, juzNumber));
    const juz = JUZ_LIST.find((j) => j.number === clamped) || JUZ_LIST[0];
    get().goToQuranPage(juz.pageStart);
    set({
      selectedPara: clamped,
    });
  },

  nextMushafPage: () => {
    const { mushafPage } = get();
    if (mushafPage < TOTAL_MUSHAF_PAGES) {
      get().goToQuranPage(mushafPage + 1);
    }
  },

  prevMushafPage: () => {
    const { mushafPage } = get();
    if (mushafPage > 1) {
      get().goToQuranPage(mushafPage - 1);
    }
  },

  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.6, Math.min(2.5, zoom)) }),
  zoomIn: () => set((s) => ({ zoomLevel: Math.min(2.5, +(s.zoomLevel + 0.15).toFixed(2)) })),
  zoomOut: () => set((s) => ({ zoomLevel: Math.max(0.6, +(s.zoomLevel - 0.15).toFixed(2)) })),
  resetZoom: () => set({ zoomLevel: 1.0 }),

  // Audio Playback
  playSurahAudio: async (surahNumber, reciterId) => {
    const targetSurah = surahNumber || get().currentSurahNumber;
    const targetReciter = reciterId || get().selectedReciterId;

    set({
      activeAudioSurah: targetSurah,
      selectedReciterId: targetReciter,
      audioPlaybackPhase: 'taawwuz',
      hasUserStartedAudio: true,
      isPlaying: true,
      playbackTime: 0,
    });

    try {
      const audioUrl = await QuranApiService.getChapterRecitationAudio(targetReciter, targetSurah);
      set({ audioRecitationUrl: audioUrl });
    } catch {
      const padded = String(targetSurah).padStart(3, '0');
      set({ audioRecitationUrl: `https://server8.mp3quran.net/afs/${padded}.mp3` });
    }
  },

  playNextSurahAudio: () => {
    const { activeAudioSurah, selectedReciterId } = get();
    const nextSurah = activeAudioSurah < 114 ? activeAudioSurah + 1 : 1;
    get().playSurahAudio(nextSurah, selectedReciterId);
  },

  playPrevSurahAudio: () => {
    const { activeAudioSurah, selectedReciterId } = get();
    const prevSurah = activeAudioSurah > 1 ? activeAudioSurah - 1 : 114;
    get().playSurahAudio(prevSurah, selectedReciterId);
  },

  toggleAudioPlay: () => {
    const { isPlaying, audioRecitationUrl, activeAudioSurah, selectedReciterId } = get();
    if (!audioRecitationUrl) {
      get().playSurahAudio(activeAudioSurah, selectedReciterId);
      return;
    }
    set({ isPlaying: !isPlaying, hasUserStartedAudio: true });
  },

  pauseAudio: () => set({ isPlaying: false }),
  resumeAudio: () => set({ isPlaying: true, hasUserStartedAudio: true }),
  stopAudio: () => set({ isPlaying: false, playbackTime: 0, audioPlaybackPhase: 'idle' }),
  seekAudio: (seconds) => set({ seekTarget: seconds, playbackTime: seconds, audioPlaybackPhase: 'surah' }),
  clearSeekTarget: () => set({ seekTarget: null }),

  setSelectedReciterId: (reciterId) => {
    set({ selectedReciterId: reciterId });
    const { isPlaying, activeAudioSurah } = get();
    if (isPlaying) {
      get().playSurahAudio(activeAudioSurah, reciterId);
    }
  },

  setPlaybackTime: (time) => set({ playbackTime: time }),
  setPlaybackDuration: (duration) => set({ playbackDuration: duration }),
  setAudioVolume: (volume) => set({ audioVolume: Math.max(0, Math.min(1, volume)) }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setAudioPlaybackPhase: (phase) => set({ audioPlaybackPhase: phase }),
  setIsLooping: (loop) => set({ isLooping: loop }),
  setAutoPlayNext: (auto) => set({ autoPlayNext: auto }),

  setPlayingAyahKey: (key) => set({ playingAyahKey: key }),
  setIsAyahAudioPlaying: (playing) => set({ isAyahAudioPlaying: playing }),

  playAyahAudio: async (verseKey: string) => {
    set({ playingAyahKey: verseKey, isAyahAudioPlaying: true });
    try {
      const audioUrl = QuranApiService.getAyahAudioUrl(verseKey);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        set({ playingAyahKey: null, isAyahAudioPlaying: false });
      };
      audio.onerror = () => {
        set({ playingAyahKey: null, isAyahAudioPlaying: false });
      };
      await audio.play();
    } catch {
      set({ playingAyahKey: null, isAyahAudioPlaying: false });
    }
  },

  toggleAyahAudio: (verseKey: string) => {
    const { playingAyahKey, isAyahAudioPlaying } = get();
    if (isAyahAudioPlaying && playingAyahKey === verseKey) {
      set({ playingAyahKey: null, isAyahAudioPlaying: false });
    } else {
      get().playAyahAudio(verseKey);
    }
  },

  // Bookmarks
  toggleBookmark: (bm) => {
    const { bookmarks } = get();
    const exists = bookmarks.some(
      (b) => b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber
    );
    let updated: QuranBookmark[];
    if (exists) {
      updated = bookmarks.filter(
        (b) => !(b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber)
      );
    } else {
      updated = [{ ...bm, createdAt: new Date().toISOString() }, ...bookmarks];
    }
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ bookmarks: updated });
  },

  removeBookmark: (surahNumber, ayahNumber) => {
    const { bookmarks } = get();
    const updated = bookmarks.filter(
      (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ bookmarks: updated });
  },

  updateReadingProgress: (surahNumber, ayahNumber, verseKey, surahName, pageNumber) => {
    const progress: QuranReadingProgress = {
      surahNumber,
      ayahNumber,
      verseKey,
      surahName,
      pageNumber,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {}
    set({ readingProgress: progress });
  },

  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));

// Helper function to get audio URL for reciters
export function getAudioUrl(surahNumber: number, reciterId: number = 7): string {
  const padded = String(surahNumber).padStart(3, '0');
  if (reciterId === 2 || reciterId === 1) {
    return `https://server7.mp3quran.net/basit/${padded}.mp3`;
  }
  if (reciterId === 6 || reciterId === 12) {
    return `https://server13.mp3quran.net/husr/${padded}.mp3`;
  }
  if (reciterId === 3) {
    return `https://server11.mp3quran.net/sds/${padded}.mp3`;
  }
  if (reciterId === 9 || reciterId === 8) {
    return `https://server10.mp3quran.net/minsh/${padded}.mp3`;
  }
  if (reciterId === 4) {
    return `https://server7.mp3quran.net/shatri/${padded}.mp3`;
  }
  if (reciterId === 5) {
    return `https://server8.mp3quran.net/rifai/${padded}.mp3`;
  }
  return `https://server8.mp3quran.net/afs/${padded}.mp3`;
}

// Helper function to get authentic Ta'awwuz audio for reciters
export function getTaawwuzAudioUrl(reciterId: number = 7): string {
  if (reciterId === 6 || reciterId === 12) {
    return '/audio/quran/taawwuz_husary.mp3';
  }
  if (reciterId === 4) {
    return '/audio/quran/taawwuz_shatri.mp3';
  }
  return '/audio/quran/taawwuz_alafasy.mp3';
}

// Helper function to get authentic Bismillah audio for reciters
export function getBismillahAudioUrl(reciterId: number = 7): string {
  if (reciterId === 6 || reciterId === 12) {
    return '/audio/quran/bismillah_husary.mp3';
  }
  if (reciterId === 2 || reciterId === 1) {
    return '/audio/quran/bismillah_abdulbasit.mp3';
  }
  if (reciterId === 4) {
    return '/audio/quran/bismillah_shatri.mp3';
  }
  if (reciterId === 5) {
    return '/audio/quran/bismillah_rifai.mp3';
  }
  if (reciterId === 3) {
    return '/audio/quran/bismillah_sudais.mp3';
  }
  return '/audio/quran/bismillah_alafasy.mp3';
}
