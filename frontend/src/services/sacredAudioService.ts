export interface SacredAudioItem {
  id: 'allah-taala' | 'huzur-muhammad';
  name: string;
  arabicName: string;
  urduMeaning: string;
  englishMeaning: string;
  audioUrl: string;
  audioFallbackUrl?: string;
  honorific?: string;
  estimatedDuration?: number;
}

export const SACRED_AUDIO_ITEMS: SacredAudioItem[] = [
  {
    id: 'allah-taala',
    name: "Allah Ta'ala",
    arabicName: 'الله جل جلاله',
    urduMeaning: "Allah Ta'ala sab se buland aur azeem hai.",
    englishMeaning: 'Allah, Glorious and Exalted is He.',
    audioUrl: '/audio/allah/allah_taala.wav',
    audioFallbackUrl: '/audio/allah/allah_taala.mp3',
    estimatedDuration: 14,
  },
  {
    id: 'huzur-muhammad',
    name: 'Huzur Muhammad ﷺ',
    arabicName: 'محمد رسول الله صلى الله عليه وسلم',
    urduMeaning: 'Huzur Muhammad Mustafa Sallallahu Alaihi Wasallam Allah ke aakhri Nabi aur Rasool hain.',
    englishMeaning: 'Muhammad, peace and blessings be upon him, is the final Prophet and Messenger of Allah.',
    audioUrl: '/audio/prophet/huzur_muhammad.wav',
    audioFallbackUrl: '/audio/prophet/huzur_muhammad.mp3',
    estimatedDuration: 30,
  },
];

type AudioStateListener = (state: SacredAudioPlaybackState) => void;

export interface SacredAudioPlaybackState {
  currentId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

class SacredAudioService {
  private audioElement: HTMLAudioElement | null = null;
  private currentItem: SacredAudioItem | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  private isSynthesizing = false;

