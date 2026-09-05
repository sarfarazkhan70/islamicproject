import React, { useEffect, useRef } from 'react';
import {
  useQuranStore,
  getAudioUrl,
  getTaawwuzAudioUrl,
  getBismillahAudioUrl,
} from '../../stores/useQuranStore';

export const GlobalQuranAudioController: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    activeAudioSurah,
    selectedReciterId,
    audioRecitationUrl,
    audioPlaybackPhase,
    isPlaying,
    audioVolume,
    playbackSpeed,
    isLooping,
    autoPlayNext,
    seekTarget,
    setPlaybackTime,
    setPlaybackDuration,
    setIsPlaying,
    setAudioPlaybackPhase,
    clearSeekTarget,
    playSurahAudio,
    pauseAudio,
  } = useQuranStore();

  // Determine active audio URL based on current playback phase (Ta'awwuz -> Bismillah -> Surah)
  const getPhaseAudioUrl = (): string => {
    if (audioPlaybackPhase === 'taawwuz') {
      return getTaawwuzAudioUrl(selectedReciterId);
    }
    if (audioPlaybackPhase === 'bismillah') {
      return getBismillahAudioUrl(selectedReciterId);
    }
    return audioRecitationUrl || getAudioUrl(activeAudioSurah, selectedReciterId);
  };

  const audioUrl = getPhaseAudioUrl();

  // Sync audio source when phase, Surah, or reciter changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentSrc = audio.getAttribute('data-src');
    if (currentSrc !== audioUrl) {
      audio.setAttribute('data-src', audioUrl);
      audio.src = audioUrl;
      audio.playbackRate = playbackSpeed || 1.0;
      audio.load();

      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Audio play error:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [audioUrl, isPlaying, setIsPlaying, playbackSpeed]);

  // Sync play / pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play request prevented by browser policy or network:', err);
          setIsPlaying(false);
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed || 1.0;
    }
  }, [playbackSpeed]);

  // Sync looping (only for main surah phase)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping && audioPlaybackPhase === 'surah';
    }
  }, [isLooping, audioPlaybackPhase]);

  // Handle explicit seek requests
  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      if (audioPlaybackPhase !== 'surah') {
        // If user seeks during intro, jump immediately into the main surah
        setAudioPlaybackPhase('surah');
      }
      audioRef.current.currentTime = seekTarget;
      clearSeekTarget();
    }
  }, [seekTarget, audioPlaybackPhase, setAudioPlaybackPhase, clearSeekTarget]);

  // Audio event listeners
  const handleTimeUpdate = () => {
    if (audioRef.current && audioPlaybackPhase === 'surah') {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioPlaybackPhase === 'surah') {
      const dur = audioRef.current.duration;
      if (!isNaN(dur) && isFinite(dur)) {
        setPlaybackDuration(dur);
      }
    }
  };

  const handleEnded = () => {
    // 1. If Ta'awwuz just finished
    if (audioPlaybackPhase === 'taawwuz') {
      // Surah 1 (Al-Fatihah) has Bismillah as Ayah 1:1 -> transition directly to Surah without duplicate Bismillah
      // Surah 9 (At-Tawbah) has no Bismillah -> transition directly to Surah
      if (activeAudioSurah === 1 || activeAudioSurah === 9) {
        setAudioPlaybackPhase('surah');
      } else {
        // All other Surahs (2-8, 10-114) play Bismillah next
        setAudioPlaybackPhase('bismillah');
      }
      return;
    }

    // 2. If Bismillah just finished
    if (audioPlaybackPhase === 'bismillah') {
      setAudioPlaybackPhase('surah');
      return;
    }

    // 3. Main Surah finished
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (autoPlayNext && activeAudioSurah < 114) {
      playSurahAudio(activeAudioSurah + 1, selectedReciterId);
    } else {
      pauseAudio();
    }
  };

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  return (
    <audio
      ref={audioRef}
      id="global-quran-audio-element"
      style={{ display: 'none' }}
      preload="auto"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onPlay={handlePlay}
      onPause={handlePause}
    />
  );
};
