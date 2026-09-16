import { create } from 'zustand';
import { IslamicNameItem } from '../data/islamic/types.js';

interface NamesState {
  currentCategory: 'allah' | 'prophet' | null;
  currentPlayingId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  audioError: string | null;
  favorites: string[];

  // Auto-play state
  isAutoPlaying: boolean;
  autoPlayIndex: number | null;
  autoPlayList: IslamicNameItem[];
  autoPlayCategory: 'allah' | 'prophet' | null;
  autoPlayStatus: string | null;

  // Actions
  playName: (item: IslamicNameItem) => void;
  playAll: (items: IslamicNameItem[], startIndex?: number) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FAV_KEY = 'islamic_prayer_fav_names';

const getInitialFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Dedicated Audio instances with lazy setup
let allahAudio: HTMLAudioElement | null = null;
let prophetAudio: HTMLAudioElement | null = null;

let currentTargetEnd: number | null = null;
let timeUpdateHandler: (() => void) | null = null;
let endedHandler: (() => void) | null = null;
let errorHandler: ((e: Event) => void) | null = null;

const selectArabicMaleVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const isExplicitMale = (name: string): boolean => {
    const lower = name.toLowerCase();
    return (
      lower.includes('male') ||
      lower.includes('maged') ||
      lower.includes('tarik') ||
      lower.includes('naayf') ||
      lower.includes('shakir') ||
      lower.includes('hamed') ||
      lower.includes('tariq') ||
      lower.includes('asad') ||
      lower.includes('salman') ||
      lower.includes('david') ||
      lower.includes('george')
    );
  };

  const isFemaleName = (name: string): boolean => {
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
      lower.includes('amira')
    );
  };

  const arVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ar'));
  if (arVoices.length > 0) {
    const male = arVoices.find((v) => isExplicitMale(v.name));
    if (male) return male;
    const nonFemale = arVoices.find((v) => !isFemaleName(v.name));
    if (nonFemale) return nonFemale;
    return arVoices[0];
  }
  return null;
};

const getCategoryAudio = (category: 'allah' | 'prophet', url?: string): HTMLAudioElement => {
  const defaultUrl = category === 'allah' ? '/audio/allah/allah-01.mp3' : '/audio/prophet/prophet-01.mp3';
  const targetUrl = url || defaultUrl;

  if (category === 'allah') {
    if (!allahAudio && typeof Audio !== 'undefined') {
      allahAudio = new Audio();
      allahAudio.preload = 'auto';
    }
    if (allahAudio) {
      if (!allahAudio.src || !allahAudio.src.endsWith(targetUrl)) {
        allahAudio.src = targetUrl;
        allahAudio.load();
      }
      allahAudio.volume = 1.0;
      allahAudio.muted = false;
    }
    return allahAudio!;
  } else {
    if (!prophetAudio && typeof Audio !== 'undefined') {
      prophetAudio = new Audio();
      prophetAudio.preload = 'auto';
    }
    if (prophetAudio) {
      if (!prophetAudio.src || !prophetAudio.src.endsWith(targetUrl)) {
        prophetAudio.src = targetUrl;
        prophetAudio.load();
      }
      prophetAudio.volume = 1.0;
      prophetAudio.muted = false;
    }
    return prophetAudio!;
  }
};

