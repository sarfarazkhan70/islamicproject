import { describe, it, expect, beforeEach } from 'vitest';
import { useQuranStore } from '../stores/useQuranStore';
import { useKanzulImanAudioStore } from '../stores/useKanzulImanAudioStore';

describe('Quran and Kanz-ul-Iman Independent Audio State Management', () => {
  beforeEach(() => {
    // Reset Quran Store
    useQuranStore.getState().stopAudio();
    useQuranStore.setState({
      hasUserStartedAudio: false,
      isMiniPlayerDismissed: false,
      activeAudioSurah: 1,
      playbackTime: 0,
      playbackDuration: 120,
      audioVolume: 0.8,
      isPlaying: false,
      seekTarget: null,
      audioPlaybackPhase: 'idle',
    });

    // Reset Kanz-ul-Iman Store
    useKanzulImanAudioStore.getState().stopAudio();
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

  it('1. Quran player controls: Play/Pause, Stop, Close (X), and 10s Skip work independently', () => {
    const quranStore = useQuranStore.getState();

    // Play Quran
    quranStore.playSurahAudio(1);
    expect(useQuranStore.getState().isPlaying).toBe(true);
    expect(useQuranStore.getState().hasUserStartedAudio).toBe(true);
    expect(useQuranStore.getState().isMiniPlayerDismissed).toBe(false);

    // Toggle Pause
    quranStore.toggleAudioPlay();
    expect(useQuranStore.getState().isPlaying).toBe(false);

    // Toggle Play
    quranStore.toggleAudioPlay();
    expect(useQuranStore.getState().isPlaying).toBe(true);

    // 10-second skip forward
    quranStore.setPlaybackTime(20);
    quranStore.skipTime(10);
    expect(useQuranStore.getState().playbackTime).toBe(30);

    // 10-second skip backward
    quranStore.skipTime(-10);
    expect(useQuranStore.getState().playbackTime).toBe(20);

    // Stop Quran audio
    quranStore.stopAudio();
    expect(useQuranStore.getState().isPlaying).toBe(false);
    expect(useQuranStore.getState().playbackTime).toBe(0);
    expect(useQuranStore.getState().audioPlaybackPhase).toBe('idle');

    // Close Mini Player
    quranStore.closeMiniPlayer();
    expect(useQuranStore.getState().isMiniPlayerDismissed).toBe(true);
    expect(useQuranStore.getState().hasUserStartedAudio).toBe(false);
  });

  it('2. Kanz-ul-Iman player controls: Play/Pause, Stop, Close (X), and 10s Skip work independently', () => {
    const kanzulStore = useKanzulImanAudioStore.getState();

    // Play Kanz-ul-Iman
    kanzulStore.playKanzulImanSurah(1, 0);
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(true);
    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(true);
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(false);

    // Toggle Pause
    kanzulStore.togglePlay();
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(false);

    // Toggle Play
    kanzulStore.togglePlay();
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(true);

    // 10-second skip forward
    kanzulStore.seekAudio(25);
    kanzulStore.skipTime(10);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(35);

    // 10-second skip backward
    kanzulStore.skipTime(-10);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(25);

    // Stop Kanz-ul-Iman audio
    kanzulStore.stopAudio();
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(false);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(0);
    expect(useKanzulImanAudioStore.getState().playbackProgress).toBe(0);

    // Close Mini Player
    kanzulStore.closeMiniPlayer();
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(true);
    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(false);
  });

  it('3. Playing or controlling Kanz-ul-Iman audio never mutates or affects Quran audio state', () => {
    const quranStore = useQuranStore.getState();
    const kanzulStore = useKanzulImanAudioStore.getState();

    // Setup initial Quran audio state
    useQuranStore.setState({
      isPlaying: false,
      hasUserStartedAudio: false,
      isMiniPlayerDismissed: false,
      playbackTime: 0,
      audioVolume: 0.75,
    });

    // Control Kanz-ul-Iman audio
    kanzulStore.playKanzulImanSurah(2, 0); // Al-Baqarah
    kanzulStore.seekAudio(50);
    kanzulStore.skipTime(10);
    kanzulStore.setAudioVolume(0.4);

    // Verify Kanz-ul-Iman state changed
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(true);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(60);
    expect(useKanzulImanAudioStore.getState().audioVolume).toBe(0.4);

    // Verify Quran state is 100% UNTOUCHED
    expect(useQuranStore.getState().isPlaying).toBe(false);
    expect(useQuranStore.getState().hasUserStartedAudio).toBe(false);
    expect(useQuranStore.getState().playbackTime).toBe(0);
    expect(useQuranStore.getState().audioVolume).toBe(0.75);

    // Stop and Close Kanz-ul-Iman
    kanzulStore.stopAudio();
    kanzulStore.closeMiniPlayer();

    // Quran remains untouched
    expect(useQuranStore.getState().isMiniPlayerDismissed).toBe(false);
    expect(useQuranStore.getState().isPlaying).toBe(false);
  });

  it('4. Playing or controlling Quran audio never mutates or affects Kanz-ul-Iman audio state', () => {
    const quranStore = useQuranStore.getState();
    const kanzulStore = useKanzulImanAudioStore.getState();

    // Setup initial Kanz-ul-Iman state
    useKanzulImanAudioStore.setState({
      isPlaying: false,
      hasUserStartedAudio: false,
      isMiniPlayerDismissed: false,
      playbackTime: 0,
      audioVolume: 0.95,
      currentSurahNumber: 36, // Ya-Sin
    });

    // Control Quran audio
    quranStore.playSurahAudio(112); // Al-Ikhlas
    quranStore.setPlaybackTime(15);
    quranStore.skipTime(10);
    quranStore.setAudioVolume(0.5);

    // Verify Quran state changed
    expect(useQuranStore.getState().isPlaying).toBe(true);
    expect(useQuranStore.getState().playbackTime).toBe(25);
    expect(useQuranStore.getState().audioVolume).toBe(0.5);

    // Verify Kanz-ul-Iman state is 100% UNTOUCHED
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(false);
    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(false);
    expect(useKanzulImanAudioStore.getState().playbackTime).toBe(0);
    expect(useKanzulImanAudioStore.getState().audioVolume).toBe(0.95);
    expect(useKanzulImanAudioStore.getState().currentSurahNumber).toBe(36);

    // Stop and Close Quran
    quranStore.stopAudio();
    quranStore.closeMiniPlayer();

    // Kanz-ul-Iman remains untouched
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(false);
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(false);
  });

  it('5. Each player has separate independent volume, seek, and mini-player dismissal states', () => {
    const quranStore = useQuranStore.getState();
    const kanzulStore = useKanzulImanAudioStore.getState();

    // Set distinct volumes
    quranStore.setAudioVolume(0.3);
    kanzulStore.setAudioVolume(0.85);
    expect(useQuranStore.getState().audioVolume).toBe(0.3);
    expect(useKanzulImanAudioStore.getState().audioVolume).toBe(0.85);

    // Dismiss only Quran mini player
    quranStore.closeMiniPlayer();
    expect(useQuranStore.getState().isMiniPlayerDismissed).toBe(true);
    expect(useKanzulImanAudioStore.getState().isMiniPlayerDismissed).toBe(false);

    // Start Kanz-ul-Iman audio
    kanzulStore.playKanzulImanSurah(1, 0);
    expect(useKanzulImanAudioStore.getState().hasUserStartedAudio).toBe(true);
    expect(useKanzulImanAudioStore.getState().isPlaying).toBe(true);
    expect(useQuranStore.getState().hasUserStartedAudio).toBe(false);
    expect(useQuranStore.getState().isPlaying).toBe(false);
  });
});
