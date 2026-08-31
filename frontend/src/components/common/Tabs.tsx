import React from 'react';
import clsx from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={clsx('tabs-container', className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={clsx('tab-btn', isActive && 'active')}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span style={{ marginRight: 6, display: 'inline-flex' }}>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  marginLeft: 6,
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontSize: '0.7rem',
                  backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-surface-hover)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
