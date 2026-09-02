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

// Pre-initialize dedicated audio instances for instant browser playback
let allahAudio: HTMLAudioElement | null =
  typeof Audio !== 'undefined' ? new Audio('/audio/asma_recitation.mp3') : null;
if (allahAudio) {
  allahAudio.preload = 'auto';
  allahAudio.volume = 1.0;
}

let prophetAudio: HTMLAudioElement | null =
  typeof Audio !== 'undefined' ? new Audio('/audio/prophet_recitation_male_source.mp3') : null;
if (prophetAudio) {
  prophetAudio.preload = 'auto';
  prophetAudio.volume = 1.0;
}

let currentTargetEnd: number | null = null;
let timeUpdateHandler: (() => void) | null = null;
let endedHandler: (() => void) | null = null;

const getCategoryAudio = (category: 'allah' | 'prophet', url?: string): HTMLAudioElement => {
  if (category === 'allah') {
    if (!allahAudio) {
      allahAudio = new Audio(url || '/audio/asma_recitation.mp3');
      allahAudio.preload = 'auto';
    } else if (url && !allahAudio.src.endsWith(url)) {
      allahAudio.src = url;
    }
    allahAudio.volume = 1.0;
    allahAudio.muted = false;
    return allahAudio;
  } else {
    if (!prophetAudio) {
      prophetAudio = new Audio(url || '/audio/prophet_recitation_male_source.mp3');
      prophetAudio.preload = 'auto';
    } else if (url && !prophetAudio.src.endsWith(url)) {
      prophetAudio.src = url;
    }
    prophetAudio.volume = 1.0;
    prophetAudio.muted = false;
    return prophetAudio;
  }
};

