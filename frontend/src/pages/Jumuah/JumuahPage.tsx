import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { Users, BookOpen, Check, Clock, Bell } from 'lucide-react';

export const JumuahPage: React.FC = () => {
  const { preferences, setJumuahTime } = useNotificationStore();
  const [kahfRead, setKahfRead] = useState(false);
  const [duroodCount, setDuroodCount] = useState(42);
  const [sunnahs, setSunnahs] = useState({
    ghusl: true,
    attar: true,
    miswak: false,
    earlyArrival: true,
    cleanClothes: true,
  });

  const toggleSunnah = (k: keyof typeof sunnahs) => {
    setSunnahs({ ...sunnahs, [k]: !sunnahs[k] });
  };

  const jumuahTime = preferences.jumuahTime || '13:30';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Jumu'ah Portal"
        arabicTitle="يوم الجمعة المبارك"
        subtitle="Weekly congregational guide, Surah Al-Kahf checklist, and Sunnahs of Friday."
        actions={<Badge variant="emerald"><Users size={12} /> Best Day of the Week</Badge>}
      />

      {/* Jumu'ah Local Timing Configuration Card */}
      <Card highlighted style={{ borderLeft: '4px solid var(--brand-primary)' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <span className="label" style={{ color: 'var(--brand-primary)' }}>
              Friday Congregational Salah
            </span>
            <h3 className="heading-2" style={{ margin: '4px 0' }}>
              Masjid Jumu'ah Prayer: {jumuahTime}
            </h3>
            <p className="text-secondary text-xs" style={{ margin: '4px 0 8px', maxWidth: 600 }}>
              <strong>Important:</strong> Jumu'ah congregation timing is set by your local mosque. Configure your mosque's Khutbah/Prayer time below to receive your Surah Al-Kahf reminder exactly 1 hour prior.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={16} style={{ color: 'var(--brand-primary)' }} />
            <input
              type="time"
              className="input text-xs"
              style={{ width: 'auto', padding: '4px 10px', height: 'auto', fontWeight: 'bold' }}
              value={jumuahTime}
              onChange={(e) => setJumuahTime(e.target.value)}
            />
            <Link to="/notifications" className="btn btn-sm btn-outline">
              <Bell size={12} /> Reminder Settings
            </Link>
          </div>
        </div>
      </Card>

      {/* Surah Al-Kahf Reading Card */}
      <Card style={{ borderLeft: '4px solid var(--brand-gold)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--brand-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex-between">
              <div>
                <span className="label" style={{ color: 'var(--brand-gold)' }}>
                  Sunnah of Friday
                </span>
                <h3 className="heading-3" style={{ margin: 0 }}>Surah Al-Kahf (The Cave)</h3>
              </div>
              <Button
                variant={kahfRead ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setKahfRead(!kahfRead)}
              >
                {kahfRead ? <Check size={14} /> : null} {kahfRead ? 'Marked as Read' : 'Mark as Read'}
              </Button>
            </div>
            <p className="text-secondary text-xs" style={{ margin: '8px 0' }}>
              "Whoever reads Surah Al-Kahf on the day of Jumu'ah, will have a light that will shine from him from one Friday to the next." — <em>Sahih al-Hakim</em>
            </p>
            <Link to="/quran" className="btn btn-sm btn-gold">
              Open Surah Al-Kahf (110 Verses)
            </Link>
          </div>
        </div>
      </Card>

      {/* Sunnahs of Jumu'ah Checklist */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Sunnah Acts of Friday
        </h3>
        <div className="grid-2">
          {[
            { key: 'ghusl' as const, label: 'Perform Ghusl (Ritual Bath)', desc: 'Purify before attending Salah' },
            { key: 'cleanClothes' as const, label: 'Wear Clean / Best Clothes', desc: 'Dress in pure white or neat attire' },
            { key: 'attar' as const, label: 'Apply Perfume / Attar', desc: 'Sunnah fragrance (for men)' },
            { key: 'miswak' as const, label: 'Use Miswak / Clean Teeth', desc: 'Oral hygiene before congregation' },
            { key: 'earlyArrival' as const, label: 'Early Arrival to the Masjid', desc: 'Listen attentively to the Khutbah' },
          ].map((item) => {
            const isChecked = sunnahs[item.key];
            return (
              <Card
                key={item.key}
                hoverable
                onClick={() => toggleSunnah(item.key)}
                className={isChecked ? 'card-highlight' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  cursor: 'pointer',
                  borderColor: isChecked ? 'var(--brand-primary)' : undefined,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isChecked
                      ? 'var(--brand-primary)'
                      : 'var(--bg-surface-elevated)',
                    color: isChecked ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isChecked ? <Check size={18} /> : <span style={{ fontSize: 10 }}>●</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
                    {item.label}
                  </div>
                  <div className="text-xs text-muted">{item.desc}</div>
                </div>
              </Card>
            );
          })}

          {/* Durood on the Prophet Counter Card */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="flex-between">
              <div>
                <span className="label" style={{ color: 'var(--brand-primary)' }}>
                  Salawat / Durood
                </span>
                <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>
                  Send Blessings on Prophet ﷺ
                </div>
              </div>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--brand-primary)' }}>
                {duroodCount}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDuroodCount(duroodCount + 1)}
            >
              + Send 1 Salawat
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
