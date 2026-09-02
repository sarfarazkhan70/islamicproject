import { create } from 'zustand';
import {
  SURAHS_LIST,
  JUZ_LIST,
  SURAH_DETAILS_MAP,
  SurahMeta,
  JuzMeta,
  SurahDetail,
  getSurahByPage,
  getJuzByPage,
} from '../data/quranData.js';

export interface QuranBookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText?: string;
  createdAt: string;
}

export interface QuranReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  pageNumber: number;
  updatedAt: string;
}

export type QuranMode = 'read' | 'listen';
export type TranslationLanguage = 'urdu' | 'english' | 'roman-urdu' | 'both';

export interface AudioReciter {
  id: string;
  name: string;
  serverUrlPrefix: string;
  style: string;
}

export const RECITERS_LIST: AudioReciter[] = [
  {
    id: 'alafasy',
    name: 'Sheikh Mishary Rashid Alafasy',
    serverUrlPrefix: 'https://server8.mp3quran.net/afs',
    style: 'Murattal with clear Tajweed',
  },
  {
    id: 'husary',
    name: 'Sheikh Mahmoud Khalil Al-Husary',
    serverUrlPrefix: 'https://server13.mp3quran.net/husr',
    style: 'Master of Tajweed & Classical Recitation',
  },
  {
    id: 'abdulbasit',
    name: 'Sheikh Abdul Basit Abdul Samad',
    serverUrlPrefix: 'https://server7.mp3quran.net/basit',
    style: 'Legendary Egyptian Murattal',
  },
  {
    id: 'ghamdi',
    name: 'Sheikh Saad Al-Ghamdi',
    serverUrlPrefix: 'https://server7.mp3quran.net/ghamdi',
    style: 'Harmonious & Emotional Recitation',
  },
];

export function getAudioUrl(surahNumber: number, reciterId: string = 'alafasy'): string {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId) || RECITERS_LIST[0];
  const padded = String(surahNumber).padStart(3, '0');
  return `${reciter.serverUrlPrefix}/${padded}.mp3`;
}

interface QuranState {
  mode: QuranMode;
  surahs: SurahMeta[];
  juzList: JuzMeta[];
  currentSurah: SurahDetail | null;
  currentAyah: number | null;
  
  // Mushaf Page Reading Mode State (Pages 1 to 604)
  mushafPage: number;
  selectedPara: number;
  zoomLevel: number;
  
  // Audio Playback State (Application / Global level)
  activeAudioSurah: number;
  selectedReciter: string;
  isPlaying: boolean;
  playbackTime: number;
  playbackDuration: number;
  audioVolume: number;
  isLooping: boolean;
  autoPlayNext: boolean;
  seekTarget: number | null;
  hasUserStartedAudio: boolean;

  // Translation & View Settings
  showTranslation: boolean;
  translationLang: TranslationLanguage;
  arabicFontSize: number;
  translationFontSize: number;

  // Bookmarks & Progress
  bookmarks: QuranBookmark[];
  readingProgress: QuranReadingProgress | null;
  searchTerm: string;
  activeTab: 'surahs' | 'juz' | 'bookmarks';
  isLoading: boolean;

  // Actions
  setMode: (mode: QuranMode) => void;
  fetchSurahs: () => void;
  fetchJuzList: () => void;
  loadSurah: (surahNumber: number) => Promise<void>;
  setMushafPage: (page: number) => void;
  setSelectedPara: (paraNumber: number) => void;
  jumpToSurahPage: (surahNumber: number) => void;
  jumpToJuzPage: (juzNumber: number) => void;
  nextMushafPage: () => void;
  prevMushafPage: () => void;
  setZoomLevel: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Audio Actions
  playSurahAudio: (surahNumber: number, reciterId?: string) => void;
  playNextSurahAudio: () => void;
  playPrevSurahAudio: () => void;
  toggleAudioPlay: () => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  seekAudio: (seconds: number) => void;
  clearSeekTarget: () => void;
  setSelectedReciter: (reciterId: string) => void;
  setPlaybackTime: (time: number) => void;
  setPlaybackDuration: (duration: number) => void;
  setAudioVolume: (volume: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (loop: boolean) => void;
  setAutoPlayNext: (auto: boolean) => void;

  // UI Actions
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: 'surahs' | 'juz' | 'bookmarks') => void;
  toggleTranslation: () => void;
  setTranslationLang: (lang: TranslationLanguage) => void;
  setArabicFontSize: (size: number) => void;
  setTranslationFontSize: (size: number) => void;
  toggleBookmark: (
    surahNumber: number,
    ayahNumber: number,
    surahName: string,
    ayahText?: string
  ) => Promise<void>;
  updateReadingProgress: (
    surahNumber: number,
    ayahNumber: number,
    surahName: string,
    pageNumber: number
  ) => Promise<void>;
}

