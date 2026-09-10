/**
 * Kanzul Iman Translation & Recitation Audio Store — Single Source of Truth Engine
 * ==============================================================================
 * Guarantees authentic playback:
 * Urdu: Complete Authentic Kanz-ul-Iman (Ala Hazrat Imam Ahmad Raza Khan) from
 * Internet Archive (kanzuliman_201907 / Paigham-e-Raza) covering all 114 Surahs
 * with multi-part support (e.g., Al-Baqarah Parts 1-3).
 * ==============================================================================
 */

import { create } from 'zustand';
import { SURAHS_LIST, JUZ_LIST } from '../data/quranData';
import { getVerifiedKanzulImanTranslation } from '../data/kanzulImanData';
import { KanzulImanService, KanzulImanAyah } from '../services/kanzulImanService';
import {
  KanzulImanAudioTrack,
  getKanzulImanAudioTracks,
  getKanzulImanSurahAudioUrl,
  getKanzulImanSurahDuration,
  isKanzulImanMultiPart,
} from '../data/kanzulImanAudioData';

export { getKanzulImanSurahDuration, isKanzulImanMultiPart, getKanzulImanAudioTracks };

export const SURAH_VERSE_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6,
  3, 5, 4, 5, 6
];

export function getGlobalAyahNumber(surahNumber: number, ayahNumberInSurah: number): number {
  if (surahNumber < 1 || surahNumber > 114) return 1;
  let globalNum = 0;
  for (let s = 1; s < surahNumber; s++) {
    globalNum += SURAH_VERSE_COUNTS[s - 1] || 0;
  }
  return globalNum + ayahNumberInSurah;
}

/**
 * Primary authentic Kanz-ul-Iman Urdu recitation audio URL by Shamshad Ali Khan (EveryAyah format)
 */
export function getKanzulImanUrduAudioUrl(surahNumber: number, ayahNumberInSurah: number): string {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumberInSurah).padStart(3, '0');
  return `https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps/${paddedSurah}${paddedAyah}.mp3`;
}

/**
 * Secondary CDN fallback for authentic Kanz-ul-Iman Urdu recitation
 */
export function getKanzulImanUrduFallbackAudioUrl(surahNumber: number, ayahNumberInSurah: number): string {
  const globalAyahNum = getGlobalAyahNumber(surahNumber, ayahNumberInSurah);
  return `https://cdn.islamic.network/quran/audio/64/ur.khan/${globalAyahNum}.mp3`;
}

/**
 * Direct Internet Archive Authentic Kanz-ul-Iman Surah Audio URL
 */
export function getKanzulImanArchiveAudioUrl(surahNumber: number, partIndex: number = 0): string {
  return getKanzulImanSurahAudioUrl(surahNumber, partIndex);
}

/**
 * Arabic Ayah recitation URL from verified Quran reciters (e.g. Alafasy)
 */
export function getArabicAyahAudioUrl(surahNumber: number, ayahNumberInSurah: number, reciterSlug: string = 'Alafasy'): string {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumberInSurah).padStart(3, '0');
  return `https://verses.quran.com/${reciterSlug}/mp3/${paddedSurah}${paddedAyah}.mp3`;
}

export type TranslationLanguage = 'urdu';
export type PlaybackPhase = 'idle' | 'translation';
export type PlaybackScope = 'surah' | 'juz';

export interface TextAyahData {
  ayahNumber: number;
  kanzulImanUrdu: string;
  kanzulImanEnglish?: string;
  englishMeaning?: string;
  arabicText?: string;
  verseKey?: string;
}

interface KanzulImanAudioState {
  // Navigation & Hierarchy
  playbackScope: PlaybackScope;
  currentSurahNumber: number;
  currentJuzNumber: number | null;
  currentAyahNumber: number;
  maxAyahsInSurah: number;
  currentAyahs: KanzulImanAyah[];
  isLoadingAyahs: boolean;

  // Multi-part Track State
  currentPartIndex: number;
  totalPartsInSurah: number;
  currentTrackTitle: string;
  currentTracks: KanzulImanAudioTrack[];

  // Active Playback State
  playingAyahKey: string | null; // e.g. "1:1"
  playingLanguage: TranslationLanguage | null;
  playbackPhase: PlaybackPhase;
  playbackMode: 'single' | 'full-urdu';
  selectedLanguage: TranslationLanguage;
  selectedReciterId: number;
  isPlaying: boolean;
  isLoading: boolean;
  isAutoPlay: boolean;
  playbackSpeed: number;
  audioVolume: number;
  playbackTime: number;
  playbackDuration: number;
  playbackProgress: number; // 0 to 1
  audioError: string | null;

