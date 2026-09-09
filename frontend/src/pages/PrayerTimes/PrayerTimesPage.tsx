import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MadhhabSelector } from '../../components/prayer/MadhhabSelector';
import { NextPrayerHero } from '../../components/prayer/NextPrayerHero';
import { PrayerCalendarView } from '../../components/prayer/PrayerCalendarView';
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
  ChevronDown,
  AlertCircle,
  Compass,
  Search,
  RefreshCw,
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
  } = usePrayerTimes();

  const {
    accuracy,
    isLowAccuracy,
    latitude,
    longitude,
    timezone,
  } = useLocationStore();

  const {
    madhhab,
    setMadhhab,
    calculationMethod,
    setCalculationMethod,
    highLatitudeRule,
    timeFormat,
    setTimeFormat,
  } = useSettingsStore();

  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [showCityModal, setShowCityModal] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close Date Picker popover on click outside or Escape key
  useEffect(() => {
    if (!isDatePickerOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDatePickerOpen]);

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

  const effectiveLocationName = displayName || `${timetable.location.city}, ${timetable.location.country}`;

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
              onClick={() => setViewMode((prev) => (prev === 'monthly' ? 'daily' : 'monthly'))}
              title={viewMode === 'monthly' ? 'Click to close calendar' : 'Click to view calendar'}
            >
              <CalendarIcon size={16} /> {viewMode === 'monthly' ? 'Close Calendar' : 'Calendar View'}
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
                  {effectiveLocationName}
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
              {isDetectingLocation ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Locating...
                </>
              ) : (
                <>
                  <Compass size={14} /> GPS Locate
                </>
              )}
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
            <span>{locationError}</span>
          </div>
        )}
      </Card>

      {/* Sunni Madhhab Selector (Recalculates Asr) & Method Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <Card>
          <MadhhabSelector
            selected={madhhab}
            onChange={(m: SunniMadhhab) => setMadhhab(m)}
          />
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

      {/* Main View Mode Content */}
      {viewMode === 'daily' ? (
        <>
          {/* Date Navigation Strip with Interactive Calendar Toggle */}
          <Card className="date-navigation-card">
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div ref={datePickerRef} className="date-picker-toggle-wrapper" style={{ position: 'relative' }}>
                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                  Selected Date
                </span>
                {/* Interactive Clickable Date Field / Dropdown Toggle Button */}
                <button
                  type="button"
                  className={`date-picker-toggle-btn ${isDatePickerOpen ? 'active' : ''}`}
                  onClick={() => setIsDatePickerOpen((prev) => !prev)}
                  aria-expanded={isDatePickerOpen}
                  aria-label="Toggle Date Calendar Picker"
                  title={isDatePickerOpen ? 'Click to close calendar' : 'Click to choose date from calendar'}
                >
                  <CalendarIcon size={16} className="date-icon" style={{ color: 'var(--brand-primary)' }} />
                  <span className="date-text" style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)' }}>
                    {timetable.dateFormatted}
                  </span>
                  <ChevronDown
                    size={15}
                    style={{
                      transition: 'transform var(--transition-fast)',
                      transform: isDatePickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: 'var(--text-muted)',
                      marginLeft: '2px',
                    }}
                  />
                </button>

                {/* Calendar Dropdown Popover */}
                {isDatePickerOpen && (
                  <div className="calendar-dropdown-popover">
                    <PrayerCalendarView
                      selectedDate={selectedDate}
                      onSelectDate={(newDate) => {
                        setSelectedDate(newDate);
                      }}
                      onClose={() => setIsDatePickerOpen(false)}
                      isCompact={true}
                      locationName={effectiveLocationName}
                      latitude={latitude ?? timetable.location.latitude}
                      longitude={longitude ?? timetable.location.longitude}
                      timezone={timezone || timetable.location.timezone}
                      madhhab={madhhab}
                      calculationMethod={calculationMethod}
                      highLatitudeRule={highLatitudeRule}
                      timeFormat={timeFormat}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
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

          {/* Hero Countdown for Active/Next Prayer */}
          <NextPrayerHero
            timetable={timetable}
            locationName={effectiveLocationName}
            onOpenLocationPicker={() => setShowCityModal(true)}
          />

          {/* Daily Timetable Display */}
          <Card>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 className="heading-3" style={{ margin: 0 }}>Complete 12-Slot Daily Timetable</h3>
              <p className="text-secondary text-xs" style={{ margin: 0 }}>
                Fard prayers, astronomical boundaries, and voluntary windows for {timetable.dateFormatted}
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
        </>
      ) : (
        /* Calendar Date Selector & Selected Date Timetable View */
        <PrayerCalendarView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          locationName={effectiveLocationName}
          latitude={latitude ?? timetable.location.latitude}
          longitude={longitude ?? timetable.location.longitude}
          timezone={timezone || timetable.location.timezone}
          madhhab={madhhab}
          calculationMethod={calculationMethod}
          highLatitudeRule={highLatitudeRule}
          timeFormat={timeFormat}
        />
      )}


      {/* Global Location Picker Modal */}
      <LocationPickerModal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
      />
    </div>
  );
};


