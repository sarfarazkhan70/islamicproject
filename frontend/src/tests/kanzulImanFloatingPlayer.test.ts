import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useKanzulImanAudioStore } from '../stores/useKanzulImanAudioStore';

describe('Kanz-ul-Iman Persistent Floating Audio Player Engine', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useKanzulImanAudioStore.getState();
    store.stopAudio();
    useKanzulImanAudioStore.setState({
      hasUserStartedAudio: false,
      isMiniPlayerDismissed: false,
      currentSurahNumber: 1,
      currentJuzNumber: null,
      playbackTime: 0,
      playbackDuration: 83.72,
      playbackProgress: 0,
      audioVolume: 0.9,
      isPlaying: false,
    });
  });

  it('1. should have initial floating mini player state as not dismissed and not started', () => {
    const state = useKanzulImanAudioStore.getState();
    expect(state.hasUserStartedAudio).toBe(false);
    expect(state.isMiniPlayerDismissed).toBe(false);
    expect(state.isPlaying).toBe(false);
    expect(state.playbackTime).toBe(0);
  });

  it('2. should activate floating player state when starting Surah playback', async () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(1, 0);

    const state = useKanzulImanAudioStore.getState();
    expect(state.hasUserStartedAudio).toBe(true);
    expect(state.isMiniPlayerDismissed).toBe(false);
    expect(state.isPlaying).toBe(true);
    expect(state.currentSurahNumber).toBe(1);
    expect(state.currentTrackTitle).toBe('AL-FATIHA');
  });

  it('3. should toggle Play and Pause correctly', () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(1, 0);
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(true);

    store.togglePlay();
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(false);

    store.togglePlay();
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(true);
  });

  it('4. should immediately stop audio and reset playing state when Stop is clicked', () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(2, 0);
    store.seekAudio(45.5);

    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(true);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(45.5);

    // Click Stop
    store.stopAudio();

    const stateAfterStop = useKanzulImanAudioStore.getState();
    expect(stateAfterStop.isPlaying).toBe(false);
    expect(stateAfterStop.playbackTime).toBe(0);
    expect(stateAfterStop.playbackProgress).toBe(0);
    expect(stateAfterStop.playingAyahKey).toBeNull();
    expect(stateAfterStop.playbackPhase).toBe('idle');
  });

  it('5. should completely close floating player and reset audio when X/Close is clicked', () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(112, 0);

    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(true);
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(false);

    // Click Close (X)
    store.closeMiniPlayer();

    const stateAfterClose = useKanzulImanAudioStore.getState();
    expect(stateAfterClose.isPlaying).toBe(false);
    expect(stateAfterClose.hasUserStartedAudio).toBe(false);
    expect(stateAfterClose.isMiniPlayerDismissed).toBe(true);
    expect(stateAfterClose.playbackTime).toBe(0);
    expect(stateAfterClose.playbackProgress).toBe(0);
  });

  it('6. should re-open floating player if user starts playing audio again after closing', () => {
    const store = useKanzulImanAudioStore.getState();
    store.closeMiniPlayer();
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(true);

    // User starts audio again (e.g. from reader or studio)
    store.playKanzulImanSurah(1, 0);
    const newState = useKanzulImanAudioStore.getState();
    expect(newState.isMiniPlayerDismissed).toBe(false);
    expect(newState.hasUserStartedAudio).toBe(true);
    expect(newState.isPlaying).toBe(true);
  });

  it('7. should preserve floating player state during page / Surah / Juz navigation without auto-dismissing', () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(36, 0); // Ya-Sin

    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(true);
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(false);

    // Simulate page scrolling / changing in reader
    useKanzulImanAudioStore.setState({ currentAyahNumber: 15 });
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(false);
    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(true);

    // Jump to another Juz
    useKanzulImanAudioStore.setState({ currentJuzNumber: 23 });
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(false);
    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(true);
  });

  it('8. should seek audio correctly and update progress and playback time', () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(1, 0);

    store.seekAudio(30);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(30);

    store.skipTime(10);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(40);

    store.skipTime(-5);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(35);
  });

  it('9. should adjust volume and clamp within 0 to 1 range', () => {
    const store = useKanzulImanAudioStore.getState();

    store.setAudioVolume(0.5);
    expect(useKanzulImanAudioStore.getState().audioVolume).toBe(0.5);

    store.setAudioVolume(1.5); // clamped to 1.0
    expect(useKanzulImanAudioStore.getState().audioVolume).toBe(1.0);

    store.setAudioVolume(-0.2); // clamped to 0.0
    expect(useKanzulImanAudioStore.getState().audioVolume).toBe(0.0);
  });

  it('10. should support multi-part Surahs in floating player (Part 1, Part 2, etc.)', () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(2, 0); // Al-Baqarah Part 1

    expect(useKanzulImanAudioStore.getState().totalPartsInSurah).toBe(3);
    expect(useKanzulImanAudioStore.getState().currentPartIndex).toBe(0);

    store.nextTrack(); // Advance to Part 2
    expect(useKanzulImanAudioStore.getState().currentPartIndex).toBe(1);

    store.nextTrack(); // Advance to Part 3
    expect(useKanzulImanAudioStore.getState().currentPartIndex).toBe(2);

    store.prevTrack(); // Back to Part 2
    expect(useKanzulImanAudioStore.getState().currentPartIndex).toBe(1);
  });

  it('11. should accurately skip 10 seconds backward and forward for essential controls', () => {
    const store = useKanzulImanAudioStore.getState();
    store.playKanzulImanSurah(1, 0);
    useKanzulImanAudioStore.setState({ playbackDuration: 100, playbackTime: 50 });

    // Skip backward 10s
    store.skipTime(-10);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(40);

    // Skip forward 10s
    store.skipTime(10);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(50);

    // Skip backward bounded at 0
    store.skipTime(-60);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(0);

    // Skip forward bounded at duration
    store.skipTime(120);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(100);
  });
});
