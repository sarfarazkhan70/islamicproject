import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuranStore } from '../../stores/useQuranStore';
import { SURAHS_LIST, QURAN_COM_RECITERS, getJuzByNumber } from '../../data/quranData';

const STORAGE_KEY = 'islamic_mini_player_pos';

interface Position {
  x: number;
  y: number;
}

export const GlobalMiniQuranPlayer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    playbackType,
    activeAudioJuz,
    activeAudioSurah,
    activeAudioAyah,
    selectedReciterId,
    audioPlaybackPhase,
    isPlaying,
    playbackTime,
    playbackDuration,
    hasUserStartedAudio,
    isMiniPlayerDismissed,
    toggleAudioPlay,
    closeMiniPlayer,
  } = useQuranStore();

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
    const elHeight = height ?? containerRef.current?.offsetHeight ?? 64;
    const maxX = Math.max(0, window.innerWidth - elWidth - 8);
    const maxY = Math.max(0, window.innerHeight - elHeight - 8);
    return {
      x: Math.min(maxX, Math.max(8, x)),
      y: Math.min(maxY, Math.max(8, y)),
    };
  };

  // Re-clamp position on window resize so the player is never lost off-screen
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
    // Don't drag if clicking buttons or interactive controls
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

      // Threshold of 4px movement to distinguish click vs drag
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
        // Persist final position in sessionStorage for current session
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
    // If user dragged the player, do not trigger navigation
    if (dragInfoRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, [data-no-drag]')) {
      return;
    }
    navigate('/quran');
  };

  const handlePlayToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    toggleAudioPlay();
  };

  const handleOpenQuran = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    navigate('/quran');
  };

  const handleClosePlayer = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeMiniPlayer();
  };

  // Hide mini player if user is currently on the Quran page, or if player was closed via X, or never started
  const isQuranPage = location.pathname === '/quran';
  const shouldShow =
    !isQuranPage &&
    !isMiniPlayerDismissed &&
    (hasUserStartedAudio || isPlaying || playbackTime > 0);

  if (!shouldShow) {
    return null;
  }

  const surahMeta = SURAHS_LIST.find((s) => s.number === activeAudioSurah) || SURAHS_LIST[0];
  const juzMeta = activeAudioJuz ? getJuzByNumber(activeAudioJuz) : null;
  const reciterObj =
    QURAN_COM_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_COM_RECITERS[0];

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

  const progressPercent = playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0;
  const hasHours = playbackDuration >= 3600 || playbackTime >= 3600;

  return (
    <div
      ref={containerRef}
      className={`global-mini-player-container ${isDragging ? 'is-dragging' : ''}`}
      onClick={handleCardClick}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      role="region"
      aria-label="Persistent Draggable Quran Audio Player"
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
      {/* Progress Line on top edge */}
      <div className="mini-player-progress-bar">
        <div
          className="mini-player-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="mini-player-content">
        {/* Surah/Juz Icon & Badge */}
        <div className="mini-player-badge">
          <span className="mini-player-surah-num">
            {playbackType === 'juz' && juzMeta ? `J${juzMeta.number}` : surahMeta.number}
          </span>
          {isPlaying && (
            <div className="mini-sound-wave" aria-hidden="true">
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
            </div>
          )}
        </div>

        {/* Surah/Juz Info */}
        <div className="mini-player-info">
          <div className="mini-player-title-row">
            <span className="mini-player-name">
              {playbackType === 'juz' && juzMeta ? `${juzMeta.name} (${surahMeta.name})` : surahMeta.name}
            </span>
            <span className="mini-player-arabic" dir="rtl">
              {playbackType === 'juz' && juzMeta ? juzMeta.arabicName : surahMeta.arabicName}
            </span>
          </div>
          <div className="mini-player-subtitle">
            <span className="mini-player-reciter">
              {audioPlaybackPhase === 'taawwuz'
                ? `Ta'awwuz • ${reciterObj.name}`
                : audioPlaybackPhase === 'bismillah'
                ? `Bismillah • ${reciterObj.name}`
                : playbackType === 'juz' && juzMeta
                ? `${reciterObj.name} (${activeAudioSurah}:${activeAudioAyah || juzMeta.startAyah})`
                : reciterObj.name}
            </span>
            <span className="mini-player-time">
              {formatTime(playbackTime, hasHours)} / {formatTime(playbackDuration, hasHours)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mini-player-actions" data-no-drag>
          <button
            type="button"
            className="mini-player-btn play-btn"
            onClick={handlePlayToggle}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title={isPlaying ? 'Pause Quran Recitation' : 'Resume Quran Recitation'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1.5" />
                <rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="mini-player-btn nav-btn"
            onClick={handleOpenQuran}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Open Quran Reader & Player"
            aria-label="Open Quran"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </button>

          <button
            type="button"
            className="mini-player-btn close-btn"
            onClick={handleClosePlayer}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="Stop and Close Audio"
            aria-label="Stop Audio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
