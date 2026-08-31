import React from 'react';
import clsx from 'clsx';
import { PrayerTimeItem, PrayerStatus } from '../../types/prayer.types';
import { Badge } from '../common/Badge';
import { Check, Clock, AlertCircle } from 'lucide-react';

export interface PrayerTimeRowProps {
  prayer: PrayerTimeItem;
  onStatusChange?: (status: PrayerStatus) => void;
}

export const PrayerTimeRow: React.FC<PrayerTimeRowProps> = ({ prayer }) => {
  const isProhibited = prayer.isProhibited;
  const isCurrent = prayer.isCurrent;
  const isNext = prayer.isNext;

  return (
    <div
      className={clsx(
        'prayer-time-row',
        isCurrent && 'active',
        isProhibited && 'prohibited'
      )}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isCurrent
              ? 'var(--brand-primary)'
              : isNext
              ? 'var(--status-pending-bg)'
              : isProhibited
              ? 'var(--status-missed-bg)'
              : 'var(--bg-surface-elevated)',
            color: isCurrent
              ? '#ffffff'
              : isNext
              ? 'var(--brand-gold)'
              : isProhibited
              ? 'var(--status-missed)'
              : 'var(--text-secondary)',
          }}
        >
          {prayer.status === 'prayed' ? (
            <Check size={18} />
          ) : isProhibited ? (
            <AlertCircle size={18} />
          ) : (
            <Clock size={18} />
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontWeight: isCurrent || isNext ? 'var(--weight-bold)' : 'var(--weight-medium)',
                color: isCurrent ? 'var(--brand-primary)' : 'var(--text-primary)',
              }}
            >
              {prayer.name}
            </span>
            <span className="font-arabic text-muted" style={{ fontSize: '1rem' }}>
              {prayer.arabicName}
            </span>
          </div>
          {prayer.note && (
            <span className="text-xs text-muted" style={{ display: 'block' }}>
              {prayer.note}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-lg)',
            fontWeight: isCurrent || isNext ? 'var(--weight-bold)' : 'var(--weight-semibold)',
            color: isCurrent
              ? 'var(--brand-primary)'
              : isNext
              ? 'var(--text-gold)'
              : isProhibited
              ? 'var(--text-muted)'
              : 'var(--text-primary)',
          }}
        >
          {prayer.time}
        </span>

        {isCurrent && <Badge variant="emerald">Active</Badge>}
        {isNext && <Badge variant="gold">Upcoming</Badge>}
        {isProhibited && <Badge variant="red">Prohibited</Badge>}
        {!isProhibited && !isCurrent && !isNext && prayer.status === 'prayed' && (
          <Badge variant="emerald">Prayed</Badge>
        )}
      </div>
    </div>
  );
};
