import React from 'react';
import { IslamicNameItem } from '../../data/islamic/types.js';
import { useNamesStore } from '../../stores/useNamesStore.js';
import { Card } from '../common/Card.js';
import { Badge } from '../common/Badge.js';
import { Volume2, VolumeX, Pause, Heart, BookOpen, Loader2 } from 'lucide-react';

interface NameCardProps {
  item: IslamicNameItem;
  onSelect: (item: IslamicNameItem) => void;
}

export const NameCard: React.FC<NameCardProps> = ({ item, onSelect }) => {
  const { currentCategory, currentPlayingId, isPlaying, isLoading, playName, toggleFavorite, isFavorite } =
    useNamesStore();

  const itemCategory = item.category || 'allah';
  const isCurrentPlaying = currentPlayingId === item.id && currentCategory === itemCategory && isPlaying;
  const isCurrentLoading = currentPlayingId === item.id && currentCategory === itemCategory && isLoading;
  const favorited = isFavorite(item.id);


  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.audioUrl) {
      playName(item);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  // Determine balanced, responsive Arabic font size
  const arabicLength = item.arabic.length;
  const arabicFontSize =
    arabicLength > 20
      ? '1.30rem'
      : arabicLength > 14
      ? '1.45rem'
      : arabicLength > 9
      ? '1.60rem'
      : '1.80rem';

  const hasAudio = Boolean(item.audioUrl);

  return (
    <Card
      id={`name-card-${item.id}`}
      className={`card-hover ${isCurrentPlaying ? 'card-highlight' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        minHeight: 230,
        borderColor: isCurrentPlaying ? 'var(--brand-gold)' : undefined,
        boxShadow: isCurrentPlaying ? '0 0 14px rgba(245, 158, 11, 0.25)' : undefined,
      }}
      onClick={() => onSelect(item)}
    >
      {/* Top Header: Number Badge & Favorite */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-2)' }}>
        <Badge variant={isCurrentPlaying ? 'gold' : 'gray'} style={{ fontSize: '0.72rem', fontWeight: 'bold' }}>
          #{String(item.number).padStart(2, '0')}
        </Badge>

        <button
          onClick={handleFavoriteClick}
          className="btn-icon btn-icon-sm"
          style={{
            color: favorited ? '#ef4444' : 'var(--text-muted)',
            backgroundColor: favorited ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            width: 28,
            height: 28,
          }}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          title={favorited ? 'Favorited' : 'Favorite'}
        >
          <Heart size={15} fill={favorited ? '#ef4444' : 'none'} />
        </button>
      </div>

      {/* Main Arabic & Typography Body */}
      <div style={{ textAlign: 'center', margin: 'var(--space-1) 0' }}>
        {/* Controlled Arabic Typography */}
        <h2
          className="font-arabic"
          style={{
            fontSize: arabicFontSize,
            lineHeight: 1.45,
            margin: '0 0 4px',
            color: isCurrentPlaying ? 'var(--brand-gold)' : 'var(--brand-primary)',
            direction: 'rtl',
            fontWeight: 'var(--weight-bold)',
            userSelect: 'text',
          }}
        >
          {item.arabic}
        </h2>

        {/* Transliteration */}
        <div
          style={{
            fontWeight: 'var(--weight-bold)',
            fontSize: '0.92rem',
            color: 'var(--text-primary)',
            marginBottom: 2,
          }}
        >
          {item.transliteration}
        </div>

        {/* Roman Urdu */}
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            marginBottom: 4,
            lineHeight: 1.35,
          }}
        >
          "{item.romanUrdu}"
        </div>

        {/* Urdu Meaning */}
        <div
          className="font-arabic"
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            direction: 'rtl',
            marginBottom: 4,
            lineHeight: 1.4,
          }}
        >
          {item.urdu}
        </div>

        {/* English Meaning */}
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--text-secondary)',
            lineHeight: 1.35,
          }}
        >
          {item.english}
        </div>
      </div>

      {/* Footer: Compact Reference & Guaranteed Visible Audio Control */}
      <div
        className="flex-between"
        style={{
          marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-2)',
          borderTop: '1px solid var(--border-subtle)',
          gap: 'var(--space-2)',
        }}
      >
        <span
          className="text-muted"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 130,
            fontSize: '0.70rem',
          }}
          title={item.reference}
        >
          <BookOpen size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          {item.reference.split(';')[0]}
        </span>

        {/* Always Visible Audio Button */}
        {hasAudio ? (
          <button
            onClick={handleAudioClick}
            className={`btn btn-sm ${isCurrentPlaying ? 'btn-gold' : 'btn-primary'}`}
            style={{
              padding: '4px 10px',
              fontSize: '0.74rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              borderRadius: 'var(--radius-md)',
              fontWeight: 'var(--weight-semibold)',
            }}
            aria-label={isCurrentPlaying ? 'Pause audio' : 'Play authentic pronunciation'}
            title={isCurrentPlaying ? 'Pause pronunciation' : 'Play authentic pronunciation'}
          >
            {isCurrentLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Loading...</span>
              </>
            ) : isCurrentPlaying ? (
              <>
                <Pause size={13} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>Play Name</span>
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="btn btn-sm btn-outline"
            style={{
              padding: '4px 8px',
              fontSize: '0.70rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              borderRadius: 'var(--radius-md)',
              opacity: 0.65,
              cursor: 'not-allowed',
              color: 'var(--text-muted)',
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'transparent',
            }}
            title="Authentic audio recording not currently available"
            aria-label="Audio unavailable"
          >
            <VolumeX size={12} />
            <span>Audio unavailable</span>
          </button>
        )}
      </div>
    </Card>
  );
};
