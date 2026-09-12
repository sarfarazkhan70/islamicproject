import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  X,
  RotateCcw,
  RotateCw,
  Headphones,
} from 'lucide-react';
import { useKanzulImanAudioStore } from '../../stores/useKanzulImanAudioStore';
import { SURAHS_LIST, getJuzByNumber } from '../../data/quranData';
import { getFullSurahName } from './KanzulImanAudioStudio';

const STORAGE_KEY = 'kanzul_iman_mini_player_pos';

interface Position {
  x: number;
  y: number;
}

export const GlobalMiniKanzulImanPlayer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    playbackScope,
    currentSurahNumber,
    currentJuzNumber,
    currentPartIndex,
    totalPartsInSurah,
    isPlaying,
    playbackTime,
    playbackDuration,
    playbackProgress,
    hasUserStartedAudio,
    isMiniPlayerDismissed,
    togglePlay,
    closeMiniPlayer,
    seekAudio,
    skipTime,
  } = useKanzulImanAudioStore();

  // Load saved position from sessionStorage
  const [position, setPosition] = useState<Position | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const dragInfoRef = useRef<{
    startX: number;
    startY: number;
    initialElemX: number;
    initialElemY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialElemX: 0,
    initialElemY: 0,
    hasMoved: false,
  });

  // Clamp position to visible viewport bounds
  const clampPosition = (x: number, y: number, width?: number, height?: number): Position => {
    const elWidth = width ?? containerRef.current?.offsetWidth ?? 380;
    const elHeight = height ?? containerRef.current?.offsetHeight ?? 66;
    const maxX = Math.max(0, window.innerWidth - elWidth - 8);
    const maxY = Math.max(0, window.innerHeight - elHeight - 8);
    return {
      x: Math.min(maxX, Math.max(8, x)),
      y: Math.min(maxY, Math.max(8, y)),
    };
  };

  // Re-clamp position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const clamped = clampPosition(prev.x, prev.y);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
        } catch {}
        return clamped;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validate initial position against viewport once mounted
  useEffect(() => {
    if (position && containerRef.current) {
      const clamped = clampPosition(position.x, position.y);
      if (clamped.x !== position.x || clamped.y !== position.y) {
        setPosition(clamped);
      }
    }
  }, []);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Don't drag if clicking buttons, inputs, or interactive controls
    if (target.closest('button, input, select, a, [data-no-drag]')) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragInfoRef.current = {
      startX: clientX,
      startY: clientY,
      initialElemX: rect.left,
      initialElemY: rect.top,
      hasMoved: false,
    };

    const handlePointerMove = (moveEvt: MouseEvent | TouchEvent) => {
      const currentX =
        'touches' in moveEvt
          ? (moveEvt as TouchEvent).touches[0].clientX
          : (moveEvt as MouseEvent).clientX;
      const currentY =
        'touches' in moveEvt
          ? (moveEvt as TouchEvent).touches[0].clientY
          : (moveEvt as MouseEvent).clientY;

      const deltaX = currentX - dragInfoRef.current.startX;
      const deltaY = currentY - dragInfoRef.current.startY;

      // 4px threshold to distinguish click vs drag
      if (!dragInfoRef.current.hasMoved && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
        dragInfoRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragInfoRef.current.hasMoved) {
        if (moveEvt.cancelable) {
          moveEvt.preventDefault();
        }
        const rawX = dragInfoRef.current.initialElemX + deltaX;
        const rawY = dragInfoRef.current.initialElemY + deltaY;
        const clamped = clampPosition(rawX, rawY);
        setPosition(clamped);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);

      if (dragInfoRef.current.hasMoved) {
        setIsDragging(false);
        if (containerRef.current) {
          const r = containerRef.current.getBoundingClientRect();
          const finalClamped = clampPosition(r.left, r.top, r.width, r.height);
          setPosition(finalClamped);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalClamped));
          } catch {}
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerUp);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (dragInfoRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, [data-no-drag]')) {
      return;
    }
    navigate('/library/kanzul-iman?mode=read');
  };

  const handlePlayToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  const handleSkipBackward = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    skipTime(-10);
  };

  const handleSkipForward = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    skipTime(10);
  };

  const handleClosePlayer = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeMiniPlayer();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || playbackDuration <= 0) return;
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekAudio(ratio * playbackDuration);
  };

  // Hide mini player if user is on the full Kanz-ul-Iman Audio Studio (?mode=listen)
  // or if mini player was dismissed via X or audio was never started
  const isAudioStudioMode =
    location.pathname === '/library/kanzul-iman' && searchParams.get('mode') === 'listen';
  const shouldShow =
    !isAudioStudioMode &&
    !isMiniPlayerDismissed &&
    (hasUserStartedAudio || isPlaying || playbackTime > 0);

  if (!shouldShow) {
    return null;
  }

  const surahMeta = SURAHS_LIST.find((s) => s.number === currentSurahNumber) || SURAHS_LIST[0];
  const juzMeta = currentJuzNumber ? getJuzByNumber(currentJuzNumber) : null;

  const formatTime = (sec: number, forceHours: boolean = false) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) {
      return forceHours ? '00:00:00' : '00:00';
    }
    const totalSeconds = Math.floor(sec);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (forceHours || hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercent =
    playbackDuration > 0
      ? (playbackTime / playbackDuration) * 100
      : playbackProgress * 100;
  const hasHours = playbackDuration >= 3600 || playbackTime >= 3600;

  const partLabel = totalPartsInSurah > 1 ? ` • Part ${currentPartIndex + 1}/${totalPartsInSurah}` : '';

  return (
    <div
      ref={containerRef}
      className={`global-mini-player-container kanzul-iman-mini-player ${isDragging ? 'is-dragging' : ''}`}
      onClick={handleCardClick}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      role="region"
      aria-label="Persistent Draggable Kanz-ul-Iman Audio Player"
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: 'auto',
              bottom: 'auto',
              margin: 0,
            }
          : undefined
      }
    >
      {/* Clickable Progress Bar along top edge */}
      <div
        className="mini-player-progress-bar"
        onClick={handleProgressClick}
        data-no-drag
        title="Click to seek"
        style={{ cursor: 'pointer', height: 4 }}
      >
        <div
          className="mini-player-progress-fill kanzul-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="mini-player-content kanzul-mini-content">
        {/* Audio Icon / Live Sound Wave Badge (No visible number) */}
        <div className="mini-player-badge kanzul-player-badge">
          {isPlaying ? (
            <div className="mini-sound-wave kanzul-sound-wave" aria-hidden="true" style={{ position: 'static', height: 16 }}>
              <span className="wave-bar kanzul-wave-bar" style={{ height: 8 }}></span>
              <span className="wave-bar kanzul-wave-bar" style={{ height: 14 }}></span>
              <span className="wave-bar kanzul-wave-bar" style={{ height: 10 }}></span>
            </div>
          ) : (
            <Headphones size={17} style={{ color: 'var(--brand-gold)' }} />
          )}
        </div>

        {/* Title, Arabic & Time Details */}
        <div className="mini-player-info">
          <div className="mini-player-title-row">
            <span className="mini-player-name kanzul-title-text" title={`${getFullSurahName(surahMeta)}${partLabel}`}>
              {playbackScope === 'juz' && juzMeta ? `${juzMeta.name} (${getFullSurahName(surahMeta)})` : getFullSurahName(surahMeta)}
              <span style={{ fontSize: '0.74rem', opacity: 0.85, fontWeight: 500 }}>
                {partLabel}
              </span>
            </span>
            <span
              className="mini-player-arabic kanzul-arabic"
              dir="rtl"
              style={{
                fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', 'Traditional Arabic', serif",
                fontSize: '1.08rem',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-block',
                overflow: 'visible',
              }}
            >
              {playbackScope === 'juz' && juzMeta ? juzMeta.arabicName : surahMeta.arabicName}
            </span>
          </div>

          <div className="mini-player-subtitle">
            <span className="mini-player-reciter kanzul-reciter-tag">
              Kanz-ul-Iman Urdu
            </span>
            <span className="mini-player-time kanzul-player-time">
              {formatTime(playbackTime, hasHours)} / {formatTime(playbackDuration, hasHours)}
            </span>
          </div>
        </div>

        {/* Essential Action Controls Only: Rewind 10s, Play/Pause, Forward 10s, Close X */}
        <div className="mini-player-actions" data-no-drag>
          {/* 1. Rewind 10s */}
          <button
            type="button"
            className="mini-player-btn skip-btn kanzul-ctrl-btn"
            onClick={handleSkipBackward}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw size={15} />
          </button>

          {/* 2. Play / Pause Toggle Button */}
          <button
            type="button"
            className="mini-player-btn play-btn kanzul-play-btn"
            onClick={handlePlayToggle}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title={isPlaying ? 'Pause Kanz-ul-Iman Recitation' : 'Resume Kanz-ul-Iman Recitation'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={18} strokeWidth={2.5} />
            ) : (
              <Play size={18} style={{ marginLeft: 2 }} />
            )}
          </button>

          {/* 3. Forward 10s */}
          <button
            type="button"
            className="mini-player-btn skip-btn kanzul-ctrl-btn"
            onClick={handleSkipForward}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Forward 10 seconds"
            aria-label="Forward 10 seconds"
          >
            <RotateCw size={15} />
          </button>

          {/* 4. X / Close Button */}
          <button
            type="button"
            className="mini-player-btn close-btn kanzul-close-btn"
            onClick={handleClosePlayer}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Close Audio Player"
            aria-label="Close Audio Player"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
