import React, { useEffect, useRef, useState } from 'react';
import { useKanzulImanAudioStore, TranslationLanguage } from '../../stores/useKanzulImanAudioStore';
import { SURAHS_LIST, JUZ_LIST } from '../../data/quranData';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Languages,
  RotateCw as AutoPlayIcon,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const KanzulImanAudioStudio: React.FC = () => {
  const {
    playbackScope,
    currentSurahNumber,
    currentJuzNumber,
    currentAyahNumber,
    currentAyahs,
    isLoadingAyahs,
    playingAyahKey,
    playbackPhase,
    selectedLanguage,
    currentPartIndex,
    totalPartsInSurah,
    currentTrackTitle,
    currentTracks,
    isPlaying,
    audioError,
    isAutoPlay,
    playbackSpeed,
    audioVolume,
    playbackTime,
    playbackDuration,
    setSelectedLanguage,
    setPlaybackSpeed,
    setAudioVolume,
    toggleAutoPlay,
    setPartIndex,
    loadSurahData,
    loadJuzData,
    playSurah,
    playKanzulImanSurah,
    playJuz,
    playAyah,
    togglePlay,
    togglePlayAyahCard,
    nextTrack,
    prevTrack,
    nextAyah,
    prevAyah,
    seekAudio,
    skipTime,
  } = useKanzulImanAudioStore();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);
  const activeAyahRef = useRef<HTMLDivElement | null>(null);

  // Load initial Surah data if empty
  useEffect(() => {
    if (currentAyahs.length === 0) {
      if (playbackScope === 'juz' && currentJuzNumber) {
        loadJuzData(currentJuzNumber);
      } else {
        loadSurahData(currentSurahNumber || 1);
      }
    }
  }, [currentSurahNumber, currentJuzNumber, playbackScope]);

  // Auto-scroll active Ayah into view smoothly
  useEffect(() => {
    if (isPlaying && activeAyahRef.current) {
      activeAyahRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [playingAyahKey, isPlaying]);

  const currentSurahMeta = SURAHS_LIST[currentSurahNumber - 1] || SURAHS_LIST[0];
  const currentJuzMeta = currentJuzNumber ? JUZ_LIST[currentJuzNumber - 1] : null;

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return '00:00';
    const totalSecs = Math.floor(sec);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${String(hours).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setAudioVolume(0.9);
      setIsMuted(false);
    } else {
      setAudioVolume(0);
      setIsMuted(true);
    }
  };

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sNum = parseInt(e.target.value, 10);
    if (!isNaN(sNum)) {
      playSurah(sNum, 1);
    }
  };

  const handleJuzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jNum = parseInt(e.target.value, 10);
    if (!isNaN(jNum)) {
      playJuz(jNum);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseFloat(e.target.value);
    seekAudio(seconds);
  };

  const handleLanguageSelect = (lang: TranslationLanguage) => {
    setSelectedLanguage(lang);
  };

  const handleCopyAyah = (arabicText: string, urduTranslation: string, verseKey: string) => {
    const text = `${arabicText}\n\n${urduTranslation}\n[Kanz-ul-Iman — ${verseKey}]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAyahKey(verseKey);
      setTimeout(() => setCopiedAyahKey(null), 2000);
    });
  };

  return (
    <div className="kanzul-audio-container" style={{ width: '100%', maxWidth: 880, margin: '0 auto' }}>
      {/* Clean Player Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          backgroundColor: 'var(--bg-surface)',
          border: isPlaying ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
          boxShadow: isPlaying ? '0 10px 32px rgba(245, 158, 11, 0.15)' : 'var(--shadow-md)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Top Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: isPlaying
              ? 'linear-gradient(90deg, #f59e0b, #10b981, #f59e0b)'
              : 'linear-gradient(90deg, var(--border-default), var(--brand-gold), var(--border-default))',
          }}
        />

        {/* Section 1: Language Switcher & Authentic Source Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Languages size={18} className="text-amber-400" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Audio Rendition:
            </span>
          </div>

          {/* Language Buttons: [ Urdu (Kanz-ul-Iman) ] [ English ] */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              id="lang-select-urdu"
              onClick={() => handleLanguageSelect('urdu')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedLanguage === 'urdu' ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                backgroundColor: selectedLanguage === 'urdu' ? 'var(--brand-gold)' : 'var(--bg-surface)',
                color: selectedLanguage === 'urdu' ? '#000' : 'var(--text-secondary)',
                boxShadow: selectedLanguage === 'urdu' ? '0 2px 10px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
              title="Select Authentic Urdu Kanz-ul-Iman Audio (Paigham-e-Raza)"
            >
              <span>{selectedLanguage === 'urdu' ? '●' : '○'}</span>
              <span>Urdu (Kanz-ul-Iman)</span>
            </button>

            <button
              type="button"
              id="lang-select-english"
              onClick={() => handleLanguageSelect('english')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedLanguage === 'english' ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                backgroundColor: selectedLanguage === 'english' ? 'var(--brand-gold)' : 'var(--bg-surface)',
                color: selectedLanguage === 'english' ? '#000' : 'var(--text-secondary)',
                boxShadow: selectedLanguage === 'english' ? '0 2px 10px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
              title="Select English Translation Audio"
            >
              <span>{selectedLanguage === 'english' ? '●' : '○'}</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Source Badge & Authenticity Credit */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            padding: '6px 12px',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-5)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} className="text-amber-400" />
            <span>
              {selectedLanguage === 'urdu' ? (
                <>
                  Authentic <strong>Kanz-ul-Iman</strong> Tilawat & Urdu Translation •{' '}
                  <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>
                    Ala Hazrat Imam Ahmad Raza Khan
                  </span>{' '}
                  (Paigham-e-Raza)
                </>
              ) : (
                <>
                  Authentic <strong>Quran & English Translation</strong> Recitation •{' '}
                  <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>
                    Mishary Rashid Alafasy & Ibrahim Walk
                  </span>
                </>
              )}
            </span>
          </div>

          {selectedLanguage === 'urdu' && (
            <a
              href="https://archive.org/details/kanzuliman_201907"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--brand-gold)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              title="View on Internet Archive"
            >
              <span>Archive.org</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Section 2: Surah & Para Selectors + Controls */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            marginBottom: totalPartsInSurah > 1 ? 'var(--space-3)' : 'var(--space-5)',
          }}
        >
          {/* Surah Selector */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <label
              htmlFor="audio-surah-select"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4,
              }}
            >
              Surah
            </label>
            <select
              id="audio-surah-select"
              value={currentSurahNumber}
              onChange={handleSurahChange}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {SURAHS_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.arabicName})
                </option>
              ))}
            </select>
          </div>

          {/* Para Selector */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <label
              htmlFor="audio-para-select"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4,
              }}
            >
              Para / Juz
            </label>
            <select
              id="audio-para-select"
              value={currentJuzNumber || 1}
              onChange={handleJuzChange}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {JUZ_LIST.map((j) => (
                <option key={j.number} value={j.number}>
                  Para {j.number} — {j.name} ({j.arabicName})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div style={{ width: 100 }}>
            <label
              htmlFor="audio-speed-select"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4,
              }}
            >
              Speed
            </label>
            <select
              id="audio-speed-select"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value={0.75}>0.75x</option>
              <option value={1.0}>1.0x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>
          </div>

          {/* Auto Play Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={toggleAutoPlay}
              style={{
                height: 40,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                border: isAutoPlay ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                backgroundColor: isAutoPlay ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)',
                color: isAutoPlay ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
              title={isAutoPlay ? 'Auto Play Next enabled' : 'Auto Play disabled'}
            >
              <AutoPlayIcon size={14} className={isAutoPlay && isPlaying ? 'animate-spin' : ''} />
              <span>Auto Play: {isAutoPlay ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Part Audio Tabs (for long Surahs like Al-Baqarah, Ali Imran, An-Nisa, etc.) */}
        {selectedLanguage === 'urdu' && totalPartsInSurah > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--space-5)',
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Surah Parts:
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {currentTracks.map((track, idx) => {
                const isPartActive = currentPartIndex === idx;
                return (
                  <button
                    key={track.fileName}
                    type="button"
                    onClick={() => setPartIndex(idx)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: isPartActive ? 700 : 500,
                      backgroundColor: isPartActive ? 'var(--brand-gold)' : 'var(--bg-surface)',
                      color: isPartActive ? '#000' : 'var(--text-primary)',
                      border: isPartActive ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: isPartActive ? '0 2px 8px rgba(245, 158, 11, 0.25)' : 'none',
                    }}
                  >
                    <span>Part {idx + 1}</span>
                    <span style={{ fontSize: '0.72rem', opacity: isPartActive ? 0.9 : 0.6 }}>
                      ({formatTime(track.duration)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Central Audio Information & Live Phase Status */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <div
            className="mushaf-text"
            dir="rtl"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              color: 'var(--brand-gold)',
              lineHeight: 1.4,
              marginBottom: 4,
            }}
          >
            {playbackScope === 'juz' && currentJuzMeta
              ? currentJuzMeta.arabicName
              : `سورۃ ${currentSurahMeta.arabicName.replace(/^(سورۃ|سورة|سُورَةُ)\s*/, '')}`}
          </div>

          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            {playbackScope === 'juz' && currentJuzMeta
              ? `Para ${currentJuzMeta.number}: ${currentJuzMeta.name}`
              : `Surah ${currentSurahMeta.number}. ${currentSurahMeta.name}`}
          </h3>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isPlaying
                ? 'rgba(245, 158, 11, 0.15)'
                : 'var(--bg-surface-elevated)',
              color: isPlaying ? 'var(--brand-gold)' : 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {isPlaying ? (
              <>
                <span className="animate-pulse text-amber-400">●</span>
                <span>
                  {selectedLanguage === 'urdu'
                    ? `Playing Kanz-ul-Iman ${totalPartsInSurah > 1 ? `(Part ${currentPartIndex + 1} of ${totalPartsInSurah})` : ''}`
                    : playbackPhase === 'arabic'
                    ? `Playing Arabic — Ayah ${currentAyahNumber}`
                    : `Playing English Translation — Ayah ${currentAyahNumber}`}
                </span>
              </>
            ) : (
              <span>
                {selectedLanguage === 'urdu'
                  ? `Kanz-ul-Iman Audio • ${totalPartsInSurah > 1 ? `Part ${currentPartIndex + 1} of ${totalPartsInSurah}` : 'Full Surah'}`
                  : `Ayah ${currentAyahNumber} of ${currentAyahs.length || currentSurahMeta.versesCount}`}
              </span>
            )}
          </div>

          {/* Audio Error Alert & Retry Button */}
          {audioError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}
            >
              <span>⚠️ {audioError}</span>
              <button
                type="button"
                onClick={() => {
                  if (selectedLanguage === 'urdu') {
                    playKanzulImanSurah(currentSurahNumber, currentPartIndex);
                  } else {
                    playAyah(currentSurahNumber, currentAyahNumber);
                  }
                }}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid #f87171',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar & Timers */}
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <input
            type="range"
            min={0}
            max={playbackDuration || 100}
            step={0.5}
            value={playbackTime || 0}
            onChange={handleSeek}
            aria-label="Audio Timeline Scrubber"
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              accentColor: 'var(--brand-gold)',
              cursor: 'pointer',
              background: `linear-gradient(to right, var(--brand-gold) 0%, var(--brand-gold) ${
                playbackDuration > 0 ? Math.min(100, (playbackTime / playbackDuration) * 100) : 0
              }%, var(--border-default) ${
                playbackDuration > 0 ? Math.min(100, (playbackTime / playbackDuration) * 100) : 0
              }%, var(--border-default) 100%)`,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: 6,
            }}
          >
            <span>{formatTime(playbackTime)}</span>
            <span>{formatTime(playbackDuration)}</span>
          </div>
        </div>

        {/* Main Controls Row: Prev, Skip -10s, Play/Pause, Skip +10s, Next */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
          }}
        >
          {/* Previous Track / Ayah */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={selectedLanguage === 'urdu' ? prevTrack : prevAyah}
            disabled={selectedLanguage === 'urdu' ? (currentSurahNumber <= 1 && currentPartIndex <= 0) : currentAyahNumber <= 1}
            title={selectedLanguage === 'urdu' ? 'Previous Part / Surah' : 'Previous Ayah'}
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkipBack size={20} />
          </button>

          {/* Skip -10s */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => skipTime(-10)}
            title="Rewind 10 Seconds"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCcw size={18} />
          </button>

          {/* Large Play / Pause Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={togglePlay}
            title={isPlaying ? 'Pause Audio' : 'Play Audio'}
            style={{
              width: 60,
              height: 60,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--brand-gold)',
              color: '#000',
              boxShadow: '0 6px 22px rgba(245, 158, 11, 0.45)',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform var(--transition-fast)',
            }}
          >
            {isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
          </button>

          {/* Skip +10s */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => skipTime(10)}
            title="Forward 10 Seconds"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCw size={18} />
          </button>

          {/* Next Track / Ayah */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={selectedLanguage === 'urdu' ? nextTrack : nextAyah}
            disabled={
              selectedLanguage === 'urdu'
                ? (currentSurahNumber >= 114 && currentPartIndex >= totalPartsInSurah - 1)
                : currentAyahNumber >= currentAyahs.length
            }
            title={selectedLanguage === 'urdu' ? 'Next Part / Surah' : 'Next Ayah'}
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Volume & Details Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Audio Source:</span>
            <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>
              {selectedLanguage === 'urdu'
                ? `Internet Archive (kanzuliman_201907) • ${currentTrackTitle}`
                : 'Quran.com Recitation + Ibrahim Walk English'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{ padding: 4 }}
            >
              {isMuted || audioVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : audioVolume}
              onChange={(e) => {
                setAudioVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              style={{ width: 80, accentColor: 'var(--brand-gold)' }}
              aria-label="Volume Slider"
            />
          </div>
        </div>
      </div>

      {/* Synchronized Ayah Reading & Translation List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            padding: '0 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Surah {currentSurahMeta.name} — Verses & Translation ({currentAyahs.length})</span>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
            Authentic Kanz-ul-Iman Text
          </span>
        </div>

        {isLoadingAyahs ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div className="animate-spin inline-block mb-2">⏳</div>
            <p>Loading verses...</p>
          </div>
        ) : (
          currentAyahs.map((ayah) => {
            const verseKey = ayah.verseKey || `${currentSurahNumber}:${ayah.ayahNumber}`;
            const isActive = playingAyahKey === verseKey;
            const isCopied = copiedAyahKey === verseKey;

            return (
              <div
                key={verseKey}
                ref={isActive ? activeAyahRef : null}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px 20px',
                  backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: isActive ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 4px 20px rgba(245, 158, 11, 0.08)' : 'var(--shadow-sm)',
                }}
              >
                {/* Ayah Header Row: Number Badge, Verse Key, Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? 'var(--brand-gold)' : 'var(--bg-surface-elevated)',
                        color: isActive ? '#000' : 'var(--brand-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {ayah.ayahNumber}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {verseKey}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => handleCopyAyah(ayah.arabicText, ayah.kanzulImanUrdu, verseKey)}
                      title="Copy Ayah with Kanz-ul-Iman translation"
                      style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-emerald-500" />
                          <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)' }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span style={{ fontSize: '0.72rem' }}>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-xs btn-outline-primary"
                      onClick={() => togglePlayAyahCard(currentSurahNumber, ayah.ayahNumber)}
                      title="Play from this Ayah"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      <Play size={12} style={{ marginRight: 4 }} />
                      <span>Play</span>
                    </button>
                  </div>
                </div>

                {/* Arabic Quranic Text */}
                <div
                  className="mushaf-text"
                  dir="rtl"
                  style={{
                    fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
                    color: isActive ? 'var(--brand-gold)' : 'var(--text-primary)',
                    textAlign: 'right',
                    lineHeight: 1.8,
                    padding: '6px 0',
                  }}
                >
                  {ayah.arabicText}
                </div>

                {/* Urdu Kanz-ul-Iman Translation in Nastaliq Typography */}
                {ayah.kanzulImanUrdu && (
                  <div
                    dir="rtl"
                    style={{
                      fontFamily: 'var(--font-urdu, "Noto Nastaliq Urdu", serif)',
                      fontSize: '1.15rem',
                      lineHeight: 2.2,
                      color: 'var(--brand-gold)',
                      textAlign: 'right',
                      backgroundColor: 'rgba(245, 158, 11, 0.05)',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-lg)',
                      borderRight: '3px solid var(--brand-gold)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontFamily: 'sans-serif' }}>
                      کنز الایمان:
                    </span>
                    {ayah.kanzulImanUrdu}
                  </div>
                )}

                {/* English Translation */}
                {ayah.kanzulImanEnglish && selectedLanguage === 'english' && (
                  <div
                    style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid var(--brand-primary)',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: 2 }}>
                      English Translation:
                    </span>
                    {ayah.kanzulImanEnglish}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
