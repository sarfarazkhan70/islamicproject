import React, { useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useQiblaStore } from '../../stores/useQiblaStore.js';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import {
  Compass,
  MapPin,
  AlertCircle,
  Check,
  Smartphone,
  Info,
} from 'lucide-react';

export const QiblaPage: React.FC = () => {
  const { location } = useSettingsStore();
  const {
    qiblaInfo,
    deviceHeading,
    sensorPermission,
    isAligned,
    calibrationGuideOpen,
    calculateForCoordinates,
    requestDeviceOrientation,
    stopCompass,
    toggleCalibrationGuide,
  } = useQiblaStore();

  useEffect(() => {
    // Calculate initial Qibla bearing from current user coordinates
    const lat = location.latitude || 21.4225;
    const lng = location.longitude || 39.8262;
    calculateForCoordinates(lat, lng);

    return () => {
      stopCompass();
    };
  }, [location, calculateForCoordinates, stopCompass]);

  const handleStartCompass = async () => {
    await requestDeviceOrientation();
  };

  const bearing = qiblaInfo?.bearing || 242.4;
  const compassHeading = deviceHeading !== null ? deviceHeading : 0;

  // The compass dial rotates opposite to device heading
  const dialRotation = -compassHeading;
  // The Kaaba indicator is placed at bearing degrees on the dial
  const kaabaRelativeRotation = bearing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 760, margin: '0 auto' }}>
      <PageHeader
        title="Qibla Finder"
        arabicTitle="اتجاه القبلة المشرفة"
        subtitle="Precise Great-Circle direction to the Holy Kaaba in Makkah."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Info size={14} />}
            onClick={() => toggleCalibrationGuide()}
          >
            Calibration Guide
          </Button>
        }
      />

      {/* Main Compass Interface Card */}
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
            ? 'linear-gradient(180deg, var(--bg-card), rgba(16, 185, 129, 0.12))'
            : 'linear-gradient(180deg, var(--bg-card), rgba(16, 185, 129, 0.03))',
          border: isAligned ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* User Location & Distance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
              {location.city}, {location.country}
            </span>
          </div>

          <Badge variant={isAligned ? 'emerald' : 'gold'}>
            {isAligned ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={12} /> Aligned with Kaaba!
              </span>
            ) : (
              `Qibla Bearing: ${bearing}° ${qiblaInfo?.directionCompass}`
            )}
          </Badge>

          {qiblaInfo && (
            <span className="text-xs text-muted">
              {qiblaInfo.distanceKm.toLocaleString()} km to Makkah
            </span>
          )}
        </div>

        {/* Visual Rotating Compass Ring */}
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: isAligned ? '4px solid var(--brand-primary)' : '4px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-elevated)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isAligned
              ? '0 0 35px rgba(16, 185, 129, 0.35)'
              : '0 0 20px rgba(0, 0, 0, 0.1)',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          {/* Compass Dial Rotating with Device Heading */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              transform: `rotate(${dialRotation}deg)`,
              transition: deviceHeading !== null ? 'transform 0.15s ease-out' : 'none',
            }}
          >
            {/* North Marker */}
            <span
              style={{
                position: 'absolute',
                top: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--status-missed)',
                fontSize: 'var(--text-sm)',
              }}
            >
              N
            </span>
            {/* East Marker */}
            <span
              style={{
                position: 'absolute',
                top: '50%',
                right: 12,
                transform: 'translateY(-50%)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-xs)',
              }}
            >
              E
            </span>
            {/* South Marker */}
            <span
              style={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-xs)',
              }}
            >
              S
            </span>
            {/* West Marker */}
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: 12,
                transform: 'translateY(-50%)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-xs)',
              }}
            >
              W
            </span>

            {/* Kaaba Direction Needle Target */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `rotate(${kaabaRelativeRotation}deg)`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 'var(--weight-bold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  🕋 Qibla
                </div>
                <div
                  style={{
                    width: 3,
                    height: 80,
                    backgroundColor: 'var(--brand-primary)',
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Center Compass Icon / Alignment Dot */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: isAligned
                ? 'var(--brand-primary)'
                : 'var(--bg-surface)',
              color: isAligned ? '#fff' : 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--border-default)',
              zIndex: 2,
              transition: 'all 0.3s ease',
            }}
          >
            <Compass size={28} />
          </div>
        </div>

        {/* Textual Bearing Display */}
        <div>
          <div
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--weight-extrabold)',
              fontFamily: 'var(--font-sans)',
              color: isAligned ? 'var(--brand-primary)' : 'var(--text-primary)',
            }}
          >
            {bearing}°
          </div>
          <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
            {deviceHeading !== null
              ? `Current Heading: ${deviceHeading}° • Rotate until phone aligns with the Kaaba.`
              : 'Hold phone flat and point in the direction of the Qibla needle.'}
          </p>
        </div>

        {/* Sensor Activation Button for Mobile */}
        {sensorPermission !== 'granted' && (
          <Button
            variant="primary"
            size="sm"
            icon={<Smartphone size={14} />}
            onClick={handleStartCompass}
          >
            Enable Live Device Compass
          </Button>
        )}
      </Card>

      {/* Calibration Guide Modal / Card */}
      {calibrationGuideOpen && (
        <Card style={{ borderLeft: '4px solid var(--brand-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <AlertCircle size={20} style={{ color: 'var(--brand-gold)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 className="heading-3" style={{ fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                Sensor Calibration Instructions
              </h4>
              <p className="text-secondary text-xs" style={{ lineHeight: '1.4rem' }}>
                1. <strong>Hold Device Flat:</strong> Keep your phone parallel to the ground.<br />
                2. <strong>Figure-8 Motion:</strong> Gently wave your device in a figure-eight pattern for 5 seconds to calibrate magnetic sensors.<br />
                3. <strong>Avoid Interference:</strong> Keep away from laptops, metallic cases, magnets, and high-voltage power sources.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
