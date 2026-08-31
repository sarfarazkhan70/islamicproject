import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { Bell, Moon, Users, Volume2, Check, Sparkles } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    permission,
    isSubscribed,
    preferences,
    checkPermission,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    updatePreferences,
    sendTestNotification,
  } = useNotificationStore();

  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handleToggleMaster = (enabled: boolean) => {
    updatePreferences({ enabled });
  };

  const handleToggleMulk = (enabled: boolean) => {
    updatePreferences({
      surahMulk11pm: { ...preferences.surahMulk11pm, enabled },
    });
  };

  const handleToggleKahf = (enabled: boolean) => {
    updatePreferences({
      fridayKahf: { ...preferences.fridayKahf, enabled },
    });
  };

  const handleJumuahTimeChange = (time: string) => {
    updatePreferences({ jumuahTime: time });
  };

  const handleTogglePrayer = (prayer: 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha') => {
    updatePreferences({
      prayerReminders: {
        ...preferences.prayerReminders,
        [prayer]: !preferences.prayerReminders[prayer],
      },
    });
  };

  const handleLeadTimeChange = (leadTimeMinutes: 0 | 5 | 10 | 15) => {
    updatePreferences({
      prayerReminders: {
        ...preferences.prayerReminders,
        leadTimeMinutes,
      },
    });
  };

  const handleTest = async () => {
    setTestSent(true);
    await sendTestNotification();
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Notifications & Web Push"
        arabicTitle="التنبيهات والتذكير"
        subtitle="Manage Adhan alerts, the daily 11:00 PM Surah Al-Mulk reminder, and Friday Jumu'ah Surah Al-Kahf notifications."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            icon={testSent ? <Check size={14} /> : <Bell size={14} />}
          >
            {testSent ? 'Test Alert Dispatched!' : 'Send Test Notification'}
          </Button>
        }
      />

      {/* Permission & Web Push Subscription Card */}
      <Card
        highlighted
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.08))',
        }}
      >
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              className="btn-icon btn-icon-md"
              style={{
                backgroundColor:
                  permission === 'granted'
                    ? 'var(--brand-primary-light)'
                    : 'var(--bg-surface-elevated)',
                color:
                  permission === 'granted'
                    ? 'var(--brand-primary)'
                    : 'var(--text-muted)',
              }}
            >
              <Bell size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h3 className="heading-3" style={{ margin: 0 }}>Browser Push Notifications</h3>
                {permission === 'granted' ? (
                  <Badge variant="emerald">Permission Granted</Badge>
                ) : permission === 'denied' ? (
                  <Badge variant="red">Permission Blocked</Badge>
                ) : (
                  <Badge variant="gold">Permission Required</Badge>
                )}
              </div>
              <p className="text-xs text-muted" style={{ margin: '4px 0 0' }}>
                {permission === 'granted'
                  ? 'Your browser is subscribed to receive timely prayer and Surah reminders.'
                  : permission === 'denied'
                  ? 'Notifications are blocked in your browser settings. Please enable them to receive alerts.'
                  : 'Grant notification permission to enable Web Push background alerts on this device.'}
              </p>
            </div>
          </div>

          <div>
            {permission !== 'granted' ? (
              <Button variant="primary" size="sm" onClick={requestPermission}>
                <Sparkles size={14} /> Enable Web Push
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                >
                  {isSubscribed ? 'Disable on Device' : 'Re-subscribe'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Master Notification Toggle */}
      <Card>
        <div className="flex-between">
          <div>
            <h4 className="heading-3" style={{ margin: 0 }}>Master Notifications Toggle</h4>
            <p className="text-xs text-muted" style={{ margin: '4px 0 0' }}>
              Globally pause or resume all scheduled reminders for your account.
            </p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => handleToggleMaster(e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>
      </Card>

      {/* Special Islamic Habit Reminders */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Spiritual Habit Reminders
        </h3>
        <div className="grid-2">
          {/* Daily 11 PM Surah Al-Mulk Reminder Card */}
          <Card highlighted style={{ borderLeft: '4px solid var(--brand-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--brand-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Moon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <h4 className="heading-3" style={{ margin: 0 }}>Daily 11:00 PM Surah Al-Mulk</h4>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.surahMulk11pm.enabled}
                      disabled={!preferences.enabled}
                      onChange={(e) => handleToggleMulk(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>
                <p className="text-secondary text-xs" style={{ margin: '6px 0 10px' }}>
                  Prompts: <em>"Have you read or listened to Surah Al-Mulk today?"</em> delivered at 11:00 PM in your local timezone.
                </p>
                <Badge variant="gold">Scheduled at 23:00 Local Time</Badge>
              </div>
            </div>
          </Card>

          {/* Friday 1-Hour Prior Jumu'ah Reminder Card */}
          <Card highlighted style={{ borderLeft: '4px solid var(--brand-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Users size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <h4 className="heading-3" style={{ margin: 0 }}>Friday Surah Al-Kahf</h4>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.fridayKahf.enabled}
                      disabled={!preferences.enabled}
                      onChange={(e) => handleToggleKahf(e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>
                <p className="text-secondary text-xs" style={{ margin: '6px 0 8px' }}>
                  Reminds you to recite Surah Al-Kahf exactly 1 hour before your local Friday Jumu'ah congregation.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  <span className="text-xs text-muted">Configured Jumu'ah:</span>
                  <input
                    type="time"
                    className="input text-xs"
                    style={{ width: 'auto', padding: '2px 8px', height: 'auto' }}
                    value={preferences.jumuahTime || '13:30'}
                    onChange={(e) => handleJumuahTimeChange(e.target.value)}
                  />
                  <Badge variant="emerald">1 Hour Prior Alert</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Daily Obligatory Prayer Adhan Notifications */}
      <div>
        <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
          <h3 className="heading-3" style={{ margin: 0 }}>
            Five Daily Prayer Adhan Reminders
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-xs text-muted">Global Lead Time:</span>
            <select
              className="select text-xs"
              style={{ width: 'auto', padding: '2px 8px', height: 'auto' }}
              value={preferences.prayerReminders.leadTimeMinutes}
              onChange={(e) => handleLeadTimeChange(Number(e.target.value) as any)}
            >
              <option value={0}>At Prayer Time (0 min)</option>
              <option value={5}>5 min before</option>
              <option value={10}>10 min before</option>
              <option value={15}>15 min before</option>
            </select>
          </div>
        </div>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {(['fajr', 'zuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => {
              const isEnabled = preferences.prayerReminders[p];
              const leadTime = preferences.prayerReminders.leadTimeMinutes;

              return (
                <div
                  key={p}
                  className="flex-between"
                  style={{
                    padding: 'var(--space-2) 0',
                    borderBottom: p !== 'isha' ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      className="btn-icon btn-icon-sm"
                      style={{
                        backgroundColor: isEnabled
                          ? 'var(--brand-primary-light)'
                          : 'var(--bg-surface-elevated)',
                        color: isEnabled ? 'var(--brand-primary)' : 'var(--text-muted)',
                      }}
                    >
                      <Volume2 size={16} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 'var(--weight-semibold)', textTransform: 'capitalize' }}>
                        {p} Prayer Alert
                      </span>
                      <div className="text-xs text-muted">
                        {isEnabled
                          ? `Alert triggers ${leadTime === 0 ? 'at prayer time' : `${leadTime}m before`}`
                          : 'Alert disabled'}
                      </div>
                    </div>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      disabled={!preferences.enabled}
                      onChange={() => handleTogglePrayer(p)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
