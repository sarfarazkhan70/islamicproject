import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MadhhabSelector } from '../../components/prayer/MadhhabSelector';
import { NextPrayerHero } from '../../components/prayer/NextPrayerHero';
import { LocationPermissionBanner } from '../../components/common/LocationPermissionBanner.js';
import { LocationPickerModal } from '../../components/common/LocationPickerModal.js';
import { usePrayerTimes } from '../../hooks/usePrayerTimes.js';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { CalculationMethod, SunniMadhhab } from '../../core/prayerEngine/types.js';
import {
  MapPin,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Compass,
  Search,
} from 'lucide-react';

export const PrayerTimesPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    timetable,
    displayName,
    isDetectingLocation,
    locationError,
    detectLocation,
    getMonthlyTimetable,
  } = usePrayerTimes();

  const {
    accuracy,
    isLowAccuracy,
  } = useLocationStore();


  const {
    madhhab,
    setMadhhab,
    calculationMethod,
    setCalculationMethod,
    timeFormat,
    setTimeFormat,
  } = useSettingsStore();

  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [showCityModal, setShowCityModal] = useState(false);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Monthly timetable calculation for monthly view
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth() + 1;
  const monthlyData = viewMode === 'monthly' ? getMonthlyTimetable(currentYear, currentMonth) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header with Action Controls */}
      <PageHeader
        title="Daily Prayer Times"
        arabicTitle="مواقيت الصلاة اليومية"
        subtitle="Accurate astronomical solar calculations, 4-Madhhab Asr methodologies, and derived prayer windows."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button
              variant={viewMode === 'daily' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('daily')}
            >
              Daily Timetable
            </Button>
            <Button
              variant={viewMode === 'monthly' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('monthly')}
            >
              <CalendarIcon size={16} /> Monthly Grid
            </Button>
          </div>
        }
      />

      {/* Permission Banner for auto location */}
      <LocationPermissionBanner onOpenManualPicker={() => setShowCityModal(true)} />

      {/* Location & Timezone Bar */}
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              className="btn-icon btn-icon-md"
              style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0, fontWeight: 'var(--weight-bold)' }}>
                  {displayName || `${timetable.location.city}, ${timetable.location.country}`}
                </h3>
                {timetable.location.isAutoDetected ? (
                  <Badge variant="emerald">GPS Detected</Badge>
                ) : (
                  <Badge variant="gray">Manual Location</Badge>
                )}
                {accuracy !== null && (
                  <Badge variant={isLowAccuracy ? 'gold' : 'emerald'}>
                    ±{accuracy}m
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted" style={{ margin: '3px 0 0 0' }}>
                {timetable.location.latitude.toFixed(4)}° N, {timetable.location.longitude.toFixed(4)}° E • Timezone:{' '}
                {timetable.location.timezone}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCityModal(true)}
            >
              <Search size={14} /> Change City
            </Button>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isDetectingLocation}
              onClick={detectLocation}
            >
              <Compass size={14} /> {isDetectingLocation ? 'Locating...' : 'GPS Locate'}
            </Button>
          </div>
        </div>

        {locationError && (
          <div
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--status-missed-bg)',
              color: 'var(--status-missed)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <AlertCircle size={14} />
            {locationError}
          </div>
        )}
      </Card>

      {/* Date Navigation & Settings Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Date Navigator Card */}
        <Card>
          <div className="flex-between">
            <div>
              <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Selected Date
              </span>
              <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)' }}>
                {timetable.dateFormatted}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button
                className="btn-icon btn-icon-sm"
                onClick={handlePrevDay}
                aria-label="Previous day"
                title="Previous day"
              >
                <ChevronLeft size={16} />
              </button>
              <Button variant="ghost" size="sm" onClick={handleToday}>
                Today
              </Button>
              <button
                className="btn-icon btn-icon-sm"
                onClick={handleNextDay}
                aria-label="Next day"
                title="Next day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Calculation Convention Selector Card */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div className="flex-between">
              <label className="label" style={{ marginBottom: 0 }}>Calculation Convention</label>
              <button
                className="btn btn-ghost text-xs"
                style={{ padding: '2px 6px', height: 'auto' }}
                onClick={() => setTimeFormat(timeFormat === '12h' ? '24h' : '12h')}
              >
                Format: <strong>{timeFormat.toUpperCase()}</strong>
              </button>
            </div>
            <select
              className="input"
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(e.target.value as CalculationMethod)}
            >
              <option value="Karachi">Karachi — Univ. of Islamic Sciences (18° / 18°)</option>
              <option value="MWL">MWL — Muslim World League (18° / 17°)</option>
              <option value="ISNA">ISNA — North America (15° / 15°)</option>
              <option value="UmmAlQura">Umm al-Qura — Makkah (18.5° / 90m interval)</option>
              <option value="Egypt">Egypt — General Authority of Survey (19.5° / 17.5°)</option>
              <option value="Tehran">Tehran — Institute of Geophysics (17.7° / 14°)</option>
              <option value="Gulf">Gulf — UAE Awqaf (19.5° / 90m interval)</option>
              <option value="Moonsighting">Moonsighting Committee Worldwide (18° / 18°)</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Sunni Madhhab Selector (Recalculates Asr) */}
      <Card>
        <MadhhabSelector
          selected={madhhab}
          onChange={(m: SunniMadhhab) => setMadhhab(m)}
        />
      </Card>

      {/* Hero Countdown for Active/Next Prayer */}
      <NextPrayerHero
        timetable={timetable}
        locationName={displayName || `${timetable.location.city}, ${timetable.location.country}`}
        onOpenLocationPicker={() => setShowCityModal(true)}
      />

      {/* Daily Timetable Display */}
      {viewMode === 'daily' ? (
        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="heading-3" style={{ margin: 0 }}>Complete 12-Slot Daily Timetable</h3>
            <p className="text-secondary text-xs" style={{ margin: 0 }}>
              Fard prayers, astronomical boundaries, and voluntary windows
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {timetable.prayers.map((prayer) => {
              const isNext = timetable.nextPrayer?.key === prayer.key;
              const isCurrent = timetable.currentPrayer?.key === prayer.key;
              const isProhibited = prayer.isProhibited;

              return (
                <div
                  key={prayer.key}
                  className={`prayer-time-row ${isCurrent ? 'active' : ''} ${isProhibited ? 'prohibited' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isCurrent
                          ? 'var(--brand-primary)'
                          : isProhibited
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'var(--bg-surface-elevated)',
                        color: isCurrent
                          ? '#fff'
                          : isProhibited
                          ? 'var(--brand-danger)'
                          : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--weight-bold)',
                      }}
                    >
                      {prayer.key.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>
                          {prayer.name}
                        </span>
                        {isNext && <Badge variant="gold">NEXT</Badge>}
                        {isCurrent && <Badge variant="emerald">CURRENT</Badge>}
                        {isProhibited && <Badge variant="red">PROHIBITED</Badge>}
                      </div>
                      <span className="text-xs text-muted font-arabic">{prayer.arabicName}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--weight-extrabold)',
                        fontFamily: 'var(--font-sans)',
                        color: isCurrent
                          ? 'var(--brand-primary)'
                          : isProhibited
                          ? 'var(--brand-danger)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {prayer.timeFormatted}
                    </div>
                    {prayer.windowEnd && (
                      <span className="text-xs text-muted">
                        until {prayer.windowEnd.timeFormatted}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Monthly Timetable View */
        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="heading-3" style={{ margin: 0 }}>
              Monthly Prayer Timetable — {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-secondary text-xs" style={{ margin: 0 }}>
              Full 30-day astronomical schedule for {displayName || `${timetable.location.city}, ${timetable.location.country}`}
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Fajr</th>
                  <th>Sunrise</th>
                  <th>Ishraq</th>
                  <th>Zuhr</th>
                  <th>Asr ({madhhab.toUpperCase()})</th>
                  <th>Maghrib</th>
                  <th>Isha</th>
                  <th>Tahajjud</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((day, idx) => {
                  const isCurrentDay = day.date.toDateString() === new Date().toDateString();
                  const getSlot = (key: string) => day.prayers.find((p) => p.key === key)?.timeFormatted || '--:--';

                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: isCurrentDay ? 'rgba(16, 185, 129, 0.08)' : undefined,
                        fontWeight: isCurrentDay ? 'var(--weight-bold)' : undefined,
                      }}
                    >
                      <td>
                        {day.date.toLocaleDateString(undefined, {
                          day: '2-digit',
                          weekday: 'short',
                        })}
                      </td>
                      <td>{getSlot('fajr')}</td>
                      <td>{getSlot('sunrise')}</td>
                      <td>{getSlot('ishraq')}</td>
                      <td>{getSlot('zuhr')}</td>
                      <td style={{ color: 'var(--brand-primary)' }}>{getSlot('asr')}</td>
                      <td>{getSlot('maghrib')}</td>
                      <td>{getSlot('isha')}</td>
                      <td style={{ color: 'var(--brand-gold)' }}>{getSlot('tahajjud')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Global Location Picker Modal */}
      <LocationPickerModal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
      />
    </div>
  );
};
