import React from 'react';
import clsx from 'clsx';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: 'emerald' | 'gold';
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'emerald',
  height = 8,
  showLabel = false,
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={clsx('progress-bar-wrapper', className)} style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            marginBottom: 6,
          }}
        >
          <span>Progress</span>
          <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className="progress-bar-track" style={{ height }}>
        <div
          className={clsx('progress-bar-fill', variant === 'gold' && 'progress-bar-fill-gold')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