const LOCAL_BOOKMARKS_KEY = 'islamic_prayer_quran_bookmarks';
const LOCAL_PROGRESS_KEY = 'islamic_prayer_quran_progress';
const LOCAL_RECITER_KEY = 'islamic_prayer_quran_reciter';
const LOCAL_TRANSLATION_LANG_KEY = 'islamic_prayer_quran_trans_lang';
const LOCAL_MUSHAF_PAGE_KEY = 'islamic_prayer_mushaf_page';
const LOCAL_LAST_AUDIO_KEY = 'islamic_prayer_last_audio_state';

// In-memory cache for all 114 Surahs on frontend
const loadedSurahsCache = new Map<number, SurahDetail>();
for (const [numStr, detail] of Object.entries(SURAH_DETAILS_MAP)) {
  loadedSurahsCache.set(Number(numStr), detail);
}

function getStoredBookmarks(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKMARKS_KEY);
    return raw
      ? JSON.parse(raw)
      : [
          { surahNumber: 67, ayahNumber: 1, surahName: 'Al-Mulk', createdAt: new Date().toISOString() },
          { surahNumber: 18, ayahNumber: 1, surahName: 'Al-Kahf', createdAt: new Date().toISOString() },
        ];
  } catch {
    return [];
  }
}

function getStoredProgress(): QuranReadingProgress | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          surahNumber: 67,
          ayahNumber: 1,
          surahName: 'Al-Mulk',
          pageNumber: 562,
          updatedAt: new Date().toISOString(),
        };
  } catch {
    return null;
  }
}

function getStoredMushafPage(): number {
  try {
    const raw = localStorage.getItem(LOCAL_MUSHAF_PAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 562; // Default to Surah Al-Mulk page 562
    return !isNaN(parsed) && parsed >= 1 && parsed <= 604 ? parsed : 562;
  } catch {
    return 562;
  }
}

function getStoredAudioState(): { surahNumber: number; playbackTime: number; reciterId: string } {
  try {
    const raw = localStorage.getItem(LOCAL_LAST_AUDIO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        surahNumber: parsed.surahNumber || 67,
        playbackTime: parsed.playbackTime || 0,
        reciterId: parsed.reciterId || 'alafasy',
      };
    }
  } catch {
    // fallback
  }
  return { surahNumber: 67, playbackTime: 0, reciterId: 'alafasy' };
}

const initialAudio = getStoredAudioState();
const initialPage = getStoredMushafPage();

