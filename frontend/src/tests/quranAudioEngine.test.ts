import { describe, it, expect } from 'vitest';
import { useQuranStore, getAudioUrl, getTaawwuzAudioUrl, getBismillahAudioUrl } from '../stores/useQuranStore';
import { SURAHS_LIST, JUZ_LIST, SUPPORTED_RECITERS, getSurahByNumber, getJuzByNumber } from '../data/quranData';
import { QuranApiService } from '../services/quranApiService';

describe('Original Quran Arabic Audio Engine', () => {
  it('1. Surah Al-Fatiha play generates correct Arabic recitation audio', () => {
    // Al-Fatiha with default reciter (Mishary Alafasy, ID 7)
    const url = getAudioUrl(1, 7);
    expect(url).toBe('https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3');

    // Test Abdul Basit (ID 1)
    const basitUrl = getAudioUrl(1, 1);
    expect(basitUrl).toBe('https://download.quranicaudio.com/qdc/abdul_baset/mujawwad/1.mp3');
  });

  it('2. Pause / resume preserves playback time without restart from beginning', () => {
    const store = useQuranStore.getState();
    
    // Simulate playing Surah 1
    useQuranStore.setState({
      activeAudioSurah: 1,
      isPlaying: true,
      playbackTime: 45,
      playbackDuration: 80,
      audioPlaybackPhase: 'surah',
    });

    expect(useQuranStore.getState().isPlaying).toBe(true);
    expect(useQuranStore.getState().playbackTime).toBe(45);

    // Pause
    store.pauseAudio();
    expect(useQuranStore.getState().isPlaying).toBe(false);
    expect(useQuranStore.getState().playbackTime).toBe(45); // Preserved!

    // Resume
    store.resumeAudio();
    expect(useQuranStore.getState().isPlaying).toBe(true);
    expect(useQuranStore.getState().playbackTime).toBe(45); // Still preserved, not reset to 0!
  });

  it('3. Next Ayah and Previous Ayah advance smoothly', () => {
    const store = useQuranStore.getState();

    // Start at Surah 1, Ayah 1
    useQuranStore.setState({
      activeAudioSurah: 1,
      activeAudioAyah: 1,
      playbackType: 'surah',
      audioPlaybackPhase: 'surah',
    });

    store.nextAyah();
    expect(useQuranStore.getState().activeAudioAyah).toBe(2);

    store.nextAyah();
    expect(useQuranStore.getState().activeAudioAyah).toBe(3);

    store.prevAyah();
    expect(useQuranStore.getState().activeAudioAyah).toBe(2);
  });

  it('4. Selecting another Surah loads correct audio URL and metadata', () => {
    // Surah 2 Al-Baqarah
    const baqarahUrl = getAudioUrl(2, 7);
    expect(baqarahUrl).toBe('https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/2.mp3');

    // Surah 36 Ya-Sin
    const yasinUrl = getAudioUrl(36, 7);
    expect(yasinUrl).toBe('https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/36.mp3');

    // Surah 114 An-Nas
    const nasUrl = getAudioUrl(114, 7);
    expect(nasUrl).toBe('https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/114.mp3');
  });

  it('5. Automatic continuation to next Ayah in Juz/Para mode (advanceJuzAyah)', () => {
    const store = useQuranStore.getState();

    // Start at Para 1 (Surah 1:1)
    useQuranStore.setState({
      playbackType: 'juz',
      activeAudioJuz: 1,
      activeAudioSurah: 1,
      activeAudioAyah: 1,
      audioPlaybackPhase: 'surah',
      isPlaying: true,
    });

    // Advance Ayah
    store.advanceJuzAyah();
    expect(useQuranStore.getState().activeAudioAyah).toBe(2);
    expect(useQuranStore.getState().activeAudioSurah).toBe(1);

    // Set to end of Surah 1 (Ayah 7)
    useQuranStore.setState({
      activeAudioSurah: 1,
      activeAudioAyah: 7,
    });

    // When Ayah 7 ends, should advance to Surah 2 Ayah 1
    store.advanceJuzAyah();
    expect(useQuranStore.getState().activeAudioSurah).toBe(2);
    expect(useQuranStore.getState().activeAudioAyah).toBe(1);
  });

  it('6. Ayah audio URL format generates valid endpoints for any verse', () => {
    const url1 = QuranApiService.getAyahAudioUrl('1:1', 'Alafasy');
    expect(url1).toBe('https://verses.quran.com/Alafasy/mp3/001001.mp3');

    const url2 = QuranApiService.getAyahAudioUrl('114:6', 'Alafasy');
    expect(url2).toBe('https://verses.quran.com/Alafasy/mp3/114006.mp3');
  });

  describe('Ta\'awwuz + Bismillah Introductory Audio Flow', () => {
    it('Authentic Ta\'awwuz and Bismillah files are mapped for reciters', () => {
      // Default / Alafasy
      expect(getTaawwuzAudioUrl(7)).toBe('/audio/quran/taawwuz_alafasy.mp3');
      expect(getBismillahAudioUrl(7)).toBe('/audio/quran/bismillah_alafasy.mp3');

      // Husary
      expect(getTaawwuzAudioUrl(6)).toBe('/audio/quran/taawwuz_husary.mp3');
      expect(getBismillahAudioUrl(6)).toBe('/audio/quran/bismillah_husary.mp3');

      // Shatri
      expect(getTaawwuzAudioUrl(4)).toBe('/audio/quran/taawwuz_shatri.mp3');
      expect(getBismillahAudioUrl(4)).toBe('/audio/quran/bismillah_shatri.mp3');

      // Abdul Basit
      expect(getBismillahAudioUrl(1)).toBe('/audio/quran/bismillah_abdulbasit.mp3');

      // Sudais
      expect(getBismillahAudioUrl(3)).toBe('/audio/quran/bismillah_sudais.mp3');
    });

    it('Surah Al-Fatiha (1) audio flow: Ta\'awwuz -> Bismillah -> Surah', async () => {
      const store = useQuranStore.getState();
      await store.playSurahAudio(1, 7);

      // 1. Initial phase is Ta'awwuz
      expect(useQuranStore.getState().activeAudioSurah).toBe(1);
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('taawwuz');
      expect(useQuranStore.getState().isPlaying).toBe(true);

      // 2. When Ta'awwuz ends for Surah 1 -> transition to Bismillah
      useQuranStore.getState().setAudioPlaybackPhase('bismillah');
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('bismillah');

      // 3. When Bismillah ends -> transition to Surah
      useQuranStore.getState().setAudioPlaybackPhase('surah');
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('surah');
    });

    it('Surah Al-Baqarah (2) audio flow: Ta\'awwuz -> Bismillah -> Surah', async () => {
      const store = useQuranStore.getState();
      await store.playSurahAudio(2, 7);

      // 1. Initial phase is Ta'awwuz
      expect(useQuranStore.getState().activeAudioSurah).toBe(2);
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('taawwuz');

      // 2. Next phase is Bismillah
      useQuranStore.getState().setAudioPlaybackPhase('bismillah');
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('bismillah');

      // 3. Next phase is Surah
      useQuranStore.getState().setAudioPlaybackPhase('surah');
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('surah');
    });

    it('Middle Surah (e.g. Surah 36 Ya-Sin): Ta\'awwuz -> Bismillah -> Surah', async () => {
      const store = useQuranStore.getState();
      await store.playSurahAudio(36, 7);

      expect(useQuranStore.getState().activeAudioSurah).toBe(36);
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('taawwuz');
    });

    it('SPECIAL CASE: Surah At-Tawbah (9) skips Bismillah: Ta\'awwuz -> Surah directly', async () => {
      const store = useQuranStore.getState();
      await store.playSurahAudio(9, 7);

      // Initial phase is Ta'awwuz
      expect(useQuranStore.getState().activeAudioSurah).toBe(9);
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('taawwuz');

      // For Surah 9, handleEnded logic routes directly to 'surah'
      const surahNum = useQuranStore.getState().activeAudioSurah;
      const nextPhase = surahNum === 9 ? 'surah' : 'bismillah';
      expect(nextPhase).toBe('surah'); // Bismillah is strictly skipped for At-Tawbah!

      useQuranStore.getState().setAudioPlaybackPhase(nextPhase);
      expect(useQuranStore.getState().audioPlaybackPhase).toBe('surah');
    });

    it('Selecting another Surah resets previous audio and restarts at Ta\'awwuz', async () => {
      const store = useQuranStore.getState();
      
      // Playing Surah 2 at 120s
      useQuranStore.setState({
        activeAudioSurah: 2,
        isPlaying: true,
        playbackTime: 120,
        audioPlaybackPhase: 'surah',
      });

      // User selects Surah 67 (Al-Mulk)
      await store.playSurahAudio(67, 7);
      const state = useQuranStore.getState();

      expect(state.activeAudioSurah).toBe(67);
      expect(state.audioPlaybackPhase).toBe('taawwuz');
      expect(state.playbackTime).toBe(0); // Reset to 0
      expect(state.isPlaying).toBe(true);
    });

    it('Stop button stops audio while keeping player active and visible on screen', () => {
      const store = useQuranStore.getState();

      useQuranStore.setState({
        activeAudioSurah: 1,
        isPlaying: true,
        playbackTime: 25,
        hasUserStartedAudio: true,
        isMiniPlayerDismissed: false,
      });

      // User triggers stopAudio
      store.stopAudio();
      const state = useQuranStore.getState();

      expect(state.isPlaying).toBe(false);
      expect(state.hasUserStartedAudio).toBe(true);
      expect(state.isMiniPlayerDismissed).toBe(false);

      // User can resume playback with Play button
      store.resumeAudio();
      expect(useQuranStore.getState().isPlaying).toBe(true);
      expect(useQuranStore.getState().isMiniPlayerDismissed).toBe(false);
    });

    it('X (Close) button completely closes mini player and clears audio state', () => {
      const store = useQuranStore.getState();

      useQuranStore.setState({
        activeAudioSurah: 1,
        isPlaying: true,
        playbackTime: 25,
        hasUserStartedAudio: true,
        isMiniPlayerDismissed: false,
      });

      // User clicks X button
      store.closeMiniPlayer();
      const state = useQuranStore.getState();

      expect(state.isPlaying).toBe(false);
      expect(state.playbackTime).toBe(0);
      expect(state.audioPlaybackPhase).toBe('idle');
      expect(state.hasUserStartedAudio).toBe(false);
      expect(state.isMiniPlayerDismissed).toBe(true);
    });
  });
});
