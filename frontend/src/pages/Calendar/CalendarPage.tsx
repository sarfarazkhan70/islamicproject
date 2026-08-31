import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useCalendarStore } from '../../stores/useCalendarStore.js';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const {
    currentYear,
    currentMonth,
    moonAdjustment,
    calendarGrid,
    events,
    converterResultHijri,
    converterResultGregorian,
    setMonth,
    nextMonth,
    prevMonth,
    setMoonAdjustment,
    convertGregorian,
    convertHijri,
  } = useCalendarStore();

  const [gregInput, setGregInput] = useState(new Date().toISOString().slice(0, 10));
  const [hijriYearInput, setHijriYearInput] = useState(1448);
  const [hijriMonthInput, setHijriMonthInput] = useState(9);
  const [hijriDayInput, setHijriDayInput] = useState(1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleConvertGreg = () => {
    convertGregorian(gregInput);
  };

  const handleConvertHijri = () => {
    convertHijri(hijriYearInput, hijriMonthInput, hijriDayInput);
  };

  // Determine current Hijri month name on display
  const primaryHijriMonth = calendarGrid.days[15]?.monthName || 'Safar';
  const primaryHijriYear = calendarGrid.days[15]?.year || 1448;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Islamic Calendar"
        arabicTitle="التقويم الهجري"
        subtitle="Hijri and Gregorian synchronized calendar with sacred Islamic events."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-xs text-muted">Moon Sighting Adjustment:</span>
            <select
              className="select text-xs"
              style={{ width: 'auto', padding: '4px 8px', height: 'auto', fontWeight: 'bold' }}
              value={moonAdjustment}
              onChange={(e) => setMoonAdjustment(Number(e.target.value))}
            >
              <option value={-2}>-2 Days (Sighted early)</option>
              <option value={-1}>-1 Day (Sighted)</option>
              <option value={0}>0 Days (Umm al-Qura baseline)</option>
              <option value={1}>+1 Day (30 days completed)</option>
              <option value={2}>+2 Days (Delayed)</option>
            </select>
          </div>
        }
      />

      {/* Monthly Calendar Card */}
      <Card>
        {/* Month Header & Controls */}
        <div className="flex-between" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <span className="label" style={{ color: 'var(--brand-primary)' }}>
              {primaryHijriMonth} {primaryHijriYear} AH
            </span>
            <h3 className="heading-2" style={{ margin: 0 }}>
              {monthNames[currentMonth - 1]} {currentYear}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="sm" onClick={prevMonth} icon={<ChevronLeft size={14} />}>
              Prev Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                setMonth(now.getFullYear(), now.getMonth() + 1);
              }}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth} icon={<ChevronRight size={14} />}>
              Next Month
            </Button>
          </div>
        </div>

        {/* Days of week header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-2)',
            paddingBottom: 'var(--space-2)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 'var(--space-2)',
          }}
        >
          {/* Empty offset padding cells */}
          {Array.from({ length: calendarGrid.firstDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                minHeight: 64,
                backgroundColor: 'transparent',
              }}
            />
          ))}

          {/* Actual days */}
          {calendarGrid.days.map((day) => {
            const isToday = day.gregorianDate === todayStr;

            return (
              <div
                key={day.gregorianDate}
                className={`card card-compact ${isToday ? 'card-highlight' : ''}`}
                style={{
                  minHeight: 64,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-2)',
                  borderColor: isToday ? 'var(--brand-primary)' : 'var(--border-subtle)',
                  backgroundColor: isToday ? 'rgba(16, 185, 129, 0.08)' : undefined,
                  borderWidth: isToday ? 2 : 1,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: isToday ? 'var(--weight-bold)' : 'normal',
                    color: isToday ? 'var(--brand-primary)' : 'var(--text-primary)',
                  }}
                >
                  {Number(day.gregorianDate.split('-')[2])}
                </span>

                <span
                  className="font-arabic text-xs"
                  style={{
                    color: 'var(--text-gold)',
                    fontSize: '0.85rem',
                    fontWeight: 'var(--weight-semibold)',
                  }}
                >
                  {day.day} {day.monthNameArabic}
                </span>

                {day.event && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand-gold)',
                    }}
                    title={day.event}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Date Converter Card */}
      <Card style={{ borderLeft: '4px solid var(--brand-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <ArrowRightLeft size={18} style={{ color: 'var(--brand-primary)' }} />
          <h3 className="heading-3" style={{ margin: 0 }}>
            Gregorian ↔ Hijri Date Converter
          </h3>
        </div>

        <div className="grid-2">
          {/* Gregorian to Hijri */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <span className="label text-xs">Convert Gregorian Date to Hijri</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="date"
                className="input"
                value={gregInput}
                onChange={(e) => setGregInput(e.target.value)}
              />
              <Button variant="primary" size="sm" onClick={handleConvertGreg}>
                Convert
              </Button>
            </div>
            {converterResultHijri && (
              <Badge variant="emerald" style={{ padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
                {converterResultHijri.formatted} ({converterResultHijri.formattedArabic})
              </Badge>
            )}
          </div>

          {/* Hijri to Gregorian */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <span className="label text-xs">Convert Hijri Date to Gregorian</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="number"
                className="input"
                style={{ width: 80 }}
                placeholder="Day"
                min={1}
                max={30}
                value={hijriDayInput}
                onChange={(e) => setHijriDayInput(Number(e.target.value))}
              />
              <select
                className="select"
                value={hijriMonthInput}
                onChange={(e) => setHijriMonthInput(Number(e.target.value))}
              >
                {[
                  '1. Muharram', '2. Safar', '3. Rabi I', '4. Rabi II',
                  '5. Jumada I', '6. Jumada II', '7. Rajab', '8. Sha\'ban',
                  '9. Ramadan', '10. Shawwal', '11. Dhul Qi\'dah', '12. Dhul Hijjah',
                ].map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="input"
                style={{ width: 90 }}
                placeholder="Year"
                value={hijriYearInput}
                onChange={(e) => setHijriYearInput(Number(e.target.value))}
              />
              <Button variant="primary" size="sm" onClick={handleConvertHijri}>
                Convert
              </Button>
            </div>
            {converterResultGregorian && (
              <Badge variant="gold" style={{ padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
                Gregorian: {converterResultGregorian}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Major Islamic Sacred Dates List */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Major Islamic Sacred Dates & Observances
        </h3>
        <div className="grid-2">
          {events.map((evt, idx) => (
            <Card key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor:
                    evt.category === 'major'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(245, 158, 11, 0.12)',
                  color:
                    evt.category === 'major'
                      ? 'var(--brand-primary)'
                      : 'var(--brand-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <h4 className="heading-3" style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
                    {evt.title}
                  </h4>
                  <Badge variant={evt.category === 'major' ? 'emerald' : 'gold'}>
                    {evt.hijriDay} {monthNames[evt.hijriMonth - 1] ? evt.hijriMonth : ''}
                  </Badge>
                </div>
                <p className="text-xs text-secondary" style={{ margin: '4px 0 0' }}>
                  {evt.description}
                </p>
                <span className="font-arabic text-xs text-muted" style={{ display: 'block', marginTop: 2 }}>
                  {evt.arabicTitle}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