  private state: SacredAudioPlaybackState = {
    currentId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
    error: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'metadata';
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audioElement) return;

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.updateState({
          currentTime: this.audioElement.currentTime,
          duration: this.audioElement.duration || this.state.duration,
        });
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement) {
        this.updateState({
          duration: this.audioElement.duration || 0,
          isLoading: false,
        });
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.updateState({
        isPlaying: false,
        currentTime: 0,
      });
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
      }
    });

    this.audioElement.addEventListener('play', () => {
      this.updateState({ isPlaying: true, isLoading: false, error: null });
    });

    this.audioElement.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('[SacredAudioService] HTMLAudio error, trying speech synthesis fallback:', e);
      if (this.currentItem) {
        this.playSpeechSynthesisFallback(this.currentItem);
      } else {
        this.updateState({
          isPlaying: false,
          isLoading: false,
          error: 'Audio playback failed. Please try again.',
        });
      }
    });
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<SacredAudioPlaybackState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[SacredAudioService] Listener notification error:', err);
      }
    }
  }

  public getState(): SacredAudioPlaybackState {
    return this.state;
  }

  /**
   * STRICT MALE VOICE SELECTION
   * Strictly forbids any female voices and selects clear natural male voice.
   */
  private selectStrictMaleVoice(langPrefix?: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const isExplicitMale = (name: string): boolean => {
      const lower = name.toLowerCase();
      return (
        lower.includes('male') ||
        lower.includes('david') ||
        lower.includes('mark') ||
        lower.includes('george') ||
        lower.includes('guy') ||
        lower.includes('andrew') ||
        lower.includes('ryan') ||
        lower.includes('asad') ||
        lower.includes('hamed') ||
        lower.includes('tariq') ||
        lower.includes('tarik') ||
        lower.includes('maged') ||
        lower.includes('naayf') ||
        lower.includes('shakir') ||
        lower.includes('salman') ||
        lower.includes('james') ||
        lower.includes('john') ||
        lower.includes('richard') ||
        lower.includes('paul')
      );
    };

    const isBlacklistedFemale = (name: string): boolean => {
      const lower = name.toLowerCase();
      return (
        lower.includes('female') ||
        lower.includes('zira') ||
        lower.includes('susan') ||
        lower.includes('hazel') ||
        lower.includes('leila') ||
        lower.includes('fatima') ||
        lower.includes('zeina') ||
        lower.includes('laila') ||
        lower.includes('salma') ||
        lower.includes('amira') ||
        lower.includes('jenny') ||
        lower.includes('aria') ||
        lower.includes('sara') ||
        lower.includes('catherine') ||
        lower.includes('heera') ||
        lower.includes('swara') ||
        lower.includes('priya') ||
        lower.includes('neerja') ||
        lower.includes('kalpana')
      );
    };

    // 1. If language filter requested
    if (langPrefix) {
      const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
      const explicitMale = langVoices.find((v) => isExplicitMale(v.name));
      if (explicitMale) return explicitMale;
      const nonFemale = langVoices.find((v) => !isBlacklistedFemale(v.name));
      if (nonFemale) return nonFemale;
    }

    // 2. Global search for explicit male voice
    const globalMale = voices.find((v) => isExplicitMale(v.name));
    if (globalMale) return globalMale;

    // 3. Fallback to any voice that is strictly NOT female
    const safeVoice = voices.find((v) => !isBlacklistedFemale(v.name));
    return safeVoice || null;
  }

  private stopSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.isSynthesizing = false;
  }

  public playSpeechSynthesisFallback(item: SacredAudioItem) {
    this.stopSpeechSynthesis();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: 'Speech synthesis is unsupported in this browser.',
      });
      return;
    }

    this.isSynthesizing = true;
    this.updateState({
      currentId: item.id,
      isPlaying: true,
      isLoading: false,
      error: null,
      currentTime: 0,
      duration: 12,
    });

    const isProphet = item.id === 'huzur-muhammad';

    // Sequence of phrases:
    // 1. Arabic Name with respectful phrase
    // 2. Urdu Title & Honorific
    // 3. Urdu Meaning
    // 4. English Title & Honorific
    // 5. English Meaning
    const phrases = isProphet
      ? [
          'Muhammadur Rasoolullah Sallallahu Alaihi Wasallam.',
          'Muhammadur Rasoolullah Sallallahu Alaihi Wasallam. Huzur Muhammad Mustafa Sallallahu Alaihi Wasallam.',
          'Huzur Muhammad Mustafa Sallallahu Alaihi Wasallam Allah ke aakhri Nabi aur Rasool hain.',
          'Muhammad, the Messenger of Allah, peace and blessings be upon him.',
          'Muhammad, peace and blessings be upon him, is the final Prophet and Messenger of Allah.',
        ]
      : [
          'Allah Jalla Jalaluhu.',
          'Allah Jalla Jalaluhu. Allah Ta\'ala.',
          'Allah Ta\'ala sab se buland aur azeem hai.',
          'Allah, Jalla Jalaluhu. Allah Ta\'ala.',
          'Allah, Glorious and Exalted is He.',
        ];
    let phraseIndex = 0;

    const speakNext = () => {
      if (!this.isSynthesizing || phraseIndex >= phrases.length) {
        this.updateState({ isPlaying: false, currentTime: 0 });
        this.isSynthesizing = false;
        return;
      }

      const text = phrases[phraseIndex];
      phraseIndex++;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Reverent, deliberate tempo
      utterance.pitch = 0.95; // Natural deeper male pitch

      const maleVoice = this.selectStrictMaleVoice();
      if (maleVoice) {
        utterance.voice = maleVoice;
      }

      utterance.onend = () => {
        if (this.isSynthesizing) {
          this.updateState({
            currentTime: (phraseIndex / phrases.length) * this.state.duration,
          });
          setTimeout(speakNext, 400); // Respectful pause between sections
        }
      };

      utterance.onerror = () => {
        if (this.isSynthesizing) {
          setTimeout(speakNext, 200);
        }
      };

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch {
        this.isSynthesizing = false;
        this.updateState({ isPlaying: false });
      }
    };

    speakNext();
  }

  public async play(item: SacredAudioItem) {
    // If already playing this item, toggle to pause
    if (this.state.currentId === item.id && this.state.isPlaying) {
      this.pause();
      return;
    }

    // If resuming the paused item
    if (this.state.currentId === item.id && !this.state.isPlaying && this.audioElement && this.audioElement.src) {
      try {
        await this.audioElement.play();
        return;
      } catch {
        this.playSpeechSynthesisFallback(item);
        return;
      }
    }

    // Stop current synthesis & audio
    this.stopSpeechSynthesis();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }

    this.currentItem = item;
    this.updateState({
      currentId: item.id,
      isPlaying: true,
      isLoading: true,
      error: null,
      currentTime: 0,
    });

    if (this.audioElement) {
      this.audioElement.src = item.audioUrl;
      this.audioElement.volume = this.state.isMuted ? 0 : this.state.volume;
      this.audioElement.load();

      try {
        await this.audioElement.play();
      } catch (playErr) {
        if (item.audioFallbackUrl) {
          try {
            this.audioElement.src = item.audioFallbackUrl;
            this.audioElement.load();
            await this.audioElement.play();
            return;
          } catch {}
        }
        console.warn('[SacredAudioService] Audio failed to play, switching to fallback:', playErr);
        this.playSpeechSynthesisFallback(item);
      }
    } else {
      this.playSpeechSynthesisFallback(item);
    }
  }

  public pause() {
    this.stopSpeechSynthesis();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.updateState({ isPlaying: false });
  }

  public replay(item?: SacredAudioItem) {
    const targetItem = item || this.currentItem;
    if (!targetItem) return;

    this.stopSpeechSynthesis();
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
    }
    this.updateState({ currentTime: 0 });
    this.play(targetItem);
  }

  public seek(seconds: number) {
    if (this.audioElement && !isNaN(seconds)) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || seconds));
      this.updateState({ currentTime: this.audioElement.currentTime });
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.updateState({ volume: clamped, isMuted: clamped === 0 });
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
  }

  public toggleMute() {
    const newMuted = !this.state.isMuted;
    this.updateState({ isMuted: newMuted });
    if (this.audioElement) {
      this.audioElement.volume = newMuted ? 0 : this.state.volume;
    }
  }

  public stop() {
    this.stopSpeechSynthesis();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.currentItem = null;
    this.updateState({
      currentId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      error: null,
    });
  }
}

export const sacredAudioService = new SacredAudioService();
