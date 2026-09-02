import React from 'react';
import { MapPin, Calendar, Clock, Compass } from 'lucide-react';
import { DailyTimetable } from '../../types/prayer.types';
import { DailyPrayerTimesResult } from '../../core/prayerEngine/types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useCentralHijriDate } from '../../hooks/useCentralHijriDate.js';

export interface NextPrayerHeroProps {
  timetable?: DailyTimetable | DailyPrayerTimesResult;
  nextPrayerName?: string;
  nextPrayerTime?: string;
  nextPrayerArabicName?: string;
  countdown?: string;
  activePrayerName?: string;
  locationName?: string;
  hijriDate?: string;
  onOpenLocationPicker?: () => void;
}

export const NextPrayerHero: React.FC<NextPrayerHeroProps> = ({
  timetable,
  nextPrayerName,
  nextPrayerTime,
  nextPrayerArabicName,
  countdown,
  activePrayerName,
  locationName,
  hijriDate,
  onOpenLocationPicker,
}) => {
  const centralHijri = useCentralHijriDate();

  // Extract values with flexible support
  const name =
    nextPrayerName ||
    (timetable && 'nextPrayer' in timetable && timetable.nextPrayer
      ? 'name' in timetable.nextPrayer
        ? timetable.nextPrayer.name
        : ''
      : 'Fajr');

  const arabicName =
    nextPrayerArabicName ||
    (timetable && 'nextPrayer' in timetable && timetable.nextPrayer
      ? 'arabicName' in timetable.nextPrayer
        ? timetable.nextPrayer.arabicName
        : ''
      : '');

  const time =
    nextPrayerTime ||
    (timetable && 'nextPrayer' in timetable && timetable.nextPrayer
      ? 'timeFormatted' in timetable.nextPrayer
        ? timetable.nextPrayer.timeFormatted
        : 'time' in timetable.nextPrayer
        ? timetable.nextPrayer.time
        : '--:--'
      : '--:--');

  const timer =
    countdown ||
    (timetable && 'timeToNextPrayerFormatted' in timetable
      ? timetable.timeToNextPrayerFormatted
      : timetable && 'nextPrayerCountdown' in timetable
      ? timetable.nextPrayerCountdown
      : '00:00:00');

  const loc =
    locationName ||
    (timetable && timetable.location
      ? `${timetable.location.city}, ${timetable.location.country}`
      : 'Makkah, Saudi Arabia');

  const madhhab = timetable && 'madhhab' in timetable ? timetable.madhhab : 'hanafi';
  const gregorianDate =
    timetable && 'dateFormatted' in timetable
      ? timetable.dateFormatted
      : timetable && 'dateGregorian' in timetable
      ? timetable.dateGregorian
      : '';

  const hijri = hijriDate || centralHijri.formatted;


  const active =
    activePrayerName ||
    (timetable && 'currentPrayer' in timetable && timetable.currentPrayer
      ? 'name' in timetable.currentPrayer
        ? timetable.currentPrayer.name
        : ''
      : undefined);

  return (
    <Card
      highlighted
      style={{
        padding: 'var(--space-8)',
        background: 'linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.07))',
        border: '1px solid var(--border-default)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={onOpenLocationPicker}
            className="btn btn-sm btn-secondary"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <MapPin size={14} style={{ color: 'var(--brand-primary)' }} />
            <span>{loc}</span>
          </button>
          <Badge variant="gray">
            <Compass size={12} /> {madhhab.toUpperCase()}
          </Badge>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
          }}
        >
          <Calendar size={14} style={{ color: 'var(--brand-gold)' }} />
          <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-gold)' }}>
            {hijri}
          </span>
          {gregorianDate && (
            <>
              <span>•</span>
              <span>{gregorianDate}</span>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        <div>
          <span className="label" style={{ color: 'var(--brand-primary)' }}>
            Next Prayer
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginTop: 4 }}>
            <h2 className="heading-display" style={{ color: 'var(--text-primary)' }}>
              {name}
            </h2>
            {arabicName && (
              <span className="font-arabic text-muted" style={{ fontSize: '1.6rem' }}>
                {arabicName}
              </span>
            )}
          </div>
          <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
            Starts at <strong style={{ color: 'var(--text-primary)' }}>{time}</strong>
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 'var(--space-5)',
            padding: 'var(--space-4) var(--space-6)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--brand-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={28} />
          </div>
          <div>
            <span className="label">Time Remaining</span>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-extrabold)',
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-gold)',
                letterSpacing: '0.05em',
              }}
            >
              {timer}
            </div>
            {active && (
              <span className="text-xs text-muted">
                Current Prayer Window: {active}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
