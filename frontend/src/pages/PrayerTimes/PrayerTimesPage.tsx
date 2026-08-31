import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MadhhabSelector } from '../../components/prayer/MadhhabSelector';
import { NextPrayerHero } from '../../components/prayer/NextPrayerHero';
import { usePrayerTimes } from '../../hooks/usePrayerTimes.js';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { GLOBAL_CITIES } from '../../core/prayerEngine/cities.js';
import { CalculationMethod, SunniMadhhab, LocationInfo } from '../../core/prayerEngine/types.js';
import {
  MapPin,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Compass,
  Search,
} from 'lucide-react';

export const PrayerTimesPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    timetable,
    isDetectingLocation,
    locationError,
    detectLocation,
    selectCity,
    getMonthlyTimetable,
  } = usePrayerTimes();

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
  const [citySearchQuery, setCitySearchQuery] = useState('');

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

  // Filter cities for modal
  const filteredCities = GLOBAL_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0, fontWeight: 'var(--weight-bold)' }}>
                  {timetable.location.city}, {timetable.location.country}
                </h3>
                {timetable.location.isAutoDetected ? (
                  <Badge variant="emerald">GPS Detected</Badge>
                ) : (
                  <Badge variant="gray">Manual Location</Badge>
                )}
              </div>
              <p className="text-xs text-muted" style={{ margin: 0 }}>
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
              <Compass size={14} /> GPS Locate
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
          showExplanation={true}
        />
      </Card>

      {/* Hero Countdown for Active/Next Prayer */}
      <NextPrayerHero timetable={timetable} />

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
                      {isProhibited ? (
                        <AlertCircle size={18} />
                      ) : isCurrent ? (
                        <CheckCircle size={18} />
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
                        {prayer.key === 'asr' && (
                          <span
                            className="badge badge-emerald"
                            style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                          >
                            {madhhab.toUpperCase()} {madhhab === 'hanafi' ? '2×' : '1×'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted" style={{ display: 'block' }}>
                        {prayer.description}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
                      {timeFormat === '24h' ? prayer.time24Formatted : prayer.timeFormatted}
                    </span>

                    {isCurrent && <Badge variant="emerald">Active</Badge>}
                    {isNext && <Badge variant="gold">Upcoming</Badge>}
                    {isProhibited && <Badge variant="red">Prohibited</Badge>}
                    {prayer.isVoluntary && !isCurrent && !isNext && (
                      <Badge variant="purple">Sunnah / Nafl</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Monthly Timetable Grid View */
        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="heading-3" style={{ margin: 0 }}>
              Monthly Prayer Calendar — {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selectedDate)}
            </h3>
            <p className="text-secondary text-xs" style={{ margin: 0 }}>
              {timetable.location.city} • Method: {calculationMethod} • Madhhab: {madhhab.toUpperCase()}
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-default)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-3)' }}>Date</th>
                  <th style={{ padding: 'var(--space-3)' }}>Fajr</th>
                  <th style={{ padding: 'var(--space-3)' }}>Sunrise</th>
                  <th style={{ padding: 'var(--space-3)' }}>Zuhr</th>
                  <th style={{ padding: 'var(--space-3)' }}>Asr ({madhhab.toUpperCase()})</th>
                  <th style={{ padding: 'var(--space-3)' }}>Maghrib</th>
                  <th style={{ padding: 'var(--space-3)' }}>Isha</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((dayResult, idx) => {
                  const isToday =
                    dayResult.date.getDate() === new Date().getDate() &&
                    dayResult.date.getMonth() === new Date().getMonth();

                  const fajr = dayResult.prayers.find((p) => p.key === 'fajr')?.timeFormatted;
                  const sunrise = dayResult.prayers.find((p) => p.key === 'sunrise')?.timeFormatted;
                  const zuhr = dayResult.prayers.find((p) => p.key === 'zuhr')?.timeFormatted;
                  const asr = dayResult.prayers.find((p) => p.key === 'asr')?.timeFormatted;
                  const maghrib = dayResult.prayers.find((p) => p.key === 'maghrib')?.timeFormatted;
                  const isha = dayResult.prayers.find((p) => p.key === 'isha')?.timeFormatted;

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: isToday ? 'var(--brand-primary-light)' : 'transparent',
                        fontWeight: isToday ? 'var(--weight-bold)' : 'normal',
                      }}
                    >
                      <td style={{ padding: 'var(--space-3)' }}>
                        {dayResult.date.getDate()} {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dayResult.date)}
                        {isToday && <span style={{ color: 'var(--brand-primary)', marginLeft: 6 }}>● Today</span>}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>{fajr}</td>
                      <td style={{ padding: 'var(--space-3)' }}>{sunrise}</td>
                      <td style={{ padding: 'var(--space-3)' }}>{zuhr}</td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--brand-primary)' }}>{asr}</td>
                      <td style={{ padding: 'var(--space-3)' }}>{maghrib}</td>
                      <td style={{ padding: 'var(--space-3)' }}>{isha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal for Selecting Global City */}
      {showCityModal && (
        <div
          className="drawer-backdrop open"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <Card
            style={{
              maxWidth: 500,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0 }}>Select City</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowCityModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <input
                type="text"
                className="input"
                placeholder="Search city or country..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {filteredCities.map((city: LocationInfo, i: number) => (
                <button
                  key={i}
                  className="btn btn-ghost"
                  style={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                  }}
                  onClick={() => {
                    selectCity(city);
                    setShowCityModal(false);
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'var(--weight-semibold)' }}>{city.city}</div>
                    <div className="text-xs text-muted">{city.country} • {city.timezone}</div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--brand-primary)' }}>
                    {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
