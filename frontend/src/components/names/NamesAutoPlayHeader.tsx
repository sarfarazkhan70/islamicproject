import React from 'react';
import { IslamicNameItem } from '../../data/islamic/types.js';
import { useNamesStore } from '../../stores/useNamesStore.js';
import { Card } from '../common/Card.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';
import { Play, Pause, Square, Sparkles, Volume2 } from 'lucide-react';

interface NamesAutoPlayHeaderProps {
  items: IslamicNameItem[];
  title: string;
}

export const NamesAutoPlayHeader: React.FC<NamesAutoPlayHeaderProps> = ({ items, title }) => {
  const {
    isAutoPlaying,
    autoPlayIndex,
    autoPlayCategory,
    autoPlayStatus,
    isPlaying,
    currentCategory,
    currentPlayingId,
    playAll,
    pauseAudio,
    resumeAudio,
    stopAudio,
  } = useNamesStore();

  const sectionCategory = items[0]?.category || 'allah';
  const isThisSectionPlaying = currentCategory === sectionCategory && isPlaying;
  const isThisSectionAutoPlaying = isAutoPlaying && autoPlayCategory === sectionCategory;

  const currentItem =
    isThisSectionAutoPlaying && autoPlayIndex !== null && autoPlayIndex >= 0 && autoPlayIndex < items.length
      ? items[autoPlayIndex]
      : currentCategory === sectionCategory
      ? items.find((i) => i.id === currentPlayingId)
      : null;

  const isCurrentSectionActive = isThisSectionAutoPlaying || (currentCategory === sectionCategory && Boolean(currentPlayingId));


  return (
    <Card
      style={{
        padding: 'var(--space-4) var(--space-5)',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: isThisSectionAutoPlaying ? '1px solid var(--brand-gold)' : '1px solid var(--border-subtle)',
        boxShadow: isThisSectionAutoPlaying ? '0 0 16px rgba(245, 158, 11, 0.15)' : undefined,
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        {/* Left: Section Title & Sequential Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {!isThisSectionAutoPlaying ? (
            <Button
              variant="primary"
              onClick={() => playAll(items)}
              icon={<Play size={15} fill="currentColor" />}
              style={{ fontWeight: 'var(--weight-bold)' }}
            >
              Play All Names
            </Button>
          ) : isThisSectionPlaying ? (
            <Button
              variant="gold"
              onClick={pauseAudio}
              icon={<Pause size={15} />}
              style={{ fontWeight: 'var(--weight-bold)' }}
            >
              Pause
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={resumeAudio}
              icon={<Play size={15} fill="currentColor" />}
              style={{ fontWeight: 'var(--weight-bold)' }}
            >
              Resume
            </Button>
          )}

          <Button
            variant="outline"
            onClick={stopAudio}
            disabled={!isCurrentSectionActive}
            icon={<Square size={14} />}
            style={{ opacity: isCurrentSectionActive ? 1 : 0.5 }}
          >
            Stop All
          </Button>
        </div>

        {/* Right: Live Status readout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {isThisSectionAutoPlaying && currentItem ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Badge variant="gold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Volume2 size={13} className={isThisSectionPlaying ? 'animate-pulse' : ''} />
                <span>
                  {isThisSectionPlaying ? 'Playing' : 'Paused'}: #{String(currentItem.number).padStart(2, '0')} —{' '}
                  <strong className="font-arabic" style={{ fontSize: '1rem' }}>{currentItem.arabic}</strong> (
                  {currentItem.transliteration})
                </span>
              </Badge>
              <span className="text-xs text-muted">
                {autoPlayIndex !== null ? `${autoPlayIndex + 1} of ${items.length}` : ''}
              </span>
            </div>
          ) : isThisSectionAutoPlaying && autoPlayStatus === 'Completed' ? (
            <Badge variant="emerald" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} />
              <span>Recitation Completed</span>
            </Badge>
          ) : (
            <span className="text-xs text-muted">
              Auto-play all {items.length} verified {title} in continuous sequence
            </span>
          )}
        </div>
      </div>
    </Card>

  );
};
