import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { useTrackerStore, TrackerStatus } from '../../stores/useTrackerStore.js';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { calculatePrayerTimes } from '../../core/prayerEngine/prayerEngine';
import { gregorianToHijri } from '../../utils/hijriCalendar';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Plane,
  RotateCcw,
  Check,
  X,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Year options: 2020 through 2035 (covering historical and upcoming years)
const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => 2020 + i);

const OBLIGATORY_PRAYERS_DEF = [
  { id: 'fajr', name: 'Fajr', arabic: 'الفجر' },
  { id: 'zuhr', name: 'Zuhr', arabic: 'الظهر' },
  { id: 'asr', name: 'Asr', arabic: 'العصر' },
  { id: 'maghrib', name: 'Maghrib', arabic: 'المغرب' },
  { id: 'isha', name: 'Isha', arabic: 'العشاء' },
];

export const HistoryPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth() + 1); // 1-12

  const {
    recordsByDate,
    safarQazaByDate,
    setPrayerStatus,
    getPrayerStatus,
    isPrayerSafarQaza,
    setSafarQaza,
    markQazaAsAda,
    getQazaCompletionInfo,
    getDateSummary,
    getMonthSummary,
  } = useTrackerStore();

  const { latitude, longitude, timezone } = useLocationStore();
  const { madhhab, calculationMethod, highLatitudeRule, timeFormat } = useSettingsStore();

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDateStr === todayDateStr;

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
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth() + 1);
    setSelectedDate(now);
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const newD = new Date(year, month - 1, day, 12, 0, 0);
    setSelectedDate(newD);
    if (year !== viewYear || month !== viewMonth) {
      setViewYear(year);
      setViewMonth(month);
    }
  };

  // Month Statistics Summary
  const monthSummary = useMemo(() => {
    return getMonthSummary(viewYear, viewMonth);
  }, [viewYear, viewMonth, recordsByDate, safarQazaByDate, getMonthSummary]);

  // Selected Date Summary
  const dateSummary = useMemo(() => {
    return getDateSummary(selectedDateStr);
  }, [selectedDateStr, recordsByDate, safarQazaByDate, getDateSummary]);

  // Timetable for the selected date
  const selectedTimetable = useMemo(() => {
    try {
      return calculatePrayerTimes({
        date: selectedDate,
        latitude: latitude || 21.4225,
        longitude: longitude || 39.8262,
        timezone: timezone || 'UTC',
        options: {
          madhhab,
          calculationMethod,
          highLatitudeRule,
          timeFormat,
        },
      });
    } catch {
      return null;
    }
  }, [selectedDate, latitude, longitude, timezone, madhhab, calculationMethod, highLatitudeRule, timeFormat]);

  const getCalculatedTime = (key: string) => {
    if (!selectedTimetable) return '--:--';
    const p = selectedTimetable.prayers.find((x) => x.key === key);
    return p ? p.timeFormatted : '--:--';
  };

  // Hijri Month label for calendar header
  const midMonthHijriLabel = useMemo(() => {
    try {
      const mid = new Date(viewYear, viewMonth - 1, 15, 12, 0, 0);
      const h = gregorianToHijri(mid);
      return `${h.monthName} ${h.year} AH`;
    } catch {
      return '';
    }
  }, [viewYear, viewMonth]);

  // Selected Date Formatted Labels
  const selectedDateFormatted = useMemo(() => {
    return selectedDate.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  const selectedHijriFormatted = useMemo(() => {
    try {
      const h = gregorianToHijri(selectedDate);
      return `${h.day} ${h.monthName} ${h.year} AH`;
    } catch {
      return '';
    }
  }, [selectedDate]);

  // Build Calendar Matrix
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: Array<{
      day: number;
      month: number;
      year: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hijriDay?: number;
      statuses: Array<{
        prayer: string;
        status: TrackerStatus;
        isSafarQaza: boolean;
      }>;
      allAda: boolean;
    }> = [];

    const buildCell = (y: number, m: number, d: number, isCurr: boolean) => {
      const dStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let hijriDay: number | undefined;
      try {
        const h = gregorianToHijri(new Date(y, m - 1, d, 12, 0, 0));
        hijriDay = h.day;
      } catch {
        hijriDay = undefined;
      }

      const dayRecords = recordsByDate[dStr] || {};
      const daySafarFlags = safarQazaByDate[dStr] || {};

      const statuses = OBLIGATORY_PRAYERS_DEF.map((p) => ({
        prayer: p.id,
        status: dayRecords[p.id] || ('NONE' as TrackerStatus),
        isSafarQaza: Boolean(daySafarFlags[p.id]),
      }));

      const adaCount = statuses.filter((s) => s.status === 'ADA').length;
      const allAda = adaCount === 5;

      return {
        day: d,
        month: m,
        year: y,
        dateStr: dStr,
        isCurrentMonth: isCurr,
        isToday: dStr === todayDateStr,
        isSelected: dStr === selectedDateStr,
        hijriDay,
        statuses,
        allAda,
      };
    };

    // Prev month padding cells
    const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
    const prevMonthNum = viewMonth === 1 ? 12 : viewMonth - 1;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      cells.push(buildCell(prevYear, prevMonthNum, dayNum, false));
    }

    // Current month cells
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(buildCell(viewYear, viewMonth, d, true));
    }

    // Next month padding cells (multiples of 7)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;
    const nextMonthNum = viewMonth === 12 ? 1 : viewMonth + 1;
    for (let d = 1; d <= remaining; d++) {
      cells.push(buildCell(nextYear, nextMonthNum, d, false));
    }

    return cells;
  }, [viewYear, viewMonth, selectedDateStr, todayDateStr, recordsByDate, safarQazaByDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Prayer History & Qaza Calendar"
        arabicTitle="سجل الصلوات وقضاء الفوائت"
        subtitle="Complete monthly prayer log and interactive Qaza management calendar connected with Namaz Tracker."
      />

      {/* Monthly Summary 4-Column Stat Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Ada"
          value={monthSummary.ada}
          subtitle={`In ${MONTH_NAMES[viewMonth - 1]} ${viewYear}`}
          icon={<CheckCircle2 size={20} />}
        />
        <StatCard
          title="Total Missed"
          value={monthSummary.missed}
          subtitle="Missed Salah in month"
          icon={<XCircle size={20} style={{ color: 'var(--status-missed)' }} />}
        />
        <StatCard
          title="Total Safar Mein Qaza"
          value={monthSummary.safarQaza}
          subtitle="Qaza occurred in Safar"
          icon={<Plane size={20} style={{ color: '#f59e0b' }} />}
        />
        <StatCard
          title="Qaza Remaining"
          value={monthSummary.qazaRemaining}
          subtitle="Total lifetime balance"
          icon={<RotateCcw size={20} style={{ color: 'var(--brand-gold)' }} />}
        />
      </div>

      {/* Main 2-Column Responsive Layout: Standard Calendar Date Picker (Left) + Selected Date Daily Chart (Right) */}
      <div className="history-calendar-layout">
        {/* ========================================================================= */}
        {/* COLUMN 1: STANDARD CALENDAR DATE PICKER                                    */}
        {/* ========================================================================= */}
        <div className="history-calendar-card">
          {/* Calendar Header with Month & Year Selectors (Requirements 2, 3, 4) */}
          <div className="history-calendar-header-strip">
            <div className="history-calendar-selects-group">
              {/* Month Selector */}
              <select
                className="history-calendar-select"
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                aria-label="Select Month"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                className="history-calendar-select"
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                aria-label="Select Year"
              >
                {YEAR_OPTIONS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {/* Hijri Month Badge */}
              {midMonthHijriLabel && (
                <span className="badge badge-emerald font-arabic" style={{ fontSize: '0.75rem' }}>
                  {midMonthHijriLabel}
                </span>
              )}
            </div>

            {/* Previous, Today, Next Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <button
                type="button"
                className="btn-icon btn-icon-sm"
                onClick={handlePrevMonth}
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <Button variant="outline" size="sm" onClick={handleGoToToday}>
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
            </div>
          </div>

          {/* Weekday Header Row */}
          <div className="history-weekdays-grid">
            {WEEKDAY_NAMES.map((d) => (
              <div key={d} className="history-weekday-cell">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="history-days-grid">
            {calendarCells.map((cell) => {
              const cellClasses = [
                'history-day-btn',
                !cell.isCurrentMonth ? 'other-month' : '',
                cell.isToday ? 'is-today' : '',
                cell.isSelected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  className={cellClasses}
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  aria-label={`${cell.day} ${MONTH_NAMES[cell.month - 1]} ${cell.year}`}
                  aria-pressed={cell.isSelected}
                >
                  <div className="history-day-header">
                    <span className="history-day-num">{cell.day}</span>
                    {cell.hijriDay !== undefined && (
                      <span className="history-hijri-num">{cell.hijriDay}</span>
                    )}
                  </div>

                  {/* Multi-Status Indicators Strip */}
                  <div className="history-status-dots-strip">
                    {cell.statuses.map((st, i) => {
                      let dotClass = 'dot-none';
                      let titleStr = `${st.prayer}: Not logged`;

                      if (st.status === 'ADA') {
                        dotClass = 'dot-ada';
                        titleStr = `${st.prayer}: Ada`;
                      } else if (st.isSafarQaza) {
                        dotClass = 'dot-safar-qaza';
                        titleStr = `${st.prayer}: Safar Mein Qaza`;
                      } else if (st.status === 'MISSED') {
                        dotClass = 'dot-missed';
                        titleStr = `${st.prayer}: Missed`;
                      } else if (st.status === 'SAFAR' || st.status === 'EXCUSED') {
                        dotClass = 'dot-safar';
                        titleStr = `${st.prayer}: Safar`;
                      } else if (st.status === 'QAZA') {
                        dotClass = 'dot-qaza';
                        titleStr = `${st.prayer}: Qaza`;
                      }

                      return (
                        <span
                          key={`${st.prayer}-${i}`}
                          className={`history-dot ${dotClass}`}
                          title={titleStr}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Indicators Legend */}
          <div className="history-calendar-legend">
            <div className="legend-item">
              <span className="history-dot dot-ada" />
              <span>Ada (Green)</span>
            </div>
            <div className="legend-item">
              <span className="history-dot dot-missed" />
              <span>Missed (Red)</span>
            </div>
            <div className="legend-item">
              <span className="history-dot dot-safar-qaza" />
              <span>Safar Qaza (Yellow)</span>
            </div>
            <div className="legend-item">
              <span className="history-dot dot-qaza" />
              <span>Qaza (Gold)</span>
            </div>
            <div className="legend-item">
              <span className="history-dot dot-safar" />
              <span>Safar (Sky)</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: COMPLETE DAILY PRAYER CHART FOR SELECTED DATE                   */}
        {/* ========================================================================= */}
        <div className="history-daily-chart-card">
          {/* Daily Header */}
          <div className="history-daily-header">
            <div>
              <span className="label" style={{ color: 'var(--brand-primary)' }}>
                Daily Prayer Chart
              </span>
              <h3 className="heading-3" style={{ margin: '2px 0 0 0' }}>
                {selectedDateFormatted}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                <span className="badge badge-emerald font-arabic" style={{ fontSize: '0.75rem' }}>
                  {selectedHijriFormatted}
                </span>
                {isToday && <span className="badge badge-emerald">Today</span>}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                {dateSummary.ada} / 5 Ada Completed
              </span>
            </div>
          </div>

          {/* Daily Summary Pill Bar */}
          <div className="history-daily-summary-strip">
            <div className="history-summary-pill">
              <span className="label" style={{ color: 'var(--brand-primary)' }}>Ada</span>
              <span className="val" style={{ color: 'var(--brand-primary)' }}>{dateSummary.ada}</span>
            </div>
            <div className="history-summary-pill">
              <span className="label" style={{ color: 'var(--status-missed)' }}>Missed</span>
              <span className="val" style={{ color: 'var(--status-missed)' }}>{dateSummary.missed}</span>
            </div>
            <div className="history-summary-pill">
              <span className="label" style={{ color: '#f59e0b' }}>Safar Qaza</span>
              <span className="val" style={{ color: '#f59e0b' }}>{dateSummary.safarQaza}</span>
            </div>
            <div className="history-summary-pill">
              <span className="label" style={{ color: 'var(--brand-gold)' }}>Qaza</span>
              <span className="val" style={{ color: 'var(--brand-gold)' }}>{dateSummary.qaza}</span>
            </div>
          </div>

          {/* 5 Obligatory Daily Prayers Rows */}
          <div className="history-prayer-rows-container">
            {OBLIGATORY_PRAYERS_DEF.map((prayer) => {
              const status = getPrayerStatus(selectedDateStr, prayer.id);
              const isSq = isPrayerSafarQaza(selectedDateStr, prayer.id);
              const completionInfo = getQazaCompletionInfo(selectedDateStr, prayer.id);
              const timeFormatted = getCalculatedTime(prayer.id);

              const isAda = status === 'ADA';
              const isMissed = status === 'MISSED';
              const isSafar = status === 'SAFAR' || status === 'EXCUSED';
              const isQaza = status === 'QAZA';
              const isMarked = status !== 'NONE';

              const cardClasses = clsx(
                'history-prayer-card',
                isAda && 'is-ada',
                isMissed && !isSq && 'is-missed',
                isSq && 'is-safar-qaza',
                isSafar && 'is-safar',
                isQaza && 'is-qaza'
              );

              return (
                <div key={prayer.id} className={cardClasses}>
                  {/* Top Row: Info + Status Badges */}
                  <div className="history-prayer-card-top">
                    <div className="history-prayer-info-left">
                      <div
                        className="history-prayer-avatar"
                        style={{
                          backgroundColor: isAda
                            ? 'var(--brand-primary)'
                            : isMissed && !isSq
                            ? 'var(--status-missed)'
                            : isSq
                            ? '#f59e0b'
                            : isSafar
                            ? 'var(--status-safar)'
                            : isQaza
                            ? 'var(--brand-gold)'
                            : 'var(--bg-surface-elevated)',
                          color: isMarked ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        {isAda ? (
                          <Check size={16} />
                        ) : isMissed ? (
                          <X size={16} />
                        ) : isSafar ? (
                          <Plane size={15} />
                        ) : isQaza ? (
                          <RefreshCw size={14} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>
                            {prayer.name}
                          </span>
                          <span className="font-arabic text-muted" style={{ fontSize: '0.9rem' }}>
                            {prayer.arabic}
                          </span>
                        </div>
                        <span className="text-xs text-muted">{timeFormatted}</span>
                      </div>
                    </div>

                    {/* Status Display Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {isAda && <span className="badge badge-emerald">✓ Ada</span>}
                      {isMissed && !isSq && <span className="badge badge-red">✗ Missed</span>}
                      {isSq && <span className="badge badge-amber"><Plane size={11} /> Safar Mein Qaza</span>}
                      {isSafar && <span className="badge badge-cyan"><Plane size={11} /> Safar</span>}
                      {isQaza && <span className="badge badge-purple"><RefreshCw size={11} /> Qaza</span>}
                      {!isMarked && <span className="badge badge-gray">Not Logged</span>}

                      {/* Qaza Completion Timestamp Note */}
                      {completionInfo && isAda && (
                        <span
                          className="history-qaza-completion-badge"
                          title={`Originally missed on ${selectedDateStr}, repaid as Ada on ${completionInfo.completedAtDate}`}
                        >
                          <Sparkles size={11} />
                          Qaza Completed: {completionInfo.completedAtDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Interactive Status Update Controls */}
                  <div className="history-prayer-actions-strip">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                      <button
                        className={clsx('btn btn-sm', isAda ? 'btn-primary' : 'btn-outline')}
                        style={{ padding: '3px 8px', height: 'auto', fontSize: 'var(--text-xs)' }}
                        onClick={() => setPrayerStatus(selectedDateStr, prayer.id, isAda ? 'NONE' : 'ADA')}
                        title="Mark as Ada"
                      >
                        <Check size={12} /> Ada
                      </button>

                      <button
                        className={clsx('btn btn-sm', isMissed && !isSq ? 'btn-danger' : 'btn-outline')}
                        style={{ padding: '3px 8px', height: 'auto', fontSize: 'var(--text-xs)' }}
                        onClick={() => setPrayerStatus(selectedDateStr, prayer.id, isMissed && !isSq ? 'NONE' : 'MISSED')}
                        title="Mark as Missed"
                      >
                        <X size={12} /> Missed
                      </button>

                      <button
                        className={clsx('btn btn-sm', isSafar ? 'btn-safar' : 'btn-outline')}
                        style={{ padding: '3px 8px', height: 'auto', fontSize: 'var(--text-xs)' }}
                        onClick={() => setPrayerStatus(selectedDateStr, prayer.id, isSafar ? 'NONE' : 'SAFAR')}
                        title="Mark as Safar (Travel prayer)"
                      >
                        <Plane size={12} /> Safar
                      </button>

                      <button
                        className={clsx('btn btn-sm', isQaza ? 'btn-secondary' : 'btn-ghost')}
                        style={{ padding: '3px 8px', height: 'auto', fontSize: 'var(--text-xs)', color: isQaza ? 'var(--text-gold)' : undefined }}
                        onClick={() => setPrayerStatus(selectedDateStr, prayer.id, isQaza ? 'NONE' : 'QAZA')}
                        title="Mark as Qaza"
                      >
                        <RefreshCw size={11} /> Qaza
                      </button>

                      {/* Safar Mein Qaza Toggle */}
                      {(isMissed || isQaza || isSq) && (
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isSq}
                          className={clsx('safar-qaza-control', isSq && 'checked')}
                          onClick={() => setSafarQaza(selectedDateStr, prayer.id, !isSq)}
                          title="Toggle Safar Mein Qaza status"
                          style={{ padding: '2px 8px' }}
                        >
                          <span className={clsx('safar-circular-checkbox', isSq && 'checked')}>
                            {isSq && <Check size={10} strokeWidth={3} />}
                          </span>
                          <span>Safar Mein Qaza</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {/* One-click Qaza Repayment Action */}
                      {(isMissed || isQaza || isSq) && (
                        <button
                          className="history-quick-repay-btn"
                          onClick={() => markQazaAsAda(selectedDateStr, prayer.id)}
                          title={`Fulfill this Qaza prayer today (${todayDateStr}) and mark as Ada`}
                        >
                          <CheckCircle2 size={13} />
                          Mark Qaza Repaid
                        </button>
                      )}

                      {isMarked && (
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ padding: '3px 6px', height: 'auto', color: 'var(--text-muted)' }}
                          onClick={() => setPrayerStatus(selectedDateStr, prayer.id, 'NONE')}
                          title="Reset / Undo"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
