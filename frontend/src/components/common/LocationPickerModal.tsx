import React, { useState } from 'react';
import { Search, MapPin, Navigation, X, RefreshCw, Check } from 'lucide-react';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { GLOBAL_CITIES } from '../../core/prayerEngine/cities.js';
import { Button } from './Button.js';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CityItem {
  city: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const EXTENDED_INDIAN_CITIES: CityItem[] = [
  { city: 'Roorkee', country: 'India', state: 'Uttarakhand', latitude: 29.8543, longitude: 77.888, timezone: 'Asia/Kolkata' },
  { city: 'Delhi', country: 'India', state: 'Delhi', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata' },
  { city: 'Mumbai', country: 'India', state: 'Maharashtra', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { city: 'Hyderabad', country: 'India', state: 'Telangana', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { city: 'Kolkata', country: 'India', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { city: 'Bengaluru', country: 'India', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { city: 'Dehradun', country: 'India', state: 'Uttarakhand', latitude: 30.3165, longitude: 78.0322, timezone: 'Asia/Kolkata' },
  { city: 'Haridwar', country: 'India', state: 'Uttarakhand', latitude: 29.9457, longitude: 78.1642, timezone: 'Asia/Kolkata' },
  { city: 'Lucknow', country: 'India', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, timezone: 'Asia/Kolkata' },
  { city: 'Ahmedabad', country: 'India', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata' },
  { city: 'Chennai', country: 'India', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { city: 'Srinagar', country: 'India', state: 'Jammu and Kashmir', latitude: 34.0837, longitude: 74.7973, timezone: 'Asia/Kolkata' },
  { city: 'Patna', country: 'India', state: 'Bihar', latitude: 25.5941, longitude: 85.1376, timezone: 'Asia/Kolkata' },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    city: currentCity,
    displayName: currentDisplayName,
    status,
    detectLocation,
    setManualLocation,
  } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'cities' | 'coordinates'>('cities');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customCountry, setCustomCountry] = useState('India');

  if (!isOpen) return null;

  const isDetecting = status === 'detecting';

  // Combine curated lists
  const allCities: CityItem[] = [
    ...EXTENDED_INDIAN_CITIES,
    ...GLOBAL_CITIES.filter(
      (gc) => !EXTENDED_INDIAN_CITIES.some((ic) => ic.city.toLowerCase() === gc.city.toLowerCase())
    ).map((gc) => ({
      city: gc.city,
      country: gc.country,
      latitude: gc.latitude,
      longitude: gc.longitude,
      timezone: gc.timezone,
    })),
  ];

  const filteredCities = allCities.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.state ? c.state.toLowerCase().includes(q) : false)
    );
  });

  const handleSelectCity = (c: CityItem) => {
    setManualLocation({
      city: c.city,
      country: c.country,
      state: c.state,
      latitude: c.latitude,
      longitude: c.longitude,
      timezone: c.timezone,
      displayName: c.state ? `${c.city}, ${c.state}, ${c.country}` : `${c.city}, ${c.country}`,
    });
    onClose();
  };


  const handleAutoLocate = async () => {
    const ok = await detectLocation({ force: true });
    if (ok) {
      onClose();
    }
  };

  const handleCustomCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || lat < -90 || lat > 90) return;
    if (isNaN(lng) || lng < -180 || lng > 180) return;

    setManualLocation({
      city: customCity.trim() || 'Custom Coordinates',
      country: customCountry.trim() || 'Custom',
      latitude: lat,
      longitude: lng,
      displayName: customCity.trim()
        ? `${customCity.trim()}, ${customCountry.trim()}`
        : `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="heading-3" style={{ margin: 0, fontSize: 'var(--text-base)' }}>
                Set Your Location
              </h3>
              <p className="text-secondary text-xs" style={{ margin: 0 }}>
                Currently: <strong>{currentDisplayName || currentCity}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon btn-icon-sm" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Live Location Action Bar */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Button
            variant="primary"
            size="md"
            style={{ width: '100%', justifyContent: 'center' }}
            icon={isDetecting ? <RefreshCw size={16} className="animate-spin" /> : <Navigation size={16} />}
            onClick={handleAutoLocate}
            disabled={isDetecting}
          >
            {isDetecting ? 'Detecting high-accuracy GPS location...' : 'Use My Current GPS Location'}
          </Button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            padding: 'var(--space-2) var(--space-6)',
            borderBottom: '1px solid var(--border-subtle)',
            gap: 'var(--space-2)',
          }}
        >
          <button
            onClick={() => setTab('cities')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: tab === 'cities' ? 'var(--brand-primary)' : 'transparent',
              color: tab === 'cities' ? '#fff' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              cursor: 'pointer',
            }}
          >
            Select City ({allCities.length})
          </button>
          <button
            onClick={() => setTab('coordinates')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: tab === 'coordinates' ? 'var(--brand-primary)' : 'transparent',
              color: tab === 'coordinates' ? '#fff' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              cursor: 'pointer',
            }}
          >
            Custom Coordinates
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'cities' ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Search Input */}
            <div style={{ padding: 'var(--space-4) var(--space-6) var(--space-2)' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search city (e.g. Roorkee, Delhi, Mumbai, London)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 38 }}
                  autoFocus
                />
              </div>
            </div>

            {/* City List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-2) var(--space-6) var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {filteredCities.map((c) => {
                const isCurrent = c.city.toLowerCase() === currentCity.toLowerCase();
                return (
                  <button
                    key={`${c.city}-${c.country}-${c.latitude}`}
                    onClick={() => handleSelectCity(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-lg)',
                      border: isCurrent
                        ? '1px solid var(--brand-primary)'
                        : '1px solid var(--border-subtle)',
                      backgroundColor: isCurrent
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
                        {c.city}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {c.state ? `${c.state}, ` : ''}{c.country} ({c.latitude.toFixed(2)}° N, {c.longitude.toFixed(2)}° E)
                      </div>
                    </div>
                    {isCurrent && <Check size={16} style={{ color: 'var(--brand-primary)' }} />}
                  </button>
                );
              })}

              {filteredCities.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No cities found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Custom Coordinates Form */
          <form onSubmit={handleCustomCoordinatesSubmit} style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="grid-2">
              <div className="input-group">
                <label className="label">Latitude (°N, -90 to +90)</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="29.8543"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Longitude (°E, -180 to +180)</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="77.8880"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="label">City / Area Label</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Roorkee"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="label">Country</label>
                <input
                  type="text"
                  className="input"
                  placeholder="India"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" style={{ marginTop: 'var(--space-2)' }}>
              Set Custom Coordinates
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
