import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useQiblaStore } from '../../stores/useQiblaStore.js';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { GLOBAL_CITIES } from '../../core/prayerEngine/cities.js';
import { getCompassCardinal, KAABA_COORDINATES } from '../../utils/qibla.js';
import { LocationPickerModal } from '../../components/common/LocationPickerModal.js';
import { LocationPermissionBanner } from '../../components/common/LocationPermissionBanner.js';
import {
  Compass,
  MapPin,
  AlertCircle,
  Check,
  Smartphone,
  Info,
  RefreshCw,
  Map,
  CheckCircle2,
} from 'lucide-react';

export const QiblaPage: React.FC = () => {
  const {
    city,
    country,
    latitude,
    longitude,
    displayName,
    accuracy: centralAccuracy,
    isLowAccuracy: centralIsLowAccuracy,
    status: centralStatus,
    permissionStatus: locationPermission,
    setManualLocation,
    detectLocation,
  } = useLocationStore();

  const {
    qiblaInfo,
    deviceHeading,
    headingSource,
    sensorPermission,
    sensorStatus,
    isCompassAvailable,
    isAligned,
    compassAccuracyDeg,
    calibrationGuideOpen,
    unwrappedDialRotation,
    unwrappedNeedleRotation,
    calculateForCoordinates,
    requestDeviceOrientation,
    stopCompass,
    toggleCalibrationGuide,
  } = useQiblaStore();

  const [activeTab, setActiveTab] = useState<'compass' | 'map'>('compass');
  const [selectedCityName, setSelectedCityName] = useState<string>(city || 'Delhi');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const isDetectingLocation = centralStatus === 'detecting';

  // Recalculate whenever coordinates change and automatically attempt compass initialization
  useEffect(() => {
    calculateForCoordinates(latitude, longitude);

    // Auto-probe compass if not already active and supported
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      // For non-iOS devices (or if permission is already granted), auto-start
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission !== 'function') {
        requestDeviceOrientation();
      }
    }

    return () => {
      stopCompass();
    };
  }, [latitude, longitude, calculateForCoordinates, requestDeviceOrientation, stopCompass]);

  const handleStartCompass = async () => {
    await requestDeviceOrientation();
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCityName(cityName);
    const found = GLOBAL_CITIES.find((c) => c.city === cityName);
    if (found) {
      setManualLocation({
        city: found.city,
        country: found.country,
        latitude: found.latitude,
        longitude: found.longitude,
        timezone: found.timezone,
        displayName: `${found.city}, ${found.country}`,
        isAutoDetected: false,
      });
    }
  };

  const bearing = qiblaInfo?.bearing ?? 266.6;
  const cardinal = qiblaInfo?.directionCompass ?? getCompassCardinal(bearing);
  const distance = qiblaInfo?.distanceKm ?? 3840;
  const distanceMiles = qiblaInfo?.distanceMiles ?? Math.round(distance * 0.621371);

  // Active rotation values:
  // When live sensor is active: dial rotates by -heading, needle points to relative Kaaba direction
  // When sensor is unavailable/desktop: static dial (0° at top), needle points to bearing (e.g. 266.6°)
  const isSensorActive = sensorStatus === 'active' && deviceHeading !== null;
  const dialStyleRotation = isSensorActive ? unwrappedDialRotation : 0;
  const needleStyleRotation = isSensorActive ? unwrappedNeedleRotation : bearing;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        maxWidth: 820,
        margin: '0 auto',
        padding: '0 var(--space-2) var(--space-8)',
      }}
    >
      <PageHeader
        title="Qibla Finder"
        arabicTitle="اتجاه القبلة المشرفة"
        subtitle="Mathematically accurate Great-Circle azimuth to the Holy Kaaba in Makkah (21.422487° N, 39.826206° E)."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<Info size={14} />}
              onClick={() => toggleCalibrationGuide()}
            >
              Sensor Guide
            </Button>
            <Button
              variant={activeTab === 'map' ? 'primary' : 'outline'}
              size="sm"
              icon={<Map size={14} />}
              onClick={() => setActiveTab(activeTab === 'compass' ? 'map' : 'compass')}
            >
              {activeTab === 'compass' ? 'Geodesic Map' : 'Compass View'}
            </Button>
          </div>
        }
      />

      {/* Permission Banner if location access is prompt/pending */}
      <LocationPermissionBanner onOpenManualPicker={() => setIsLocationModalOpen(true)} />

      {/* City Switcher & GPS High-Accuracy Toolbar */}
      <Card
        style={{
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
            Quick Location / City:
          </span>
          <select
            value={selectedCityName}
            onChange={(e) => handleCitySelect(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-medium)',
              cursor: 'pointer',
              minWidth: 160,
            }}
          >
            <optgroup label="Popular Subcontinent Cities">
              <option value="Delhi">Delhi, India (266.6° W)</option>
              <option value="Mumbai">Mumbai, India (280.1° W)</option>
              <option value="Hyderabad">Hyderabad, India (282.7° WNW)</option>
              <option value="Kolkata">Kolkata, India (278.2° W)</option>
              <option value="Bengaluru">Bengaluru, India (288.5° WNW)</option>
              <option value="Karachi">Karachi, Pakistan (267.7° W)</option>
              <option value="Lahore">Lahore, Pakistan (260.3° W)</option>
              <option value="Dhaka">Dhaka, Bangladesh (277.6° W)</option>
            </optgroup>
            <optgroup label="Middle East & Global Reference">
              <option value="Makkah">Makkah, Saudi Arabia (Kaaba Center)</option>
              <option value="Madinah">Madinah, Saudi Arabia (176.2° S)</option>
              <option value="Dubai">Dubai, UAE (258.2° WSW)</option>
              <option value="Istanbul">Istanbul, Turkey (151.6° SSE)</option>
              <option value="Cairo">Cairo, Egypt (136.1° SE)</option>
              <option value="London">London, UK (119.0° ESE)</option>
              <option value="New York">New York, USA (58.5° ENE)</option>
              <option value="Tokyo">Tokyo, Japan (293.0° WNW)</option>
            </optgroup>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
          >
            Search More Cities...
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={13} className={isDetectingLocation ? 'animate-spin' : ''} />}
            onClick={() => detectLocation({ force: true })}
            disabled={isDetectingLocation}
          >
            {isDetectingLocation ? 'Locating...' : 'Live GPS'}
          </Button>
        </div>
      </Card>

      {/* System Status Indicators Strip: Location Status & Compass Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          padding: '0 var(--space-2)',
        }}
      >
        {/* Left: Location & GPS Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <MapPin size={16} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
            Location: {displayName || `${city}, ${country}`}
          </span>
          <span className="text-xs text-muted">
            ({latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E)
          </span>

          <Badge variant={centralStatus === 'ready' || latitude ? 'emerald' : centralStatus === 'detecting' ? 'gold' : 'gray'}>
            {centralStatus === 'detecting' ? 'Detecting Location...' : locationPermission === 'denied' ? 'Manual Location' : 'Location Active'}
          </Badge>
        </div>

        {/* Right: Compass & Hardware Sensor Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {isSensorActive ? (
            <Badge variant="emerald">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                Live Compass Active
              </span>
            </Badge>
          ) : sensorStatus === 'calibrating' ? (
            <Badge variant="gold">Calibrating Compass...</Badge>
          ) : sensorStatus === 'unavailable' || !isCompassAvailable ? (
            <Badge variant="gray">Compass Not Available (Static Mode)</Badge>
          ) : (
            <Badge variant="gold">Compass Available (Tap Enable)</Badge>
          )}

          {centralAccuracy !== null && (
            <Badge variant={centralIsLowAccuracy ? 'gold' : 'emerald'}>
              GPS: ±{centralAccuracy}m
            </Badge>
          )}
        </div>
      </div>

      {activeTab === 'compass' ? (
        /* Main Compass Card */
        <Card
          highlighted
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-4)',
            gap: 'var(--space-6)',
            background: isAligned
              ? 'linear-gradient(180deg, var(--bg-card), rgba(16, 185, 129, 0.16))'
              : 'linear-gradient(180deg, var(--bg-card), rgba(16, 185, 129, 0.03))',
            border: isAligned ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Status & Alignment Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Badge variant={isAligned ? 'emerald' : 'gold'}>
              {isAligned ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'var(--weight-bold)' }}>
                  <CheckCircle2 size={15} /> Aligned with Holy Kaaba!
                </span>
              ) : (
                `Qibla Direction: ${bearing.toFixed(1)}° ${cardinal}`
              )}
            </Badge>

            <span className="text-xs text-muted" style={{ fontWeight: 'var(--weight-medium)' }}>
              {distance.toLocaleString()} km ({distanceMiles.toLocaleString()} mi) to Holy Kaaba
            </span>
          </div>

          {/* Device Orientation Header Guidance */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {isSensorActive ? (
              <>
                <span style={{ fontSize: '0.78rem', fontWeight: 'var(--weight-bold)', color: 'var(--brand-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  ▲ Top of Phone Facing
                </span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Current Heading: <strong>{deviceHeading}° ({getCompassCardinal(deviceHeading!)})</strong>
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: '0.78rem', fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  ▲ Reference: True North (0°)
                </span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Static Qibla Bearing Dial ({city}, {country})
                </div>
              </>
            )}
          </div>

          {/* Compass Dial Container (Responsive max-width 300px, no clipping) */}
          <div
            style={{
              width: 'min(80vw, 300px)',
              height: 'min(80vw, 300px)',
              borderRadius: '50%',
              border: isAligned ? '4px solid var(--brand-primary)' : '4px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-elevated)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isAligned
                ? '0 0 45px rgba(16, 185, 129, 0.45)'
                : '0 0 25px rgba(0, 0, 0, 0.15)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              userSelect: 'none',
              margin: '0 auto',
            }}
          >
            {/* Rotating Cardinal Dial (N/S/E/W and degree ticks) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                transform: `rotate(${dialStyleRotation}deg)`,
                transition: isSensorActive ? 'transform 0.12s linear' : 'transform 0.4s ease-out',
                pointerEvents: 'none',
              }}
            >
              {/* North Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 'var(--weight-extrabold)', color: '#ef4444', fontSize: '0.95rem' }}>
                  N
                </span>
                <div style={{ width: 3, height: 8, backgroundColor: '#ef4444', borderRadius: 2, marginTop: 1 }} />
              </div>

              {/* East Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 12,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 8, height: 3, backgroundColor: 'var(--text-muted)', borderRadius: 2 }} />
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 4 }}>
                  E
                </span>
              </div>

              {/* South Marker */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 3, height: 8, backgroundColor: 'var(--text-muted)', borderRadius: 2 }} />
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                  S
                </span>
              </div>

              {/* West Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 12,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 4 }}>
                  W
                </span>
                <div style={{ width: 8, height: 3, backgroundColor: 'var(--text-muted)', borderRadius: 2 }} />
              </div>

              {/* Compass Degree Tick Ring SVG */}
              <svg
                viewBox="0 0 300 300"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              >
                {Array.from({ length: 36 }).map((_, i) => {
                  const deg = i * 10;
                  const isMajor = deg % 90 === 0;
                  const isMedium = deg % 30 === 0;
                  const r1 = 142;
                  const r2 = isMajor ? 128 : isMedium ? 133 : 136;
                  const rad = (deg - 90) * (Math.PI / 180);
                  const x1 = 150 + r1 * Math.cos(rad);
                  const y1 = 150 + r1 * Math.sin(rad);
                  const x2 = 150 + r2 * Math.cos(rad);
                  const y2 = 150 + r2 * Math.sin(rad);
                  return (
                    <line
                      key={deg}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isMajor ? '#ef4444' : isMedium ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)'}
                      strokeWidth={isMajor ? 2.5 : 1}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Qibla Direction Needle / Kaaba Arrow Pointer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotate(${needleStyleRotation}deg)`,
                transition: isSensorActive ? 'transform 0.12s linear' : 'transform 0.4s ease-out',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 'var(--weight-bold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: '0 3px 12px rgba(16, 185, 129, 0.55)',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>🕋</span> Qibla ({bearing.toFixed(1)}°)
                </div>
                <div
                  style={{
                    width: 3.5,
                    height: 90,
                    background: 'linear-gradient(180deg, var(--brand-primary), rgba(16, 185, 129, 0.2))',
                    borderRadius: 2,
                    marginTop: 2,
                  }}
                />
              </div>
            </div>

            {/* Center Compass Hub Icon */}
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                backgroundColor: isAligned ? 'var(--brand-primary)' : 'var(--bg-surface)',
                color: isAligned ? '#fff' : 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--border-default)',
                zIndex: 4,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
              }}
            >
              {isAligned ? <Check size={26} strokeWidth={3} /> : <Compass size={28} />}
            </div>
          </div>

          {/* Primary Bearing Degree & Guidance Display */}
          <div>
            <div
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3rem)',
                fontWeight: 'var(--weight-extrabold)',
                fontFamily: 'var(--font-sans)',
                color: isAligned ? 'var(--brand-primary)' : 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              {bearing.toFixed(1)}°
            </div>
            <p className="text-secondary text-sm" style={{ marginTop: 6, fontWeight: 'var(--weight-semibold)' }}>
              Direction: <strong style={{ color: 'var(--brand-gold)' }}>{cardinal}</strong> ({bearing.toFixed(1)}° clockwise from True North)
            </p>
            <p className="text-secondary text-xs" style={{ marginTop: 4, maxWidth: 520, marginInline: 'auto' }}>
              {isSensorActive
                ? 'Rotate your phone horizontally until the Kaaba needle points straight up to top (0°).'
                : `To face Qibla from ${city}: Face True North (0°), then turn ${bearing.toFixed(1)}° clockwise towards the Kaaba.`}
            </p>
          </div>

          {/* Desktop / Non-Compass Device Notice */}
          {(sensorStatus === 'unavailable' || !isCompassAvailable) && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                maxWidth: 540,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Info size={16} style={{ color: 'var(--brand-gold)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>Desktop / Laptop Mode:</strong> Your device does not provide a compass sensor. The Qibla bearing from your current location is <strong>{bearing.toFixed(1)}° from North</strong>. Use the static reference dial or the <strong>Geodesic Map</strong> tab for visual navigation.
                </div>
              </div>
            </div>
          )}

          {/* Enable Live Compass Button for Mobile iOS/Safari & Android */}
          {sensorPermission !== 'granted' && sensorStatus !== 'unavailable' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Button
                variant="primary"
                size="md"
                icon={<Smartphone size={16} />}
                onClick={handleStartCompass}
              >
                Enable Live Compass
              </Button>
              <span className="text-xs text-muted">
                Tap to grant orientation sensor permission on mobile/tablet.
              </span>
            </div>
          )}

          {/* Sensor Heading Source & Accuracy Detail */}
          {sensorStatus === 'active' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>Heading Source: <strong>{headingSource}</strong></span>
              {compassAccuracyDeg !== null && (
                <span>Accuracy: ±{compassAccuracyDeg}°</span>
              )}
            </div>
          )}
        </Card>
      ) : (
        /* Geodesic Vector Trajectory / Map Fallback */
        <Card
          highlighted
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            padding: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <h3 className="heading-3" style={{ margin: 0 }}>
                Great-Circle Geodesic Trajectory
              </h3>
              <p className="text-secondary text-xs" style={{ margin: '4px 0 0' }}>
                Direct forward spherical geodesic path from {city} ({latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E) to Kaaba, Makkah ({KAABA_COORDINATES.latitude}° N, {KAABA_COORDINATES.longitude}° E).
              </p>
            </div>

            <Badge variant="emerald">
              Bearing: {bearing.toFixed(1)}° {cardinal} • {distance.toLocaleString()} km
            </Badge>
          </div>

          {/* Geodesic Vector SVG Diagram */}
          <div
            style={{
              width: '100%',
              height: 280,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="0 0 600 280"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="qiblaArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[-60, -30, 0, 30, 60].map((y, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={140 + y}
                  x2="600"
                  y2={140 + y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Origin: User Location Marker */}
              <g transform="translate(120, 160)">
                <circle r="16" fill="rgba(16, 185, 129, 0.15)" />
                <circle r="6" fill="#10b981" />
                <text x="0" y="-14" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
                  📍 {city}
                </text>
                <text x="0" y="24" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                  {latitude?.toFixed(2)}°N, {longitude?.toFixed(2)}°E
                </text>
              </g>

              {/* Destination: Kaaba Marker */}
              <g transform="translate(480, 100)">
                <circle r="18" fill="rgba(245, 158, 11, 0.2)" />
                <circle r="7" fill="#f59e0b" />
                <text x="0" y="-16" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                  🕋 Holy Kaaba (Makkah)
                </text>
                <text x="0" y="24" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                  21.4225°N, 39.8262°E
                </text>
              </g>

              {/* Great Circle Arc Path */}
              <path
                d="M 120 160 Q 300 60 480 100"
                fill="none"
                stroke="url(#qiblaArcGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Direction Azimuth Arrow on path */}
              <g transform="translate(300, 95)">
                <circle r="14" fill="var(--bg-surface)" stroke="#10b981" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">
                  {bearing.toFixed(0)}°
                </text>
              </g>

              {/* Compass Rose in Corner */}
              <g transform="translate(540, 45)">
                <circle r="22" fill="var(--bg-surface)" stroke="var(--border-default)" />
                <text x="0" y="-8" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">N</text>
                <text x="12" y="3" textAnchor="middle" fill="var(--text-muted)" fontSize="7">E</text>
                <text x="0" y="14" textAnchor="middle" fill="var(--text-muted)" fontSize="7">S</text>
                <text x="-12" y="3" textAnchor="middle" fill="var(--text-muted)" fontSize="7">W</text>
              </g>
            </svg>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <span className="text-xs text-muted">Initial Forward Azimuth</span>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--brand-primary)' }}>
                {bearing.toFixed(2)}° ({cardinal})
              </div>
            </div>
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <span className="text-xs text-muted">Geodesic Distance</span>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                {distance.toLocaleString()} km ({distanceMiles.toLocaleString()} miles)
              </div>
            </div>
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <span className="text-xs text-muted">Destination Kaaba</span>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                {KAABA_COORDINATES.latitude}° N, {KAABA_COORDINATES.longitude}° E
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Sensor Calibration & Help Guide Card */}
      {calibrationGuideOpen && (
        <Card style={{ borderLeft: '4px solid var(--brand-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--brand-gold)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 className="heading-3" style={{ fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                Sensor Calibration & Accuracy Guidelines
              </h4>
              <p className="text-secondary text-xs" style={{ lineHeight: '1.5rem', margin: 0 }}>
                1. <strong>Figure-8 Motion:</strong> On mobile phones, move your phone in a gentle figure-8 motion to calibrate the magnetometer sensor.<br />
                2. <strong>Hold Device Flat:</strong> Keep the device horizontal and parallel to the ground.<br />
                3. <strong>Avoid Magnetic Interference:</strong> Stay away from laptops, metallic cases, magnets, speakers, and high-voltage electronics.<br />
                4. <strong>Desktop / Laptop Fallback:</strong> Computers without magnetometer hardware display the verified Great-Circle bearing relative to True North (0°).
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Global Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
