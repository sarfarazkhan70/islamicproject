import React from 'react';
import { SunniMadhhab } from '../../core/prayerEngine/types.js';
import { MADHHAB_RULES } from '../../core/prayerEngine/madhhabRules.js';
import { Tabs } from '../common/Tabs';

export interface MadhhabSelectorProps {
  selected: SunniMadhhab;
  onChange: (madhhab: SunniMadhhab) => void;
  showExplanation?: boolean;
}

export const MadhhabSelector: React.FC<MadhhabSelectorProps> = ({
  selected,
  onChange,
  showExplanation = true,
}) => {
  const madhhabTabs = [
    { id: 'hanafi', label: 'Hanafi (حنفى)' },
    { id: 'shafii', label: "Shafi'i (شافعى)" },
    { id: 'maliki', label: 'Maliki (مالكى)' },
    { id: 'hanbali', label: 'Hanbali (حنبلى)' },
  ];

  const currentRule = MADHHAB_RULES[selected];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="label" style={{ marginBottom: 0 }}>Sunni Madhhab (Asr Juristic Calculation)</label>
        <span className="text-xs text-muted" style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--brand-primary)' }}>
          {selected === 'hanafi' ? '2× Shadow Length (Mithlayn)' : '1× Shadow Length (Mithl)'}
        </span>
      </div>
      <Tabs
        tabs={madhhabTabs}
        activeTab={selected}
        onChange={(id) => onChange(id as SunniMadhhab)}
      />
      {showExplanation && currentRule && (
        <p className="text-xs text-muted" style={{ margin: 0, fontStyle: 'italic' }}>
          {currentRule.description} ({currentRule.imam})
        </p>
      )}
    </div>
  );
};
