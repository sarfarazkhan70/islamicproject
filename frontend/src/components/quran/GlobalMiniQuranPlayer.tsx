import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuranStore } from '../../stores/useQuranStore';
import { SURAHS_LIST, QURAN_COM_RECITERS } from '../../data/quranData';

export const GlobalMiniQuranPlayer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    activeAudioSurah,
    selectedReciterId,
    audioPlaybackPhase,
    isPlaying,
    playbackTime,
    playbackDuration,
    toggleAudioPlay,
    stopAudio,
  } = useQuranStore();

  // Hide mini player if user is currently on the Quran page or if no audio has been activated
  const isQuranPage = location.pathname === '/quran';
  const hasAudioActive = isPlaying || playbackTime > 0;

  if (isQuranPage || !hasAudioActive) {
    return null;
  }

  const surahMeta = SURAHS_LIST.find((s) => s.number === activeAudioSurah) || SURAHS_LIST[0];
  const reciterObj =
    QURAN_COM_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_COM_RECITERS[0];

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }
    navigate('/quran');
  };

  const progressPercent = playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0;

  return (
    <div
      className="global-mini-player-container"
      onClick={handleCardClick}
      role="region"
      aria-label="Persistent Quran Audio Player"
    >
      {/* Progress Line on top edge */}
      <div className="mini-player-progress-bar">
        <div
          className="mini-player-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="mini-player-content">
        {/* Surah Icon & Badge */}
        <div className="mini-player-badge">
          <span className="mini-player-surah-num">{surahMeta.number}</span>
          {isPlaying && (
            <div className="mini-sound-wave" aria-hidden="true">
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
              <span className="wave-bar"></span>
            </div>
          )}
        </div>

        {/* Surah Info */}
        <div className="mini-player-info">
          <div className="mini-player-title-row">
            <span className="mini-player-name">{surahMeta.name}</span>
            <span className="mini-player-arabic" dir="rtl">{surahMeta.arabicName}</span>
          </div>
          <div className="mini-player-subtitle">
            <span className="mini-player-reciter">
              {audioPlaybackPhase === 'taawwuz'
                ? `Ta'awwuz • ${reciterObj.name}`
                : audioPlaybackPhase === 'bismillah'
                ? `Bismillah • ${reciterObj.name}`
                : reciterObj.name}
            </span>
            <span className="mini-player-time">
              {formatTime(playbackTime)} / {formatTime(playbackDuration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mini-player-actions">
          <button
            type="button"
            className="mini-player-btn play-btn"
            onClick={toggleAudioPlay}
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
            onClick={() => navigate('/quran')}
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
            onClick={stopAudio}
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
