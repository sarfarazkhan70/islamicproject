import React from 'react';
import { IslamicNameItem } from '../../data/islamic/types.js';
import { useNamesStore } from '../../stores/useNamesStore.js';
import { Card } from '../common/Card.js';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';
import {
  X,
  Volume2,
  VolumeX,
  Pause,
  Heart,
  BookOpen,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';


interface NameDetailModalProps {
  item: IslamicNameItem | null;
  onClose: () => void;
}

export const NameDetailModal: React.FC<NameDetailModalProps> = ({ item, onClose }) => {
  const { currentCategory, currentPlayingId, isPlaying, isLoading, audioError, playName, toggleFavorite, isFavorite } =
    useNamesStore();

  if (!item) return null;

  const itemCategory = item.category || 'allah';
  const isCurrentPlaying = currentPlayingId === item.id && currentCategory === itemCategory && isPlaying;
  const isCurrentLoading = currentPlayingId === item.id && currentCategory === itemCategory && isLoading;
  const favorited = isFavorite(item.id);
  const hasAudio = Boolean(item.audioUrl);


  const arabicFontSize = item.arabic.length > 18 ? '2.1rem' : '2.4rem';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--space-5)',
          position: 'relative',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Badge variant="gold" style={{ fontSize: '0.72rem', fontWeight: 'bold' }}>
              #{String(item.number).padStart(2, '0')}
            </Badge>
            <span className="label" style={{ margin: 0, color: 'var(--brand-primary)', fontSize: '0.85rem' }}>
              {item.category === 'prophet' ? 'Asma-e-Mustafa ﷺ' : 'Asma-ul-Husna'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={() => toggleFavorite(item.id)}
              className="btn-icon btn-icon-sm"
              style={{
                color: favorited ? '#ef4444' : 'var(--text-muted)',
                backgroundColor: favorited ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              }}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={18} fill={favorited ? '#ef4444' : 'none'} />
            </button>

            <button
              onClick={onClose}
              className="btn-icon btn-icon-sm"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Big Arabic Display Card */}
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-4) var(--space-3)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h1
            className="font-arabic"
            style={{
              fontSize: arabicFontSize,
              lineHeight: 1.35,
              margin: '0 0 6px',
              color: 'var(--brand-primary)',
              direction: 'rtl',
            }}
          >
            {item.arabic}
            {item.category === 'allah' && (
              <span
                style={{
                  fontSize: '0.62em',
                  fontWeight: 'normal',
                  marginRight: '8px',
                  opacity: 0.85,
                  color: 'var(--brand-gold, #f59e0b)',
                  fontFamily: 'inherit',
                }}
              >
                {' '}جَلَّ جَلَالُهُ
              </span>
            )}
          </h1>

          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            {item.transliteration}
          </div>

          <div
            className="font-arabic"
            style={{
              fontSize: '1.1rem',
              color: 'var(--brand-gold)',
              direction: 'rtl',
              marginBottom: 2,
            }}
          >
            {item.urdu}
          </div>
        </div>

        {/* Translation & Roman Urdu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div>
            <span className="text-xs text-muted" style={{ fontWeight: 'var(--weight-semibold)', display: 'block', marginBottom: 2 }}>
              English Translation
            </span>
            <div style={{ fontSize: '0.92rem', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
              {item.english}
            </div>
          </div>

          <div>
            <span className="text-xs text-muted" style={{ fontWeight: 'var(--weight-semibold)', display: 'block', marginBottom: 2 }}>
              Roman Urdu Meaning
            </span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {item.romanUrdu}
            </div>
          </div>

          {item.explanation && (
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--brand-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Info size={14} style={{ color: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 'var(--weight-bold)', color: 'var(--brand-primary)' }}>
                  Spiritual Meaning & Reflection
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
                {item.explanation}
              </p>
            </div>
          )}

          {/* Authentic Reference Box */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <BookOpen size={14} style={{ color: 'var(--brand-gold)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 'var(--weight-bold)', color: 'var(--text-gold)' }}>
                Authentic Source Reference
              </span>
            </div>
            <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {item.reference}
            </div>
          </div>
        </div>

        {/* Audio Error Alert if any */}
        {audioError && currentPlayingId === item.id && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              fontSize: '0.78rem',
              marginBottom: 'var(--space-3)',
            }}
          >
            <AlertCircle size={14} />
            <span>{audioError}</span>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {hasAudio ? (
            <Button
              variant={isCurrentPlaying ? 'secondary' : 'primary'}
              style={{ flex: 1 }}
              onClick={() => playName(item)}
              icon={
                isCurrentLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isCurrentPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Volume2 size={16} />
                )
              }
            >
              {isCurrentLoading
                ? 'Loading Audio...'
                : isCurrentPlaying
                ? 'Pause Pronunciation'
                : 'Listen to Pronunciation'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled
              style={{ flex: 1, opacity: 0.65, cursor: 'not-allowed' }}
              icon={<VolumeX size={16} />}
            >
              Audio unavailable
            </Button>
          )}

          <Button variant="outline" onClick={onClose} style={{ minWidth: 90 }}>
            Close
          </Button>
        </div>

      </Card>
    </div>
  );
};
