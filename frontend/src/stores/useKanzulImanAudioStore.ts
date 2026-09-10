/**
 * Kanzul Iman Translation & Recitation Audio Store — Single Source of Truth Engine
 * ==============================================================================
 * Guarantees authentic playback:
 * 1. Urdu: Complete Authentic Kanz-ul-Iman (Ala Hazrat Imam Ahmad Raza Khan) from
 *    Internet Archive (kanzuliman_201907 / Paigham-e-Raza) covering all 114 Surahs
 *    with multi-part support (e.g., Al-Baqarah Parts 1-3).
 * 2. English: Verified English Translation Recitation (Ibrahim Walk / Saheeh Intnl)
 *    Ayah-by-Ayah with Arabic recitation (Selected Qari e.g. Mishary Rashid Alafasy).
 * ==============================================================================
 */

import { create } from 'zustand';
import { SURAHS_LIST, JUZ_LIST, QURAN_COM_RECITERS } from '../data/quranData';
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
 * Primary authentic English translation recitation audio URL by Ibrahim Walk (Male voice)
 */
export function getEnglishTranslationAudioUrl(surahNumber: number, ayahNumberInSurah: number): string {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumberInSurah).padStart(3, '0');
  return `https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/${paddedSurah}${paddedAyah}.mp3`;
}

/**
 * Secondary CDN fallback for English translation recitation
 */
export function getEnglishTranslationFallbackAudioUrl(surahNumber: number, ayahNumberInSurah: number): string {
  const globalAyahNum = getGlobalAyahNumber(surahNumber, ayahNumberInSurah);
  return `https://cdn.islamic.network/quran/audio/192/en.walk/${globalAyahNum}.mp3`;
}

/**
 * Arabic Ayah recitation URL from verified Quran reciters (e.g. Alafasy)
 */
export function getArabicAyahAudioUrl(surahNumber: number, ayahNumberInSurah: number, reciterSlug: string = 'Alafasy'): string {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumberInSurah).padStart(3, '0');
  return `https://verses.quran.com/${reciterSlug}/mp3/${paddedSurah}${paddedAyah}.mp3`;
}

export type TranslationLanguage = 'urdu' | 'english';
export type PlaybackPhase = 'idle' | 'arabic' | 'translation';
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
  playbackMode: 'single' | 'full-urdu' | 'full-english';
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
  setSelectedLanguage: (lang: TranslationLanguage) => void;
  setSelectedReciterId: (reciterId: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setAudioVolume: (volume: number) => void;
  setAutoPlay: (enabled: boolean) => void;
  toggleAutoPlay: () => void;
  setPartIndex: (partIndex: number) => void;

  // Flow Triggers
  loadSurahData: (surahNumber: number) => Promise<void>;
  loadJuzData: (juzNumber: number) => Promise<void>;
  playSurah: (surahNumber: number, startAyah?: number, lang?: TranslationLanguage) => Promise<void>;
  playKanzulImanSurah: (surahNumber: number, partIndex?: number) => void;
  playJuz: (juzNumber: number, startSurah?: number, startAyah?: number, lang?: TranslationLanguage) => Promise<void>;
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
    mode?: 'full-urdu' | 'full-english',
    maxAyahs?: number,
    textAyahs?: any[]
  ) => void;
  playAyahTranslation: (
    surahNumber: number,
    ayahNumber: number,
    language: TranslationLanguage,
    maxAyahs?: number,
    textAyahs?: any[]
  ) => void;
  togglePlayAyah: (
    surahNumber: number,
    ayahNumber: number,
    language: TranslationLanguage,
    maxAyahs?: number,
    textAyahs?: any[]
  ) => void;
}

const AUTOPLAY_STORAGE_KEY = 'islamic_prayer_kanzul_iman_autoplay';
const LANG_STORAGE_KEY = 'islamic_prayer_kanzul_iman_lang';