  // Actions
  setPlaybackScope: (scope: PlaybackScope) => void;
  setSelectedLanguage: (lang?: string) => void;
  setSelectedReciterId: (reciterId: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setAudioVolume: (volume: number) => void;
  setAutoPlay: (enabled: boolean) => void;
  toggleAutoPlay: () => void;
  setPartIndex: (partIndex: number) => void;

  // Flow Triggers
  loadSurahData: (surahNumber: number) => Promise<void>;
  loadJuzData: (juzNumber: number) => Promise<void>;
  playSurah: (surahNumber: number, startAyah?: number, _lang?: string) => Promise<void>;
  playKanzulImanSurah: (surahNumber: number, partIndex?: number) => void;
  playJuz: (juzNumber: number, startSurah?: number, startAyah?: number, _lang?: string) => Promise<void>;
  playAyah: (surahNumber: number, ayahNumber: number, startPhase?: PlaybackPhase) => void;
  togglePlay: () => void;
  togglePlayAyahCard: (surahNumber: number, ayahNumber: number) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekAudio: (seconds: number) => void;
  skipTime: (seconds: number) => void;

  // Backward compatibility methods
  playFullSurah: (
    surahNumber: number,
    _mode?: string,
    _maxAyahs?: number,
    _textAyahs?: any[]
  ) => void;
  playAyahTranslation: (
    surahNumber: number,
    ayahNumber: number,
    _language?: string,
    _maxAyahs?: number,
    _textAyahs?: any[]
  ) => void;
  togglePlayAyah: (
    surahNumber: number,
    ayahNumber: number,
    _language?: string,
    _maxAyahs?: number,
    _textAyahs?: any[]
  ) => void;
}

const AUTOPLAY_STORAGE_KEY = 'islamic_prayer_kanzul_iman_autoplay';

function getStoredAutoPlay(): boolean {
  try {
    const raw = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

// Audio Element Controller (Pure HTML5 Audio streaming from authentic audio endpoints)
let activeHtmlAudio: HTMLAudioElement | null = null;

/**
 * Completely stops any active HTML5 audio playback and cleans up event listeners
 */
function stopAnyAudio() {
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
      activeHtmlAudio.src = '';
      activeHtmlAudio.onplay = null;
      activeHtmlAudio.onpause = null;
      activeHtmlAudio.onended = null;
      activeHtmlAudio.onerror = null;
      activeHtmlAudio.ontimeupdate = null;
      activeHtmlAudio.onloadedmetadata = null;
    } catch {}
  }
}

/**
 * Extracts the exact text displayed for an Ayah from the active Ayah collection
 */
export function getDisplayedAyahText(
  surahNumber: number,
  ayahNumber: number,
  language: string,
  cachedAyahs: TextAyahData[]
): string {
  const matchingAyah = cachedAyahs.find((a) => a.ayahNumber === ayahNumber);
  if (matchingAyah) {
    if (language === 'urdu') {
      return matchingAyah.kanzulImanUrdu ? matchingAyah.kanzulImanUrdu.trim() : '';
    } else {
      const english = matchingAyah.kanzulImanEnglish || matchingAyah.englishMeaning;
      return english ? english.trim() : '';
    }
  }

  const verified = getVerifiedKanzulImanTranslation(surahNumber, ayahNumber, language as any);
  return verified ? verified.trim() : '';
}

export const useKanzulImanAudioStore = create<KanzulImanAudioState>((set, get) => {
  const initialSurahTracks = getKanzulImanAudioTracks(1);

  return {
    playbackScope: 'surah',
    currentSurahNumber: 1,
    currentJuzNumber: null,
    currentAyahNumber: 1,
    maxAyahsInSurah: 7,
    currentAyahs: [],
    isLoadingAyahs: false,

    currentPartIndex: 0,
    totalPartsInSurah: initialSurahTracks.length,
    currentTrackTitle: initialSurahTracks[0]?.title || 'AL-FATIHA',
    currentTracks: initialSurahTracks,

    playingAyahKey: null,
    playingLanguage: 'urdu',
    playbackPhase: 'idle',
    playbackMode: 'full-urdu',
    selectedLanguage: 'urdu',
    selectedReciterId: 7, // Mishary Rashid Alafasy
    isPlaying: false,
    isLoading: false,
    isAutoPlay: getStoredAutoPlay(),
    playbackSpeed: 1.0,
    audioVolume: 0.9,
    playbackTime: 0,
    playbackDuration: initialSurahTracks[0]?.duration || 83.72,
    playbackProgress: 0,
    audioError: null,

    playFullSurah: (surahNumber, _mode, _maxAyahs, _textAyahs) => {
      get().playSurah(surahNumber, 1);
    },

    playAyahTranslation: (surahNumber, ayahNumber, _language, _maxAyahs, _textAyahs) => {
      get().playAyah(surahNumber, ayahNumber);
    },

    togglePlayAyah: (surahNumber, ayahNumber, _language, _maxAyahs, _textAyahs) => {
      get().togglePlayAyahCard(surahNumber, ayahNumber);
    },

    setPlaybackScope: (scope) => set({ playbackScope: scope }),

    setSelectedLanguage: (_lang) => {
      set({
        selectedLanguage: 'urdu',
        playingLanguage: 'urdu',
        playbackMode: 'full-urdu',
      });
    },

    setSelectedReciterId: (reciterId) => {
      set({ selectedReciterId: reciterId });
    },

    setPlaybackSpeed: (speed) => {
      set({ playbackSpeed: speed });
      if (activeHtmlAudio) {
        activeHtmlAudio.playbackRate = speed;
      }
    },

    setAudioVolume: (volume) => {
      const clamped = Math.max(0, Math.min(1, volume));
      set({ audioVolume: clamped });
      if (activeHtmlAudio) {
        activeHtmlAudio.volume = clamped;
      }
    },

    setAutoPlay: (enabled) => {
      try {
        localStorage.setItem(AUTOPLAY_STORAGE_KEY, enabled.toString());
      } catch {}
      set({ isAutoPlay: enabled });
    },

    toggleAutoPlay: () => {
      const next = !get().isAutoPlay;
      get().setAutoPlay(next);
    },

    setPartIndex: (partIndex) => {
      const { currentSurahNumber } = get();
      get().playKanzulImanSurah(currentSurahNumber, partIndex);
    },

    loadSurahData: async (surahNumber) => {
      const validNum = Math.max(1, Math.min(114, surahNumber));
      const tracks = getKanzulImanAudioTracks(validNum);
      set({
        isLoadingAyahs: true,
        currentSurahNumber: validNum,
        currentTracks: tracks,
        totalPartsInSurah: tracks.length,
      });
      try {
        const res = await KanzulImanService.getSurah(validNum);
        set({
          currentAyahs: res.ayahs,
          maxAyahsInSurah: res.versesCount,
          isLoadingAyahs: false,
        });
      } catch (err) {
        console.error(`Failed to load Kanzul Iman Surah ${validNum}:`, err);
        set({ isLoadingAyahs: false });
      }
    },

    loadJuzData: async (juzNumber) => {
      const validNum = Math.max(1, Math.min(30, juzNumber));
      set({ isLoadingAyahs: true, currentJuzNumber: validNum, playbackScope: 'juz' });
      try {
        const ayahs = await KanzulImanService.getJuz(validNum);
        const firstSurah = ayahs.length > 0 ? parseInt(ayahs[0].verseKey.split(':')[0], 10) : 1;
        const tracks = getKanzulImanAudioTracks(firstSurah);
        set({
          currentAyahs: ayahs,
          currentSurahNumber: firstSurah,
          currentTracks: tracks,
          totalPartsInSurah: tracks.length,
          isLoadingAyahs: false,
        });
      } catch (err) {
        console.error(`Failed to load Kanzul Iman Juz ${validNum}:`, err);
        set({ isLoadingAyahs: false });
      }
    },

    playSurah: async (surahNumber, startAyah = 1, _lang) => {
      const validSurah = Math.max(1, Math.min(114, surahNumber));
      const tracks = getKanzulImanAudioTracks(validSurah);
      set({
        playbackScope: 'surah',
        currentSurahNumber: validSurah,
        currentAyahNumber: startAyah,
        selectedLanguage: 'urdu',
        playingLanguage: 'urdu',
        currentTracks: tracks,
        totalPartsInSurah: tracks.length,
        currentPartIndex: 0,
      });

      if (get().currentAyahs.length === 0 || get().currentSurahNumber !== validSurah) {
        await get().loadSurahData(validSurah);
      }

      get().playKanzulImanSurah(validSurah, 0);
    },

    playKanzulImanSurah: (surahNumber: number, partIndex: number = 0) => {
      stopAnyAudio();
      const validSurah = Math.max(1, Math.min(114, surahNumber));
      const tracks = getKanzulImanAudioTracks(validSurah);
      const validPart = Math.max(0, Math.min(tracks.length - 1, partIndex));
      const track = tracks[validPart] || tracks[0];

      if (!track) {
        set({ audioError: 'Audio track not found.' });
        return;
      }

      const surahMeta = SURAHS_LIST.find((s) => s.number === validSurah);
      const totalAyahs = surahMeta?.versesCount || SURAH_VERSE_COUNTS[validSurah - 1] || 7;

      set({
        playbackScope: 'surah',
        currentSurahNumber: validSurah,
        currentPartIndex: validPart,
        totalPartsInSurah: tracks.length,
        currentTrackTitle: track.title,
        currentTracks: tracks,
        playingAyahKey: `${validSurah}:1`,
        playingLanguage: 'urdu',
        selectedLanguage: 'urdu',
        maxAyahsInSurah: totalAyahs,
        playbackPhase: 'translation',
        isPlaying: true,
        isLoading: true,
        audioError: null,
        playbackTime: 0,
        playbackDuration: track.duration || 0,
        playbackProgress: 0,
      });

      if (!activeHtmlAudio) {
        activeHtmlAudio = new Audio();
      }

      activeHtmlAudio.src = track.url;
      activeHtmlAudio.playbackRate = get().playbackSpeed || 1.0;
      activeHtmlAudio.volume = get().audioVolume;

      activeHtmlAudio.onplay = () => {
        set({ isPlaying: true, isLoading: false, audioError: null });
      };

      activeHtmlAudio.onpause = () => {
        if (activeHtmlAudio && !activeHtmlAudio.ended) {
          set({ isPlaying: false });
        }
      };

      activeHtmlAudio.ontimeupdate = () => {
        if (activeHtmlAudio && activeHtmlAudio.duration) {
          const cur = activeHtmlAudio.currentTime;
          const dur = activeHtmlAudio.duration;
          set({
            playbackTime: cur,
            playbackDuration: dur,
            playbackProgress: dur > 0 ? cur / dur : 0,
          });
        }
      };

      activeHtmlAudio.onloadedmetadata = () => {
        if (activeHtmlAudio && activeHtmlAudio.duration) {
          set({ playbackDuration: activeHtmlAudio.duration });
        }
      };

      activeHtmlAudio.onended = () => {
        const { currentPartIndex, totalPartsInSurah, currentSurahNumber, isAutoPlay } = get();
        // If there's another part for this Surah (e.g. Al-Baqarah Part 2), play it next
        if (currentPartIndex + 1 < totalPartsInSurah) {
          get().playKanzulImanSurah(currentSurahNumber, currentPartIndex + 1);
        } else if (isAutoPlay && currentSurahNumber < 114) {
          // Advance to next Surah
          get().playSurah(currentSurahNumber + 1, 1);
        } else {
          set({ isPlaying: false, playbackProgress: 1, playbackTime: get().playbackDuration });
        }
      };

      activeHtmlAudio.onerror = (e) => {
        console.error('Kanzul Iman audio stream error:', e);
        set({
          isPlaying: false,
          isLoading: false,
          audioError: 'Kanz-ul-Iman audio stream failed to load. Please click retry.',
        });
      };

      const playPromise = activeHtmlAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Audio play request failed or interrupted:', err);
            set({ isPlaying: false, isLoading: false });
          }
        });
      }
    },

    playJuz: async (juzNumber, startSurah, startAyah, _lang) => {
      const validJuz = Math.max(1, Math.min(30, juzNumber));
      const juzMeta = JUZ_LIST[validJuz - 1] || JUZ_LIST[0];
      const sNum = startSurah || juzMeta.startSurah;
      const aNum = startAyah || juzMeta.startAyah;
      const tracks = getKanzulImanAudioTracks(sNum);

      set({
        playbackScope: 'juz',
        currentJuzNumber: validJuz,
        currentSurahNumber: sNum,
        currentAyahNumber: aNum,
        selectedLanguage: 'urdu',
        playingLanguage: 'urdu',
        currentTracks: tracks,
        totalPartsInSurah: tracks.length,
        currentPartIndex: 0,
      });

      await get().loadJuzData(validJuz);
      get().playKanzulImanSurah(sNum, 0);
    },

    playAyah: (surahNumber, ayahNumber, _startPhase) => {
      const validSurah = Math.max(1, Math.min(114, surahNumber));
      const surahMeta = SURAHS_LIST.find((s) => s.number === validSurah);
      const totalAyahs = surahMeta?.versesCount || SURAH_VERSE_COUNTS[validSurah - 1] || 7;
      const verseKey = `${validSurah}:${ayahNumber}`;

      set({
        playingAyahKey: verseKey,
        playingLanguage: 'urdu',
        currentSurahNumber: validSurah,
        currentAyahNumber: ayahNumber,
        maxAyahsInSurah: totalAyahs,
        playbackPhase: 'translation',
      });

      // Play authentic Kanz-ul-Iman Urdu Surah Audio
      get().playKanzulImanSurah(validSurah, 0);
    },

    togglePlay: () => {
      const { isPlaying, currentSurahNumber, currentPartIndex } = get();
      if (isPlaying) {
        get().pauseAudio();
      } else {
        if (activeHtmlAudio && activeHtmlAudio.src && activeHtmlAudio.paused) {
          get().resumeAudio();
        } else {
          get().playKanzulImanSurah(currentSurahNumber || 1, currentPartIndex || 0);
        }
      }
    },

    togglePlayAyahCard: (surahNumber, _ayahNumber) => {
      get().playKanzulImanSurah(surahNumber, 0);
    },

    pauseAudio: () => {
      if (activeHtmlAudio && !activeHtmlAudio.paused) {
        try {
          activeHtmlAudio.pause();
        } catch {}
      }
      set({ isPlaying: false });
    },

    resumeAudio: () => {
      if (activeHtmlAudio && activeHtmlAudio.paused && activeHtmlAudio.src) {
        activeHtmlAudio.play().then(() => {
          set({ isPlaying: true });
        }).catch(() => {});
        return;
      }
      const { currentSurahNumber, currentPartIndex } = get();
      get().playKanzulImanSurah(currentSurahNumber || 1, currentPartIndex || 0);
    },

    stopAudio: () => {
      stopAnyAudio();
      set({
        playingAyahKey: null,
        playbackPhase: 'idle',
        isPlaying: false,
        isLoading: false,
        playbackProgress: 0,
        playbackTime: 0,
        audioError: null,
      });
    },

    nextTrack: () => {
      const { currentSurahNumber, currentPartIndex, totalPartsInSurah } = get();
      if (currentPartIndex + 1 < totalPartsInSurah) {
        get().playKanzulImanSurah(currentSurahNumber, currentPartIndex + 1);
      } else if (currentSurahNumber < 114) {
        get().playSurah(currentSurahNumber + 1, 1);
      }
    },

    prevTrack: () => {
      const { currentSurahNumber, currentPartIndex } = get();
      if (currentPartIndex > 0) {
        get().playKanzulImanSurah(currentSurahNumber, currentPartIndex - 1);
      } else if (currentSurahNumber > 1) {
        const prevSurah = currentSurahNumber - 1;
        const prevTracks = getKanzulImanAudioTracks(prevSurah);
        get().playKanzulImanSurah(prevSurah, Math.max(0, prevTracks.length - 1));
      }
    },

    nextAyah: () => {
      get().nextTrack();
    },

    prevAyah: () => {
      get().prevTrack();
    },

    seekAudio: (seconds) => {
      if (activeHtmlAudio && !isNaN(activeHtmlAudio.duration) && activeHtmlAudio.duration > 0) {
        const target = Math.max(0, Math.min(activeHtmlAudio.duration, seconds));
        activeHtmlAudio.currentTime = target;
        set({ playbackTime: target, playbackProgress: target / activeHtmlAudio.duration });
      }
    },

    skipTime: (seconds) => {
      if (activeHtmlAudio && !isNaN(activeHtmlAudio.duration) && activeHtmlAudio.duration > 0) {
        const target = Math.max(0, Math.min(activeHtmlAudio.duration, activeHtmlAudio.currentTime + seconds));
        activeHtmlAudio.currentTime = target;
        set({ playbackTime: target, playbackProgress: target / activeHtmlAudio.duration });
      }
    },
  };
});
