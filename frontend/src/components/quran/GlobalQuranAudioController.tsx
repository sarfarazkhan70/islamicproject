import React, { useEffect, useRef } from 'react';
import {
  useQuranStore,
  getAudioUrl,
  getTaawwuzAudioUrl,
  getBismillahAudioUrl,
} from '../../stores/useQuranStore';
import { QURAN_COM_RECITERS } from '../../data/quranData';
import { QuranApiService } from '../../services/quranApiService';

export const GlobalQuranAudioController: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    playbackType,
    activeAudioSurah,
    activeAudioAyah,
    selectedReciterId,
    audioRecitationUrl,
    audioPlaybackPhase,
    isPlaying,
    audioVolume,
    playbackSpeed,
    isLooping,
    autoPlayNext,
    seekTarget,
    playbackDuration,
    setPlaybackTime,
    setPlaybackDuration,
    setAudioPlaybackPhase,
    clearSeekTarget,
    playSurahAudio,
    advanceJuzAyah,
    pauseAudio,
  } = useQuranStore();

  // Determine active audio URL based on current playback phase (Ta'awwuz -> Bismillah -> Surah/Ayah)
  const getPhaseAudioUrl = (): string => {
    if (audioPlaybackPhase === 'taawwuz') {
      return getTaawwuzAudioUrl(selectedReciterId);
    }
    if (audioPlaybackPhase === 'bismillah') {
      return getBismillahAudioUrl(selectedReciterId);
    }
    if (audioPlaybackPhase === 'surah') {
      if (playbackType === 'juz') {
        const reciterObj =
          QURAN_COM_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_COM_RECITERS[0];
        const reciterSlug = reciterObj.reciterSlug || 'Alafasy';
        return QuranApiService.getAyahAudioUrl(
          `${activeAudioSurah}:${activeAudioAyah || 1}`,
          reciterSlug
        );
      }
      return audioRecitationUrl || getAudioUrl(activeAudioSurah, selectedReciterId);
    }
    return '';
  };

  const audioUrl = getPhaseAudioUrl();

  // Sync audio source when phase, Surah, Ayah, or reciter changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioPlaybackPhase === 'idle') {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.removeAttribute('data-src');
      audio.load();
      return;
    }

    if (!audioUrl) return;

    const currentSrc = audio.getAttribute('data-src');
    if (currentSrc !== audioUrl) {
      audio.setAttribute('data-src', audioUrl);
      audio.src = audioUrl;
      audio.playbackRate = playbackSpeed || 1.0;

      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Audio play request interrupted or prevented:', err);
            }
          });
        }
      }
    }
  }, [audioUrl, audioPlaybackPhase, isPlaying, playbackSpeed]);

  // Sync play / pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying || audioPlaybackPhase === 'idle') {
      if (!audio.paused) {
        audio.pause();
      }
    } else if (isPlaying && audioUrl) {
      if (audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Audio play request failed:', err);
            }
          });
        }
      }
    }
  }, [isPlaying, audioUrl, audioPlaybackPhase]);

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

  // Sync looping (only for main surah phase in surah mode)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping && audioPlaybackPhase === 'surah' && playbackType === 'surah';
    }
  }, [isLooping, audioPlaybackPhase, playbackType]);

  // Handle explicit seek requests
  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      if (audioPlaybackPhase !== 'surah') {
        // If user seeks during intro, jump immediately into the main surah
        setAudioPlaybackPhase('surah');
      }
      audioRef.current.currentTime = seekTarget;
      setPlaybackTime(seekTarget);
      clearSeekTarget();
    }
  }, [seekTarget, audioPlaybackPhase, setAudioPlaybackPhase, clearSeekTarget, setPlaybackTime]);

  // Pre-load Surah audio duration whenever active Surah or Reciter changes
  useEffect(() => {
    if (playbackType === 'surah' && activeAudioSurah) {
      const url = audioRecitationUrl || getAudioUrl(activeAudioSurah, selectedReciterId);
      if (url) {
        const temp = new Audio(url);
        temp.preload = 'metadata';
        const onMeta = () => {
          if (!isNaN(temp.duration) && isFinite(temp.duration) && temp.duration > 0) {
            setPlaybackDuration(temp.duration);
          }
        };
        temp.addEventListener('loadedmetadata', onMeta);
        temp.addEventListener('durationchange', onMeta);
        return () => {
          temp.removeEventListener('loadedmetadata', onMeta);
          temp.removeEventListener('durationchange', onMeta);
          temp.src = '';
        };
      }
    }
  }, [activeAudioSurah, selectedReciterId, audioRecitationUrl, playbackType, setPlaybackDuration]);

  // Audio event listeners
  const handleTimeUpdate = () => {
    if (audioRef.current && audioPlaybackPhase === 'surah') {
      const cur = audioRef.current.currentTime;
      setPlaybackTime(cur);
      const dur = audioRef.current.duration;
      if (!isNaN(dur) && isFinite(dur) && dur > 0 && Math.abs(dur - playbackDuration) > 1) {
        setPlaybackDuration(dur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioPlaybackPhase === 'surah') {
      const dur = audioRef.current.duration;
      if (!isNaN(dur) && isFinite(dur) && dur > 0) {
        setPlaybackDuration(dur);
      }
    }
  };

  const handleEnded = () => {
    // 1. If Ta'awwuz just finished
    if (audioPlaybackPhase === 'taawwuz') {
      // Special case: Surah 9 (At-Tawbah) has NO Bismillah -> transition directly to Surah
      if (activeAudioSurah === 9) {
        setAudioPlaybackPhase('surah');
      } else {
        // All other Surahs (1..114 except 9) transition to Bismillah
        setAudioPlaybackPhase('bismillah');
      }
      return;
    }

    // 2. If Bismillah just finished
    if (audioPlaybackPhase === 'bismillah') {
      setAudioPlaybackPhase('surah');
      return;
    }

    // 3. Main Surah / Ayah finished
    if (audioPlaybackPhase === 'surah') {
      if (playbackType === 'juz') {
        advanceJuzAyah();
        return;
      }

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
        const finalDur = audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0
          ? audioRef.current.duration
          : playbackDuration;
        setPlaybackTime(finalDur);
        pauseAudio();
        setAudioPlaybackPhase('idle');
      }
    }
  };

  const handleError = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // If failed during taawwuz phase, advance to next phase
    if (audioPlaybackPhase === 'taawwuz') {
      if (activeAudioSurah === 9) {
        setAudioPlaybackPhase('surah');
      } else {
        setAudioPlaybackPhase('bismillah');
      }
      return;
    }

    // If failed during bismillah phase, advance to surah
    if (audioPlaybackPhase === 'bismillah') {
      setAudioPlaybackPhase('surah');
      return;
    }

    // If failed during surah phase, fallback to standard high-availability server
    if (audioPlaybackPhase === 'surah' && activeAudioSurah) {
      const fallbackUrl = getAudioUrl(activeAudioSurah, selectedReciterId);
      if (audio.getAttribute('data-src') !== fallbackUrl) {
        audio.setAttribute('data-src', fallbackUrl);
        audio.src = fallbackUrl;
        if (isPlaying) {
          audio.play().catch(() => {});
        }
      }
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
      onDurationChange={handleLoadedMetadata}
      onEnded={handleEnded}
      onError={handleError}
    />
  );
};