function getStoredAutoPlay(): boolean {
  try {
    const raw = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

function getStoredLanguage(): TranslationLanguage {
  try {
    const raw = localStorage.getItem(LANG_STORAGE_KEY);
    if (raw === 'urdu' || raw === 'english') return raw;
  } catch {}
  return 'urdu';
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
  language: TranslationLanguage,
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

  const verified = getVerifiedKanzulImanTranslation(surahNumber, ayahNumber, language);
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
    playingLanguage: getStoredLanguage(),
    playbackPhase: 'idle',
    playbackMode: getStoredLanguage() === 'english' ? 'full-english' : 'full-urdu',
    selectedLanguage: getStoredLanguage(),
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

    playFullSurah: (surahNumber, mode, _maxAyahs, _textAyahs) => {
      const lang: TranslationLanguage = mode === 'full-english' ? 'english' : 'urdu';
      get().setSelectedLanguage(lang);
      get().playSurah(surahNumber, 1, lang);
    },

    playAyahTranslation: (surahNumber, ayahNumber, language, _maxAyahs, _textAyahs) => {
      get().setSelectedLanguage(language);
      get().playAyah(surahNumber, ayahNumber, 'translation');
    },

    togglePlayAyah: (surahNumber, ayahNumber, language, _maxAyahs, _textAyahs) => {
      get().setSelectedLanguage(language);
      get().togglePlayAyahCard(surahNumber, ayahNumber);
    },

    setPlaybackScope: (scope) => set({ playbackScope: scope }),

    setSelectedLanguage: (lang) => {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {}
      set({
        selectedLanguage: lang,
        playingLanguage: lang,
        playbackMode: lang === 'english' ? 'full-english' : 'full-urdu',
      });
      const { isPlaying, currentSurahNumber, currentPartIndex } = get();
      if (isPlaying) {
        if (lang === 'urdu') {
          get().playKanzulImanSurah(currentSurahNumber, currentPartIndex);
        } else {
          get().playAyah(currentSurahNumber, 1, 'arabic');
        }
      }
    },

    setSelectedReciterId: (reciterId) => {
      set({ selectedReciterId: reciterId });
      const { isPlaying, playbackPhase, currentSurahNumber, currentAyahNumber, selectedLanguage } = get();
      if (isPlaying && selectedLanguage === 'english' && playbackPhase === 'arabic') {
        get().playAyah(currentSurahNumber, currentAyahNumber, 'arabic');
      }
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

    playSurah: async (surahNumber, startAyah = 1, lang) => {
      const targetLang = lang || get().selectedLanguage;
      const tracks = getKanzulImanAudioTracks(surahNumber);
      set({
        playbackScope: 'surah',
        currentSurahNumber: surahNumber,
        currentAyahNumber: startAyah,
        selectedLanguage: targetLang,
        playingLanguage: targetLang,
        currentTracks: tracks,
        totalPartsInSurah: tracks.length,
        currentPartIndex: 0,
      });

      if (get().currentAyahs.length === 0 || get().currentSurahNumber !== surahNumber) {
        await get().loadSurahData(surahNumber);
      }

      if (targetLang === 'urdu') {
        get().playKanzulImanSurah(surahNumber, 0);
      } else {
        get().playAyah(surahNumber, startAyah, 'arabic');
      }
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
          get().playSurah(currentSurahNumber + 1, 1, 'urdu');
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

    playJuz: async (juzNumber, startSurah, startAyah, lang) => {
      const targetLang = lang || get().selectedLanguage;
      const juzMeta = JUZ_LIST[juzNumber - 1] || JUZ_LIST[0];
      const sNum = startSurah || juzMeta.startSurah;
      const aNum = startAyah || juzMeta.startAyah;
      const tracks = getKanzulImanAudioTracks(sNum);

      set({
        playbackScope: 'juz',
        currentJuzNumber: juzNumber,
        currentSurahNumber: sNum,
        currentAyahNumber: aNum,
        selectedLanguage: targetLang,
        playingLanguage: targetLang,
        currentTracks: tracks,
        totalPartsInSurah: tracks.length,
        currentPartIndex: 0,
      });

      await get().loadJuzData(juzNumber);
      if (targetLang === 'urdu') {
        get().playKanzulImanSurah(sNum, 0);
      } else {
        get().playAyah(sNum, aNum, 'arabic');
      }
    },

    playAyah: (surahNumber, ayahNumber, startPhase = 'arabic') => {
      stopAnyAudio();

      const surahMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
      const totalAyahs = surahMeta?.versesCount || SURAH_VERSE_COUNTS[surahNumber - 1] || 7;
      const verseKey = `${surahNumber}:${ayahNumber}`;
      const { selectedLanguage, playbackSpeed, audioVolume, selectedReciterId } = get();

      set({
        playingAyahKey: verseKey,
        playingLanguage: selectedLanguage,
        currentSurahNumber: surahNumber,
        currentAyahNumber: ayahNumber,
        maxAyahsInSurah: totalAyahs,
        playbackPhase: startPhase,
        isPlaying: true,
        isLoading: true,
        audioError: null,
        playbackTime: 0,
        playbackDuration: 0,
        playbackProgress: 0,
      });

      // If Urdu is selected: Play the authentic Kanz-ul-Iman Surah Audio
      if (selectedLanguage === 'urdu') {
        get().playKanzulImanSurah(surahNumber, 0);
        return;
      }

      // Phase 1: Play Arabic Recitation (Selected Qari e.g. Mishary Rashid Alafasy)
      if (startPhase === 'arabic') {
        const reciterObj =
          QURAN_COM_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_COM_RECITERS[0];
        const reciterSlug = reciterObj.reciterSlug || 'Alafasy';
        const arabicUrl = getArabicAyahAudioUrl(surahNumber, ayahNumber, reciterSlug);

        if (!activeHtmlAudio) {
          activeHtmlAudio = new Audio();
        }

        activeHtmlAudio.src = arabicUrl;
        activeHtmlAudio.playbackRate = playbackSpeed || 1.0;
        activeHtmlAudio.volume = audioVolume;

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
          // Transition immediately to Phase 2: English Translation Audio for the same Ayah
          set({ playbackPhase: 'translation', playbackTime: 0, playbackProgress: 0 });
          get().playAyah(surahNumber, ayahNumber, 'translation');
        };

        activeHtmlAudio.onerror = (e) => {
          console.warn('Arabic audio stream error, transitioning to translation:', e);
          set({ playbackPhase: 'translation', playbackTime: 0, playbackProgress: 0 });
          get().playAyah(surahNumber, ayahNumber, 'translation');
        };

        const playPromise = activeHtmlAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Arabic play interrupted:', err);
              set({ playbackPhase: 'translation', playbackTime: 0, playbackProgress: 0 });
              get().playAyah(surahNumber, ayahNumber, 'translation');
            }
          });
        }
        return;
      }

      // English Translation Audio via Verified EveryAyah / Islamic Network CDN Endpoint
      const primaryUrl = getEnglishTranslationAudioUrl(surahNumber, ayahNumber);
      const fallbackUrl = getEnglishTranslationFallbackAudioUrl(surahNumber, ayahNumber);

      playTranslationAudioApi(primaryUrl, fallbackUrl, 'english', surahNumber, ayahNumber, set, get);
    },

    togglePlay: () => {
      const { isPlaying, currentSurahNumber, currentAyahNumber, playbackPhase, selectedLanguage, currentPartIndex } = get();
      if (isPlaying) {
        get().pauseAudio();
      } else {
        if (selectedLanguage === 'urdu') {
          if (activeHtmlAudio && activeHtmlAudio.src && activeHtmlAudio.paused) {
            get().resumeAudio();
          } else {
            get().playKanzulImanSurah(currentSurahNumber || 1, currentPartIndex || 0);
          }
        } else {
          if (playbackPhase === 'idle') {
            get().playAyah(currentSurahNumber || 1, currentAyahNumber || 1, 'arabic');
          } else {
            get().resumeAudio();
          }
        }
      }
    },

    togglePlayAyahCard: (surahNumber, ayahNumber) => {
      const verseKey = `${surahNumber}:${ayahNumber}`;
      const { playingAyahKey, isPlaying, selectedLanguage } = get();

      if (selectedLanguage === 'urdu') {
        get().playKanzulImanSurah(surahNumber, 0);
        return;
      }

      if (playingAyahKey === verseKey) {
        if (isPlaying) {
          get().pauseAudio();
        } else {
          get().resumeAudio();
        }
      } else {
        get().playAyah(surahNumber, ayahNumber, 'arabic');
      }
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
      const { currentSurahNumber, currentAyahNumber, playbackPhase, selectedLanguage, currentPartIndex } = get();
      if (selectedLanguage === 'urdu') {
        get().playKanzulImanSurah(currentSurahNumber || 1, currentPartIndex || 0);
      } else {
        get().playAyah(currentSurahNumber || 1, currentAyahNumber || 1, playbackPhase === 'idle' ? 'arabic' : playbackPhase);
      }
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
      const { currentSurahNumber, currentPartIndex, totalPartsInSurah, selectedLanguage } = get();
      if (selectedLanguage === 'urdu') {
        if (currentPartIndex + 1 < totalPartsInSurah) {
          get().playKanzulImanSurah(currentSurahNumber, currentPartIndex + 1);
        } else if (currentSurahNumber < 114) {
          get().playSurah(currentSurahNumber + 1, 1, 'urdu');
        }
      } else {
        get().nextAyah();
      }
    },

    prevTrack: () => {
      const { currentSurahNumber, currentPartIndex, selectedLanguage } = get();
      if (selectedLanguage === 'urdu') {
        if (currentPartIndex > 0) {
          get().playKanzulImanSurah(currentSurahNumber, currentPartIndex - 1);
        } else if (currentSurahNumber > 1) {
          const prevSurah = currentSurahNumber - 1;
          const prevTracks = getKanzulImanAudioTracks(prevSurah);
          get().playKanzulImanSurah(prevSurah, Math.max(0, prevTracks.length - 1));
        }
      } else {
        get().prevAyah();
      }
    },

    nextAyah: () => {
      const { currentSurahNumber, currentAyahNumber, maxAyahsInSurah, playbackScope, currentJuzNumber, selectedLanguage } = get();
      if (selectedLanguage === 'urdu') {
        get().nextTrack();
        return;
      }

      if (playbackScope === 'juz' && currentJuzNumber) {
        const juzMeta = JUZ_LIST[currentJuzNumber - 1];
        if (juzMeta && juzMeta.endSurah && juzMeta.endAyah) {
          if (currentSurahNumber === juzMeta.endSurah && currentAyahNumber >= juzMeta.endAyah) {
            return; // end of juz
          }
        }
      }

      if (currentAyahNumber < maxAyahsInSurah) {
        get().playAyah(currentSurahNumber, currentAyahNumber + 1, 'arabic');
      } else if (currentSurahNumber < 114) {
        get().playSurah(currentSurahNumber + 1, 1);
      }
    },

    prevAyah: () => {
      const { currentSurahNumber, currentAyahNumber, selectedLanguage } = get();
      if (selectedLanguage === 'urdu') {
        get().prevTrack();
        return;
      }

      if (currentAyahNumber > 1) {
        get().playAyah(currentSurahNumber, currentAyahNumber - 1, 'arabic');
      } else if (currentSurahNumber > 1) {
        const prevSurah = currentSurahNumber - 1;
        const prevMax = SURAH_VERSE_COUNTS[prevSurah - 1] || 7;
        get().playSurah(prevSurah, prevMax);
      }
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

/**
 * Plays translation audio using authentic per-ayah audio endpoints (HTMLAudioElement) for English.
 */
function playTranslationAudioApi(
  primaryUrl: string,
  fallbackUrl: string,
  language: TranslationLanguage,
  surahNumber: number,
  ayahNumber: number,
  set: any,
  get: any
) {
  if (!activeHtmlAudio) {
    activeHtmlAudio = new Audio();
  }

  let triedFallback = false;

  const tryPlay = (url: string) => {
    if (!activeHtmlAudio) return;

    activeHtmlAudio.src = url;
    activeHtmlAudio.playbackRate = get().playbackSpeed || 1.0;
    activeHtmlAudio.volume = get().audioVolume;

    activeHtmlAudio.onplay = () => {
      set({ isPlaying: true, isLoading: false, audioError: null });
      try {
        localStorage.setItem(`kanzul_audio_url_${language}_${surahNumber}_${ayahNumber}`, url);
      } catch {}
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
      handleSequencingNext(set, get);
    };

    activeHtmlAudio.onerror = () => {
      if (!triedFallback && fallbackUrl && fallbackUrl !== url) {
        triedFallback = true;
        tryPlay(fallbackUrl);
      } else {
        set({
          isPlaying: false,
          isLoading: false,
          audioError: `${language === 'urdu' ? 'Kanz-ul-Iman' : 'English'} translation audio is currently unavailable.`,
        });
      }
    };

    const playPromise = activeHtmlAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err.name !== 'AbortError') {
          if (!triedFallback && fallbackUrl && fallbackUrl !== url) {
            triedFallback = true;
            tryPlay(fallbackUrl);
          } else {
            set({
              isPlaying: false,
              isLoading: false,
              audioError: `${language === 'urdu' ? 'Kanz-ul-Iman' : 'English'} translation audio is currently unavailable.`,
            });
          }
        }
      });
    }
  };

  tryPlay(primaryUrl);
}