export const useNamesStore = create<NamesState>((set, get) => {
  const cleanupAudioListeners = (audio: HTMLAudioElement) => {
    if (timeUpdateHandler) {
      audio.removeEventListener('timeupdate', timeUpdateHandler);
      timeUpdateHandler = null;
    }
    if (endedHandler) {
      audio.removeEventListener('ended', endedHandler);
      endedHandler = null;
    }
  };

  const stopOtherAudios = (activeCategory: 'allah' | 'prophet') => {
    if (activeCategory === 'allah' && prophetAudio) {
      cleanupAudioListeners(prophetAudio);
      prophetAudio.pause();
    } else if (activeCategory === 'prophet' && allahAudio) {
      cleanupAudioListeners(allahAudio);
      allahAudio.pause();
    }
  };

  // Internal AutoPlay sequence runner: immediate gapless transitions
  const executeAutoPlayStep = (items: IslamicNameItem[], index: number) => {
    if (index >= items.length) {
      // Completed full sequence
      const category = items[0]?.category || 'allah';
      const audio = getCategoryAudio(category);
      cleanupAudioListeners(audio);
      audio.pause();

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
    if (category === 'prophet' && item.audioUrl.includes('asma_recitation.mp3')) {
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

    if (item.audioUrl && !audio.src.endsWith(item.audioUrl)) {
      audio.src = item.audioUrl;
    }

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

    audio.playbackRate = category === 'prophet' ? 0.90 : 1.0;
    audio.volume = 1.0;
    audio.muted = false;

    // Segment bounds listener (for segmented tracks)
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

    // Full file ended listener (for standalone files)
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

    audio.onerror = (e) => {
      console.error('[NamesAudio] AutoPlay error on item:', item.id, e);
      cleanupAudioListeners(audio);
      const { isAutoPlaying, autoPlayList, autoPlayIndex } = get();
      if (isAutoPlaying && autoPlayIndex !== null) {
        executeAutoPlayStep(autoPlayList, autoPlayIndex + 1);
      } else {
        set({
          isPlaying: false,
          isLoading: false,
          audioError: 'Audio unavailable. Please try again.',
        });
      }
    };

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
          console.error('[NamesAudio] AutoPlay play promise error:', err);
          const { isAutoPlaying, autoPlayList, autoPlayIndex } = get();
          if (isAutoPlaying && autoPlayIndex !== null) {
            executeAutoPlayStep(autoPlayList, autoPlayIndex + 1);
          } else {
            set({
              isPlaying: false,
              isLoading: false,
              audioError: 'Audio playback failed.',
            });
          }
        });
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
        audio.pause();
        set({ isPlaying: false, autoPlayStatus: isAutoPlaying ? 'Paused' : null });
        return;
      }

      // 2. If resuming the same paused item
      if (currentPlayingId === item.id && currentCategory === itemCategory && !isPlaying) {
        const audio = getCategoryAudio(itemCategory);
        const hasSegment = typeof item.startTime === 'number' && typeof item.endTime === 'number';

        if (hasSegment && (audio.currentTime >= item.endTime! || audio.currentTime < item.startTime!)) {
          audio.currentTime = item.startTime!;
        }

        audio.volume = 1.0;
        audio.muted = false;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              set({ isPlaying: true, audioError: null, autoPlayStatus: isAutoPlaying ? 'Playing' : null });
            })
            .catch((err) => {
              console.error('[NamesAudio] Resume error:', err);
              set({ isPlaying: false, audioError: 'Audio unavailable. Please try again.' });
            });
        }
        return;
      }

      // 3. If clicking a missing audio item
      if (!item.audioUrl) {
        if (isAutoPlaying) {
          get().stopAudio();
        }
        set({
          currentCategory: itemCategory,
          currentPlayingId: item.id,
          isPlaying: false,
          isLoading: false,
          audioError: 'Audio recording currently unavailable for this title.',
        });
        return;
      }

      // 4. Strict Cross-Audio Protection
      if (itemCategory === 'prophet' && item.audioUrl.includes('asma_recitation.mp3')) {
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

      if (item.audioUrl && !audio.src.endsWith(item.audioUrl)) {
        audio.src = item.audioUrl;
      }

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

      audio.playbackRate = itemCategory === 'prophet' ? 0.90 : 1.0;
      audio.volume = 1.0;
      audio.muted = false;

      // Individual mode timeupdate: stops only this item when targetEnd reached
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

      audio.onerror = (e) => {
        console.error('[NamesAudio] Individual play error on item:', item.id, e);
        cleanupAudioListeners(audio);
        set({
          isPlaying: false,
          isLoading: false,
          audioError: 'Audio unavailable. Please try again.',
        });
      };

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
            console.error('[NamesAudio] Single play error:', err);
            set({
              isPlaying: false,
              isLoading: false,
              audioError: 'Audio unavailable. Please try again.',
            });
          });
      }
    },

    playAll: (items: IslamicNameItem[], startIndex: number = 0) => {
      if (items.length === 0) return;

      const { isAutoPlaying, isPlaying, currentCategory } = get();
      const category = items[0]?.category || 'allah';

      // If already playing all in same category, toggle pause/play
      if (isAutoPlaying && isPlaying && currentCategory === category) {
        const audio = getCategoryAudio(category);
        audio.pause();
        set({ isPlaying: false, autoPlayStatus: 'Paused' });
        return;
      }

      if (isAutoPlaying && !isPlaying && currentCategory === category) {
        const audio = getCategoryAudio(category);
        audio.volume = 1.0;
        audio.muted = false;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => set({ isPlaying: true, autoPlayStatus: 'Playing' }))
            .catch((err) => {
              console.error('[NamesAudio] Resume auto-play error:', err);
            });
        }
        return;
      }

      executeAutoPlayStep(items, startIndex);
    },

    pauseAudio: () => {
      const { currentCategory, isAutoPlaying } = get();
      if (currentCategory) {
        const audio = getCategoryAudio(currentCategory);
        audio.pause();
      }
      set({ isPlaying: false, autoPlayStatus: isAutoPlaying ? 'Paused' : null });
    },

    resumeAudio: () => {
      const { currentCategory, isAutoPlaying } = get();
      if (currentCategory) {
        const audio = getCategoryAudio(currentCategory);
        audio.volume = 1.0;
        audio.muted = false;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => set({ isPlaying: true, audioError: null, autoPlayStatus: isAutoPlaying ? 'Playing' : null }))
            .catch(() => set({ isPlaying: false, audioError: 'Audio unavailable. Please try again.' }));
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
