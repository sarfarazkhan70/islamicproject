import React, { useEffect, useRef, useState } from 'react';
import { useKanzulImanAudioStore } from '../../stores/useKanzulImanAudioStore';
import { SURAHS_LIST } from '../../data/quranData';
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
  ChevronDown,
  Search,
  Check,
} from 'lucide-react';

export function getFullSurahName(surah: { number: number; name: string }): string {
  if (surah.number === 3) {
    return 'Surah Aal-E-Imran';
  }
  const cleanName = surah.name.startsWith('Surah ')
    ? surah.name.replace(/^Surah\s+/, '')
    : surah.name;
  return `Surah ${cleanName}`;
}

export const KanzulImanAudioStudio: React.FC = () => {
  const {
    currentSurahNumber,
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
    setPlaybackSpeed,
    setAudioVolume,
    toggleAutoPlay,
    setPartIndex,
    loadSurahData,
    playSurah,
    playKanzulImanSurah,
    togglePlay,
    nextTrack,
    prevTrack,
    seekAudio,
    skipTime,
  } = useKanzulImanAudioStore();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Surah data on mount
  useEffect(() => {
    loadSurahData(currentSurahNumber || 1);
  }, [currentSurahNumber]);

  // Click outside listener to dismiss Surah dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSurahDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSurahDropdownOpen(false);
      }
    };

    if (isSurahDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSurahDropdownOpen]);

  const currentSurahMeta = SURAHS_LIST[currentSurahNumber - 1] || SURAHS_LIST[0];

  const filteredSurahs = SURAHS_LIST.filter((s) => {
    const q = surahSearchQuery.trim().toLowerCase();
    if (!q) return true;
    const fullName = getFullSurahName(s).toLowerCase();
    return (
      s.number.toString().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      s.arabicName.includes(q) ||
      (s.meaning && s.meaning.toLowerCase().includes(q))
    );
  });

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

  const handleSelectSurah = (surahNumber: number) => {
    playSurah(surahNumber, 1);
    setIsSurahDropdownOpen(false);
    setSurahSearchQuery('');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseFloat(e.target.value);
    seekAudio(seconds);
  };

  return (
    <div
      className="kanzul-audio-container"
      style={{
        width: '100%',
        maxWidth: 880,
        margin: '0 auto',
        paddingBottom: '100px',
      }}
    >
      {/* Clean Audio Studio Player Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--bg-surface)',
          border: isPlaying ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
          boxShadow: isPlaying ? '0 10px 32px rgba(245, 158, 11, 0.15)' : 'var(--shadow-md)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Subtle Top Accent Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderTopLeftRadius: 'var(--radius-xl)',
            borderTopRightRadius: 'var(--radius-xl)',
            background: isPlaying
              ? 'linear-gradient(90deg, #f59e0b, #10b981, #f59e0b)'
              : 'linear-gradient(90deg, var(--border-default), var(--brand-gold), var(--border-default))',
          }}
        />

        {/* Section 1: Authentic Urdu Audio Rendition Badge */}
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

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: 'var(--brand-gold)',
              color: '#000',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
            }}
          >
            <span>●</span>
            <span>Urdu (Kanz-ul-Iman)</span>
          </div>
        </div>

        {/* Section 2: Surah Selector + Speed + AutoPlay Controls */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            marginBottom: totalPartsInSurah > 1 ? 'var(--space-4)' : 'var(--space-5)',
            position: 'relative',
            zIndex: 30,
          }}
        >
          {/* Custom Downward-Opening Surah Selector with Live Search */}
          <div ref={dropdownRef} style={{ flex: '1 1 260px', position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4,
              }}
            >
              Select Surah (114 Surahs)
            </label>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSurahDropdownOpen((prev) => !prev)}
              style={{
                width: '100%',
                height: 42,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: isSurahDropdownOpen ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                boxShadow: isSurahDropdownOpen ? '0 0 0 2px rgba(245, 158, 11, 0.2)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
              title="Click to choose a Surah"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, overflow: 'hidden' }}>
                <span
                  style={{
                    backgroundColor: 'var(--brand-gold)',
                    color: '#000',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}
                >
                  {currentSurahMeta.number}
                </span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                  {getFullSurahName(currentSurahMeta)}
                </span>
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: 'var(--brand-gold)',
                    fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', 'Traditional Arabic', serif",
                    direction: 'rtl',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    lineHeight: 1.4,
                  }}
                >
                  ({currentSurahMeta.arabicName})
                </span>
              </div>

              <ChevronDown
                size={18}
                style={{
                  color: 'var(--text-secondary)',
                  transition: 'transform var(--transition-fast)',
                  transform: isSurahDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Downward Dropdown Menu Panel (Opens strictly BELOW the button) */}
            {isSurahDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '100%',
                  minWidth: 'min(380px, calc(100vw - 32px))',
                  maxWidth: 'calc(100vw - 32px)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                  zIndex: 100,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {/* Search Box Header */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Search size={15} style={{ color: 'var(--text-muted)' }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Surah"
                    value={surahSearchQuery}
                    onChange={(e) => setSurahSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.84rem',
                      color: 'var(--text-primary)',
                    }}
                    aria-label="Search Surah"
                  />
                  {surahSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSurahSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Scrollable 114 Surahs List */}
                <div
                  style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '4px',
                  }}
                >
                  {filteredSurahs.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      No Surah found matching &quot;{surahSearchQuery}&quot;
                    </div>
                  ) : (
                    filteredSurahs.map((s) => {
                      const isSelected = s.number === currentSurahNumber;
                      return (
                        <button
                          key={s.number}
                          type="button"
                          onClick={() => handleSelectSurah(s.number)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                            border: 'none',
                            color: isSelected ? 'var(--brand-gold)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            cursor: 'pointer',
                            fontSize: '0.86rem',
                            fontWeight: isSelected ? 700 : 500,
                            textAlign: 'left',
                            transition: 'background var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                            <span
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: isSelected ? 'var(--brand-gold)' : 'var(--bg-surface-elevated)',
                                color: isSelected ? '#000' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                                flexShrink: 0,
                              }}
                            >
                              {s.number}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {getFullSurahName(s)}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.meaning} • {s.versesCount} Ayahs
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: '1.12rem',
                                fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', 'Traditional Arabic', serif",
                                color: 'var(--brand-gold)',
                                direction: 'rtl',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.5,
                                display: 'inline-block',
                                overflow: 'visible',
                                padding: '0 2px',
                              }}
                            >
                              {s.arabicName}
                            </span>
                            {isSelected && <Check size={16} className="text-amber-400" style={{ flexShrink: 0 }} />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Speed Selector */}
          <div style={{ width: 110, position: 'relative' }}>
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
                height: 42,
                padding: '0 10px',
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
              <option value={1.0}>1.0x (Normal)</option>
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
                height: 42,
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                border: isAutoPlay ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                backgroundColor: isAutoPlay ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)',
                color: isAutoPlay ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
              title={isAutoPlay ? 'Auto Play Next Surah enabled' : 'Auto Play disabled'}
            >
              <AutoPlayIcon size={15} className={isAutoPlay && isPlaying ? 'animate-spin' : ''} />
              <span>Auto Play: {isAutoPlay ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Clean, Balanced, and Equal-Height Part 1 / Part 2 / Part 3 UI */}
        {totalPartsInSurah > 1 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: '14px 18px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--space-5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Surah Audio Parts ({totalPartsInSurah} Parts):
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', fontWeight: 600 }}>
                Continuous Auto-Sequence
              </span>
            </div>

            {/* Balanced Grid of Part Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(totalPartsInSurah, 4)}, minmax(0, 1fr))`,
                gap: '10px',
                alignItems: 'stretch',
              }}
            >
              {currentTracks.map((track, idx) => {
                const isPartActive = currentPartIndex === idx;
                return (
                  <button
                    key={track.fileName}
                    type="button"
                    onClick={() => setPartIndex(idx)}
                    style={{
                      height: 44,
                      padding: '0 12px',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.86rem',
                      fontWeight: isPartActive ? 700 : 500,
                      backgroundColor: isPartActive ? 'var(--brand-gold)' : 'var(--bg-surface)',
                      color: isPartActive ? '#000' : 'var(--text-primary)',
                      border: isPartActive ? '1px solid var(--brand-gold)' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: isPartActive ? '0 4px 14px rgba(245, 158, 11, 0.35)' : 'var(--shadow-xs)',
                      transition: 'all var(--transition-fast)',
                      whiteSpace: 'nowrap',
                    }}
                    title={`Part ${idx + 1}: ${formatTime(track.duration)} (Auto-continuous playback)`}
                  >
                    {isPartActive && isPlaying && (
                      <span style={{ fontSize: '0.7rem' }}>▶</span>
                    )}
                    <span>Part {idx + 1}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        opacity: isPartActive ? 0.9 : 0.65,
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: isPartActive ? 'rgba(0, 0, 0, 0.15)' : 'var(--bg-surface-elevated)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                      }}
                    >
                      {formatTime(track.duration)}
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
            {`سورۃ ${currentSurahMeta.arabicName.replace(/^(سورۃ|سورة|سُورَةُ)\s*/, '')}`}
          </div>

          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            {`Surah ${currentSurahMeta.number}. ${currentSurahMeta.name}`}
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
                  Playing Kanz-ul-Iman {totalPartsInSurah > 1 ? `(Part ${currentPartIndex + 1} of ${totalPartsInSurah} • Auto-Continuous)` : 'Full Surah'}
                </span>
              </>
            ) : (
              <span>
                Kanz-ul-Iman Audio • {totalPartsInSurah > 1 ? `${totalPartsInSurah} Parts Auto-Continuous (Current: Part ${currentPartIndex + 1})` : 'Full Surah'}
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
                  playKanzulImanSurah(currentSurahNumber, currentPartIndex);
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
          {/* Previous Track / Surah Part */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={prevTrack}
            disabled={currentSurahNumber <= 1 && currentPartIndex <= 0}
            title="Previous Part / Surah"
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

          {/* Next Track / Surah Part */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={nextTrack}
            disabled={currentSurahNumber >= 114 && currentPartIndex >= totalPartsInSurah - 1}
            title="Next Part / Surah"
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
              {`Internet Archive (kanzuliman_201907) • ${currentTrackTitle}`}
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
    </div>
  );
};