export const useNamesStore = create<NamesState>((set, get) => {
  const cleanupAudioListeners = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    if (timeUpdateHandler) {
      audio.removeEventListener('timeupdate', timeUpdateHandler);
      timeUpdateHandler = null;
    }
    if (endedHandler) {
      audio.removeEventListener('ended', endedHandler);
      endedHandler = null;
    }
    if (errorHandler) {
      audio.removeEventListener('error', errorHandler);
      errorHandler = null;
    }
  };

  const stopSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  };

  const stopOtherAudios = (activeCategory: 'allah' | 'prophet') => {
    stopSpeechSynthesis();
    if (activeCategory === 'allah' && prophetAudio) {
      cleanupAudioListeners(prophetAudio);
      prophetAudio.pause();
      prophetAudio.currentTime = 0;
    } else if (activeCategory === 'prophet' && allahAudio) {
      cleanupAudioListeners(allahAudio);
      allahAudio.pause();
      allahAudio.currentTime = 0;
    }
  };

  /**
   * Fallback using SpeechSynthesis to guarantee natural Arabic male voice pronunciation
   */
  const playSpeechFallback = (
    item: IslamicNameItem,
    onComplete: () => void,
    onError: (err: string) => void
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError('Audio playback unsupported in this browser environment.');
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {}

    const cleanArabic = item.arabic.replace(/ﷺ/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanArabic);
    utterance.lang = 'ar-SA';
    utterance.pitch = 1.0;
    utterance.rate = 0.88;

    const maleVoice = selectArabicMaleVoice();
    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    utterance.onend = () => {
      onComplete();
    };

    utterance.onerror = (e) => {
      console.warn('[NamesAudio] Speech fallback note:', e);
      onComplete(); // Advance in auto-play rather than hanging
    };

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('[NamesAudio] Speech synthesis failed:', err);
      onError('Speech synthesis failed.');
    }
  };

  // Internal AutoPlay sequence runner
  const executeAutoPlayStep = (items: IslamicNameItem[], index: number) => {
    if (index >= items.length) {
      // Completed full sequence
      const category = items[0]?.category || 'allah';
      const audio = getCategoryAudio(category);
      if (audio) {
        cleanupAudioListeners(audio);
        audio.pause();
      }
      stopSpeechSynthesis();

      set({
        isAutoPlaying: false,
        autoPlayIndex: null,
        isPlaying: false,
        isLoading: false,
        currentPlayingId: null,
        currentCategory: null,
        autoPlayStatus: 'Completed',
      });
      return;
    }

    const item = items[index];

    // Missing Audio: Skip immediately to next available name
    if (!item || !item.audioUrl) {
      set({
        autoPlayIndex: index,
        currentPlayingId: item?.id || null,
        currentCategory: item?.category || null,
        audioError: null,
      });
      executeAutoPlayStep(items, index + 1);
      return;
    }

    const category = item.category || 'allah';

    // Strict Cross-Audio Protection
    if (category === 'prophet' && item.audioUrl.includes('allah')) {
      console.error('[NamesAudio] BLOCKED: Attempted to play Allah audio for Prophet entry:', item.id);
      set({
        isPlaying: false,
        isLoading: false,
        audioError: 'Audio mapping error: Prophet entry cannot use Allah recitation',
      });
      return;
    }

    if (category === 'allah' && item.audioUrl.includes('prophet')) {
      console.error('[NamesAudio] BLOCKED: Attempted to play Prophet audio for Allah entry:', item.id);
      set({
        isPlaying: false,
        isLoading: false,
        audioError: 'Audio mapping error: Allah entry cannot use Prophet audio',
      });
      return;
    }

    stopOtherAudios(category);

    const audio = getCategoryAudio(category, item.audioUrl);
    cleanupAudioListeners(audio);

    const hasSegment = typeof item.startTime === 'number' && typeof item.endTime === 'number';
    currentTargetEnd = hasSegment ? item.endTime! : null;

    set({
      isAutoPlaying: true,
      autoPlayIndex: index,
      autoPlayList: items,
      autoPlayCategory: category,
      currentCategory: category,
      currentPlayingId: item.id,
      isLoading: false,
      isPlaying: true,
      audioError: null,
      autoPlayStatus: 'Playing',
    });

    if (audio) {
      audio.playbackRate = 1.0;
      audio.volume = 1.0;
      audio.muted = false;

      // Segment bounds listener
      timeUpdateHandler = () => {
        if (currentTargetEnd !== null && audio.currentTime >= currentTargetEnd) {
          cleanupAudioListeners(audio);
          audio.pause();

          const { isAutoPlaying, autoPlayList, autoPlayIndex } = get();
          if (isAutoPlaying && autoPlayIndex !== null) {
            executeAutoPlayStep(autoPlayList, autoPlayIndex + 1);
          } else {
            set({ isPlaying: false, currentPlayingId: null, currentCategory: null });
          }
        }
      };
      audio.addEventListener('timeupdate', timeUpdateHandler);

      // Full file ended listener
      endedHandler = () => {
        cleanupAudioListeners(audio);
        const { isAutoPlaying, autoPlayList, autoPlayIndex } = get();
        if (isAutoPlaying && autoPlayIndex !== null) {
          executeAutoPlayStep(autoPlayList, autoPlayIndex + 1);
        } else {
          set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false });
        }
      };
      audio.addEventListener('ended', endedHandler);

      errorHandler = () => {
        console.warn('[NamesAudio] Audio file failed, activating speech fallback for:', item.id);
        cleanupAudioListeners(audio);
        playSpeechFallback(
          item,
          () => {
            const { isAutoPlaying, autoPlayList, autoPlayIndex } = get();
            if (isAutoPlaying && autoPlayIndex !== null) {
              executeAutoPlayStep(autoPlayList, autoPlayIndex + 1);
            } else {
              set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false });
            }
          },
          (err) => {
            set({ isPlaying: false, isLoading: false, audioError: err });
          }
        );
      };
      audio.addEventListener('error', errorHandler);

      if (hasSegment) {
        audio.currentTime = item.startTime!;
      } else {
        audio.currentTime = 0;
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            set({ isPlaying: true, isLoading: false, audioError: null });
          })
          .catch((err) => {
            console.warn('[NamesAudio] HTMLAudio play error, falling back to speech synthesis:', err);
            cleanupAudioListeners(audio);
            playSpeechFallback(
              item,
              () => {
                const { isAutoPlaying, autoPlayList, autoPlayIndex } = get();
                if (isAutoPlaying && autoPlayIndex !== null) {
                  executeAutoPlayStep(autoPlayList, autoPlayIndex + 1);
                } else {
                  set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false });
                }
              },
              (errMsg) => {
                set({ isPlaying: false, isLoading: false, audioError: errMsg });
              }
            );
          });
      }
    } else {
      // Audio element unavailable (e.g. node / headless) -> speech fallback
      playSpeechFallback(
        item,
        () => {
          const { isAutoPlaying, autoPlayList, autoPlayIndex } = get();
          if (isAutoPlaying && autoPlayIndex !== null) {
            executeAutoPlayStep(autoPlayList, autoPlayIndex + 1);
          } else {
            set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false });
          }
        },
        (errMsg) => {
          set({ isPlaying: false, isLoading: false, audioError: errMsg });
        }
      );
    }
  };

  return {
    currentCategory: null,
    currentPlayingId: null,
    isPlaying: false,
    isLoading: false,
    audioError: null,
    favorites: getInitialFavorites(),

    isAutoPlaying: false,
    autoPlayIndex: null,
    autoPlayList: [],
    autoPlayCategory: null,
    autoPlayStatus: null,

    playName: (item: IslamicNameItem) => {
      const { currentPlayingId, currentCategory, isPlaying, isAutoPlaying } = get();
      const itemCategory = item.category || 'allah';

      // 1. If currently playing this exact item, toggle to PAUSE
      if (currentPlayingId === item.id && currentCategory === itemCategory && isPlaying) {
        const audio = getCategoryAudio(itemCategory);
        if (audio) audio.pause();
        stopSpeechSynthesis();
        set({ isPlaying: false, autoPlayStatus: isAutoPlaying ? 'Paused' : null });
        return;
      }

      // 2. If resuming the same paused item
      if (currentPlayingId === item.id && currentCategory === itemCategory && !isPlaying) {
        set({ isPlaying: true, audioError: null, autoPlayStatus: isAutoPlaying ? 'Playing' : null });
        const audio = getCategoryAudio(itemCategory);
        if (audio) {
          const hasSegment = typeof item.startTime === 'number' && typeof item.endTime === 'number';
          if (hasSegment && (audio.currentTime >= item.endTime! || audio.currentTime < item.startTime!)) {
            audio.currentTime = item.startTime!;
          }
          audio.volume = 1.0;
          audio.muted = false;

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('[NamesAudio] Resume error, fallback to speech:', err);
              playSpeechFallback(
                item,
                () => set({ isPlaying: false, currentPlayingId: null, currentCategory: null }),
                (errMsg) => set({ isPlaying: false, audioError: errMsg })
              );
            });
          }
        }
        return;
      }

      // 3. If clicking a missing audio item
      if (!item.audioUrl) {
        if (isAutoPlaying) {
          get().stopAudio();
        }
        // Use speech fallback directly
        set({
          currentCategory: itemCategory,
          currentPlayingId: item.id,
          isPlaying: true,
          isLoading: false,
          audioError: null,
        });
        playSpeechFallback(
          item,
          () => set({ isPlaying: false, currentPlayingId: null, currentCategory: null }),
          (err) => set({ isPlaying: false, audioError: err })
        );
        return;
      }

      // 4. Strict Cross-Audio Protection
      if (itemCategory === 'prophet' && item.audioUrl.includes('allah')) {
        console.error('[NamesAudio] BLOCKED: Attempted to play Allah audio for Prophet entry:', item.id);
        set({
          isPlaying: false,
          isLoading: false,
          audioError: 'Audio mapping error: Prophet entry cannot use Allah recitation',
        });
        return;
      }

      if (itemCategory === 'allah' && item.audioUrl.includes('prophet')) {
        console.error('[NamesAudio] BLOCKED: Attempted to play Prophet audio for Allah entry:', item.id);
        set({
          isPlaying: false,
          isLoading: false,
          audioError: 'Audio mapping error: Allah entry cannot use Prophet audio',
        });
        return;
      }

      // 5. Starting new individual playback (Cancel any AutoPlay)
      const audio = getCategoryAudio(itemCategory, item.audioUrl);
      stopOtherAudios(itemCategory);
      cleanupAudioListeners(audio);

      const hasSegment = typeof item.startTime === 'number' && typeof item.endTime === 'number';
      currentTargetEnd = hasSegment ? item.endTime! : null;

      set({
        isAutoPlaying: false,
        autoPlayIndex: null,
        autoPlayStatus: null,
        currentCategory: itemCategory,
        currentPlayingId: item.id,
        isLoading: false,
        isPlaying: true,
        audioError: null,
      });

      if (audio) {
        audio.playbackRate = 1.0;
        audio.volume = 1.0;
        audio.muted = false;

        timeUpdateHandler = () => {
          if (currentTargetEnd !== null && audio.currentTime >= currentTargetEnd) {
            cleanupAudioListeners(audio);
            audio.pause();
            set({ isPlaying: false, currentPlayingId: null, currentCategory: null });
          }
        };
        audio.addEventListener('timeupdate', timeUpdateHandler);

        endedHandler = () => {
          cleanupAudioListeners(audio);
          set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false });
        };
        audio.addEventListener('ended', endedHandler);

        errorHandler = () => {
          console.warn('[NamesAudio] Single play error, activating speech fallback:', item.id);
          cleanupAudioListeners(audio);
          playSpeechFallback(
            item,
            () => set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false }),
            (errMsg) => set({ isPlaying: false, isLoading: false, audioError: errMsg })
          );
        };
        audio.addEventListener('error', errorHandler);

        if (hasSegment) {
          audio.currentTime = item.startTime!;
        } else {
          audio.currentTime = 0;
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              set({ isPlaying: true, isLoading: false, audioError: null });
            })
            .catch((err) => {
              console.warn('[NamesAudio] Single play promise error, fallback to speech:', err);
              cleanupAudioListeners(audio);
              playSpeechFallback(
                item,
                () => set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false }),
                (errMsg) => set({ isPlaying: false, isLoading: false, audioError: errMsg })
              );
            });
        }
      } else {
        playSpeechFallback(
          item,
          () => set({ isPlaying: false, currentPlayingId: null, currentCategory: null, isLoading: false }),
          (errMsg) => set({ isPlaying: false, isLoading: false, audioError: errMsg })
        );
      }
    },

    playAll: (items: IslamicNameItem[], startIndex: number = 0) => {
      if (items.length === 0) return;

      const { isAutoPlaying, isPlaying, currentCategory } = get();
      const category = items[0]?.category || 'allah';

      // If already playing all in same category, toggle pause/play
      if (isAutoPlaying && isPlaying && currentCategory === category) {
        const audio = getCategoryAudio(category);
        if (audio) audio.pause();
        stopSpeechSynthesis();
        set({ isPlaying: false, autoPlayStatus: 'Paused' });
        return;
      }

      if (isAutoPlaying && !isPlaying && currentCategory === category) {
        const audio = getCategoryAudio(category);
        if (audio) {
          audio.volume = 1.0;
          audio.muted = false;
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => set({ isPlaying: true, autoPlayStatus: 'Playing' }))
              .catch((err) => {
                console.warn('[NamesAudio] Resume auto-play error:', err);
              });
          }
        }
        return;
      }

      executeAutoPlayStep(items, startIndex);
    },

    pauseAudio: () => {
      const { currentCategory, isAutoPlaying } = get();
      if (currentCategory) {
        const audio = getCategoryAudio(currentCategory);
        if (audio) audio.pause();
      }
      stopSpeechSynthesis();
      set({ isPlaying: false, autoPlayStatus: isAutoPlaying ? 'Paused' : null });
    },

    resumeAudio: () => {
      const { currentCategory, isAutoPlaying } = get();
      if (currentCategory) {
        const audio = getCategoryAudio(currentCategory);
        if (audio) {
          audio.volume = 1.0;
          audio.muted = false;
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => set({ isPlaying: true, audioError: null, autoPlayStatus: isAutoPlaying ? 'Playing' : null }))
              .catch(() => set({ isPlaying: false, audioError: 'Audio unavailable. Please try again.' }));
          }
        }
      }
    },

    stopAudio: () => {
      if (allahAudio) {
        cleanupAudioListeners(allahAudio);
        allahAudio.pause();
        allahAudio.currentTime = 0;
      }
      if (prophetAudio) {
        cleanupAudioListeners(prophetAudio);
        prophetAudio.pause();
        prophetAudio.currentTime = 0;
      }
      stopSpeechSynthesis();

      currentTargetEnd = null;

      set({
        currentCategory: null,
        currentPlayingId: null,
        isPlaying: false,
        isLoading: false,
        audioError: null,
        isAutoPlaying: false,
        autoPlayIndex: null,
        autoPlayStatus: null,
      });
    },

    toggleFavorite: (id: string) => {
      const { favorites } = get();
      const exists = favorites.includes(id);
      const updated = exists ? favorites.filter((favId) => favId !== id) : [...favorites, id];

      set({ favorites: updated });
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(updated));
      } catch {}
    },

    isFavorite: (id: string) => {
      return get().favorites.includes(id);
    },
  };
});