/**
 * Coordinates automatic advance to the next Arabic Ayah according to Auto-Play & Scope rules
 */
function handleSequencingNext(set: any, get: any) {
  const {
    isAutoPlay,
    playbackScope,
    currentSurahNumber,
    currentJuzNumber,
    currentAyahNumber,
    maxAyahsInSurah,
  } = get();

  set({ isPlaying: false, isLoading: false, playbackProgress: 0 });

  if (!isAutoPlay) {
    set({ playbackPhase: 'idle' });
    return;
  }

  // Handle Juz Mode
  if (playbackScope === 'juz' && currentJuzNumber) {
    const juzMeta = JUZ_LIST[currentJuzNumber - 1];
    const isJuzEnd = juzMeta && juzMeta.endSurah && juzMeta.endAyah
      ? (currentSurahNumber === juzMeta.endSurah && currentAyahNumber >= juzMeta.endAyah)
      : (currentSurahNumber === 114 && currentAyahNumber >= 6);

    if (isJuzEnd) {
      if (currentJuzNumber < 30) {
        setTimeout(() => {
          get().playJuz(currentJuzNumber + 1);
        }, 300);
      } else {
        set({ playbackPhase: 'idle', playingAyahKey: null });
      }
      return;
    }

    if (currentAyahNumber < maxAyahsInSurah) {
      setTimeout(() => {
        get().playAyah(currentSurahNumber, currentAyahNumber + 1, 'arabic');
      }, 250);
      return;
    } else {
      const nextSurah = currentSurahNumber + 1;
      setTimeout(() => {
        get().playAyah(nextSurah, 1, 'arabic');
      }, 300);
      return;
    }
  }

  // Handle Surah Mode
  if (currentAyahNumber < maxAyahsInSurah) {
    setTimeout(() => {
      get().playAyah(currentSurahNumber, currentAyahNumber + 1, 'arabic');
    }, 250);
  } else if (currentSurahNumber < 114) {
    setTimeout(() => {
      get().playSurah(currentSurahNumber + 1, 1);
    }, 400);
  } else {
    set({ playbackPhase: 'idle', playingAyahKey: null });
  }
}
