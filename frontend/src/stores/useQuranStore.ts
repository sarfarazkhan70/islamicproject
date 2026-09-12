import { create } from 'zustand';
import {
  SURAHS_LIST,
  JUZ_LIST,
  MIN_MUSHAF_PAGE,
  TOTAL_MUSHAF_PAGES,
  SurahMeta,
  JuzMeta,
  getSurahByPage,
  getJuzByPage,
  getSurahByNumber,
  getJuzByNumber,
} from '../data/quranData';
import {
  QuranApiService,
  QuranVerseApi,
  QuranChapterInfo,
} from '../services/quranApiService';
import { getKanzulImanSurahAudioUrl } from '../data/kanzulImanAudioData';

export interface QuranBookmark {
  type?: 'page' | 'surah' | 'juz' | 'ayah';
  pageNumber?: number;
  juzNumber?: number;
  juzName?: string;
  juzArabicName?: string;
  surahNumber?: number;
  ayahNumber?: number;
  verseKey?: string;
  surahName?: string;
  surahArabicName?: string;
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
  playbackType: 'surah' | 'juz';
  activeAudioJuz: number | null;
  activeAudioSurah: number;
  activeAudioAyah: number | null;
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
  isMiniPlayerDismissed: boolean;

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
  jumpToSurahPage: (surahNumber: number, autoPlay?: boolean) => void;
  jumpToJuzPage: (juzNumber: number, autoPlay?: boolean) => void;
  nextMushafPage: () => void;
  prevMushafPage: () => void;
  setZoomLevel: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Audio actions
  playSurahAudio: (surahNumber?: number, reciterId?: number) => Promise<void>;
  playJuzAudio: (juzNumber?: number, reciterId?: number) => Promise<void>;
  playNextSurahAudio: () => void;
  playPrevSurahAudio: () => void;
  toggleAudioPlay: () => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  closeMiniPlayer: () => void;
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
  advanceJuzAyah: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  playAyah: (surahNumber: number, ayahNumber: number) => void;

  // Ayah Audio
  setPlayingAyahKey: (key: string | null) => void;
  setIsAyahAudioPlaying: (playing: boolean) => void;
  playAyahAudio: (verseKey: string) => Promise<void>;
  toggleAyahAudio: (verseKey: string) => void;

  // Bookmarks & Progress
  toggleBookmark: (bookmark: Omit<QuranBookmark, 'createdAt'>) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  removeBookmarkItem: (bm: QuranBookmark) => void;
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

  mushafPage: MIN_MUSHAF_PAGE,
  selectedPara: 1,
  zoomLevel: 1.0,

  playbackType: 'surah',
  activeAudioJuz: null,
  activeAudioSurah: 1,
  activeAudioAyah: 1,
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
  isMiniPlayerDismissed: false,

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

