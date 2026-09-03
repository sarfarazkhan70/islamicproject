import React, { useEffect, useRef } from 'react';
import { useQuranStore, getAudioUrl } from '../../stores/useQuranStore';

export const GlobalQuranAudioController: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    activeAudioSurah,
    selectedReciterId,
    audioRecitationUrl,
    isPlaying,
    audioVolume,
    playbackSpeed,
    isLooping,
    autoPlayNext,
    seekTarget,
    setPlaybackTime,
    setPlaybackDuration,
    setIsPlaying,
    clearSeekTarget,
    playSurahAudio,
    pauseAudio,
  } = useQuranStore();

  const audioUrl = audioRecitationUrl || getAudioUrl(activeAudioSurah, selectedReciterId);

  // Sync audio source when Surah or reciter changes
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
        audio.play().catch(() => {
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

  // Sync looping
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Handle explicit seek requests
  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      audioRef.current.currentTime = seekTarget;
      clearSeekTarget();
    }
  }, [seekTarget, clearSeekTarget]);

  // Audio event listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (!isNaN(dur) && isFinite(dur)) {
        setPlaybackDuration(dur);
      }
    }
  };

  const handleEnded = () => {
    if (isLooping) {
      return; // Handled by audio.loop
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
      preload="metadata"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onPlay={handlePlay}
      onPause={handlePause}
    />
  );
};
