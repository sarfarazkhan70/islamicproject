import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useTrackerStore, QazaSummaryState } from '../../stores/useTrackerStore.js';
import { useSettingsStore } from '../../stores/useSettingsStore.js';
import { RotateCcw, Plus, Check, Target, Calendar, Calculator, Clock, History } from 'lucide-react';

export const QazaPage: React.FC = () => {
  const { qazaSummary, qazaLogs, incrementQaza, repayQaza, setQazaCounts, setDailyTarget } =
    useTrackerStore();
  const { madhhab } = useSettingsStore();

  const [showEstimatorModal, setShowEstimatorModal] = useState(false);
  const [estimateYears, setEstimateYears] = useState(1);
  const [estimateMonths, setEstimateMonths] = useState(0);

  // Madhhab-aware Witr handling (Hanafi treats Witr as Wajib Qaza)
  const isHanafi = madhhab === 'hanafi';

  const qazaList: {
    key: keyof Omit<QazaSummaryState, 'dailyTarget' | 'totalCompleted'>;
    label: string;
    arabic: string;
    count: number;
    sublabel?: string;
  }[] = [
    { key: 'fajr', label: 'Fajr', arabic: 'الفجر', count: qazaSummary.fajr },
    { key: 'zuhr', label: 'Zuhr', arabic: 'الظهر', count: qazaSummary.zuhr },
    { key: 'asr', label: 'Asr', arabic: 'العصر', count: qazaSummary.asr },
    { key: 'maghrib', label: 'Maghrib', arabic: 'المغرب', count: qazaSummary.maghrib },
    { key: 'isha', label: 'Isha', arabic: 'العشاء', count: qazaSummary.isha },
    ...(isHanafi
      ? ([
          {
            key: 'witr',
            label: 'Witr',
            arabic: 'الوتر',
            count: qazaSummary.witr,
            sublabel: 'Wajib (Hanafi School)',
          },
        ] as const)
      : []),
  ];

  const totalRemaining =
    qazaSummary.fajr +
    qazaSummary.zuhr +
    qazaSummary.asr +
    qazaSummary.maghrib +
    qazaSummary.isha +
    (isHanafi ? qazaSummary.witr : 0);

  const dailyTarget = qazaSummary.dailyTarget || 1;
  const estimatedDays = totalRemaining > 0 ? Math.ceil(totalRemaining / dailyTarget) : 0;
  const completedToday = qazaLogs.filter(
    (l) => l.localDate === new Date().toISOString().split('T')[0]
  ).length;

  const targetProgress = Math.min(100, (completedToday / dailyTarget) * 100);

  // Apply lifetime calculation estimate
  const handleApplyEstimate = () => {
    const totalDays = estimateYears * 365 + estimateMonths * 30;
    setQazaCounts({
      fajr: totalDays,
      zuhr: totalDays,
      asr: totalDays,
      maghrib: totalDays,
      isha: totalDays,
      witr: isHanafi ? totalDays : 0,
    });
    setShowEstimatorModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Qaza Namaz Manager"
        arabicTitle="قضاء الصلوات"
        subtitle="Track, fulfill, and log lifetime missed prayers (Qaza-e-Umri) with disciplined daily targets."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEstimatorModal(true)}
          >
            <Calculator size={14} /> Lifetime Estimator
          </Button>
        }
      />

      {/* Analytics Summary */}
      <div className="grid-3">
        <StatCard
          title="Total Qaza Remaining"
          value={totalRemaining}
          subtitle={`Total completed: ${qazaSummary.totalCompleted}`}
          icon={<RotateCcw size={20} />}
        />
        <StatCard
          title="Daily Target Pace"
          value={`${completedToday} / ${dailyTarget}`}
          subtitle={`${Math.round(targetProgress)}% completed today`}
          icon={<Target size={20} />}
        />
        <StatCard
          title="Estimated Duration"
          value={totalRemaining > 0 ? `~${estimatedDays} Days` : 'All Paid!'}
          subtitle={`At pace of ${dailyTarget} prayers / day`}
          icon={<Calendar size={20} />}
        />
      </div>

      {/* Daily Target Progress Card */}
      <Card>
        <div className="flex-between" style={{ marginBottom: 'var(--space-2)' }}>
          <div>
            <span className="label" style={{ color: 'var(--brand-primary)' }}>Today's Qaza Goal</span>
            <h4 className="heading-3" style={{ margin: 0 }}>
              {completedToday} of {dailyTarget} Qaza Repayments Completed
            </h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-xs text-muted">Daily Target:</span>
            <select
              className="input text-xs"
              style={{ width: 'auto', padding: '2px 8px', height: 'auto' }}
              value={dailyTarget}
              onChange={(e) => setDailyTarget(parseInt(e.target.value))}
            >
              <option value="1">1 / day</option>
              <option value="2">2 / day</option>
              <option value="3">3 / day</option>
              <option value="5">5 / day (1 with each Salah)</option>
              <option value="10">10 / day</option>
            </select>
          </div>
        </div>
        <ProgressBar progress={targetProgress} height={8} />
      </Card>

      {/* Individual Prayer Qaza Counters */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Qaza Repayment Counters
        </h3>

        <div className="grid-2">
          {qazaList.map((item) => (
            <Card key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="flex-between">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <h4 className="heading-3" style={{ margin: 0 }}>{item.label}</h4>
                    <span className="font-arabic text-muted">{item.arabic}</span>
                  </div>
                  <span className="text-xs text-muted">
                    {item.sublabel || 'Obligatory Qaza Owed'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 'var(--weight-extrabold)',
                    color: item.count > 0 ? 'var(--text-gold)' : 'var(--brand-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {item.count}
                </div>
              </div>

              {/* Action Buttons: Fulfill (-1) and Add (+1, +5, +10) */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={item.count <= 0}
                  onClick={() => repayQaza(item.key, 1)}
                  style={{ flex: 1 }}
                >
                  <Check size={14} /> Prayed 1 Qaza
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => incrementQaza(item.key, 1)}
                >
                  <Plus size={14} /> 1
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => incrementQaza(item.key, 5)}
                >
                  +5
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => incrementQaza(item.key, 10)}
                >
                  +10
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Repayment History Logs */}
      <Card>
        <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <History size={18} style={{ color: 'var(--brand-primary)' }} />
            <h3 className="heading-3" style={{ margin: 0 }}>Recent Qaza Repayments</h3>
          </div>
          <span className="text-xs text-muted">{qazaLogs.length} total logged</span>
        </div>

        {qazaLogs.length === 0 ? (
          <p className="text-muted text-sm" style={{ margin: 0 }}>
            No Qaza repayments logged yet. Complete a Qaza prayer above to start your repayment log.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {qazaLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="badge badge-emerald">✓ Repaid</span>
                  <strong style={{ textTransform: 'capitalize' }}>{log.prayer}</strong>
                  <span className="text-muted text-xs">({log.quantity} prayer)</span>
                </div>
                <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} />
                  {new Date(log.completedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Lifetime Qaza Estimation Modal */}
      {showEstimatorModal && (
        <div
          className="drawer-backdrop open"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <Card style={{ maxWidth: 480, width: '90%', position: 'relative' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0 }}>Qaza-e-Umri Lifetime Estimator</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowEstimatorModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-4)' }}>
              Estimate missed prayers since puberty (Bulugh). Enter the approximate duration of missed Salah to calculate your starting balance.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="label">Years of Missed Salah</label>
                <input
                  type="number"
                  min="0"
                  max="80"
                  className="input"
                  value={estimateYears}
                  onChange={(e) => setEstimateYears(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>

              <div className="input-group">
                <label className="label">Additional Months</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  className="input"
                  value={estimateMonths}
                  onChange={(e) => setEstimateMonths(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>

              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--brand-primary-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                Estimated: <strong>{(estimateYears * 365 + estimateMonths * 30) * (isHanafi ? 6 : 5)}</strong> total prayers
                (~{estimateYears * 365 + estimateMonths * 30} of each Salah).
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <Button variant="outline" size="sm" onClick={() => setShowEstimatorModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyEstimate}>
                  Apply to Counters
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
