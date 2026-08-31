import React from 'react';
import clsx from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  return (
    <div className={clsx('stat-card', className)}>
      <div className="stat-header">
        <span>{title}</span>
        {icon && <span style={{ color: 'var(--brand-primary)', opacity: 0.85 }}>{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend) && (
        <div className="stat-desc" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {trend && (
            <span style={{ color: 'var(--brand-primary)', fontWeight: 'var(--weight-semibold)' }}>
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
