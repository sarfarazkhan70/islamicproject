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
    setManualLocation,
    detectLocation,
  } = useLocationStore();

  const {
    qiblaInfo,
    deviceHeading,
    headingSource,
    sensorPermission,
    sensorStatus,
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

  useEffect(() => {
    calculateForCoordinates(latitude, longitude);

    return () => {
      stopCompass();
    };
  }, [latitude, longitude, calculateForCoordinates, stopCompass]);

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

  // Active rotation values:
  // Dial rotates opposite to device heading (-heading)
  // Needle is placed at bearing on the dial, or relative on screen
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
      }}
    >
      <PageHeader
        title="Qibla Finder"
        arabicTitle="اتجاه القبلة المشرفة"
        subtitle="True North Great-Circle forward azimuth to the Holy Kaaba in Makkah (21.422487° N, 39.826206° E)."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
              {activeTab === 'compass' ? 'Map Fallback' : 'Compass View'}
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
            Quick City / India Test:
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
            }}
          >
            <optgroup label="India Locations (Test Set)">
              <option value="Delhi">Delhi (266.6° W)</option>
              <option value="Mumbai">Mumbai (280.1° W)</option>
              <option value="Hyderabad">Hyderabad (282.7° WNW)</option>
              <option value="Kolkata">Kolkata (278.2° W)</option>
              <option value="Bengaluru">Bengaluru (288.5° WNW)</option>
            </optgroup>
            <optgroup label="Global Reference Locations">
              <option value="Makkah">Makkah (Kaaba Center)</option>
              <option value="London">London (119.0° ESE)</option>
              <option value="New York">New York (58.5° ENE)</option>
              <option value="Tokyo">Tokyo (293.0° WNW)</option>
            </optgroup>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
          >
            More Cities...
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
            {isDetectingLocation ? 'Fetching GPS...' : 'Live GPS'}
          </Button>
        </div>
      </Card>

      {/* Location & GPS Accuracy Strip */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MapPin size={16} style={{ color: 'var(--brand-primary)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
            Location: {displayName || `${city}, ${country}`}
          </span>
          <span className="text-xs text-muted">
            ({latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {centralAccuracy !== null && (
            <Badge variant={centralIsLowAccuracy ? 'gold' : 'emerald'}>
              GPS Accuracy: ±{centralAccuracy}m
            </Badge>
          )}
          {centralIsLowAccuracy && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--brand-gold)' }}>
              ⚠️ Low GPS accuracy. Ensure clear sky view.
            </span>
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
            padding: 'var(--space-8)',
            gap: 'var(--space-6)',
            background: isAligned
              ? 'linear-gradient(180deg, var(--bg-card), rgba(16, 185, 129, 0.15))'
              : 'linear-gradient(180deg, var(--bg-card), rgba(16, 185, 129, 0.03))',
            border: isAligned ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Top Status & Alignment Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Badge variant={isAligned ? 'emerald' : 'gold'}>
              {isAligned ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 'var(--weight-bold)' }}>
                  <CheckCircle2 size={14} /> Aligned with Holy Kaaba!
                </span>
              ) : (
                `Qibla Bearing: ${bearing.toFixed(1)}° ${cardinal}`
              )}
            </Badge>

            <span className="text-xs text-muted">
              {distance.toLocaleString()} km to Holy Kaaba
            </span>
          </div>

          {/* Heading Orientation Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'var(--weight-bold)', color: 'var(--brand-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ▲ Top of Phone Facing
            </span>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {isSensorActive
                ? `Current Heading: ${deviceHeading}° (${getCompassCardinal(deviceHeading!)})`
                : 'Sensor idle / Desktop mode (Reference: True North = 0°)'}
            </div>
          </div>

          {/* Visual Rotating Compass Ring */}
          <div
            style={{
              width: 290,
              height: 290,
              borderRadius: '50%',
              border: isAligned ? '4px solid var(--brand-primary)' : '4px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-elevated)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isAligned
                ? '0 0 40px rgba(16, 185, 129, 0.4)'
                : '0 0 20px rgba(0, 0, 0, 0.1)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {/* North-South-East-West Dial (rotates by -heading when sensor is active) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                transform: `rotate(${dialStyleRotation}deg)`,
                transition: isSensorActive ? 'transform 0.12s linear' : 'none',
              }}
            >
              {/* North Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 'var(--weight-extrabold)', color: '#ef4444', fontSize: '0.9rem' }}>
                  N
                </span>
                <div style={{ width: 3, height: 8, backgroundColor: '#ef4444', borderRadius: 2 }} />
              </div>

              {/* East Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 10,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 8, height: 3, backgroundColor: 'var(--text-muted)', borderRadius: 2 }} />
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 4 }}>
                  E
                </span>
              </div>

              {/* South Marker */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: 3, height: 8, backgroundColor: 'var(--text-muted)', borderRadius: 2 }} />
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                  S
                </span>
              </div>

              {/* West Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 10,
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: 4 }}>
                  W
                </span>
                <div style={{ width: 8, height: 3, backgroundColor: 'var(--text-muted)', borderRadius: 2 }} />
              </div>

              {/* Compass Degree Tick Ring */}
              <svg
                viewBox="0 0 290 290"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              >
                {Array.from({ length: 36 }).map((_, i) => {
                  const deg = i * 10;
                  const isMajor = deg % 90 === 0;
                  const isMedium = deg % 30 === 0;
                  const r1 = 135;
                  const r2 = isMajor ? 122 : isMedium ? 126 : 129;
                  const rad = (deg - 90) * (Math.PI / 180);
                  const x1 = 145 + r1 * Math.cos(rad);
                  const y1 = 145 + r1 * Math.sin(rad);
                  const x2 = 145 + r2 * Math.cos(rad);
                  const y2 = 145 + r2 * Math.sin(rad);
                  return (
                    <line
                      key={deg}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isMajor ? '#ef4444' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={isMajor ? 2 : 1}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Qibla Direction Pointer Needle (Points to Kaaba) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotate(${needleStyleRotation}deg)`,
                transition: isSensorActive ? 'transform 0.12s linear' : 'none',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 18,
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
                    fontSize: '0.72rem',
                    fontWeight: 'var(--weight-bold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.5)',
                    letterSpacing: '0.02em',
                  }}
                >
                  <span>🕋</span> Qibla ({bearing.toFixed(1)}°)
                </div>
                <div
                  style={{
                    width: 3.5,
                    height: 86,
                    background: 'linear-gradient(180deg, var(--brand-primary), rgba(16, 185, 129, 0.2))',
                    borderRadius: 2,
                    marginTop: 2,
                  }}
                />
              </div>
            </div>

            {/* Center Compass Hub */}
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

          {/* Primary Bearing Degree Display */}
          <div>
            <div
              style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--weight-extrabold)',
                fontFamily: 'var(--font-sans)',
                color: isAligned ? 'var(--brand-primary)' : 'var(--text-primary)',
              }}
            >
              {bearing.toFixed(1)}°
            </div>
            <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
              Direction: <strong>{cardinal}</strong> ({bearing.toFixed(1)}° clockwise from True North)
            </p>
            <p className="text-secondary text-xs" style={{ marginTop: 2 }}>
              {isSensorActive
                ? 'Rotate phone horizontally until the Kaaba needle aligns with the top (0°).'
                : 'Desktop / Manual Mode: Hold device horizontally and aim towards the calculated Great-Circle bearing.'}
            </p>
          </div>

          {/* Sensor Status / Fallback Notice */}
          {sensorStatus === 'unavailable' && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                maxWidth: 480,
              }}
            >
              <strong>Desktop / Device Notice:</strong> Compass sensor is not available or reliable on this device. Showing True North Great-Circle bearing. You can use the <strong>Map Fallback</strong> for visual path navigation.
            </div>
          )}

          {/* Enable Compass Button for Mobile iOS/Android */}
          {sensorPermission !== 'granted' && sensorStatus !== 'unavailable' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Smartphone size={14} />}
              onClick={handleStartCompass}
            >
              Enable Live Device Compass
            </Button>
          )}

          {sensorStatus === 'active' && compassAccuracyDeg !== null && (
            <span className="text-xs text-muted">
              Compass Accuracy: ±{compassAccuracyDeg}° ({headingSource})
            </span>
          )}
        </Card>
      ) : (
        /* Interactive Great-Circle Map Fallback */
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
              <p className="text-secondary text-xs" style={{ margin: 0 }}>
                Direct forward geodesic path from {city} ({latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E) to Kaaba, Makkah ({KAABA_COORDINATES.latitude}° N, {KAABA_COORDINATES.longitude}° E).
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
              {/* Latitude / Longitude Grid */}
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
                  stroke="rgba(255,255,255,0.05)"
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
                {distance.toLocaleString()} km ({Math.round(distance * 0.621371).toLocaleString()} miles)
              </div>
            </div>
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <span className="text-xs text-muted">Reference</span>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                True North (0.00°)
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Sensor Calibration Guide Card */}
      {calibrationGuideOpen && (
        <Card style={{ borderLeft: '4px solid var(--brand-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--brand-gold)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 className="heading-3" style={{ fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                Sensor Calibration & Accuracy Guidelines
              </h4>
              <p className="text-secondary text-xs" style={{ lineHeight: '1.45rem' }}>
                1. <strong>Figure-8 Motion:</strong> Move your phone in a gentle figure-8 motion to calibrate magnetic sensors.<br />
                2. <strong>Hold Device Flat:</strong> Keep the device parallel to the ground surface.<br />
                3. <strong>Avoid Magnetic Interference:</strong> Keep away from laptops, metallic cases, magnets, and high-voltage electronics.<br />
                4. <strong>Desktop Fallback:</strong> Computers without magnetometer hardware display the verified Great-Circle bearing relative to True North.
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


