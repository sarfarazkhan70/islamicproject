import React, { useState } from 'react';
import { NextPrayerHero } from '../../components/prayer/NextPrayerHero';
import { LocationPermissionBanner } from '../../components/common/LocationPermissionBanner.js';
import { LocationPickerModal } from '../../components/common/LocationPickerModal.js';
import { usePrayerTimes } from '../../hooks/usePrayerTimes.js';
import { useTrackerStore } from '../../stores/useTrackerStore';
import { DailyHadithCard } from '../../components/dashboard/DailyHadithCard';

import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  Moon,
  Heart,
  RotateCcw,
  BellRing,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { timetable, displayName } = usePrayerTimes();
  const { qazaSummary } = useTrackerStore();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Auto Location Permission Banner */}
      <LocationPermissionBanner onOpenManualPicker={() => setIsLocationModalOpen(true)} />

      {/* Dynamic Hero Countdown Card */}
      <NextPrayerHero
        timetable={timetable}
        locationName={displayName || `${timetable.location.city}, ${timetable.location.country}`}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
      />

      {/* Authentic Sahih al-Bukhari Daily Hadith Card */}
      <DailyHadithCard />

      {/* Quick Action Dock */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Quick Companion Access
        </h3>
        <div className="grid-4">
          <Link to="/qibla" className="card card-hover" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="btn-icon btn-icon-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--brand-primary)' }}>
              <Compass size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 'var(--weight-semibold)' }}>Qibla Finder</div>
              <div className="text-xs text-muted">Kaaba Bearing 242°</div>
            </div>
          </Link>

          <Link to="/quran" className="card card-hover" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="btn-icon btn-icon-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--brand-gold)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 'var(--weight-semibold)' }}>Noble Quran</div>
              <div className="text-xs text-muted">114 Surahs • Tanzil</div>
            </div>
          </Link>

          <Link to="/surah-al-mulk" className="card card-hover" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="btn-icon btn-icon-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa' }}>
              <Moon size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 'var(--weight-semibold)' }}>Surah Al-Mulk</div>
              <div className="text-xs text-muted">Sleep Audio Player</div>
            </div>
          </Link>

          <Link to="/azkar" className="card card-hover" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="btn-icon btn-icon-lg" style={{ backgroundColor: 'rgba(20, 184, 166, 0.12)', color: 'var(--brand-teal)' }}>
              <Heart size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 'var(--weight-semibold)' }}>Azkar & Duas</div>
              <div className="text-xs text-muted">Morning & Evening</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Contextual Islamic Feature Cards */}
      <div className="grid-2">
        {/* Surah Al-Mulk 11 PM Sleep Reminder Card */}
        <Card style={{ borderLeft: '4px solid var(--brand-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--brand-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BellRing size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex-between">
                <span className="label" style={{ color: 'var(--brand-gold)' }}>Daily 11:00 PM Habit</span>
                <Badge variant="gold">Sunnah of Sleep</Badge>
              </div>
              <h3 className="heading-3" style={{ margin: '4px 0' }}>
                Surah Al-Mulk Protection
              </h3>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-4)' }}>
                "Surah Al-Mulk is the protector from the punishment of the grave." — <em>Sahih At-Tirmidhi</em>
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Link to="/surah-al-mulk" className="btn btn-sm btn-gold">
                  <Moon size={14} /> Listen Now
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Qaza Namaz Summary Card */}
        <Card style={{ borderLeft: '4px solid var(--status-qaza)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--status-qaza)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <RotateCcw size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex-between">
                <span className="label" style={{ color: 'var(--status-qaza)' }}>Qaza-e-Umri Manager</span>
                <Badge variant="purple">Lifetime Tracker</Badge>
              </div>
              <h3 className="heading-3" style={{ margin: '4px 0' }}>
                Missed Prayers Tracker
              </h3>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-4)' }}>
                You have logged missed prayers in your active tally. Fulfill them with each daily prayer.
              </p>
              <Link to="/qaza" className="btn btn-sm btn-secondary">
                View Qaza Tally ({qazaSummary.fajr + qazaSummary.zuhr + qazaSummary.asr + qazaSummary.maghrib + qazaSummary.isha} total)
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Global Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};

