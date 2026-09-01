import React from 'react';
import { MapPin, Navigation, X, RefreshCw } from 'lucide-react';
import { useLocationStore } from '../../stores/useLocationStore.js';
import { Button } from './Button.js';

interface LocationPermissionBannerProps {
  onOpenManualPicker?: () => void;
}

export const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  onOpenManualPicker,
}) => {
  const {
    isAutoDetected,
    isPermissionBannerDismissed,
    permissionStatus,
    status,
    detectLocation,
    dismissPermissionBanner,
  } = useLocationStore();

  // If already auto-detected or dismissed or unsupported/denied, do not display banner
  if (isAutoDetected || isPermissionBannerDismissed || permissionStatus === 'denied') {
    return null;
  }

  const isDetecting = status === 'detecting';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-6)',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        position: 'relative',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 300px' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MapPin size={20} />
        </div>
        <div>
          <h4
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Use Your Location for Accurate Timings & Qibla
          </h4>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              margin: '2px 0 0 0',
            }}
          >
            Allow location access to calculate exact astronomical prayer timings and Kaaba direction for your area.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Button
          variant="primary"
          size="sm"
          icon={
            isDetecting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )
          }
          onClick={() => detectLocation()}
          disabled={isDetecting}
        >
          {isDetecting ? 'Detecting...' : 'Allow Location'}
        </Button>

        {onOpenManualPicker && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenManualPicker}
            disabled={isDetecting}
          >
            Set Manually
          </Button>
        )}

        <button
          onClick={dismissPermissionBanner}
          className="btn-icon btn-icon-sm"
          style={{ color: 'var(--text-muted)' }}
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
