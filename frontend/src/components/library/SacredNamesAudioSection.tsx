import React from 'react';
import { SACRED_AUDIO_ITEMS } from '../../services/sacredAudioService';
import { SacredNameAudioCard } from './SacredNameAudioCard';
import { Headphones, ShieldCheck } from 'lucide-react';

export const SacredNamesAudioSection: React.FC = () => {
  return (
    <section
      className="sacred-names-audio-section"
      aria-label="Sacred Names Audio Recitation"
      style={{
        marginBottom: 'var(--space-6, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4, 16px)',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-2, 8px)',
          paddingBottom: 'var(--space-2, 8px)',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(245, 158, 11, 0.18)',
              color: 'var(--brand-gold, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Headphones size={18} />
          </div>

          <div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-primary, #ffffff)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Sacred Names & Meanings Audio</span>
              <span
                className="font-arabic"
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--brand-gold, #f59e0b)',
                  fontWeight: 600,
                }}
              >
                (أسماء مقدسة وصوتية)
              </span>
            </h3>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-muted, #94a3b8)',
                margin: '2px 0 0',
              }}
            >
              Listen to the sacred names of Allah Ta'ala and Huzur Muhammad ﷺ with authentic pronunciation and complete Urdu & English meanings in clear, respectful male voice.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            fontSize: '0.76rem',
            fontWeight: 700,
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <ShieldCheck size={14} />
          <span>Strict Male Voice Recitation</span>
        </div>
      </div>

      {/* 2-Column Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4, 16px)',
        }}
      >
        {SACRED_AUDIO_ITEMS.map((item) => (
          <SacredNameAudioCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