export const useQuranStore = create<QuranState>((set, get) => ({
  mode: 'read',
  surahs: SURAHS_LIST,
  juzList: JUZ_LIST,
  currentSurah: SURAH_DETAILS_MAP[67] || null,
  currentAyah: 1,

  // Mushaf Page Reading Mode State
  mushafPage: initialPage,
  selectedPara: getJuzByPage(initialPage).number,
  zoomLevel: 1.0,

  // Global Audio Playback State
  activeAudioSurah: initialAudio.surahNumber,
  selectedReciter: localStorage.getItem(LOCAL_RECITER_KEY) || initialAudio.reciterId,
  isPlaying: false,
  playbackTime: initialAudio.playbackTime,
  playbackDuration: 0,
  audioVolume: 0.9,
  isLooping: false,
  autoPlayNext: true,
  seekTarget: null,
  hasUserStartedAudio: false,

  // Translation & View Settings
  showTranslation: true,
  translationLang: (localStorage.getItem(LOCAL_TRANSLATION_LANG_KEY) as TranslationLanguage) || 'urdu',
  arabicFontSize: 28,
  translationFontSize: 16,

  // Bookmarks & Progress
  bookmarks: getStoredBookmarks(),
  readingProgress: getStoredProgress(),
  searchTerm: '',
  activeTab: 'surahs',
  isLoading: false,

  setMode: (mode: QuranMode) => {
    set({ mode });
  },

  fetchSurahs: () => {
    set({ surahs: SURAHS_LIST });
  },

  fetchJuzList: () => {
    set({ juzList: JUZ_LIST });
  },

  setMushafPage: (page: number) => {
    const clamped = Math.max(1, Math.min(604, page));
    const matchedSurah = getSurahByPage(clamped);
    const matchedJuz = getJuzByPage(clamped);
    
    set({
      mushafPage: clamped,
      selectedPara: matchedJuz.number,
    });
    localStorage.setItem(LOCAL_MUSHAF_PAGE_KEY, String(clamped));
    get().updateReadingProgress(matchedSurah.number, 1, matchedSurah.name, clamped);
  },

  setSelectedPara: (paraNumber: number) => {
    const clampedPara = Math.max(1, Math.min(30, paraNumber));
    const juz = JUZ_LIST.find((j) => j.number === clampedPara) || JUZ_LIST[0];
    get().setMushafPage(juz.pageStart);
  },

  jumpToSurahPage: (surahNumber: number) => {
    const surah = SURAHS_LIST.find((s) => s.number === surahNumber) || SURAHS_LIST[0];
    get().loadSurah(surah.number);
    get().setMushafPage(surah.pageStart);
  },

  jumpToJuzPage: (juzNumber: number) => {
    const juz = JUZ_LIST.find((j) => j.number === juzNumber) || JUZ_LIST[0];
    get().setMushafPage(juz.pageStart);
  },

  nextMushafPage: () => {
    const { mushafPage } = get();
    if (mushafPage < 604) {
      get().setMushafPage(mushafPage + 1);
    }
  },

  prevMushafPage: () => {
    const { mushafPage } = get();
    if (mushafPage > 1) {
      get().setMushafPage(mushafPage - 1);
    }
  },

  setZoomLevel: (zoom: number) => {
    const clamped = Math.max(0.8, Math.min(2.5, zoom));
    set({ zoomLevel: clamped });
  },

  zoomIn: () => {
    const { zoomLevel } = get();
    get().setZoomLevel(Math.round((zoomLevel + 0.15) * 100) / 100);
  },

  zoomOut: () => {
    const { zoomLevel } = get();
    get().setZoomLevel(Math.round((zoomLevel - 0.15) * 100) / 100);
  },

  resetZoom: () => {
    set({ zoomLevel: 1.0 });
  },

  loadSurah: async (surahNumber: number) => {
    const cached = loadedSurahsCache.get(surahNumber);
    const meta = SURAHS_LIST.find((s) => s.number === surahNumber);

    if (cached && meta && cached.ayahs.length >= meta.versesCount) {
      set({ currentSurah: cached, currentAyah: 1, isLoading: false });
      get().updateReadingProgress(surahNumber, 1, cached.name, cached.pageStart);
      return;
    }

    set({ isLoading: true });

    try {
      // 1. Try local API
      const res = await fetch(`/api/v1/quran/surah/${surahNumber}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.surah?.ayahs && json.data.surah.ayahs.length > 0) {
          const detail = json.data.surah as SurahDetail;
          loadedSurahsCache.set(surahNumber, detail);
          set({ currentSurah: detail, currentAyah: 1, isLoading: false });
          get().updateReadingProgress(surahNumber, 1, detail.name, detail.pageStart);
          return;
        }
      }
    } catch {
      // Backend fallback
    }

    try {
      // 2. Direct fallback to verified Tanzil/AlQuran Cloud API
      const cloudRes = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ur.kanzuliman,en.ahmedraza`
      );
      if (cloudRes.ok) {
        const json = await cloudRes.json();
        if (json?.code === 200 && Array.isArray(json.data) && json.data.length > 0 && meta) {
          const arData = json.data.find((d: any) => d.edition.identifier === 'quran-uthmani') || json.data[0];
          const urData = json.data.find((d: any) => d.edition.identifier === 'ur.kanzuliman');
          const enData = json.data.find((d: any) => d.edition.identifier === 'en.ahmedraza');
          const padded = String(surahNumber).padStart(3, '0');

          const ayahs = arData.ayahs.map((ayahItem: any, index: number) => {
            const urAyah = urData?.ayahs?.[index];
            const enAyah = enData?.ayahs?.[index];
            let arabicText = ayahItem.text;

            if (surahNumber !== 1 && surahNumber !== 9 && ayahItem.numberInSurah === 1) {
              const bismillahPrefix = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ';
              if (arabicText.startsWith(bismillahPrefix)) {
                arabicText = arabicText.slice(bismillahPrefix.length);
              }
            }

            return {
              number: ayahItem.numberInSurah,
              globalNumber: ayahItem.number,
              arabic: arabicText,
              translation: enAyah?.text || urAyah?.text || `Surah ${meta.name} - Verse ${ayahItem.numberInSurah}`,
              translationUrdu: urAyah?.text || '',
              kanzulImanUrdu: urAyah?.text || '',
              kanzulImanEn: enAyah?.text || '',
            };
          });

          const completeDetail: SurahDetail = {
            ...meta,
            bismillahPre: surahNumber !== 1 && surahNumber !== 9,
            ayahs,
            audioRecitations: [
              {
                reciterId: 'alafasy',
                reciterName: 'Sheikh Mishary Rashid Alafasy',
                audioUrl: `https://server8.mp3quran.net/afs/${padded}.mp3`,
              },
              {
                reciterId: 'husary',
                reciterName: 'Sheikh Mahmoud Khalil Al-Husary',
                audioUrl: `https://server13.mp3quran.net/husr/${padded}.mp3`,
              },
              {
                reciterId: 'abdulbasit',
                reciterName: 'Sheikh Abdul Basit Abdul Samad (Murattal)',
                audioUrl: `https://server7.mp3quran.net/basit/${padded}.mp3`,
              },
              {
                reciterId: 'ghamdi',
                reciterName: 'Sheikh Saad Al-Ghamdi',
                audioUrl: `https://server7.mp3quran.net/ghamdi/${padded}.mp3`,
              },
            ],
          };

          loadedSurahsCache.set(surahNumber, completeDetail);
          set({ currentSurah: completeDetail, currentAyah: 1, isLoading: false });
          get().updateReadingProgress(surahNumber, 1, meta.name, meta.pageStart);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const staticDetail = SURAH_DETAILS_MAP[surahNumber];
    if (staticDetail) {
      set({ currentSurah: staticDetail, currentAyah: 1, isLoading: false });
      get().updateReadingProgress(surahNumber, 1, staticDetail.name, staticDetail.pageStart);
    } else if (meta) {
      const padded = String(surahNumber).padStart(3, '0');
      const fallbackDetail: SurahDetail = {
        ...meta,
        bismillahPre: surahNumber !== 1 && surahNumber !== 9,
        ayahs: [
          {
            number: 1,
            arabic: `سُورَةُ ${meta.arabicName}`,
            translation: `Surah ${meta.name} (${meta.meaning}) - ${meta.versesCount} Verses.`,
            translationUrdu: `سورۃ ${meta.name} - کنز الایمان (اعلیٰ حضرت امام احمد رضا خان)`,
            kanzulImanUrdu: `سورۃ ${meta.name} - کنز الایمان (اعلیٰ حضرت امام احمد رضا خان)`,
          },
        ],
        audioRecitations: [
          {
            reciterId: 'alafasy',
            reciterName: 'Sheikh Mishary Rashid Alafasy',
            audioUrl: `https://server8.mp3quran.net/afs/${padded}.mp3`,
          },
          {
            reciterId: 'husary',
            reciterName: 'Sheikh Mahmoud Khalil Al-Husary',
            audioUrl: `https://server13.mp3quran.net/husr/${padded}.mp3`,
          },
        ],
      };
      set({ currentSurah: fallbackDetail, currentAyah: 1, isLoading: false });
      get().updateReadingProgress(surahNumber, 1, meta.name, meta.pageStart);
    }

    set({ isLoading: false });
  },

  // Audio Playback Implementation
  playSurahAudio: (surahNumber: number, reciterId?: string) => {
    const reciter = reciterId || get().selectedReciter || 'alafasy';
    const isDifferentSurah = get().activeAudioSurah !== surahNumber;
    
    set({
      activeAudioSurah: surahNumber,
      selectedReciter: reciter,
      isPlaying: true,
      hasUserStartedAudio: true,
      playbackTime: isDifferentSurah ? 0 : get().playbackTime,
    });

    localStorage.setItem(LOCAL_RECITER_KEY, reciter);
    localStorage.setItem(
      LOCAL_LAST_AUDIO_KEY,
      JSON.stringify({
        surahNumber,
        playbackTime: isDifferentSurah ? 0 : get().playbackTime,
        reciterId: reciter,
      })
    );
  },

  playNextSurahAudio: () => {
    const { activeAudioSurah, selectedReciter } = get();
    const nextSurah = activeAudioSurah < 114 ? activeAudioSurah + 1 : 1;
    get().playSurahAudio(nextSurah, selectedReciter);
  },

  playPrevSurahAudio: () => {
    const { activeAudioSurah, selectedReciter } = get();
    const prevSurah = activeAudioSurah > 1 ? activeAudioSurah - 1 : 114;
    get().playSurahAudio(prevSurah, selectedReciter);
  },

  toggleAudioPlay: () => {
    const { isPlaying, activeAudioSurah, selectedReciter } = get();
    if (isPlaying) {
      get().pauseAudio();
    } else {
      get().playSurahAudio(activeAudioSurah || 67, selectedReciter || 'alafasy');
    }
  },

  pauseAudio: () => {
    set({ isPlaying: false });
    const { activeAudioSurah, playbackTime, selectedReciter } = get();
    localStorage.setItem(
      LOCAL_LAST_AUDIO_KEY,
      JSON.stringify({ surahNumber: activeAudioSurah, playbackTime, reciterId: selectedReciter })
    );
  },

  resumeAudio: () => {
    set({ isPlaying: true, hasUserStartedAudio: true });
  },

  stopAudio: () => {
    set({ isPlaying: false, playbackTime: 0 });
    const { activeAudioSurah, selectedReciter } = get();
    localStorage.setItem(
      LOCAL_LAST_AUDIO_KEY,
      JSON.stringify({ surahNumber: activeAudioSurah, playbackTime: 0, reciterId: selectedReciter })
    );
  },

  seekAudio: (seconds: number) => {
    set({ seekTarget: seconds, playbackTime: seconds });
    const { activeAudioSurah, selectedReciter } = get();
    localStorage.setItem(
      LOCAL_LAST_AUDIO_KEY,
      JSON.stringify({ surahNumber: activeAudioSurah, playbackTime: seconds, reciterId: selectedReciter })
    );
  },

  clearSeekTarget: () => {
    set({ seekTarget: null });
  },

  setSelectedReciter: (reciterId: string) => {
    set({ selectedReciter: reciterId });
    localStorage.setItem(LOCAL_RECITER_KEY, reciterId);
    const { activeAudioSurah, playbackTime } = get();
    localStorage.setItem(
      LOCAL_LAST_AUDIO_KEY,
      JSON.stringify({ surahNumber: activeAudioSurah, playbackTime, reciterId })
    );
  },

  setPlaybackTime: (playbackTime: number) => {
    set({ playbackTime });
  },

  setPlaybackDuration: (playbackDuration: number) => {
    set({ playbackDuration });
  },

  setAudioVolume: (audioVolume: number) => {
    set({ audioVolume: Math.max(0, Math.min(1, audioVolume)) });
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  setIsLooping: (isLooping: boolean) => {
    set({ isLooping });
  },

  setAutoPlayNext: (autoPlayNext: boolean) => {
    set({ autoPlayNext });
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  setActiveTab: (activeTab: 'surahs' | 'juz' | 'bookmarks') => {
    set({ activeTab });
  },

  toggleTranslation: () => {
    set((state) => ({ showTranslation: !state.showTranslation }));
  },

  setTranslationLang: (translationLang: TranslationLanguage) => {
    set({ translationLang });
    localStorage.setItem(LOCAL_TRANSLATION_LANG_KEY, translationLang);
  },

  setArabicFontSize: (size: number) => {
    const clamped = Math.max(20, Math.min(44, size));
    set({ arabicFontSize: clamped });
  },

  setTranslationFontSize: (size: number) => {
    const clamped = Math.max(12, Math.min(26, size));
    set({ translationFontSize: clamped });
  },

  toggleBookmark: async (surahNumber, ayahNumber, surahName, ayahText) => {
    const { bookmarks } = get();
    const existingIndex = bookmarks.findIndex(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );

    let updatedBookmarks: QuranBookmark[];
    if (existingIndex >= 0) {
      updatedBookmarks = bookmarks.filter((_, idx) => idx !== existingIndex);
    } else {
      updatedBookmarks = [
        {
          surahNumber,
          ayahNumber,
          surahName,
          ayahText,
          createdAt: new Date().toISOString(),
        },
        ...bookmarks,
      ];
    }

    set({ bookmarks: updatedBookmarks });
    localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));

    try {
      const token = localStorage.getItem('token');
      if (token) {
        if (existingIndex >= 0) {
          await fetch('/api/v1/quran/bookmarks', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ surahNumber, ayahNumber }),
          });
        } else {
          await fetch('/api/v1/quran/bookmarks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ surahNumber, ayahNumber, surahName, ayahText }),
          });
        }
      }
    } catch {
      // Local fallback
    }
  },

  updateReadingProgress: async (surahNumber, ayahNumber, surahName, pageNumber) => {
    const progress: QuranReadingProgress = {
      surahNumber,
      ayahNumber,
      surahName,
      pageNumber,
      updatedAt: new Date().toISOString(),
    };

    set({ readingProgress: progress });
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/v1/quran/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ surahNumber, ayahNumber, surahName, pageNumber }),
        });
      }
    } catch {
      // Local fallback
    }
  },
}));
