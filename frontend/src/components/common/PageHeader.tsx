import React from 'react';

export interface PageHeaderProps {
  title: string;
  arabicTitle?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  arabicTitle,
  subtitle,
  actions,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1 className="heading-1">{title}</h1>
          {arabicTitle && (
            <span
              className="font-arabic text-gold"
              style={{ fontSize: '1.4rem', lineHeight: 1 }}
            >
              {arabicTitle}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>{actions}</div>}
    </div>
  );
};
