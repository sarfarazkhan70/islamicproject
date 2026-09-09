import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  SunniMadhhab,
  CalculationMethod,
  HighLatitudeRule,
  DailyPrayerTimesResult,
} from '../../core/prayerEngine/types';
import { calculatePrayerTimes } from '../../core/prayerEngine/prayerEngine';
import { gregorianToHijri } from '../../utils/hijriCalendar';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sunrise,
  Sun,
  Sunset as SunsetIcon,
  Moon,
  Sparkles,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export interface PrayerCalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  locationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  madhhab: SunniMadhhab;
  calculationMethod: CalculationMethod;
  highLatitudeRule?: HighLatitudeRule;
  timeFormat?: '12h' | '24h';
  onClose?: () => void;
  isCompact?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const PrayerCalendarView: React.FC<PrayerCalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  locationName,
  latitude,
  longitude,
  timezone,
  madhhab,
  calculationMethod,
  highLatitudeRule = 'TwilightAngle',
  timeFormat = '12h',
  onClose,
  isCompact = false,
}) => {
  // Calendar viewing month/year state (allows browsing any month or year)
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth() + 1); // 1-12

  // Sync viewing month/year when selectedDate prop changes
  useEffect(() => {
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth() + 1);
  }, [selectedDate]);

  // Handle Escape key to close
  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
    onSelectDate(today);
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month - 1, day, 12, 0, 0);
    onSelectDate(newDate);
    // If clicking a date from adjacent month filler, update view to that month
    if (year !== viewYear || month !== viewMonth) {
      setViewYear(year);
      setViewMonth(month);
    }
  };



  // Build the calendar days matrix
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hijriDay?: number;
    }> = [];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const selectedStr = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;

    // Prev month padding cells
    const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
    const prevMonthNum = viewMonth === 1 ? 12 : viewMonth - 1;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const cellDateStr = `${prevYear}-${prevMonthNum}-${dayNum}`;
      cells.push({
        day: dayNum,
        month: prevMonthNum,
        year: prevYear,
        isCurrentMonth: false,
        isToday: cellDateStr === todayStr,
        isSelected: cellDateStr === selectedStr,
      });
    }

    // Current month cells
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDateStr = `${viewYear}-${viewMonth}-${d}`;
      let hijriDay: number | undefined;
      try {
        const h = gregorianToHijri(new Date(viewYear, viewMonth - 1, d, 12, 0, 0));
        hijriDay = h.day;
      } catch {
        hijriDay = undefined;
      }

      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isToday: cellDateStr === todayStr,
        isSelected: cellDateStr === selectedStr,
        hijriDay,
      });
    }

    // Next month padding cells to complete full grid (multiples of 7)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;
    const nextMonthNum = viewMonth === 12 ? 1 : viewMonth + 1;
    for (let d = 1; d <= remaining; d++) {
      const cellDateStr = `${nextYear}-${nextMonthNum}-${d}`;
      cells.push({
        day: d,
        month: nextMonthNum,
        year: nextYear,
        isCurrentMonth: false,
        isToday: cellDateStr === todayStr,
        isSelected: cellDateStr === selectedStr,
      });
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate]);

  // Mid-month Hijri info for header label
  const midMonthHijriLabel = useMemo(() => {
    try {
      const midDate = new Date(viewYear, viewMonth - 1, 15, 12, 0, 0);
      const h = gregorianToHijri(midDate);
      return `${h.monthName} ${h.year} AH`;
    } catch {
      return '';
    }
  }, [viewYear, viewMonth]);

  // Selected Date's Prayer Calculation Timetable (using existing calculation engine)
  const selectedTimetable = useMemo<DailyPrayerTimesResult>(() => {
    return calculatePrayerTimes({
      date: selectedDate,
      latitude,
      longitude,
      timezone,
      options: {
        madhhab,
        calculationMethod,
        highLatitudeRule,
        timeFormat,
      },
    });
  }, [selectedDate, latitude, longitude, timezone, madhhab, calculationMethod, highLatitudeRule, timeFormat]);

  // Formatted representations of the selected date
  const selectedDateFormatted = useMemo(() => {
    return selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  const selectedHijri = useMemo(() => {
    try {
      const h = gregorianToHijri(selectedDate);
      return `${h.day} ${h.monthName} ${h.year} AH`;
    } catch {
      return '';
    }
  }, [selectedDate]);

  const isTodaySelected = selectedDate.toDateString() === new Date().toDateString();

  // Helper icon for prayer slot
  const getPrayerIcon = (key: string, _category: string, isProhibited?: boolean) => {
    if (isProhibited) return <AlertTriangle size={16} style={{ color: 'var(--status-missed)' }} />;
    switch (key) {
      case 'fajr':
        return <Sunrise size={16} style={{ color: 'var(--brand-teal)' }} />;
      case 'sunrise':
        return <Sun size={16} style={{ color: 'var(--brand-gold)' }} />;
      case 'ishraq':
      case 'chasht':
        return <Sparkles size={16} style={{ color: 'var(--brand-gold)' }} />;
      case 'zawal':
        return <AlertTriangle size={16} style={{ color: 'var(--status-missed)' }} />;
      case 'zuhr':
        return <Sun size={16} style={{ color: 'var(--brand-primary)' }} />;
      case 'asr':
        return <Sun size={16} style={{ color: 'var(--brand-gold)' }} />;
      case 'sunset':
        return <SunsetIcon size={16} style={{ color: 'var(--status-missed)' }} />;
      case 'maghrib':
        return <SunsetIcon size={16} style={{ color: 'var(--brand-primary)' }} />;
      case 'isha':
        return <Moon size={16} style={{ color: 'var(--brand-teal)' }} />;
      case 'tahajjud':
        return <Moon size={16} style={{ color: 'var(--brand-gold)' }} />;
      default:
        return <Clock size={16} />;
    }
  };

  // Helper badge text for prayer slot
  const getCategoryBadge = (prayer: (typeof selectedTimetable.prayers)[0]) => {
    if (prayer.isProhibited) {
      return <Badge variant="red">Prohibited</Badge>;
    }
    if (prayer.isFard) {
      return <Badge variant="emerald">Fard</Badge>;
    }
    if (prayer.isVoluntary) {
      return <Badge variant="gold">Sunnah / Nafl</Badge>;
    }
    return <Badge variant="gray">Astronomical</Badge>;
  };

  if (isCompact) {
    return (
      <div className="prayer-calendar-compact">
        <Card className="calendar-selector-card calendar-compact-card">
          {/* Month Header & Controls */}
          <div className="calendar-header-strip">
            <div>
              {midMonthHijriLabel && <div className="calendar-month-hijri">{midMonthHijriLabel}</div>}
              <h2 className="calendar-month-title">
                {MONTH_NAMES[viewMonth - 1]} {viewYear}
              </h2>
            </div>

            <div className="calendar-nav-buttons">
              <button
                type="button"
                className="btn-icon btn-icon-sm"
                onClick={handlePrevMonth}
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToToday}
                className="calendar-today-btn"
              >
                Today
              </Button>
              <button
                type="button"
                className="btn-icon btn-icon-sm"
                onClick={handleNextMonth}
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
              {onClose && (
                <button
                  type="button"
                  className="btn-icon btn-icon-sm"
                  onClick={onClose}
                  title="Close Calendar (Esc)"
                  aria-label="Close Calendar"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Weekday Row */}
          <div className="calendar-weekdays-grid">
            {WEEKDAY_NAMES.map((d) => (
              <div key={d} className="calendar-weekday-cell">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-days-grid">
            {calendarCells.map((cell, idx) => {
              const cellClasses = [
                'calendar-day-btn',
                !cell.isCurrentMonth ? 'other-month' : '',
                cell.isToday ? 'is-today' : '',
                cell.isSelected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  type="button"
                  className={cellClasses}
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  aria-label={`${cell.day} ${MONTH_NAMES[cell.month - 1]} ${cell.year}`}
                  aria-pressed={cell.isSelected}
                >
                  <span className="calendar-day-num">{cell.day}</span>
                  {cell.hijriDay !== undefined && (
                    <span className="calendar-hijri-num">{cell.hijriDay}</span>
                  )}
                  {cell.isToday && <span className="calendar-today-dot" />}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer Hint */}
          <div className="calendar-footer-hint">
            <Info size={13} />
            <span>Click any date to select. Press Esc or click outside to close.</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="prayer-calendar-experience">
      {/* 2-Column Responsive Layout: Calendar Date Selector & Selected Date Timetable */}
      <div className="prayer-calendar-layout">
        {/* ========================================================================= */}
        {/* COLUMN 1: INTERACTIVE DATE CALENDAR                                      */}
        {/* ========================================================================= */}
        <Card className="calendar-selector-card">
          {/* Month Header & Controls */}
          <div className="calendar-header-strip">
            <div>
              {midMonthHijriLabel && <div className="calendar-month-hijri">{midMonthHijriLabel}</div>}
              <h2 className="calendar-month-title">
                {MONTH_NAMES[viewMonth - 1]} {viewYear}
              </h2>
            </div>

            <div className="calendar-nav-buttons">
              <button
                type="button"
                className="btn-icon btn-icon-sm"
                onClick={handlePrevMonth}
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToToday}
                className="calendar-today-btn"
              >
                Today
              </Button>
              <button
                type="button"
                className="btn-icon btn-icon-sm"
                onClick={handleNextMonth}
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
              {onClose && (
                <button
                  type="button"
                  className="btn-icon btn-icon-sm"
                  onClick={onClose}
                  title="Close Calendar (Esc)"
                  aria-label="Close Calendar"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>


          {/* Weekday Row */}
          <div className="calendar-weekdays-grid">
            {WEEKDAY_NAMES.map((d) => (
              <div key={d} className="calendar-weekday-cell">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-days-grid">
            {calendarCells.map((cell, idx) => {
              const cellClasses = [
                'calendar-day-btn',
                !cell.isCurrentMonth ? 'other-month' : '',
                cell.isToday ? 'is-today' : '',
                cell.isSelected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  type="button"
                  className={cellClasses}
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  aria-label={`${cell.day} ${MONTH_NAMES[cell.month - 1]} ${cell.year}`}
                  aria-pressed={cell.isSelected}
                >
                  <span className="calendar-day-num">{cell.day}</span>
                  {cell.hijriDay !== undefined && (
                    <span className="calendar-hijri-num">{cell.hijriDay}</span>
                  )}
                  {cell.isToday && <span className="calendar-today-dot" />}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer Hint */}
          <div className="calendar-footer-hint">
            <Info size={13} />
            <span>Click any date above to view its complete calculated prayer timetable.</span>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* COLUMN 2: SELECTED DATE PRAYER TIMETABLE                                 */}
        {/* ========================================================================= */}
        <Card className="selected-timetable-card">
          {/* Card Header */}
          <div className="timetable-header-strip">
            <div className="timetable-header-left">
              <span className="timetable-kicker">Prayer Timetable</span>
              <h2 className="timetable-selected-date">{selectedDateFormatted}</h2>
              {selectedHijri && (
                <div className="timetable-selected-hijri">
                  <span className="hijri-badge">{selectedHijri}</span>
                  {isTodaySelected && <Badge variant="emerald">Today</Badge>}
                </div>
              )}
            </div>

            <div className="timetable-header-meta">
              <span className="meta-pill">{locationName}</span>
              <span className="meta-pill">Asr: {madhhab.toUpperCase()}</span>
              <span className="meta-pill">{calculationMethod}</span>
            </div>
          </div>

          {/* Timetable List */}
          <div className="timetable-rows-list">
            {selectedTimetable.prayers.map((prayer) => {
              const isCurrent = isTodaySelected && selectedTimetable.currentPrayer?.key === prayer.key;
              const isNext = isTodaySelected && selectedTimetable.nextPrayer?.key === prayer.key;
              const isProhibited = prayer.isProhibited;

              const rowClasses = [
                'timetable-row-item',
                isCurrent ? 'row-current' : '',
                isNext ? 'row-next' : '',
                isProhibited ? 'row-prohibited' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={prayer.key} className={rowClasses}>
                  {/* Left Section: Icon + Prayer Name + Arabic */}
                  <div className="timetable-row-left">
                    <div className="timetable-slot-icon">
                      {getPrayerIcon(prayer.key, prayer.category, prayer.isProhibited)}
                    </div>
                    <div className="timetable-name-group">
                      <div className="timetable-name-line">
                        <span className="timetable-prayer-name">{prayer.name}</span>
                        {getCategoryBadge(prayer)}
                        {isCurrent && <Badge variant="emerald">Current</Badge>}
                        {isNext && <Badge variant="gold">Next</Badge>}
                      </div>
                      <div className="timetable-desc-line">
                        <span className="timetable-arabic-name font-arabic">{prayer.arabicName}</span>
                        <span className="timetable-note-text">• {prayer.description}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Formatted Time + Window End */}
                  <div className="timetable-row-right">
                    <div className="timetable-time-value">{prayer.timeFormatted}</div>
                    {prayer.windowEnd && (
                      <div className="timetable-window-end">
                        until {prayer.windowEnd.timeFormatted}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="timetable-card-footer">
            <span>
              Astronomical solar calculations based on {locationName} ({latitude.toFixed(3)}°N, {longitude.toFixed(3)}°E) • Timezone: {timezone}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
