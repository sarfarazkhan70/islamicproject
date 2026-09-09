import React, { useEffect, useRef } from 'react';
import { useKanzulImanAudioStore } from '../../stores/useKanzulImanAudioStore';
import { SURAHS_LIST, JUZ_LIST } from '../../data/quranData';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
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
    isPlaying,
    audioVolume,
    playbackTime,
    playbackDuration,
    playbackProgress,
    setAudioVolume,
    loadSurahData,
    loadJuzData,
    playSurah,
    playJuz,
    togglePlay,
    togglePlayAyahCard,
    nextAyah,
    prevAyah,
    seekAudio,
  } = useKanzulImanAudioStore();

  const [isMuted, setIsMuted] = React.useState<boolean>(false);
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
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
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
    const percentage = parseFloat(e.target.value);
    seekAudio(percentage);
  };

  return (
    <div className="kanzul-audio-container" style={{ width: '100%', maxWidth: 840, margin: '0 auto' }}>
      {/* Clean Player Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          backgroundColor: 'var(--bg-surface)',
          border: isPlaying ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
          boxShadow: isPlaying ? '0 8px 30px rgba(245, 158, 11, 0.12)' : 'var(--shadow-md)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Simple Selectors: [Surah] [Para] */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Surah Selector */}
          <div style={{ flex: 1, minWidth: 200 }}>
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
          <div style={{ flex: 1, minWidth: 200 }}>
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
        </div>

        {/* Central Audio Information & Live Phase Status */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            className="mushaf-text"
            dir="rtl"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              color: 'var(--brand-gold)',
              lineHeight: 1.4,
              marginBottom: 6,
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
              padding: '4px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isPlaying
                ? playbackPhase === 'arabic'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)'
                : 'var(--bg-surface-elevated)',
              color: isPlaying
                ? playbackPhase === 'arabic'
                  ? 'var(--brand-primary)'
                  : 'var(--brand-gold)'
                : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {isPlaying ? (
              <>
                <span className="animate-pulse">●</span>
                <span>
                  {playbackPhase === 'arabic'
                    ? `Current Ayah ${currentAyahNumber}: Arabic Recitation`
                    : `Current Ayah ${currentAyahNumber}: Kanzul Iman Urdu Translation Audio`}
                </span>
              </>
            ) : (
              <span>Current Ayah: {currentAyahNumber} of {currentAyahs.length || currentSurahMeta.versesCount}</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={playbackProgress || 0}
            onChange={handleSeek}
            aria-label="Audio Progress"
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              accentColor: 'var(--brand-gold)',
              cursor: 'pointer',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: 4,
            }}
          >
            <span>{formatTime(playbackTime)}</span>
            <span>{formatTime(playbackDuration)}</span>
          </div>
        </div>

        {/* Main Controls: Previous | Play / Pause | Next */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {/* Previous Ayah */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={prevAyah}
            disabled={currentAyahNumber <= 1}
            title="Previous Ayah"
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkipBack size={22} />
          </button>

          {/* Large Play / Pause Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={togglePlay}
            title={isPlaying ? 'Pause Audio' : 'Play Audio'}
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--brand-gold)',
              color: '#000',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
          </button>

          {/* Next Ayah */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={nextAyah}
            disabled={currentAyahNumber >= currentAyahs.length}
            title="Next Ayah"
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SkipForward size={22} />
          </button>
        </div>

        {/* Volume & Sequence Info */}
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
            <span>Audio Sequence:</span>
            <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>
              Arabic Ayah → Kanzul Iman Urdu Translation Audio → Next Ayah
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
              style={{ width: 70, accentColor: 'var(--brand-gold)' }}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* Clean Ayah List (No Written Translation Text Displayed) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            padding: '0 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Surah {currentSurahMeta.name} — Verses ({currentAyahs.length})</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
            Click any verse to start playback
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
            const isArabicPlaying = isActive && playbackPhase === 'arabic';
            const isUrduPlaying = isActive && playbackPhase === 'translation';

            return (
              <div
                key={verseKey}
                ref={isActive ? activeAyahRef : null}
                onClick={() => togglePlayAyahCard(currentSurahNumber, ayah.ayahNumber)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                  padding: '12px 16px',
                  backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: isActive ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {/* Left: Ayah Number & Play Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
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

                  {isArabicPlaying && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                      ● Arabic
                    </span>
                  )}
                  {isUrduPlaying && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
                      ● Urdu Audio
                    </span>
                  )}
                </div>

                {/* Right: Arabic Quran Text Only (No Translation Text Displayed) */}
                <div
                  className="mushaf-text"
                  dir="rtl"
                  style={{
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
                    color: isActive ? 'var(--brand-gold)' : 'var(--text-primary)',
                    textAlign: 'right',
                    lineHeight: 1.6,
                  }}
                >
                  {ayah.arabicText}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