  // Central Quran page navigation function (Pages 1 to 604)
  goToQuranPage: (pageNumber: number) => {
    const clamped = Math.max(MIN_MUSHAF_PAGE, Math.min(TOTAL_MUSHAF_PAGES, Math.floor(pageNumber) || MIN_MUSHAF_PAGE));
    const { currentSurahNumber } = get();

    // Check if the currently selected Surah is active on this page
    let meta = getSurahByNumber(currentSurahNumber);
    const nextSurah = getSurahByNumber(Math.min(114, currentSurahNumber + 1));
    const isCurrentSurahOnThisPage =
      meta.pageStart <= clamped && (currentSurahNumber === 114 || nextSurah.pageStart > clamped || meta.pageStart === clamped);

    if (!isCurrentSurahOnThisPage) {
      meta = getSurahByPage(clamped);
    }

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

  jumpToSurahPage: (surahNumber, autoPlay = false) => {
    const validNumber = Math.max(1, Math.min(114, surahNumber));
    const meta = getSurahByNumber(validNumber);
    const clampedPage = meta.pageStart;
    const juz = getJuzByPage(clampedPage);
    set({
      mushafPage: clampedPage,
      currentSurahNumber: validNumber,
      currentSurahMeta: meta,
      selectedPara: juz.number,
      activeAudioSurah: validNumber,
    });
    if (autoPlay || get().isPlaying) {
      get().playSurahAudio(validNumber, get().selectedReciterId);
    }
  },

  jumpToJuzPage: (juzNumber, autoPlay = false) => {
    const clampedJuz = Math.max(1, Math.min(30, juzNumber));
    const juz = getJuzByNumber(clampedJuz);
    const clampedPage = juz.pageStart;
    const surahMeta = getSurahByNumber(juz.startSurah);
    set({
      mushafPage: clampedPage,
      currentSurahNumber: juz.startSurah,
      currentSurahMeta: surahMeta,
      selectedPara: clampedJuz,
      activeAudioSurah: juz.startSurah,
      activeAudioJuz: clampedJuz,
      activeAudioAyah: juz.startAyah,
    });
    if (autoPlay || get().isPlaying) {
      get().playSurahAudio(juz.startSurah, get().selectedReciterId);
    }
  },

  playJuzAudio: async (juzNumber, reciterId) => {
    const targetJuz = juzNumber || get().selectedPara;
    const clamped = Math.max(1, Math.min(30, targetJuz));
    const juz = getJuzByNumber(clamped);
    const targetReciter = reciterId || get().selectedReciterId;
    const startSurahMeta = getSurahByNumber(juz.startSurah);

    set({
      playbackType: 'juz',
      selectedPara: clamped,
      activeAudioJuz: clamped,
      activeAudioSurah: juz.startSurah,
      activeAudioAyah: juz.startAyah,
      mushafPage: juz.pageStart,
      currentSurahNumber: juz.startSurah,
      currentSurahMeta: startSurahMeta,
      selectedReciterId: targetReciter,
      audioPlaybackPhase: 'taawwuz',
      hasUserStartedAudio: true,
      isMiniPlayerDismissed: false,
      isPlaying: true,
      playbackTime: 0,
    });
  },

  advanceJuzAyah: () => {
    const { activeAudioJuz, activeAudioSurah, activeAudioAyah, autoPlayNext, selectedReciterId } = get();
    if (!activeAudioJuz) return;
    const juz = getJuzByNumber(activeAudioJuz);
    const currentAyah = activeAudioAyah || juz.startAyah;

    // Check if the completed Ayah was the absolute end of the entire Juz
    const isEndJuz = juz.endSurah && juz.endAyah
      ? (activeAudioSurah === juz.endSurah && currentAyah === juz.endAyah)
      : (activeAudioSurah === 114 && currentAyah === 6);

    if (isEndJuz) {
      if (autoPlayNext && activeAudioJuz < 30) {
        get().playJuzAudio(activeAudioJuz + 1, selectedReciterId);
      } else {
        get().pauseAudio();
        set({ audioPlaybackPhase: 'idle', playbackTime: 0 });
      }
      return;
    }

    const surahMeta = getSurahByNumber(activeAudioSurah);

    // If there are more Ayahs in the current Surah
    if (currentAyah < surahMeta.versesCount) {
      set({
        activeAudioAyah: currentAyah + 1,
        audioPlaybackPhase: 'surah',
        playbackTime: 0,
      });
      return;
    }

    // If current Surah is completed, advance to the next Surah in this Juz
    const nextSurah = activeAudioSurah + 1;
    const nextSurahMeta = getSurahByNumber(nextSurah);
    set({
      activeAudioSurah: nextSurah,
      activeAudioAyah: 1,
      currentSurahNumber: nextSurah,
      currentSurahMeta: nextSurahMeta,
      audioPlaybackPhase: 'taawwuz',
      playbackTime: 0,
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
    const initialAudioUrl = getAudioUrl(targetSurah, targetReciter);
    const surahMeta = getSurahByNumber(targetSurah);

    set({
      playbackType: 'surah',
      activeAudioJuz: null,
      activeAudioSurah: targetSurah,
      activeAudioAyah: 1,
      currentSurahNumber: targetSurah,
      currentSurahMeta: surahMeta,
      selectedReciterId: targetReciter,
      audioRecitationUrl: initialAudioUrl,
      audioPlaybackPhase: 'taawwuz',
      hasUserStartedAudio: true,
      isMiniPlayerDismissed: false,
      isPlaying: true,
      playbackTime: 0,
    });

    if (targetReciter === 99) {
      // Kanz-ul-Iman uses direct Archive.org audio
      return;
    }

    try {
      const audioUrl = await QuranApiService.getChapterRecitationAudio(targetReciter, targetSurah);
      if (get().activeAudioSurah === targetSurah && get().selectedReciterId === targetReciter) {
        set({ audioRecitationUrl: audioUrl });
      }
    } catch {
      if (get().activeAudioSurah === targetSurah) {
        set({ audioRecitationUrl: initialAudioUrl });
      }
    }
  },

  playNextSurahAudio: () => {
    const { playbackType, activeAudioJuz, activeAudioSurah, selectedReciterId } = get();
    if (playbackType === 'juz' && activeAudioJuz) {
      const nextJuz = activeAudioJuz < 30 ? activeAudioJuz + 1 : 1;
      get().playJuzAudio(nextJuz, selectedReciterId);
      return;
    }
    const nextSurah = activeAudioSurah < 114 ? activeAudioSurah + 1 : 1;
    get().playSurahAudio(nextSurah, selectedReciterId);
  },

  playPrevSurahAudio: () => {
    const { playbackType, activeAudioJuz, activeAudioSurah, selectedReciterId } = get();
    if (playbackType === 'juz' && activeAudioJuz) {
      const prevJuz = activeAudioJuz > 1 ? activeAudioJuz - 1 : 30;
      get().playJuzAudio(prevJuz, selectedReciterId);
      return;
    }
    const prevSurah = activeAudioSurah > 1 ? activeAudioSurah - 1 : 114;
    get().playSurahAudio(prevSurah, selectedReciterId);
  },

  nextAyah: () => {
    const { activeAudioSurah, activeAudioAyah, playbackType, selectedReciterId } = get();
    if (playbackType === 'juz') {
      get().advanceJuzAyah();
      return;
    }
    const surahMeta = getSurahByNumber(activeAudioSurah);
    const curAyah = activeAudioAyah || 1;
    if (curAyah < surahMeta.versesCount) {
      set({
        activeAudioAyah: curAyah + 1,
        audioPlaybackPhase: 'surah',
        isPlaying: true,
      });
    } else if (activeAudioSurah < 114) {
      get().playSurahAudio(activeAudioSurah + 1, selectedReciterId);
    }
  },

  prevAyah: () => {
    const { activeAudioSurah, activeAudioAyah, selectedReciterId } = get();
    const curAyah = activeAudioAyah || 1;
    if (curAyah > 1) {
      set({
        activeAudioAyah: curAyah - 1,
        audioPlaybackPhase: 'surah',
        isPlaying: true,
      });
    } else if (activeAudioSurah > 1) {
      const prevSurah = activeAudioSurah - 1;
      const prevMeta = getSurahByNumber(prevSurah);
      set({
        activeAudioSurah: prevSurah,
        activeAudioAyah: prevMeta.versesCount,
        audioPlaybackPhase: 'surah',
        isPlaying: true,
      });
      get().playSurahAudio(prevSurah, selectedReciterId);
    }
  },

  playAyah: (surahNumber: number, ayahNumber: number) => {
    const targetSurah = surahNumber || get().currentSurahNumber;
    const surahMeta = getSurahByNumber(targetSurah);
    const targetAyah = Math.max(1, Math.min(surahMeta.versesCount, ayahNumber));
    set({
      playbackType: 'juz',
      activeAudioSurah: targetSurah,
      activeAudioAyah: targetAyah,
      currentSurahNumber: targetSurah,
      currentSurahMeta: surahMeta,
      audioPlaybackPhase: 'surah',
      hasUserStartedAudio: true,
      isPlaying: true,
      playbackTime: 0,
    });
  },

  toggleAudioPlay: () => {
    const { isPlaying, playbackType, activeAudioJuz, activeAudioSurah, selectedReciterId, audioPlaybackPhase } = get();
    if (audioPlaybackPhase === 'idle') {
      if (playbackType === 'juz' && activeAudioJuz) {
        get().playJuzAudio(activeAudioJuz, selectedReciterId);
      } else {
        get().playSurahAudio(activeAudioSurah, selectedReciterId);
      }
      return;
    }
    set({ isPlaying: !isPlaying, hasUserStartedAudio: true });
  },

  pauseAudio: () => set({ isPlaying: false }),
  resumeAudio: () => set({ isPlaying: true, hasUserStartedAudio: true, isMiniPlayerDismissed: false }),
  stopAudio: () =>
    set({
      isPlaying: false,
      hasUserStartedAudio: true,
      isMiniPlayerDismissed: false,
    }),
  closeMiniPlayer: () =>
    set({
      isPlaying: false,
      playbackTime: 0,
      audioPlaybackPhase: 'idle',
      hasUserStartedAudio: false,
      isMiniPlayerDismissed: true,
      seekTarget: null,
      playingAyahKey: null,
      isAyahAudioPlaying: false,
    }),
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
    const isMatch = (b: QuranBookmark) => {
      const bType = b.type || (b.ayahNumber ? 'ayah' : 'surah');
      const bmType = bm.type || (bm.ayahNumber ? 'ayah' : 'surah');
      if (bmType === 'page') {
        return bType === 'page' && b.pageNumber === bm.pageNumber;
      }
      if (bmType === 'juz') {
        return bType === 'juz' && b.juzNumber === bm.juzNumber;
      }
      if (bmType === 'surah') {
        return bType === 'surah' && b.surahNumber === bm.surahNumber;
      }
      if (bmType === 'ayah') {
        return bType === 'ayah' && b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber;
      }
      return false;
    };

    const exists = bookmarks.some(isMatch);
    let updated: QuranBookmark[];
    if (exists) {
      updated = bookmarks.filter((b) => !isMatch(b));
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

  removeBookmarkItem: (bm) => {
    const { bookmarks } = get();
    const isMatch = (b: QuranBookmark) => {
      const bType = b.type || (b.ayahNumber ? 'ayah' : 'surah');
      const bmType = bm.type || (bm.ayahNumber ? 'ayah' : 'surah');
      if (bmType === 'page') return bType === 'page' && b.pageNumber === bm.pageNumber;
      if (bmType === 'juz') return bType === 'juz' && b.juzNumber === bm.juzNumber;
      if (bmType === 'surah') return bType === 'surah' && b.surahNumber === bm.surahNumber;
      if (bmType === 'ayah') return bType === 'ayah' && b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber;
      return false;
    };
    const updated = bookmarks.filter((b) => !isMatch(b));
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
  if (reciterId === 99) {
    return getKanzulImanSurahAudioUrl(surahNumber, 0);
  }
  const padded = String(surahNumber).padStart(3, '0');
  if (reciterId === 1) {
    return `https://download.quranicaudio.com/qdc/abdul_baset/mujawwad/${surahNumber}.mp3`;
  }
  if (reciterId === 2) {
    return `https://download.quranicaudio.com/qdc/abdul_baset/murattal/${surahNumber}.mp3`;
  }
  if (reciterId === 3) {
    return `https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudais/murattal/${surahNumber}.mp3`;
  }
  if (reciterId === 4) {
    return `https://download.quranicaudio.com/qdc/abu_bakr_shatri/murattal/${surahNumber}.mp3`;
  }
  if (reciterId === 5) {
    return `https://download.quranicaudio.com/qdc/hani_ar_rifai/murattal/${surahNumber}.mp3`;
  }
  if (reciterId === 6) {
    return `https://download.quranicaudio.com/qdc/khalil_al_husary/murattal/${surahNumber}.mp3`;
  }
  if (reciterId === 9) {
    return `https://download.quranicaudio.com/qdc/siddiq_minshawi/murattal/${surahNumber}.mp3`;
  }
  if (reciterId === 10) {
    return `https://download.quranicaudio.com/qdc/saud_ash-shuraym/murattal/${padded}.mp3`;
  }
  if (reciterId === 12) {
    return `https://download.quranicaudio.com/qdc/khalil_al_husary/muallim/${surahNumber}.mp3`;
  }
  if (reciterId === 13) {
    return `https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/complete/${padded}.mp3`;
  }
  // Default: Reciter 7 Mishary Rashid Alafasy
  return `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahNumber}.mp3`;
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
