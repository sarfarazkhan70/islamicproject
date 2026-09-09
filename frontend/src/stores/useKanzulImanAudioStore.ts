/**
 * Kanzul Iman Translation & Recitation Audio Store — Single Source of Truth Engine
 * ==============================================================================
 * Guarantees synchronized Ayah-by-Ayah playback:
 * 1. Arabic Ayah Recitation (Selected Qari e.g. Mishary Rashid Alafasy)
 * 2. Translation Audio (Urdu Kanz-ul-Iman / English) in MALE VOICE ONLY
 * 3. Next Arabic Ayah -> Next Translation Audio ...
 *
 * Strictly adheres to:
 * - Urdu: Authentic Kanz-ul-Iman by Imam Ahmad Raza Khan Ala Hazrat (رحمۃ اللہ علیہ)
 * - English: Verified English Translation (Saheeh International / Shah Farid-ul-Haque)
 * - Zero word substitutions, zero paraphrasing, zero missing or added words.
 * - Male Voice Only (strict keyword blocking of female voices across Web Speech & Streams)
 * ==============================================================================
 */

import { create } from 'zustand';
import { SURAHS_LIST, JUZ_LIST, QURAN_COM_RECITERS } from '../data/quranData';
import { getVerifiedKanzulImanTranslation } from '../data/kanzulImanData';
import { KanzulImanService, KanzulImanAyah } from '../services/kanzulImanService';

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

export function getKanzulImanUrduAudioUrl(surahNumber: number, ayahNumberInSurah: number): string {
  const globalAyahNum = getGlobalAyahNumber(surahNumber, ayahNumberInSurah);
  return `https://cdn.islamic.network/quran/audio/64/ur.khan/${globalAyahNum}.mp3`;
}

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

  // Active Playback State
  playingAyahKey: string | null; // e.g. "1:1"
  playingLanguage: TranslationLanguage | null;
  playbackPhase: PlaybackPhase;
  playbackMode: 'single' | 'full-urdu' | 'full-english' | 'full-both';
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

  // Flow Triggers
  loadSurahData: (surahNumber: number) => Promise<void>;
  loadJuzData: (juzNumber: number) => Promise<void>;
  playSurah: (surahNumber: number, startAyah?: number, lang?: TranslationLanguage) => Promise<void>;
  playJuz: (juzNumber: number, startSurah?: number, startAyah?: number, lang?: TranslationLanguage) => Promise<void>;
  playAyah: (surahNumber: number, ayahNumber: number, startPhase?: PlaybackPhase) => void;
  togglePlay: () => void;
  togglePlayAyahCard: (surahNumber: number, ayahNumber: number) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  seekAudio: (seconds: number) => void;

  // Backward compatibility methods
  playFullSurah: (
    surahNumber: number,
    mode?: 'full-urdu' | 'full-english' | 'full-both',
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

// Female voice keywords to strictly avoid across all OS & browsers
const FEMALE_VOICE_KEYWORDS = [
  'female', 'woman', 'girl', 'zira', 'heera', 'hazel', 'susan', 'linda', 'catherine',
  'sara', 'sarah', 'aria', 'jenny', 'samantha', 'victoria', 'karen', 'moira', 'fiona',
  'tessa', 'veena', 'neerja', 'swara', 'zarvox', 'kavya', 'priya', 'ananya', 'kalpana',
  'gul', 'uzma', 'aisha', 'fatima', 'zehra', 'yasmin', 'shabnam', 'rabia', 'mariam',
  'maryam', 'sana', 'hina', 'nida', 'fariha', 'zohra', 'pooja', 'lekha', 'chitra',
  'meera', 'shruti', 'alva', 'kanya'
];

// Male voice indicators to prioritize
const MALE_VOICE_KEYWORDS = [
  'male', 'man', 'guy', 'david', 'christopher', 'mark', 'george', 'richard', 'james',
  'brian', 'ryan', 'asad', 'salman', 'tariq', 'hamza', 'bilal', 'usman', 'hemant',
  'madhav', 'ravi', 'shakir', 'hamed', 'naayf', 'natural (male)', 'male (natural)'
];

function isFemaleVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  return FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
}

function isMaleVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  return MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw)) && !isFemaleVoice(voice);
}

// Audio Element & Speech Synthesis Controllers
let activeHtmlAudio: HTMLAudioElement | null = null;
let currentAudioChunks: string[] = [];
let currentAudioChunkIndex = 0;

let activeSpeechUtterance: SpeechSynthesisUtterance | null = null;
let speechHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (cachedVoices.length > 0) {
      voicesLoaded = true;
    }
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Builds direct high-quality audio stream URL for exact text translation
 */
