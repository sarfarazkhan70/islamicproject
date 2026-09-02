import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { useThemeStore } from '../../stores/useThemeStore.js';
import { useCentralHijriDate } from '../../hooks/useCentralHijriDate.js';
import { HIJRI_MONTHS } from '../../utils/hijriCalendar.js';
import { MadhhabSelector } from '../../components/prayer/MadhhabSelector';
import { LocationPickerModal } from '../../components/common/LocationPickerModal.js';
import { MapPin, Moon, Sun, Clock, Download, Trash2, Shield, Check, RefreshCw, Search, Bell, Radio, Calendar } from 'lucide-react';
import { CalculationMethod, HighLatitudeRule, SunniMadhhab } from '../../core/prayerEngine/types.js';


export const SettingsPage: React.FC = () => {
  const {
    madhhab,
    setMadhhab,
    calculationMethod,
    setCalculationMethod,
    highLatitudeRule,
    setHighLatitudeRule,
    timeFormat,
    setTimeFormat,
    hijriMode,
    setHijriMode,
    hijriAdjustment,
    setHijriAdjustment,
    manualHijriDate,
    setManualHijriDate,
    resetHijriToAutomatic,
  } = useSettingsStore();

  const {
    city,
    country,
    state,
    latitude,
    longitude,
    displayName,
    timezone,
    accuracy,
    isLowAccuracy,
    isAutoDetected,
    status: locationStatus,
    refreshLocation,
    setManualLocation,
  } = useLocationStore();

  const currentActiveHijri = useCentralHijriDate();

  const [manualDay, setManualDay] = useState(manualHijriDate?.day || 19);
  const [manualMonth, setManualMonth] = useState(manualHijriDate?.month || 3);
  const [manualYear, setManualYear] = useState(manualHijriDate?.year || 1448);

  useEffect(() => {
    if (manualHijriDate) {
      setManualDay(manualHijriDate.day);
      setManualMonth(manualHijriDate.month);
      setManualYear(manualHijriDate.year);
    }
  }, [manualHijriDate]);

  const { theme, setTheme } = useThemeStore();
  const [saveToast, setSaveToast] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const isLocating = locationStatus === 'detecting';

  const handleRefreshLocation = async () => {
    const ok = await refreshLocation();
    if (ok) {
      triggerSaveToast();
    }
  };

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 840 }}>
      <PageHeader
        title="Settings & Preferences"
        arabicTitle="الإعدادات"
        subtitle="Configure your location, Sunni Madhhab, calculation convention, high-latitude rule, and visual themes."
      />

      {saveToast && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--brand-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Check size={18} /> Settings saved & prayer timetable recalculated!
        </div>
      )}

      {/* 1. Location Settings */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <MapPin size={20} style={{ color: 'var(--brand-primary)' }} />
            <h3 className="heading-3" style={{ margin: 0 }}>Location & Coordinates</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {isAutoDetected ? (
              <Badge variant="emerald">Auto GPS</Badge>
            ) : (
              <Badge variant="gray">Manual</Badge>
            )}
            {accuracy !== null && (
              <Badge variant={isLowAccuracy ? 'gold' : 'emerald'}>
                Accuracy: ±{accuracy}m
              </Badge>
            )}
          </div>
        </div>

        {/* Display name highlight */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Active Location Display
            </div>
            <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              {displayName || `${city}, ${country}`}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
              Coordinates: {latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E • Timezone: <strong>{timezone}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="sm"
              isLoading={isLocating}
              icon={<RefreshCw size={14} className={isLocating ? 'animate-spin' : ''} />}
              onClick={handleRefreshLocation}
            >
              {isLocating ? 'Detecting...' : 'Refresh My Location'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Search size={14} />}
              onClick={() => setIsCityModalOpen(true)}
            >
              Choose City
            </Button>
          </div>
        </div>

        {isLowAccuracy && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--brand-gold)',
              fontSize: 'var(--text-xs)',
              marginBottom: 'var(--space-4)',
            }}
          >
            ⚠️ Your location accuracy is low (±{accuracy}m). Prayer timings and Qibla direction may be less accurate. Try refreshing with a clearer view of the sky.
          </div>
        )}

        <div className="grid-2">
          <div className="input-group">
            <label className="label">City / Locality</label>
            <input
              type="text"
              className="input"
              value={city}
              onChange={(e) => {
                setManualLocation({ city: e.target.value });
                triggerSaveToast();
              }}
            />
          </div>

          <div className="input-group">
            <label className="label">State / Region</label>
            <input
              type="text"
              className="input"
              value={state || ''}
              onChange={(e) => {
                setManualLocation({ state: e.target.value });
                triggerSaveToast();
              }}
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="label">Country</label>
            <input
              type="text"
              className="input"
              value={country}
              onChange={(e) => {
                setManualLocation({ country: e.target.value });
                triggerSaveToast();
              }}
            />
          </div>

          <div className="input-group">
            <label className="label">Timezone (IANA)</label>
            <input
              type="text"
              className="input"
              value={timezone}
              onChange={(e) => {
                setManualLocation({ timezone: e.target.value });
                triggerSaveToast();
              }}
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="label">Latitude (°N)</label>
            <input
              type="number"
              step="any"
              className="input"
              value={latitude}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setManualLocation({ latitude: val });
                  triggerSaveToast();
                }
              }}
            />
          </div>

          <div className="input-group">
            <label className="label">Longitude (°E)</label>
            <input
              type="number"
              step="any"
              className="input"
              value={longitude}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setManualLocation({ longitude: val });
                  triggerSaveToast();
                }
              }}
            />
          </div>
        </div>
      </Card>


      {/* 2. Madhhab & Prayer Calculation Conventions */}
      <Card>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Islamic Methodology & Calculations
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <MadhhabSelector
            selected={madhhab}
            onChange={(m: SunniMadhhab) => {
              setMadhhab(m);
              triggerSaveToast();
            }}
          />

          <div className="input-group">
            <label className="label">Calculation Convention</label>
            <select
              className="input"
              value={calculationMethod}
              onChange={(e) => {
                setCalculationMethod(e.target.value as CalculationMethod);
                triggerSaveToast();
              }}
            >
              <option value="Karachi">University of Islamic Sciences, Karachi (18° / 18°)</option>
              <option value="MWL">Muslim World League (18° / 17°)</option>
              <option value="ISNA">ISNA - North America (15° / 15°)</option>
              <option value="UmmAlQura">Umm al-Qura University, Makkah (18.5° / 90m)</option>
              <option value="Egypt">Egyptian General Authority of Survey (19.5° / 17.5°)</option>
              <option value="Tehran">Institute of Geophysics, University of Tehran (17.7° / 14°)</option>
              <option value="Gulf">Gulf Region / UAE Awqaf (19.5° / 90m)</option>
              <option value="Moonsighting">Moonsighting Committee Worldwide (18° / 18°)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label">High Latitude Adjustment Rule</label>
            <select
              className="input"
              value={highLatitudeRule}
              onChange={(e) => {
                setHighLatitudeRule(e.target.value as HighLatitudeRule);
                triggerSaveToast();
              }}
            >
              <option value="TwilightAngle">Angle-Based (Twilight angle proportion of night)</option>
              <option value="MiddleOfTheNight">Middle of the Night (Fajr/Isha capped at 1/2 of night)</option>
              <option value="SeventhOfTheNight">One-Seventh of the Night (1/7th proportion)</option>
              <option value="None">None (Unadjusted)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Islamic / Hijri Date Settings */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={20} style={{ color: 'var(--brand-gold)' }} />
            <h3 className="heading-3" style={{ margin: 0 }}>Islamic / Hijri Date Settings</h3>
          </div>
          <Badge variant={hijriMode === 'automatic' ? 'emerald' : 'gold'}>
            {hijriMode === 'automatic' ? '⚡ Maghrib Auto' : '✍️ Manual Date'}
          </Badge>
        </div>

        {/* Current Active Date Display Box */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Active Displayed Hijri Date (All Pages)
            </div>
            <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--text-gold)', marginTop: 2 }}>
              {currentActiveHijri.formatted} • {currentActiveHijri.formattedArabic}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
              {hijriMode === 'automatic'
                ? 'Changes automatically at local Sunset (Maghrib) • Midnight causes no change'
                : 'Custom user-specified date • Locked until reset'}
            </div>
          </div>
          {hijriMode === 'manual' && (
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={() => {
                resetHijriToAutomatic();
                triggerSaveToast();
              }}
            >
              Reset to Automatic
            </Button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
          <label className="label">Hijri Date Mode</label>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant={hijriMode === 'automatic' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setHijriMode('automatic');
                triggerSaveToast();
              }}
              style={{ flex: 1 }}
            >
              (●) Automatic (Maghrib-based)
            </Button>
            <Button
              variant={hijriMode === 'manual' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setHijriMode('manual');
                triggerSaveToast();
              }}
              style={{ flex: 1 }}
            >
              ( ) Manual Setting
            </Button>
          </div>
        </div>

        {/* Automatic Mode Details */}
        {hijriMode === 'automatic' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The Hijri date is calculated automatically from your local location and advances at <strong>Sunset (Maghrib)</strong>. Local midnight (12:00 AM) does not cause an extra increment.
            </div>

            <div className="input-group">
              <label className="label">Hijri Date Adjustment (Daily Moon Correction)</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: 360 }}>
                {[-1, 0, 1].map((adj) => (
                  <Button
                    key={adj}
                    variant={hijriAdjustment === adj ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setHijriAdjustment(adj);
                      triggerSaveToast();
                    }}
                    style={{ flex: 1 }}
                  >
                    {adj > 0 ? `+${adj} Day` : adj < 0 ? `${adj} Day` : '0 (Default)'}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted" style={{ margin: '6px 0 0' }}>
                Optional ±1 day regional moon-sighting adjustment on top of the calculated automatic date.
              </p>
            </div>
          </div>
        ) : (
          /* Manual Mode Form */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Set your custom Hijri date. This will remain fixed across refreshes and page navigation until you change it or click "Reset to Automatic".
            </div>

            <div className="grid-3">
              <div className="input-group">
                <label className="label">Day (1 – 30)</label>
                <select
                  className="input"
                  value={manualDay}
                  onChange={(e) => setManualDay(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="label">Islamic Month</label>
                <select
                  className="input"
                  value={manualMonth}
                  onChange={(e) => setManualMonth(parseInt(e.target.value, 10))}
                >
                  {HIJRI_MONTHS.map((m) => (
                    <option key={m.number} value={m.number}>
                      {m.number}. {m.name} ({m.arabicName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="label">Hijri Year (AH)</label>
                <input
                  type="number"
                  className="input"
                  min={1400}
                  max={1500}
                  value={manualYear}
                  onChange={(e) => setManualYear(parseInt(e.target.value, 10) || 1448)}
                />
              </div>
            </div>

            {/* Selected Date Preview */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Configured Date: <strong>{manualDay} {HIJRI_MONTHS[manualMonth - 1]?.name} {manualYear} AH</strong> ({manualDay} {HIJRI_MONTHS[manualMonth - 1]?.arabicName} {manualYear} هـ)
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Check size={14} />}
                onClick={() => {
                  setManualHijriDate({ day: manualDay, month: manualMonth, year: manualYear });
                  triggerSaveToast();
                }}
              >
                Save Hijri Date
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw size={14} />}
                onClick={() => {
                  resetHijriToAutomatic();
                  triggerSaveToast();
                }}
              >
                Reset to Automatic
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Azaan & Audio Notifications Status */}
      <Card highlighted style={{ borderLeft: '4px solid var(--brand-primary)' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              className="btn-icon btn-icon-md"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--brand-primary)',
              }}
            >
              <Radio size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h3 className="heading-3" style={{ margin: 0 }}>Azaan & 15-Minute Reminders</h3>
                <Badge variant="emerald">Auto GPS Synced</Badge>
              </div>
              <p className="text-xs text-muted" style={{ margin: '4px 0 0' }}>
                Full authentic male Azaan audio at prayer times + gentle Islamic reminders 15 minutes later.
              </p>
            </div>
          </div>

          <Link to="/notifications">
            <Button variant="primary" size="sm" icon={<Bell size={14} />}>
              Configure Azaan & Alerts
            </Button>
          </Link>
        </div>
      </Card>

      {/* 4. Appearance & Formatting */}
      <Card>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Appearance & Formatting
        </h3>

        <div className="grid-2">
          <div className="input-group">
            <label className="label">Theme Mode</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button
                variant={theme === 'dark' ? 'primary' : 'outline'}
                size="sm"
                icon={<Moon size={14} />}
                onClick={() => setTheme('dark')}
                style={{ flex: 1 }}
              >
                Night Emerald (Dark)
              </Button>
              <Button
                variant={theme === 'light' ? 'primary' : 'outline'}
                size="sm"
                icon={<Sun size={14} />}
                onClick={() => setTheme('light')}
                style={{ flex: 1 }}
              >
                Desert Dawn (Light)
              </Button>
            </div>
          </div>

          <div className="input-group">
            <label className="label">Time Format</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button
                variant={timeFormat === '12h' ? 'primary' : 'outline'}
                size="sm"
                icon={<Clock size={14} />}
                onClick={() => {
                  setTimeFormat('12h');
                  triggerSaveToast();
                }}
                style={{ flex: 1 }}
              >
                12-Hour (AM/PM)
              </Button>
              <Button
                variant={timeFormat === '24h' ? 'primary' : 'outline'}
                size="sm"
                icon={<Clock size={14} />}
                onClick={() => {
                  setTimeFormat('24h');
                  triggerSaveToast();
                }}
                style={{ flex: 1 }}
              >
                24-Hour (Military)
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Privacy & Data Backup */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Shield size={20} style={{ color: 'var(--brand-primary)' }} />
          <h3 className="heading-3">Privacy & Data Management</h3>
        </div>

        <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-4)' }}>
          Your location coordinates and preferences are stored locally on your device.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" icon={<Download size={14} />}>
            Export My Data (JSON)
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Clear Local Cache
          </Button>
        </div>
      </Card>

      {/* Global Location Picker Modal */}
      <LocationPickerModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />
    </div>
  );
};

