import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNamesStore } from '../stores/useNamesStore';
import { ASMA_UL_HUSNA } from '../data/islamic/asmaUlHusnaData';
import { ASMA_E_MUSTAFA } from '../data/islamic/asmaEMustafaData';

// Mock Audio and SpeechSynthesis for Node / Vitest
class MockAudio {
  src: string = '';
  volume: number = 1.0;
  muted: boolean = false;
  playbackRate: number = 1.0;
  currentTime: number = 0;
  preload: string = 'auto';
  listeners: Record<string, Function[]> = {};

  addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event: string, fn: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((f) => f !== fn);
    }
  }

  load() {}
  pause() {}
  play() {
    return Promise.resolve();
  }
}

describe('Islamic Names Audio Engine (Asma-ul-Husna & Asma-e-Mustafa)', () => {
  beforeEach(() => {
    // Setup Audio mock
    globalThis.Audio = MockAudio as any;

    // Setup SpeechSynthesis mock
    globalThis.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: () => [],
      paused: false,
      pending: false,
      speaking: false,
      onvoiceschanged: null,
    } as any;

    globalThis.SpeechSynthesisUtterance = class {
      text: string;
      lang: string = 'ar-SA';
      pitch: number = 1.0;
      rate: number = 0.88;
      voice: any = null;
      onend: Function | null = null;
      onerror: Function | null = null;
      constructor(text?: string) {
        this.text = text || '';
      }
    } as any;

    // Reset store state
    useNamesStore.getState().stopAudio();
    useNamesStore.setState({
      currentCategory: null,
      currentPlayingId: null,
      isPlaying: false,
      isLoading: false,
      audioError: null,
      isAutoPlaying: false,
      autoPlayIndex: null,
      autoPlayList: [],
      autoPlayCategory: null,
      autoPlayStatus: null,
    });
  });

  it('1. Asma-ul-Husna items point to valid .mp3 files', () => {
    expect(ASMA_UL_HUSNA.length).toBe(99);
    for (const item of ASMA_UL_HUSNA) {
      expect(item.category).toBe('allah');
      expect(item.audioUrl).toBeDefined();
      expect(item.audioUrl).toMatch(/^\/audio\/allah\/allah-\d{2}\.mp3$/);
    }
  });

  it('2. Asma-e-Mustafa items point to valid .mp3 files', () => {
    expect(ASMA_E_MUSTAFA.length).toBe(99);
    for (const item of ASMA_E_MUSTAFA) {
      expect(item.category).toBe('prophet');
      expect(item.audioUrl).toBeDefined();
      expect(item.audioUrl).toMatch(/^\/audio\/prophet\/prophet-\d{2}\.mp3$/);
    }
  });

  it('3. Plays Allah name and updates state correctly', () => {
    const item = ASMA_UL_HUSNA[0]; // Ar-Rahman
    useNamesStore.getState().playName(item);

    const state = useNamesStore.getState();
    expect(state.currentCategory).toBe('allah');
    expect(state.currentPlayingId).toBe('allah-01');
    expect(state.isPlaying).toBe(true);
    expect(state.audioError).toBeNull();
  });

  it('4. Plays Prophet name and updates state correctly', () => {
    const item = ASMA_E_MUSTAFA[0]; // Muhammad ﷺ
    useNamesStore.getState().playName(item);

    const state = useNamesStore.getState();
    expect(state.currentCategory).toBe('prophet');
    expect(state.currentPlayingId).toBe('prophet-01');
    expect(state.isPlaying).toBe(true);
    expect(state.audioError).toBeNull();
  });

  it('5. Toggling play on the same item pauses and resumes playback', () => {
    const item = ASMA_UL_HUSNA[1]; // Ar-Rahim
    const store = useNamesStore.getState();

    // Start playing
    store.playName(item);
    expect(useNamesStore.getState().isPlaying).toBe(true);

    // Toggle -> should pause
    useNamesStore.getState().playName(item);
    expect(useNamesStore.getState().isPlaying).toBe(false);
    expect(useNamesStore.getState().currentPlayingId).toBe('allah-02');

    // Toggle -> should resume
    useNamesStore.getState().playName(item);
    expect(useNamesStore.getState().isPlaying).toBe(true);
    expect(useNamesStore.getState().currentPlayingId).toBe('allah-02');
  });

  it('6. Stop audio resets playing states cleanly', () => {
    const item = ASMA_UL_HUSNA[2]; // Al-Malik
    useNamesStore.getState().playName(item);
    expect(useNamesStore.getState().isPlaying).toBe(true);

    useNamesStore.getState().stopAudio();
    const state = useNamesStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentPlayingId).toBeNull();
    expect(state.currentCategory).toBeNull();
    expect(state.isAutoPlaying).toBe(false);
  });

  it('7. Enforces strict cross-audio category protection', () => {
    // Malicious or mismatched item
    const mismatchedItem = {
      ...ASMA_E_MUSTAFA[0],
      audioUrl: '/audio/allah/allah-01.mp3', // Prophet entry trying to use Allah recitation
    };

    useNamesStore.getState().playName(mismatchedItem);
    const state = useNamesStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.audioError).toContain('Audio mapping error');
  });

  it('8. Auto-play initializes continuous playback sequence for all items', () => {
    const sampleItems = ASMA_UL_HUSNA.slice(0, 5);
    useNamesStore.getState().playAll(sampleItems);

    const state = useNamesStore.getState();
    expect(state.isAutoPlaying).toBe(true);
    expect(state.autoPlayIndex).toBe(0);
    expect(state.autoPlayCategory).toBe('allah');
    expect(state.isPlaying).toBe(true);
    expect(state.currentPlayingId).toBe('allah-01');
  });

  it('9. Favorites toggle and query work properly', () => {
    const id = 'allah-01';
    const store = useNamesStore.getState();

    const initial = store.isFavorite(id);
    store.toggleFavorite(id);
    expect(useNamesStore.getState().isFavorite(id)).toBe(!initial);

    // Toggle back
    store.toggleFavorite(id);
    expect(useNamesStore.getState().isFavorite(id)).toBe(initial);
  });
});
