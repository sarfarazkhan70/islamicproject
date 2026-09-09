import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { PrayerStatusToggle } from '../../components/prayer/PrayerStatusToggle';
import { PrayerCalendarView } from '../../components/prayer/PrayerCalendarView';
import { useTrackerStore, TrackerStatus } from '../../stores/useTrackerStore.js';
import { usePrayerTimes } from '../../hooks/usePrayerTimes.js';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const TrackerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { timetable } = usePrayerTimes(selectedDate);
  const { getPrayerStatus, setPrayerStatus } = useTrackerStore();
  const { latitude, longitude, timezone, displayName } = useLocationStore();
  const { madhhab, calculationMethod, highLatitudeRule, timeFormat } = useSettingsStore();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

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

  const localDateStr = selectedDate.toISOString().split('T')[0];

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

  const getPrayerTime = (key: string) => {
    const p = timetable.prayers.find((x) => x.key === key);
    return p ? p.timeFormatted : '--:--';
  };

  const obligatoryPrayers = [
    { id: 'fajr', name: 'Fajr', arabic: 'الفجر', time: getPrayerTime('fajr') },
    { id: 'zuhr', name: 'Zuhr', arabic: 'الظهر', time: getPrayerTime('zuhr') },
    { id: 'asr', name: 'Asr', arabic: 'العصر', time: getPrayerTime('asr') },
    { id: 'maghrib', name: 'Maghrib', arabic: 'المغرب', time: getPrayerTime('maghrib') },
    { id: 'isha', name: 'Isha', arabic: 'العشاء', time: getPrayerTime('isha') },
  ];

  const voluntaryPrayers = [
    { id: 'tahajjud', name: 'Tahajjud (Qiyam)', arabic: 'التهجد', time: getPrayerTime('tahajjud'), isVoluntary: true },
    { id: 'ishraq', name: 'Ishraq', arabic: 'الإشراق', time: getPrayerTime('ishraq'), isVoluntary: true },
    { id: 'chasht', name: 'Chasht / Duha', arabic: 'الضحى', time: getPrayerTime('chasht'), isVoluntary: true },
  ];

  // Count completions
  const adaCount = obligatoryPrayers.filter((p) => getPrayerStatus(localDateStr, p.id) === 'ADA').length;
  const excusedCount = obligatoryPrayers.filter((p) => getPrayerStatus(localDateStr, p.id) === 'EXCUSED').length;
  const missedCount = obligatoryPrayers.filter((p) => getPrayerStatus(localDateStr, p.id) === 'MISSED').length;
  const qazaCount = obligatoryPrayers.filter((p) => getPrayerStatus(localDateStr, p.id) === 'QAZA').length;

  const completedTotal = adaCount + excusedCount;
  const progressPercent = (completedTotal / obligatoryPrayers.length) * 100;

  const isToday = new Date().toISOString().split('T')[0] === localDateStr;
  const effectiveLocationName = displayName || `${timetable.location.city}, ${timetable.location.country}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Namaz Daily Tracker"
        arabicTitle="متابعة الصلوات اليومية"
        subtitle="Log your daily prayers on time. Track Ada, Missed, Excused, Qaza, and voluntary prayers."
      />

      {/* Date Navigation Strip */}
      <Card>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div ref={datePickerRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={`date-picker-toggle-btn ${isDatePickerOpen ? 'active' : ''}`}
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              aria-expanded={isDatePickerOpen}
              aria-label="Toggle Calendar Date Picker"
              title={isDatePickerOpen ? 'Click to close calendar' : 'Click to choose date from calendar'}
            >
              <CalendarIcon size={18} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>
                    {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(selectedDate)}
                  </span>
                  {isToday && <span className="badge badge-emerald">Today</span>}
                  <ChevronDown
                    size={15}
                    style={{
                      transition: 'transform var(--transition-fast)',
                      transform: isDatePickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
                <p className="text-xs text-muted" style={{ margin: 0 }}>
                  {effectiveLocationName} • Madhhab: {madhhab.toUpperCase()}
                </p>
              </div>
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


      {/* Progress Summary Card */}
      <Card
        highlighted
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.08))',
        }}
      >
        <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div>
            <span className="label" style={{ color: 'var(--brand-primary)' }}>
              Fard Prayers Status
            </span>
            <h3 className="heading-2" style={{ margin: 0 }}>
              {adaCount} of {obligatoryPrayers.length} Ada Completed
            </h3>
            <p className="text-xs text-muted" style={{ marginTop: 2, marginBottom: 0 }}>
              {missedCount > 0 && <span style={{ color: 'var(--status-missed)', marginRight: 8 }}>● {missedCount} Missed</span>}
              {excusedCount > 0 && <span style={{ color: 'var(--status-excused, #8b5cf6)', marginRight: 8 }}>● {excusedCount} Excused</span>}
              {qazaCount > 0 && <span style={{ color: 'var(--text-gold)' }}>● {qazaCount} Qaza</span>}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-extrabold)',
                color: 'var(--brand-primary)',
              }}
            >
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
        <ProgressBar progress={progressPercent} height={10} />
      </Card>

      {/* Obligatory Prayers Section */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-3)' }}>
          Five Daily Fard Prayers
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {obligatoryPrayers.map((prayer) => (
            <PrayerStatusToggle
              key={prayer.id}
              prayerKey={prayer.id}
              displayName={prayer.name}
              arabicName={prayer.arabic}
              time={prayer.time}
              status={getPrayerStatus(localDateStr, prayer.id)}
              onStatusChange={(pk, status: TrackerStatus) => setPrayerStatus(localDateStr, pk, status)}
            />
          ))}
        </div>
      </div>

      {/* Voluntary (Sunnah & Nafl) Section */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-3)' }}>
          Voluntary (Sunnah & Nafl) Prayers
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {voluntaryPrayers.map((prayer) => (
            <PrayerStatusToggle
              key={prayer.id}
              prayerKey={prayer.id}
              displayName={prayer.name}
              arabicName={prayer.arabic}
              time={prayer.time}
              status={getPrayerStatus(localDateStr, prayer.id)}
              onStatusChange={(pk, status: TrackerStatus) => setPrayerStatus(localDateStr, pk, status)}
              isVoluntary={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
