import React, { useEffect, useState } from 'react';
import {
  SacredAudioItem,
  sacredAudioService,
  SacredAudioPlaybackState,
} from '../../services/sacredAudioService';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Mic,
  Loader2,
} from 'lucide-react';

interface SacredNameAudioCardProps {
  item: SacredAudioItem;
}

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const SacredNameAudioCard: React.FC<SacredNameAudioCardProps> = ({ item }) => {
  const [playback, setPlayback] = useState<SacredAudioPlaybackState>(sacredAudioService.getState());

  useEffect(() => {
    const unsubscribe = sacredAudioService.subscribe((state) => {
      setPlayback(state);
    });
    return () => unsubscribe();
  }, []);

  const isCurrent = playback.currentId === item.id;
  const isPlaying = isCurrent && playback.isPlaying;
  const isLoading = isCurrent && playback.isLoading;
  const currentTime = isCurrent ? playback.currentTime : 0;
  const duration = isCurrent && playback.duration > 0 ? playback.duration : (item.estimatedDuration || 15);

  const handlePlayToggle = () => {
    sacredAudioService.play(item);
  };

  const handleReplay = () => {
    sacredAudioService.replay(item);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    sacredAudioService.seek(val);
  };

  const isAllah = item.id === 'allah-taala';

  const cardGradient = isAllah
    ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)'
    : 'linear-gradient(135deg, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)';

  const accentColor = isAllah ? 'var(--brand-gold, #f59e0b)' : 'var(--brand-emerald, #10b981)';
  const activeBorderColor = isPlaying ? accentColor : 'rgba(245, 158, 11, 0.25)';

  return (
    <div
      id={`sacred-audio-card-${item.id}`}
      className="card card-hover"
      style={{
        background: cardGradient,
        border: `2px solid ${activeBorderColor}`,
        borderRadius: 'var(--radius-lg, 16px)',
        padding: 'var(--space-5, 20px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'var(--space-4, 16px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isPlaying
          ? '0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 0 24px rgba(245, 158, 11, 0.2)'
          : '0 8px 20px -4px rgba(0, 0, 0, 0.35)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Background Subtle Watermark */}
      <div
        style={{
          position: 'absolute',
          right: -15,
          top: -20,
          opacity: 0.05,
          pointerEvents: 'none',
          fontSize: '7rem',
          fontFamily: 'var(--font-arabic, "Amiri", serif)',
        }}
      >
        {isAllah ? 'الله' : 'محمد'}
      </div>

      {/* Card Header: Category & Voice Guarantee Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: isAllah ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: accentColor,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          {isAllah ? <Sparkles size={13} /> : <Heart size={13} fill="currentColor" />}
          <span>{isAllah ? "ALLAH TA'ALA AUDIO" : 'HUZUR MUHAMMAD ﷺ AUDIO'}</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--text-secondary, #94a3b8)',
            fontSize: '0.72rem',
            fontWeight: 600,
          }}
          title="Verified 100% natural, clear male voice audio"
        >
          <Mic size={12} style={{ color: accentColor }} />
          <span>Clear Male Voice</span>
        </div>
      </div>

      {/* Main Sacred Display (Name & Arabic) */}
      <div style={{ textAlign: 'center', margin: '4px 0', zIndex: 1 }}>
        <h3
          className="font-arabic"
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            color: isPlaying ? accentColor : 'var(--text-primary, #ffffff)',
            lineHeight: 1.3,
            margin: '0 0 6px',
            fontWeight: 700,
            textShadow: isPlaying ? '0 0 16px rgba(245, 158, 11, 0.35)' : 'none',
            direction: 'rtl',
            userSelect: 'text',
          }}
        >
          {item.arabicName}
          {item.honorific && (
            <span
              style={{
                fontSize: '0.6em',
                marginRight: 6,
                opacity: 0.9,
                fontWeight: 500,
              }}
            >
              {' '}{item.honorific}
            </span>
          )}
        </h3>

        <div
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-primary, #ffffff)',
            letterSpacing: 0.3,
          }}
        >
          {item.name}
        </div>
      </div>

      {/* Meanings Section: Urdu & English (Cleanly Highlighted) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 1,
        }}
      >
        {/* Urdu Meaning */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderLeft: `3px solid ${accentColor}`,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm, 6px)',
          }}
        >
          <div
            style={{
              fontSize: '0.70rem',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: accentColor,
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            Urdu Meaning:
          </div>
          <div
            className="font-urdu"
            style={{
              fontSize: '0.98rem',
              color: 'var(--text-primary, #f1f5f9)',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {item.urduMeaning}
          </div>
        </div>

        {/* English Meaning */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderLeft: `3px solid rgba(255, 255, 255, 0.3)`,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm, 6px)',
          }}
        >
          <div
            style={{
              fontSize: '0.70rem',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: 'var(--text-muted, #94a3b8)',
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            English Meaning:
          </div>
          <div
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary, #cbd5e1)',
              lineHeight: 1.45,
              fontWeight: 500,
            }}
          >
            {item.englishMeaning}
          </div>
        </div>
      </div>

      {/* Interactive Audio Controls Toolbar */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          borderRadius: 'var(--radius-md, 10px)',
          padding: '12px 14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 1,
        }}
      >
        {/* Progress Bar & Timestamps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--text-muted, #94a3b8)',
              fontWeight: 600,
            }}
          >
            <span>{formatTime(currentTime)}</span>
            {isPlaying && (
              <span
                style={{
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                    animation: 'pulse 1.2s infinite',
                  }}
                />
                Playing (Male Voice)
              </span>
            )}
            <span>{formatTime(duration)}</span>
          </div>

          {/* Scrubbable Seek Bar */}
          <input
            type="range"
            min="0"
            max={duration || 15}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            disabled={!isCurrent}
            style={{
              width: '100%',
              cursor: isCurrent ? 'pointer' : 'default',
              accentColor: accentColor,
              height: 5,
              borderRadius: 3,
            }}
            aria-label={`${item.name} audio progress`}
          />
        </div>

        {/* Buttons Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {/* Main Big Play / Pause Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePlayToggle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: isPlaying ? 'rgba(239, 68, 68, 0.2)' : accentColor,
              borderColor: isPlaying ? '#ef4444' : accentColor,
              color: isPlaying ? '#ef4444' : '#0f172a',
              borderRadius: 'var(--radius-md, 8px)',
              boxShadow: isPlaying ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)',
              cursor: 'pointer',
              flex: 1,
            }}
            aria-label={isPlaying ? `Pause ${item.name}` : `Play ${item.name} audio`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Loading Voice...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause size={16} />
                <span>Pause Audio</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Play Name & Meanings</span>
              </>
            )}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            className="btn-icon"
            onClick={handleReplay}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Replay from start"
            aria-label="Replay audio from start"
          >
            <RotateCcw size={16} />
          </button>

          {/* Mute/Volume Toggle */}
          <button
            type="button"
            className="btn-icon"
            onClick={() => sacredAudioService.toggleMute()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: playback.isMuted ? '#ef4444' : 'var(--text-primary, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={playback.isMuted ? 'Unmute' : 'Mute'}
            aria-label={playback.isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {playback.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Dynamic Waveform Visualizer */}
        {isPlaying && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              height: 18,
              paddingTop: 2,
            }}
          >
            {[40, 75, 100, 60, 85, 45, 90, 70, 95, 55, 80, 50, 90, 65].map((height, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: `${height}%`,
                  backgroundColor: accentColor,
                  borderRadius: 2,
                  animation: `equalizeBar 0.8s ease-in-out infinite alternate ${i * 0.07}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
