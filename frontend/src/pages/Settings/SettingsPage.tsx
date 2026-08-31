import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { useThemeStore } from '../../stores/useThemeStore.js';
import { MadhhabSelector } from '../../components/prayer/MadhhabSelector';
import { MapPin, Globe, Moon, Sun, Clock, Download, Trash2, Shield, Check } from 'lucide-react';
import { CalculationMethod, HighLatitudeRule, SunniMadhhab } from '../../core/prayerEngine/types.js';
import { requestCurrentLocation } from '../../utils/geolocation.js';

export const SettingsPage: React.FC = () => {
  const {
    location,
    setLocation,
    madhhab,
    setMadhhab,
    calculationMethod,
    setCalculationMethod,
    highLatitudeRule,
    setHighLatitudeRule,
    timeFormat,
    setTimeFormat,
  } = useSettingsStore();

  const { theme, setTheme } = useThemeStore();
  const [isLocating, setIsLocating] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleAutoLocate = async () => {
    setIsLocating(true);
    const res = await requestCurrentLocation();
    setIsLocating(false);
    if (res.success && res.location) {
      setLocation(res.location);
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
          }}
        >
          <Check size={18} /> Settings saved & prayer timetable recalculated!
        </div>
      )}

      {/* 1. Location Settings */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <MapPin size={20} style={{ color: 'var(--brand-primary)' }} />
          <h3 className="heading-3">Location & Coordinates</h3>
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label className="label">Current City</label>
            <input
              type="text"
              className="input"
              value={location.city}
              onChange={(e) => {
                setLocation({ city: e.target.value });
                triggerSaveToast();
              }}
            />
          </div>

          <div className="input-group">
            <label className="label">Country</label>
            <input
              type="text"
              className="input"
              value={location.country}
              onChange={(e) => {
                setLocation({ country: e.target.value });
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
              value={location.latitude}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setLocation({ latitude: val });
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
              value={location.longitude}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  setLocation({ longitude: val });
                  triggerSaveToast();
                }
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isLocating}
            icon={<Globe size={14} />}
            onClick={handleAutoLocate}
          >
            Auto-Detect via GPS
          </Button>
          <span className="text-xs text-muted">
            Timezone: <strong>{location.timezone}</strong>
          </span>
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

      {/* 3. Appearance & Formatting */}
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
    </div>
  );
};
