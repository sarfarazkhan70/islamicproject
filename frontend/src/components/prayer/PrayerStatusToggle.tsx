import React from 'react';
import { TrackerStatus } from '../../stores/useTrackerStore.js';
import { Check, X, RotateCcw, Clock, RefreshCw, Plane } from 'lucide-react';
import clsx from 'clsx';

export interface PrayerStatusToggleProps {
  prayerKey: string;
  displayName: string;
  arabicName: string;
  time: string;
  status: TrackerStatus;
  onStatusChange: (prayerKey: string, status: TrackerStatus) => void;
  isSafarQaza?: boolean;
  onSafarQazaChange?: (prayerKey: string, isSafarQaza: boolean) => void;
  isVoluntary?: boolean;
}

export const PrayerStatusToggle: React.FC<PrayerStatusToggleProps> = ({
  prayerKey,
  displayName,
  arabicName,
  time,
  status,
  onStatusChange,
  isSafarQaza = false,
  onSafarQazaChange,
  isVoluntary = false,
}) => {
  const isAda = status === 'ADA';
  const isMissed = status === 'MISSED';
  const isSafar = status === 'SAFAR' || status === 'EXCUSED';
  const isQaza = status === 'QAZA';
  const isMarked = status !== 'NONE';

  const getStatusColor = () => {
    if (isAda) return 'var(--brand-primary)';
    if (isMissed) return 'var(--status-missed)';
    if (isSafar) return 'var(--status-safar, #0ea5e9)';
    if (isQaza) return 'var(--brand-gold)';
    return 'var(--text-muted)';
  };

  const showSafarQazaControl = !isVoluntary && (isMissed || isQaza || isSafarQaza);

  const handleSafarQazaToggle = () => {
    if (onSafarQazaChange) {
      onSafarQazaChange(prayerKey, !isSafarQaza);
    }
  };

  return (
    <div
      className={clsx(
        'card card-compact',
        isAda && 'card-highlight',
        'card-hover'
      )}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isMarked ? getStatusColor() : 'var(--bg-surface-elevated)',
            color: isMarked ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 'var(--weight-bold)',
            flexShrink: 0,
            transition: 'all var(--transition-fast)',
          }}
        >
          {isAda ? (
            <Check size={18} />
          ) : isMissed ? (
            <X size={18} />
          ) : isSafar ? (
            <Plane size={17} />
          ) : isQaza ? (
            <RefreshCw size={16} />
          ) : (
            <Clock size={18} />
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)' }}>
              {displayName}
            </span>
            <span className="font-arabic text-muted" style={{ fontSize: '0.95rem' }}>
              {arabicName}
            </span>
            {isVoluntary && (
              <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                Nafl
              </span>
            )}
            {isSafar && (
              <span
                className="prayer-safar-indicator safar-status"
                title="Prayer performed during Safar (Travel)"
              >
                <Plane size={11} /> Safar
              </span>
            )}
            {isSafarQaza && (
              <span
                className="prayer-safar-indicator safar-qaza"
                title="Missed/Qaza prayer during travel (Safar)"
              >
                <Plane size={11} /> Safar Mein Qaza
              </span>
            )}
          </div>
          <span className="text-xs text-secondary">{time}</span>
        </div>
      </div>

      {/* Interactive Status Controls & Safar Mein Qaza Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <button
          className={clsx('btn btn-sm', isAda ? 'btn-primary' : 'btn-outline')}
          style={{ padding: '4px 10px', height: 'auto', fontSize: 'var(--text-xs)' }}
          onClick={() => onStatusChange(prayerKey, isAda ? 'NONE' : 'ADA')}
        >
          <Check size={13} /> Ada
        </button>

        {!isVoluntary && (
          <>
            <button
              className={clsx('btn btn-sm', isMissed ? 'btn-danger' : 'btn-outline')}
              style={{ padding: '4px 10px', height: 'auto', fontSize: 'var(--text-xs)' }}
              onClick={() => onStatusChange(prayerKey, isMissed ? 'NONE' : 'MISSED')}
            >
              <X size={13} /> Missed
            </button>

            <button
              className={clsx('btn btn-sm', isSafar ? 'btn-safar' : 'btn-outline')}
              style={{
                padding: '4px 9px',
                height: 'auto',
                fontSize: 'var(--text-xs)',
              }}
              onClick={() => onStatusChange(prayerKey, isSafar ? 'NONE' : 'SAFAR')}
              title="Safar (Travel / Qasr Prayer)"
            >
              <Plane size={12} /> Safar
            </button>

            <button
              className={clsx('btn btn-sm', isQaza ? 'btn-secondary' : 'btn-ghost')}
              style={{ padding: '4px 8px', height: 'auto', fontSize: 'var(--text-xs)', color: isQaza ? 'var(--text-gold)' : undefined }}
              onClick={() => onStatusChange(prayerKey, isQaza ? 'NONE' : 'QAZA')}
              title="Performed later as Qaza"
            >
              <RefreshCw size={12} /> Qaza
            </button>
          </>
        )}

        {/* Safar Mein Qaza Circular Checkbox / Tick Control */}
        {showSafarQazaControl && (
          <button
            type="button"
            role="checkbox"
            aria-checked={isSafarQaza}
            className={clsx('safar-qaza-control', isSafarQaza && 'checked')}
            onClick={handleSafarQazaToggle}
            title={
              isSafarQaza
                ? 'Click to remove Safar marking (prayer record will be preserved)'
                : 'Mark this missed/Qaza prayer as occurred during travel (Safar)'
            }
          >
            <span className={clsx('safar-circular-checkbox', isSafarQaza && 'checked')}>
              {isSafarQaza && <Check size={10} strokeWidth={3} />}
            </span>
            <span>Safar Mein Qaza</span>
          </button>
        )}

        {isMarked && (
          <button
            className="btn btn-sm btn-ghost"
            style={{ padding: '4px 6px', height: 'auto', color: 'var(--text-muted)' }}
            onClick={() => onStatusChange(prayerKey, 'NONE')}
            title="Reset / Undo"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

