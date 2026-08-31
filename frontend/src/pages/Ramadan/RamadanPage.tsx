import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { usePrayerTimes } from '../../hooks/usePrayerTimes.js';
import { useRamadanStore, FastingStatus } from '../../stores/useRamadanStore.js';
import {
  Sparkles,
  Moon,
  Sun,
  Check,
  BookOpen,
  Calendar as CalendarIcon,
} from 'lucide-react';

export const RamadanPage: React.FC = () => {
  const { timetable } = usePrayerTimes();
  const {
    isRamadan,
    currentRamadanDay,
    currentHijriYear,
    completedJuz,
    getFastingStatus,
    logFast,
    toggleJuz,
  } = useRamadanStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'khatam' | 'calendar'>('overview');
  const [countdownText, setCountdownText] = useState('00:00:00');
  const [nextEventLabel, setNextEventLabel] = useState('Iftar');

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentFastStatus = getFastingStatus(todayStr);

  const fajrSlot = timetable.prayers.find((p) => p.key === 'fajr');
  const maghribSlot = timetable.prayers.find((p) => p.key === 'maghrib');

  const sehriTimeStr = fajrSlot?.timeFormatted || '04:52 AM';
  const iftarTimeStr = maghribSlot?.timeFormatted || '06:27 PM';

  // Live countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      if (!fajrSlot || !maghribSlot) return;

      const fajrDate = fajrSlot.date;
      const maghribDate = maghribSlot.date;

      let targetDate = maghribDate;
      let label = 'Iftar';

      if (now < fajrDate) {
        targetDate = fajrDate;
        label = 'Sehri Ends (Fajr)';
      } else if (now < maghribDate) {
        targetDate = maghribDate;
        label = 'Iftar Time (Maghrib)';
      } else {
        // Next day Fajr
        targetDate = new Date(fajrDate.getTime() + 24 * 60 * 60 * 1000);
        label = 'Tomorrow Sehri (Fajr)';
      }

      setNextEventLabel(label);

      const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setCountdownText(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [fajrSlot, maghribSlot]);

  const handleStatusChange = (status: FastingStatus) => {
    logFast(todayStr, status, currentRamadanDay);
  };

  const khatamProgressPercent = Math.round((completedJuz.length / 30) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Ramadan Companion"
        arabicTitle="شهر رمضان المبارك"
        subtitle="Daily Sehri & Iftar timetable, live fasting countdown, and 30-day Quran Khatam planner."
        actions={
          <Badge variant="gold">
            <Sparkles size={12} /> {isRamadan ? `Ramadan ${currentHijriYear} AH` : 'Ramadan Preparation'}
          </Badge>
        }
      />

      {/* Live Countdown & Sehri/Iftar Cards */}
      <div className="grid-2">
        {/* Sehri Cutoff Card */}
        <Card highlighted style={{ borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Moon size={26} />
            </div>
            <div>
              <span className="label" style={{ color: 'var(--brand-primary)' }}>
                Sehri Ends / Fajr Adhan
              </span>
              <div
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-extrabold)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {sehriTimeStr}
              </div>
              <span className="text-xs text-muted">Stop eating & drinking before Fajr</span>
            </div>
          </div>
        </Card>

        {/* Iftar Time Card */}
        <Card highlighted style={{ borderLeft: '4px solid var(--brand-gold)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
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
                flexShrink: 0,
              }}
            >
              <Sun size={26} />
            </div>
            <div>
              <span className="label" style={{ color: 'var(--brand-gold)' }}>
                Iftar Time / Maghrib Adhan
              </span>
              <div
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--weight-extrabold)',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-gold)',
                }}
              >
                {iftarTimeStr}
              </div>
              <span className="text-xs text-muted">Break fast at sunset with Dates & Water</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Per-Second Countdown Strip */}
      <Card
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.06))',
          textAlign: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <span className="label" style={{ color: 'var(--brand-primary)' }}>
          Countdown to {nextEventLabel}
        </span>
        <div
          style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-extrabold)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--brand-primary)',
            letterSpacing: '0.05em',
            margin: '4px 0',
          }}
        >
          {countdownText}
        </div>
        <span className="text-xs text-muted">
          Based on verified astronomical calculation for {timetable.location.city}
        </span>
      </Card>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('overview')}
        >
          Daily Fast Tracker
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'khatam' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('khatam')}
        >
          <BookOpen size={14} /> 30-Day Quran Khatam ({completedJuz.length}/30)
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarIcon size={14} /> 30-Day Ramadan Timetable
        </button>
      </div>

      {/* Tab 1: Daily Fasting Tracker */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 className="heading-3">Today's Fasting Status</h3>
                <p className="text-secondary text-sm">
                  Log your personal Ramadan fast for {todayStr}.
                </p>
              </div>
              <Badge variant="emerald">Day {currentRamadanDay} of Ramadan</Badge>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button
                variant={currentFastStatus === 'FASTED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('FASTED')}
              >
                <Check size={14} /> Fasted (Alhamdulillah)
              </Button>
              <Button
                variant={currentFastStatus === 'QAZA' ? 'gold' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('QAZA')}
              >
                Qaza / Make-up Intended
              </Button>
              <Button
                variant={currentFastStatus === 'EXCUSED' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => handleStatusChange('EXCUSED')}
              >
                Excused (Travel/Illness)
              </Button>
            </div>
          </Card>

          {/* Authentic Iftar & Lailat al-Qadr Duas */}
          <div className="grid-2">
            {/* Iftar Dua */}
            <Card style={{ borderLeft: '4px solid var(--brand-gold)' }}>
              <Badge variant="gold">Authentic Iftar Supplication</Badge>
              <p
                className="dua-text"
                style={{ fontSize: '1.4rem', margin: 'var(--space-3) 0', color: 'var(--text-primary)', textAlign: 'right' }}
                dir="rtl"
              >
                ذَهَبَ الظَّمَأُ وَابْتَلَّتِ العُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
              </p>
              <p className="translation-text" style={{ fontSize: '0.85rem' }}>
                "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills."
              </p>
              <span className="reference-text">Sahih • Sunan Abi Dawud #2357</span>
            </Card>

            {/* Laylat al-Qadr Dua */}
            <Card style={{ borderLeft: '4px solid var(--brand-primary)' }}>
              <Badge variant="emerald">Laylat al-Qadr Supplication</Badge>
              <p
                className="dua-text"
                style={{ fontSize: '1.4rem', margin: 'var(--space-3) 0', color: 'var(--text-primary)', textAlign: 'right' }}
                dir="rtl"
              >
                اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنِّي
              </p>
              <p className="translation-text" style={{ fontSize: '0.85rem' }}>
                "O Allah, You are Most Forgiving, and You love forgiveness; so forgive me."
              </p>
              <span className="reference-text">Sahih • Jami` at-Tirmidhi #3513</span>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: 30-Day Quran Khatam Planner */}
      {activeTab === 'khatam' && (
        <Card>
          <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
            <div>
              <span className="label" style={{ color: 'var(--brand-primary)' }}>
                Ramadan Khatam Goal (1 Juz / Day)
              </span>
              <h3 className="heading-3">30-Day Quran Completion Progress</h3>
            </div>
            <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--brand-primary)', fontSize: 'var(--text-lg)' }}>
              {completedJuz.length} / 30 Juz ({khatamProgressPercent}%)
            </span>
          </div>

          <ProgressBar progress={khatamProgressPercent} height={10} showLabel={false} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-6)',
            }}
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
              const isDone = completedJuz.includes(juz);
              return (
                <button
                  key={juz}
                  className={`card card-compact ${isDone ? 'card-highlight' : ''}`}
                  onClick={() => toggleJuz(juz)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-3)',
                    cursor: 'pointer',
                    borderColor: isDone ? 'var(--brand-primary)' : 'var(--border-subtle)',
                    backgroundColor: isDone ? 'rgba(16, 185, 129, 0.1)' : undefined,
                  }}
                >
                  <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>
                    Juz {juz}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: isDone ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                    {isDone ? '✓ Completed' : 'Pending'}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 3: 30-Day Ramadan Timetable Overview */}
      {activeTab === 'calendar' && (
        <Card>
          <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
            <div>
              <h3 className="heading-3">30-Day Ramadan Timetable</h3>
              <p className="text-secondary text-xs">
                Sehri & Iftar timetable for {timetable.location.city}, {timetable.location.country}.
              </p>
            </div>
            <Badge variant="gold">30 Days</Badge>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 12px' }}>Ramadan Day</th>
                  <th style={{ padding: '8px 12px' }}>Sehri Ends (Fajr)</th>
                  <th style={{ padding: '8px 12px' }}>Iftar (Maghrib)</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                  <tr
                    key={day}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: day === currentRamadanDay ? 'rgba(16, 185, 129, 0.06)' : undefined,
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 'var(--weight-semibold)' }}>
                      Day {day} {day === currentRamadanDay && <Badge variant="emerald">Today</Badge>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{sehriTimeStr}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-gold)', fontWeight: 'bold' }}>
                      {iftarTimeStr}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {day < currentRamadanDay ? (
                        <span style={{ color: 'var(--brand-primary)' }}>✓ Fasted</span>
                      ) : day === currentRamadanDay ? (
                        <span style={{ color: 'var(--brand-gold)' }}>● Active</span>
                      ) : (
                        <span className="text-muted">Upcoming</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
