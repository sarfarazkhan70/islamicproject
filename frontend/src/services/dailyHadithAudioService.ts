/**
 * Daily Hadith Multilingual Male Voice Speech Service
 *
 * Utilizes the Web Speech API to sequentially and reliably read:
 * 1. Arabic Hadith text (natural Arabic male pronunciation)
 * 2. Urdu translation by Ala Hazrat Imam Ahmad Raza Khan (clear Urdu male pronunciation)
 * 3. English translation (natural English male pronunciation)
 *
 * Enforces strict male voice selection, clean phonetic text formatting,
 * respectful pauses between languages, and cross-browser resilience.
 */

import { DailyHadith } from '../data/dailyHadithData';

export type HadithAudioSegment = 'arabic' | 'urdu' | 'english';

export interface HadithSpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  activeSegment: HadithAudioSegment | null;
  supported: boolean;
}

type StateListener = (state: HadithSpeechState) => void;

class DailyHadithAudioService {
  private isPlaying = false;
  private isPaused = false;
  private activeSegment: HadithAudioSegment | null = null;
  private listeners: Set<StateListener> = new Set();
  private currentHadith: DailyHadith | null = null;
  private isSequentialMode = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.refreshVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.refreshVoices();
        };
      }
    }
  }

  private refreshVoices(): void {
    if (this.isSupported()) {
      try {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          this.cachedVoices = list;
        }
      } catch {
        // Ignore voice discovery error
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public getState(): HadithSpeechState {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      activeSegment: this.activeSegment,
      supported: this.isSupported(),
    };
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  /**
   * Filters and selects a high-quality natural male voice strictly matching the language.
   * Never returns an incompatible cross-language voice (e.g. never returns English for Arabic/Urdu).
   */
  public selectMaleVoice(langCode: string): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;

    let voices = this.cachedVoices;
    if (!voices || voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.cachedVoices = voices;
      }
    }

    if (!voices || voices.length === 0) return null;

    const isFemaleName = (name: string): boolean => {
      const lower = name.toLowerCase();
      return (
        lower.includes('female') ||
        lower.includes('zira') ||
        lower.includes('susan') ||
        lower.includes('hazel') ||
        lower.includes('samantha') ||
        lower.includes('victoria') ||
        lower.includes('karen') ||
        lower.includes('catherine') ||
        lower.includes('helena') ||
        lower.includes('heera') ||
        lower.includes('kalpana') ||
        lower.includes('veena') ||
        lower.includes('swara') ||
        lower.includes('sangeeta') ||
        lower.includes('zari') ||
        lower.includes('leila') ||
        lower.includes('fatima') ||
        lower.includes('mary') ||
        lower.includes('linda') ||
        lower.includes('jenny') ||
        lower.includes('monica') ||
        lower.includes('siri') ||
        lower.includes('joanna') ||
        lower.includes('ivy') ||
        lower.includes('kendra') ||
        lower.includes('kimberly') ||
        lower.includes('ayesha') ||
        lower.includes('farah') ||
        lower.includes('yasmin') ||
        lower.includes('salma') ||
        lower.includes('amira') ||
        lower.includes('zeina') ||
        lower.includes('laila')
      );
    };

    const isExplicitMale = (name: string): boolean => {
      const lower = name.toLowerCase();
      return (
        lower.includes('male') ||
        lower.includes('david') ||
        lower.includes('george') ||
        lower.includes('guy') ||
        lower.includes('ryan') ||
        lower.includes('mark') ||
        lower.includes('richard') ||
        lower.includes('maged') ||
        lower.includes('tarik') ||
        lower.includes('naayf') ||
        lower.includes('shakir') ||
        lower.includes('hamed') ||
        lower.includes('tariq') ||
        lower.includes('asad') ||
        lower.includes('salman') ||
        lower.includes('hemant') ||
        lower.includes('pradeep') ||
        lower.includes('ravi') ||
        lower.includes('madhav') ||
        lower.includes('brian') ||
        lower.includes('russell') ||
        lower.includes('justin') ||
        lower.includes('matthew') ||
        lower.includes('james') ||
        lower.includes('daniel') ||
        lower.includes('oliver') ||
        lower.includes('andrew')
      );
    };

    // Filter by language prefix
    const prefix = langCode.toLowerCase().slice(0, 2);
    const matchingLangVoices = voices.filter((v) => {
      const vLang = v.lang.toLowerCase();
      if (prefix === 'ar') return vLang.startsWith('ar');
      if (prefix === 'ur') return vLang.startsWith('ur') || vLang.startsWith('hi');
      if (prefix === 'en') return vLang.startsWith('en');
      return vLang.startsWith(prefix);
    });

    if (matchingLangVoices.length > 0) {
      // 1. First choice: explicitly verified male voice for this language
      const maleVoice = matchingLangVoices.find((v) => isExplicitMale(v.name));
      if (maleVoice) return maleVoice;

      // 2. Second choice: non-female voice matching this language
      const nonFemaleVoice = matchingLangVoices.find((v) => !isFemaleName(v.name));
      if (nonFemaleVoice) return nonFemaleVoice;

      // 3. Any matching voice for this specific language
      return matchingLangVoices[0];
    }

    // Crucial: If no voice matching this specific language is found,
    // return null so the browser's native multilingual engine uses the correct language tag
    // rather than incorrectly forcing an English voice onto Arabic/Urdu!
    return null;
  }

  /**
   * Prepares clean, natural text for speech synthesis without symbol noise.
   */
  public prepareSpeechText(text: string, segment: HadithAudioSegment): string {
    if (!text) return '';

    let clean = text;

    if (segment === 'arabic') {
      // Remove citation brackets, quotation marks and non-spoken punctuation
      clean = clean
        .replace(/[«»“”‘’"'\`„‟]/g, '')
        .replace(/—/g, '، ')
        .replace(/ﷺ/g, 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (segment === 'urdu') {
      // Clean quotes and format Urdu pauses
      clean = clean
        .replace(/[«»“”‘’"'\`„‟]/g, '')
        .replace(/ﷺ/g, 'صلی اللہ علیہ وسلم')
        .replace(/—/g, '۔ ')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (segment === 'english') {
      // Clean English quotations and symbols
      clean = clean
        .replace(/[«»“”‘’"'\`„‟]/g, '')
        .replace(/ﷺ|\(ﷺ\)/g, 'peace and blessings be upon him')
        .replace(/\(RA\)|\(رضي الله عنه\)/g, 'may Allah be pleased with him')
        .replace(/—/g, ', ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return clean;
  }

  /**
   * Starts sequential recitation: Arabic Hadith -> Ala Hazrat Urdu translation -> English translation
   */
  public playFullHadith(hadith: DailyHadith): void {
    if (!this.isSupported()) return;

    this.stop();
    this.currentHadith = hadith;
    this.isSequentialMode = true;
    this.isPlaying = true;
    this.isPaused = false;
    this.playSegment('arabic');
  }

  /**
   * Plays a single segment ('arabic' | 'urdu' | 'english')
   */
  public playSingleSegment(hadith: DailyHadith, segment: HadithAudioSegment): void {
    if (!this.isSupported()) return;

    this.stop();
    this.currentHadith = hadith;
    this.isSequentialMode = false;
    this.isPlaying = true;
    this.isPaused = false;
    this.playSegment(segment);
  }

  private playSegment(segment: HadithAudioSegment): void {
    if (!this.isSupported() || !this.currentHadith) {
      this.stop();
      return;
    }

    this.activeSegment = segment;
    this.notify();

    let rawText = '';
    let lang = 'en-US';

    if (segment === 'arabic') {
      rawText = this.currentHadith.arabicText;
      lang = 'ar-SA';
    } else if (segment === 'urdu') {
      rawText = this.currentHadith.urduTranslation;
      lang = 'ur-PK';
    } else if (segment === 'english') {
      rawText = this.currentHadith.englishTranslation;
      lang = 'en-US';
    }

    const spokenText = this.prepareSpeechText(rawText, segment);
    if (!spokenText) {
      this.handleSegmentEnd(segment);
      return;
    }

    // Cancel previous speech to reset Chromium audio pipeline
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel error
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = lang;

    // Natural pitch (1.0) and comfortable respectful pacing
    utterance.pitch = 1.0;

    if (segment === 'arabic') {
      utterance.rate = 0.88;
    } else if (segment === 'urdu') {
      utterance.rate = 0.90;
    } else {
      utterance.rate = 0.92;
    }

    // Assign specific male voice if available for this language
    const voice = this.selectMaleVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    let hasEnded = false;

    utterance.onend = () => {
      if (hasEnded) return;
      hasEnded = true;
      this.handleSegmentEnd(segment);
    };

    utterance.onerror = (e) => {
      if (hasEnded) return;
      hasEnded = true;
      console.warn(`Speech synthesis notice for ${segment}:`, e);
      // In sequential mode, smoothly continue to the next translation rather than halting
      this.handleSegmentEnd(segment);
    };

    this.currentUtterance = utterance;

    try {
      // Resume if browser TTS is paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech synthesis:', err);
      this.handleSegmentEnd(segment);
    }
  }

  private handleSegmentEnd(segment: HadithAudioSegment): void {
    if (!this.isPlaying) return;

    if (this.isSequentialMode) {
      if (segment === 'arabic') {
        // Respectful 600ms pause between Arabic and Urdu translation
        setTimeout(() => {
          if (this.isPlaying) this.playSegment('urdu');
        }, 600);
      } else if (segment === 'urdu') {
        // Respectful 600ms pause between Urdu and English translation
        setTimeout(() => {
          if (this.isPlaying) this.playSegment('english');
        }, 600);
      } else {
        // All 3 segments finished
        this.isPlaying = false;
        this.isPaused = false;
        this.activeSegment = null;
        this.currentUtterance = null;
        this.notify();
      }
    } else {
      // Single segment finished
      this.isPlaying = false;
      this.isPaused = false;
      this.activeSegment = null;
      this.currentUtterance = null;
      this.notify();
    }
  }

  public pause(): void {
    if (!this.isSupported() || !this.isPlaying) return;
    try {
      window.speechSynthesis.pause();
    } catch {
      // Ignore pause error
    }
    this.isPaused = true;
    this.notify();
  }

  public resume(): void {
    if (!this.isSupported() || !this.isPaused) return;
    try {
      window.speechSynthesis.resume();
    } catch {
      // Ignore resume error
    }
    this.isPaused = false;
    this.notify();
  }

  public stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel error
      }
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.activeSegment = null;
    this.currentUtterance = null;
    this.notify();
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }
}

export const hadithAudioService = new DailyHadithAudioService();
