import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Moon,
  Volume2,
  VolumeX,
  Timer,
  Clock,
  Check,
} from 'lucide-react';

export const SurahAlMulkPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('alafasy');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | 'end' | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reciters = [
    {
      id: 'alafasy',
      name: 'Sheikh Mishary Rashid Alafasy',
      audioUrl: 'https://server8.mp3quran.net/afs/067.mp3',
      riwayah: 'Hafs an Asim',
    },
    {
      id: 'husary',
      name: 'Sheikh Mahmoud Khalil Al-Husary',
      audioUrl: 'https://server13.mp3quran.net/husr/067.mp3',
      riwayah: 'Murattal',
    },
    {
      id: 'abdulbasit',
      name: 'Sheikh Abdul Basit Abdul Samad',
      audioUrl: 'https://server7.mp3quran.net/basit/067.mp3',
      riwayah: 'Murattal',
    },
    {
      id: 'ghamdi',
      name: 'Sheikh Saad Al-Ghamdi',
      audioUrl: 'https://server7.mp3quran.net/ghamdi/067.mp3',
      riwayah: 'Hafs an Asim',
    },
  ];

  const currentReciterObj = reciters.find((r) => r.id === selectedReciter) || reciters[0];

  // Media Session API Setup for Background / Lockscreen Playback
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Surah Al-Mulk (سورة الملك)',
        artist: currentReciterObj.name,
        album: 'The Noble Quran • Sleep Recitation',
        artwork: [
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
      });
    }
  }, [currentReciterObj, duration]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerMinutes === null || sleepTimerMinutes === 'end') {
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(sleepTimerMinutes * 60);

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Audio Event Listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
      if (sleepTimerMinutes === 'end') {
        setSleepTimerMinutes(null);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol / 100;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 760, margin: '0 auto' }}>
      <PageHeader
        title="Surah Al-Mulk Sleep Experience"
        arabicTitle="سورة الملك"
        subtitle="Distraction-free, calming authentic Arabic recitation before sleep."
        actions={<Badge variant="gold"><Moon size={12} /> Sleep Mode</Badge>}
      />

      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentReciterObj.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Main Sleep Audio Player Card */}
      <Card
        highlighted
        style={{
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-6)',
          background: 'linear-gradient(180deg, var(--bg-card), rgba(245, 158, 11, 0.04))',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}
      >
        {/* Title and Reciter */}
        <div>
          <span className="label" style={{ color: 'var(--brand-gold)' }}>
            Surah 67 • 30 Verses • Meccan
          </span>
          <h2
            className="font-arabic"
            style={{ fontSize: '2.8rem', margin: '8px 0', color: 'var(--brand-gold)' }}
          >
            سُورَةُ المُلْكِ
          </h2>
          <p className="text-secondary text-sm">
            Reciter: <strong>{currentReciterObj.name}</strong>
          </p>
        </div>

        {/* Reciter Selector */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <select
            className="select"
            value={selectedReciter}
            onChange={(e) => {
              setSelectedReciter(e.target.value);
              setIsPlaying(false);
            }}
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.riwayah})
              </option>
            ))}
          </select>
        </div>

        {/* Audio Scrubber Track */}
        <div style={{ width: '100%', maxWidth: 500 }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: '100%',
              accentColor: 'var(--brand-gold)',
              cursor: 'pointer',
            }}
          />
          <div className="flex-between text-xs text-muted" style={{ marginTop: 4 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          {/* Loop Mode */}
          <button
            className={`btn-icon ${isLooping ? 'active' : ''}`}
            onClick={() => setIsLooping(!isLooping)}
            title={isLooping ? 'Repeat Enabled' : 'Enable Repeat'}
            aria-label="Loop Surah"
            style={{
              color: isLooping ? 'var(--brand-gold)' : undefined,
              backgroundColor: isLooping ? 'rgba(245, 158, 11, 0.15)' : undefined,
            }}
          >
            <Repeat size={20} />
          </button>

          {/* Rewind 10s */}
          <button
            className="btn-icon"
            onClick={() => handleSkip(-10)}
            title="Rewind 10 Seconds"
            aria-label="Rewind 10 Seconds"
          >
            <RotateCcw size={20} />
          </button>

          {/* Big Center Play/Pause Button */}
          <button
            className="btn btn-gold"
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
            }}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: 4 }} />}
          </button>

          {/* Forward 10s */}
          <button
            className="btn-icon"
            onClick={() => handleSkip(10)}
            title="Forward 10 Seconds"
            aria-label="Forward 10 Seconds"
          >
            <RotateCw size={20} />
          </button>
        </div>

        {/* Sleep Timer Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Timer size={16} style={{ color: 'var(--brand-gold)' }} />
            <span className="text-xs text-secondary" style={{ fontWeight: 'var(--weight-semibold)' }}>
              Sleep Timer:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: '10 min', val: 10 },
              { label: '20 min', val: 20 },
              { label: '30 min', val: 30 },
              { label: '45 min', val: 45 },
              { label: '60 min', val: 60 },
              { label: 'End of Surah', val: 'end' as const },
            ].map((opt) => {
              const isSelected = sleepTimerMinutes === opt.val;
              return (
                <button
                  key={opt.label}
                  className={`btn btn-sm ${isSelected ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => setSleepTimerMinutes(isSelected ? null : opt.val)}
                >
                  {isSelected ? <Check size={12} /> : null} {opt.label}
                </button>
              );
            })}
          </div>

          {remainingSeconds !== null && (
            <Badge variant="gold" style={{ marginTop: 4 }}>
              <Clock size={12} /> Audio stops automatically in {Math.floor(remainingSeconds / 60)}m {remainingSeconds % 60}s
            </Badge>
          )}
        </div>

        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', maxWidth: 280 }}>
          <button
            className="btn-icon btn-icon-sm"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--brand-gold)' }}
          />
          <span className="text-xs text-muted" style={{ minWidth: 32 }}>
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>
      </Card>

      {/* Authentic Virtue & Sunnah Card */}
      <Card style={{ borderLeft: '4px solid var(--brand-gold)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Moon size={20} style={{ color: 'var(--brand-gold)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 className="heading-3" style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>
              Sunnah of Recitation Before Sleep
            </h4>
            <p className="text-secondary text-sm">
              The Prophet ﷺ said: <em>"There is a Surah of thirty verses in the Quran which will intercede for a man until he is forgiven: 'Blessed is He in whose hand is the Sovereignty' [Surah Al-Mulk]."</em>
            </p>
            <span className="reference-text" style={{ marginTop: 6, display: 'inline-block' }}>
              Sahih • Sunan Abi Dawud #1400 • Jami` at-Tirmidhi #2891
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