export function buildTTSStreamUrl(text: string, language: TranslationLanguage): string {
  const langCode = language === 'urdu' ? 'ur' : 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(text)}`;
}

/**
 * Chunks long text at natural sentence and clause boundaries
 */
export function chunkTextForTTS(text: string, maxLen: number = 180): string[] {
  if (!text) return [];
  if (text.length <= maxLen) return [text.trim()];

  const chunks: string[] = [];
  let current = '';
  const parts = text.split(/([،,۔.؛;!?\n]+)/);

  for (const part of parts) {
    if ((current + part).length > maxLen && current.trim()) {
      chunks.push(current.trim());
      current = part;
    } else {
      current += part;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Completely stops all audio (both HTML5 Audio and Web Speech synthesis)
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
  currentAudioChunks = [];
  currentAudioChunkIndex = 0;

  if (speechHeartbeatTimer) {
    clearInterval(speechHeartbeatTimer);
    speechHeartbeatTimer = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {}
  }
  if (activeSpeechUtterance) {
    activeSpeechUtterance.onstart = null;
    activeSpeechUtterance.onend = null;
    activeSpeechUtterance.onerror = null;
  }
  activeSpeechUtterance = null;
  if (typeof window !== 'undefined') {
    (window as any).__activeUtterance = null;
  }
}

/**
 * Returns a high-quality respectful MALE voice for the selected language.
 * Strictly avoids returning any female voice.
 */
function getBestMaleVoiceForLanguage(language: TranslationLanguage): SpeechSynthesisVoice | null {
  if (!voicesLoaded) {
    loadVoices();
  }
  if (!cachedVoices || cachedVoices.length === 0) return null;

  if (language === 'urdu') {
    const maleUrduVoice = cachedVoices.find(
      (v) => v.lang.toLowerCase().startsWith('ur') && isMaleVoice(v)
    );
    if (maleUrduVoice) return maleUrduVoice;

    const nonFemaleUrdu = cachedVoices.find(
      (v) => v.lang.toLowerCase().startsWith('ur') && !isFemaleVoice(v)
    );
    if (nonFemaleUrdu) return nonFemaleUrdu;

    const maleHindiVoice = cachedVoices.find(
      (v) => v.lang.toLowerCase().startsWith('hi') && isMaleVoice(v)
    );
    if (maleHindiVoice) return maleHindiVoice;

    const nonFemaleHindi = cachedVoices.find(
      (v) => v.lang.toLowerCase().startsWith('hi') && !isFemaleVoice(v)
    );
    if (nonFemaleHindi) return nonFemaleHindi;

    return null;
  } else {
    const maleEnglishVoice = cachedVoices.find(
      (v) => v.lang.toLowerCase().startsWith('en') && isMaleVoice(v)
    );
    if (maleEnglishVoice) return maleEnglishVoice;

    const nonFemaleEnglish = cachedVoices.find(
      (v) => v.lang.toLowerCase().startsWith('en') && !isFemaleVoice(v)
    );
    if (nonFemaleEnglish) return nonFemaleEnglish;

    return null;
  }
}

/**
 * Prepares displayed translation text for natural, dignified speech synthesis
 */
export function preprocessTextForNaturalSpeech(rawText: string, language: TranslationLanguage): string {
  if (!rawText) return '';
  let text = rawText.trim();

  if (language === 'english') {
    text = text.replace(/\[\s*([^\]]+?)\s*\]/g, '$1');
    text = text.replace(/[""“”]/g, '');
    text = text.replace(/\s*[-—–]\s*$/g, '.');
    text = text.replace(/\s+[-—–]\s+/g, ', ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  } else {
    text = text.replace(/[\[\]]/g, '');
    text = text.replace(/\s*[-—–]\s*$/g, '۔');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
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
  return {
    playbackScope: 'surah',
    currentSurahNumber: 1,
    currentJuzNumber: null,
    currentAyahNumber: 1,
    maxAyahsInSurah: 7,
    currentAyahs: [],
    isLoadingAyahs: false,

    playingAyahKey: null,
    playingLanguage: getStoredLanguage(),
    playbackPhase: 'idle',
    playbackMode: 'single',
    selectedLanguage: getStoredLanguage(),
    selectedReciterId: 7, // Mishary Rashid Alafasy
    isPlaying: false,
    isLoading: false,
    isAutoPlay: getStoredAutoPlay(),
    playbackSpeed: 1.0,
    audioVolume: 0.9,
    playbackTime: 0,
    playbackDuration: 0,
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
      set({ selectedLanguage: lang });
      // If currently playing translation, seamlessly restart with new language
      const { isPlaying, playbackPhase, currentSurahNumber, currentAyahNumber } = get();
      if (isPlaying && playbackPhase === 'translation') {
        get().playAyah(currentSurahNumber, currentAyahNumber, 'translation');
      }
    },

    setSelectedReciterId: (reciterId) => {
      set({ selectedReciterId: reciterId });
      const { isPlaying, playbackPhase, currentSurahNumber, currentAyahNumber } = get();
      if (isPlaying && playbackPhase === 'arabic') {
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

    loadSurahData: async (surahNumber) => {
      const validNum = Math.max(1, Math.min(114, surahNumber));
      set({ isLoadingAyahs: true, currentSurahNumber: validNum });
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
        set({
          currentAyahs: ayahs,
          currentSurahNumber: firstSurah,
          isLoadingAyahs: false,
        });
      } catch (err) {
        console.error(`Failed to load Kanzul Iman Juz ${validNum}:`, err);
        set({ isLoadingAyahs: false });
      }
    },

    playSurah: async (surahNumber, startAyah = 1, lang) => {
      const targetLang = lang || get().selectedLanguage;
      set({
        playbackScope: 'surah',
        currentSurahNumber: surahNumber,
        currentAyahNumber: startAyah,
        selectedLanguage: targetLang,
      });

      if (get().currentAyahs.length === 0 || get().currentSurahNumber !== surahNumber) {
        await get().loadSurahData(surahNumber);
      }

      get().playAyah(surahNumber, startAyah, 'arabic');
    },

    playJuz: async (juzNumber, startSurah, startAyah, lang) => {
      const targetLang = lang || get().selectedLanguage;
      const juzMeta = JUZ_LIST[juzNumber - 1] || JUZ_LIST[0];
      const sNum = startSurah || juzMeta.startSurah;
      const aNum = startAyah || juzMeta.startAyah;

      set({
        playbackScope: 'juz',
        currentJuzNumber: juzNumber,
        currentSurahNumber: sNum,
        currentAyahNumber: aNum,
        selectedLanguage: targetLang,
      });

      await get().loadJuzData(juzNumber);
      get().playAyah(sNum, aNum, 'arabic');
    },

    playAyah: (surahNumber, ayahNumber, startPhase = 'arabic') => {
      stopAnyAudio();

      const surahMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
      const totalAyahs = surahMeta?.versesCount || SURAH_VERSE_COUNTS[surahNumber - 1] || 7;
      const verseKey = `${surahNumber}:${ayahNumber}`;

      set({
        playingAyahKey: verseKey,
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

      // Phase 1: Play Arabic Recitation
      if (startPhase === 'arabic') {
        const { selectedReciterId, playbackSpeed, audioVolume } = get();
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
          // Transition to Phase 2: Translation Audio for this same Ayah
          set({ playbackPhase: 'translation', playbackTime: 0, playbackProgress: 0 });
          get().playAyah(surahNumber, ayahNumber, 'translation');
        };

        activeHtmlAudio.onerror = (e) => {
          console.warn('Arabic audio stream error, falling back to translation:', e);
          set({ playbackPhase: 'translation' });
          get().playAyah(surahNumber, ayahNumber, 'translation');
        };

        const playPromise = activeHtmlAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Arabic play rejected:', err);
            set({ playbackPhase: 'translation' });
            get().playAyah(surahNumber, ayahNumber, 'translation');
          });
        }
        return;
      }

      // Phase 2: Play Translation Audio (Urdu / English) strictly from exact on-screen displayed text
      const { selectedLanguage, currentAyahs } = get();
      const rawDisplayedText = getDisplayedAyahText(surahNumber, ayahNumber, selectedLanguage, currentAyahs);
      const textToSpeak = preprocessTextForNaturalSpeech(rawDisplayedText, selectedLanguage);

      if (!textToSpeak) {
        handleSequencingNext(set, get);
        return;
      }

      // Both Urdu (Kanzul Iman) and English translations are spoken using natural speech synthesis
      // generated directly from the displayed translation string (guarantees 100% exact text-to-audio match)
      playTranslationViaTTS(textToSpeak, selectedLanguage, set, get);
    },

    togglePlay: () => {
      const { isPlaying, currentSurahNumber, currentAyahNumber, playbackPhase } = get();
      if (isPlaying) {
        get().pauseAudio();
      } else {
        if (playbackPhase === 'idle') {
          get().playAyah(currentSurahNumber || 1, currentAyahNumber || 1, 'arabic');
        } else {
          get().resumeAudio();
        }
      }
    },

    togglePlayAyahCard: (surahNumber, ayahNumber) => {
      const verseKey = `${surahNumber}:${ayahNumber}`;
      const { playingAyahKey, isPlaying } = get();

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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        set({ isPlaying: true });
        return;
      }
      const { currentSurahNumber, currentAyahNumber, playbackPhase } = get();
      get().playAyah(currentSurahNumber || 1, currentAyahNumber || 1, playbackPhase === 'idle' ? 'arabic' : playbackPhase);
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

    nextAyah: () => {
      const { currentSurahNumber, currentAyahNumber, maxAyahsInSurah, playbackScope, currentJuzNumber } = get();
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
      const { currentSurahNumber, currentAyahNumber } = get();
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
        set({ playbackTime: target });
      }
    },
  };
});

/**
 * Plays translation text using Google TTS stream chunks with Web Speech API male fallback
 */
function playTranslationViaTTS(textToSpeak: string, language: TranslationLanguage, set: any, get: any) {
  currentAudioChunks = chunkTextForTTS(textToSpeak, 180);
  currentAudioChunkIndex = 0;

  const playNextChunk = () => {
    if (currentAudioChunkIndex >= currentAudioChunks.length) {
      handleSequencingNext(set, get);
      return;
    }

    const chunkText = currentAudioChunks[currentAudioChunkIndex];
    const streamUrl = buildTTSStreamUrl(chunkText, language);

    if (!activeHtmlAudio) {
      activeHtmlAudio = new Audio();
    }

    activeHtmlAudio.src = streamUrl;
    activeHtmlAudio.playbackRate = get().playbackSpeed || 1.0;
    activeHtmlAudio.volume = get().audioVolume;

    activeHtmlAudio.onplay = () => {
      set({ isPlaying: true, isLoading: false, audioError: null });
    };

    activeHtmlAudio.ontimeupdate = () => {
      if (activeHtmlAudio && activeHtmlAudio.duration) {
        const chunkProgress = activeHtmlAudio.currentTime / activeHtmlAudio.duration;
        const overall = (currentAudioChunkIndex + chunkProgress) / Math.max(1, currentAudioChunks.length);
        set({
          playbackTime: activeHtmlAudio.currentTime,
          playbackDuration: activeHtmlAudio.duration * currentAudioChunks.length,
          playbackProgress: Math.min(1, Math.max(0, overall)),
        });
      }
    };

    activeHtmlAudio.onended = () => {
      currentAudioChunkIndex++;
      playNextChunk();
    };

    activeHtmlAudio.onerror = () => {
      playViaWebSpeechMaleVoice(textToSpeak, language, set, get);
    };

    const playPromise = activeHtmlAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        playViaWebSpeechMaleVoice(textToSpeak, language, set, get);
      });
    }
  };

  playNextChunk();
}

/**
 * Web Speech API fallback strictly utilizing confirmed MALE voice
 */
function playViaWebSpeechMaleVoice(textToSpeak: string, language: TranslationLanguage, set: any, get: any) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    handleSequencingNext(set, get);
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'urdu' ? 'ur-PK' : 'en-US';
    utterance.rate = language === 'urdu' ? 0.96 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = get().audioVolume;

    const maleVoice = getBestMaleVoiceForLanguage(language);
    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    utterance.onstart = () => {
      set({ isPlaying: true, isLoading: false, audioError: null });
    };

    utterance.onend = () => {
      if (speechHeartbeatTimer) {
        clearInterval(speechHeartbeatTimer);
        speechHeartbeatTimer = null;
      }
      activeSpeechUtterance = null;
      handleSequencingNext(set, get);
    };

    utterance.onerror = () => {
      if (speechHeartbeatTimer) {
        clearInterval(speechHeartbeatTimer);
        speechHeartbeatTimer = null;
      }
      activeSpeechUtterance = null;
      handleSequencingNext(set, get);
    };

    activeSpeechUtterance = utterance;
    if (typeof window !== 'undefined') {
      (window as any).__activeUtterance = utterance;
    }

    speechHeartbeatTimer = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 10000);

    window.speechSynthesis.speak(utterance);
  } catch {
    handleSequencingNext(set, get);
  }
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
        }, 500);
      } else {
        set({ playbackPhase: 'idle', playingAyahKey: null });
      }
      return;
    }

    if (currentAyahNumber < maxAyahsInSurah) {
      setTimeout(() => {
        get().playAyah(currentSurahNumber, currentAyahNumber + 1, 'arabic');
      }, 400);
      return;
    } else {
      // Advance to next Surah in this Juz
      const nextSurah = currentSurahNumber + 1;
      setTimeout(() => {
        get().playAyah(nextSurah, 1, 'arabic');
      }, 500);
      return;
    }
  }

  // Handle Surah Mode
  if (currentAyahNumber < maxAyahsInSurah) {
    setTimeout(() => {
      get().playAyah(currentSurahNumber, currentAyahNumber + 1, 'arabic');
    }, 400);
  } else if (currentSurahNumber < 114) {
    setTimeout(() => {
      get().playSurah(currentSurahNumber + 1, 1);
    }, 600);
  } else {
    set({ playbackPhase: 'idle', playingAyahKey: null });
  }
}
