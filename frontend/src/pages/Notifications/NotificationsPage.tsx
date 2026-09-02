import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { usePrayerTimes } from '../../hooks/usePrayerTimes.js';
import { azaanScheduler, ScheduledEventInfo } from '../../core/azaan/azaanScheduler.js';
import {
  Bell,
  Moon,
  Users,
  Volume2,
  Play,
  Square,
  Check,
  Sparkles,
  Clock,
  Radio,
  Flame,
  ListCheck,
} from 'lucide-react';

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

  const { timetable, displayName } = usePrayerTimes();

  const [testSent, setTestSent] = useState(false);
  const [isPlayingAzaan, setIsPlayingAzaan] = useState(false);
  const [isPlayingReminder, setIsPlayingReminder] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simCountdown, setSimCountdown] = useState<number | null>(null);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [selectedSimPrayer, setSelectedSimPrayer] = useState<'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'>('Dhuhr');
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEventInfo[]>([]);

  useEffect(() => {
    checkPermission();
    setScheduledEvents(azaanScheduler.getScheduledEvents());
    const interval = setInterval(() => {
      setScheduledEvents(azaanScheduler.getScheduledEvents());
    }, 5000);
    return () => clearInterval(interval);
  }, [checkPermission]);

  const handleToggleMaster = (enabled: boolean) => {
    updatePreferences({ enabled });
  };

  const handleToggleAzaan = (azaanEnabled: boolean) => {
    updatePreferences({ azaanEnabled });
  };

  const handleAzaanVolume = (azaanVolume: number) => {
    updatePreferences({ azaanVolume });
  };

  const handleToggle15MinReminder = (reminder15MinEnabled: boolean) => {
    updatePreferences({ reminder15MinEnabled });
  };

  const handleReminderVolume = (reminderVolume: number) => {
    updatePreferences({ reminderVolume });
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

  const handleTest = async () => {
    setTestSent(true);
    await sendTestNotification();
    setTimeout(() => setTestSent(false), 3000);
  };

  const togglePreviewAzaan = () => {
    if (isPlayingAzaan) {
      azaanScheduler.stopAudio();
      setIsPlayingAzaan(false);
    } else {
      setIsPlayingReminder(false);
      azaanScheduler.playAudio('/audio/madina_azaan.mp3', preferences.azaanVolume ?? 0.8);
      setIsPlayingAzaan(true);
    }
  };

  const togglePreviewReminder = () => {
    if (isPlayingReminder) {
      azaanScheduler.stopAudio();
      setIsPlayingReminder(false);
    } else {
      setIsPlayingAzaan(false);
      azaanScheduler.playAudio('/audio/namaz_reminder.mp3', preferences.reminderVolume ?? 0.7);
      setIsPlayingReminder(true);
    }
  };

  const handleStopAudio = () => {
    azaanScheduler.stopAudio();
    setIsPlayingAzaan(false);
    setIsPlayingReminder(false);
  };

  // Safe simulation triggers
  const startAzaanSimulation = (seconds = 10) => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimCountdown(seconds);
    setSimMessage(`Simulating ${selectedSimPrayer} Azaan in ${seconds} seconds...`);

    let remaining = seconds;
    const interval = setInterval(() => {
      remaining -= 1;
      setSimCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setSimCountdown(null);
        setSimMessage(`Triggering ${selectedSimPrayer} Azaan & Audio now!`);
        azaanScheduler.triggerAzaan(selectedSimPrayer, selectedSimPrayer.toLowerCase());
        setScheduledEvents(azaanScheduler.getScheduledEvents());
        setTimeout(() => {
          setSimulationActive(false);
          setSimMessage(null);
        }, 4000);
      }
    }, 1000);
  };

  const startReminderSimulation = (seconds = 5) => {
    if (simulationActive) return;
    setSimulationActive(true);
    setSimCountdown(seconds);
    setSimMessage(`Simulating ${selectedSimPrayer} +15 Min Reminder in ${seconds} seconds...`);

    let remaining = seconds;
    const interval = setInterval(() => {
      remaining -= 1;
      setSimCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setSimCountdown(null);
        setSimMessage(`Triggering ${selectedSimPrayer} 15-Minute Reminder now!`);
        azaanScheduler.trigger15MinReminder(selectedSimPrayer, selectedSimPrayer.toLowerCase());
        setScheduledEvents(azaanScheduler.getScheduledEvents());
        setTimeout(() => {
          setSimulationActive(false);
          setSimMessage(null);
        }, 4000);
      }
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 900 }}>
      <PageHeader
        title="Notifications & Azaan Alerts"
        arabicTitle="التنبيهات والأذان والتذكير"
        subtitle="Automatic authentic male Azaan audio, 15-minute Islamic Namaz reminders, and daily Sunnah alerts based on your auto location."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {(isPlayingAzaan || isPlayingReminder) && (
              <Button variant="outline" size="sm" onClick={handleStopAudio} icon={<Square size={14} />}>
                Stop Audio
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              icon={testSent ? <Check size={14} /> : <Bell size={14} />}
            >
              {testSent ? 'Test Dispatched!' : 'Quick Push Test'}
            </Button>
          </div>
        }
      />

      {/* Permission & Status Banner */}
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
                <h3 className="heading-3" style={{ margin: 0 }}>System Notifications & Web Push</h3>
                {permission === 'granted' ? (
                  <Badge variant="emerald">Permission Active</Badge>
                ) : permission === 'denied' ? (
                  <Badge variant="red">Blocked in Browser</Badge>
                ) : (
                  <Badge variant="gold">Permission Required</Badge>
                )}
              </div>
              <p className="text-xs text-muted" style={{ margin: '4px 0 0' }}>
                {permission === 'granted'
                  ? `Active for ${displayName || 'your current location'}. Scheduled Azaans and 15-minute reminders will alert on this device.`
                  : permission === 'denied'
                  ? 'Notifications are blocked in your browser settings. Please allow notifications to hear Azaan.'
                  : 'Grant notification permission to enable real-time Azaan alerts on this device.'}
              </p>
            </div>
          </div>

          <div>
            {permission !== 'granted' ? (
              <Button variant="primary" size="sm" onClick={requestPermission}>
                <Sparkles size={14} /> Enable Notifications
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
              >
                {isSubscribed ? 'Subscribed (Device Ready)' : 'Re-subscribe'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Master Toggle Card */}
      <Card>
        <div className="flex-between">
          <div>
            <h4 className="heading-3" style={{ margin: 0 }}>Master Notifications Toggle</h4>
            <p className="text-xs text-muted" style={{ margin: '4px 0 0' }}>
              Globally pause or resume all scheduled Azaans and Islamic reminders.
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

      {/* 1. Core Azaan Audio Settings Card */}
      <Card highlighted style={{ borderLeft: '4px solid var(--brand-primary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Radio size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <h3 className="heading-3" style={{ margin: 0 }}>Full Madina / Masjid an-Nabawi ﷺ Azaan</h3>
                  <Badge variant="emerald">Live at Prayer Time</Badge>
                </div>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Plays the complete authentic Masjid an-Nabawi ﷺ (Madina Munawwarah) Azaan from beginning to end at exact prayer times.
                </p>
              </div>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={preferences.azaanEnabled ?? true}
                disabled={!preferences.enabled}
                onChange={(e) => handleToggleAzaan(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Volume and Audio Preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 220 }}>
              <Volume2 size={18} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <span className="text-xs text-secondary font-medium">Azaan Volume</span>
                  <span className="text-xs text-primary font-semibold">
                    {Math.round((preferences.azaanVolume ?? 0.8) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.azaanVolume ?? 0.8}
                  onChange={(e) => handleAzaanVolume(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <Button
              variant={isPlayingAzaan ? 'primary' : 'outline'}
              size="sm"
              onClick={togglePreviewAzaan}
              icon={isPlayingAzaan ? <Square size={14} /> : <Play size={14} />}
            >
              {isPlayingAzaan ? 'Stop Azaan' : 'Audition Azaan Recording'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. 15-Minute Islamic Reminder Settings Card */}
      <Card highlighted style={{ borderLeft: '4px solid var(--brand-gold)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--brand-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <h3 className="heading-3" style={{ margin: 0 }}>15-Minute Namaz Reminder</h3>
                  <Badge variant="gold">+15 Min After Prayer</Badge>
                </div>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Authentic male Qari reminder playing ONLY: <em>"Hayya 'alas-Salah"</em> (2 times) &amp; <em>"Hayya 'alal-Falah"</em> (2 times). No full Azaan or extra speech.
                </p>
              </div>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={preferences.reminder15MinEnabled ?? true}
                disabled={!preferences.enabled}
                onChange={(e) => handleToggle15MinReminder(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Volume and Audio Preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 220 }}>
              <Volume2 size={18} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <span className="text-xs text-secondary font-medium">Reminder Volume</span>
                  <span className="text-xs text-primary font-semibold">
                    {Math.round((preferences.reminderVolume ?? 0.7) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.reminderVolume ?? 0.7}
                  onChange={(e) => handleReminderVolume(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-gold)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <Button
              variant={isPlayingReminder ? 'primary' : 'outline'}
              size="sm"
              onClick={togglePreviewReminder}
              icon={isPlayingReminder ? <Square size={14} /> : <Play size={14} />}
            >
              {isPlayingReminder ? 'Stop Reminder' : "Audition Reminder (Hayya 'alas-Salah & Hayya 'alal-Falah)"}
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Five Daily Obligatory Prayer Schedule & Toggles */}
      <div>
        <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div>
            <h3 className="heading-3" style={{ margin: 0 }}>
              Daily 5 Prayers — Active Schedule & Toggles
            </h3>
            <span className="text-xs text-muted">
              Auto location prayer timetable ({displayName || 'Current Location'}). Individual toggles control both Azaan and +15m reminder.
            </span>
          </div>
        </div>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {(['fajr', 'zuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => {
              const isEnabled = preferences.prayerReminders[p];
              const prayerItem = timetable?.prayers?.find((item) => item.key === p);
              const azaanTimeStr = prayerItem?.timeFormatted || '--:--';

              let reminderTimeStr = '--:--';
              if (prayerItem?.date) {
                const rDate = new Date(prayerItem.date.getTime() + 15 * 60 * 1000);
                reminderTimeStr = rDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
              }

              return (
                <div
                  key={p}
                  className="flex-between"
                  style={{
                    padding: 'var(--space-3) 0',
                    borderBottom: p !== 'isha' ? '1px solid var(--border-subtle)' : 'none',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontWeight: 'var(--weight-bold)', textTransform: 'capitalize' }}>
                          {p}
                        </span>
                        <Badge variant="emerald">Azaan: {azaanTimeStr}</Badge>
                        <Badge variant="gold">+15m Reminder: {reminderTimeStr}</Badge>
                      </div>
                      <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                        {isEnabled ? 'Azaan & 15-minute reminder active' : 'Prayer notifications paused'}
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

      {/* 4. Safe Interactive Test & Simulation Suite */}
      <Card style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--brand-gold)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Flame size={20} style={{ color: 'var(--brand-gold)' }} />
              <h3 className="heading-3" style={{ margin: 0 }}>Interactive Prayer Simulator & QA Suite</h3>
            </div>
            <Badge variant="gold">Test Simulation Mode</Badge>
          </div>

          <p className="text-xs text-muted" style={{ margin: 0 }}>
            Safely test Azaan audio, 15-minute reminders, and OS notifications without waiting for real prayer times.
          </p>

          {simMessage && (
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--brand-gold)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <Clock size={16} className="animate-spin" />
              <span>{simMessage}</span>
              {simCountdown !== null && <Badge variant="gold">{simCountdown}s</Badge>}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="text-xs font-semibold">Prayer:</span>
              <select
                className="select text-xs"
                style={{ width: 'auto', padding: '4px 8px' }}
                value={selectedSimPrayer}
                onChange={(e) => setSelectedSimPrayer(e.target.value as any)}
              >
                <option value="Fajr">Fajr</option>
                <option value="Dhuhr">Dhuhr</option>
                <option value="Asr">Asr</option>
                <option value="Maghrib">Maghrib</option>
                <option value="Isha">Isha</option>
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={simulationActive}
              onClick={() => startAzaanSimulation(10)}
              icon={<Radio size={14} />}
            >
              Simulate Azaan in 10s
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={simulationActive}
              onClick={() => startReminderSimulation(5)}
              icon={<Clock size={14} />}
            >
              Simulate +15m Reminder in 5s
            </Button>

            {(isPlayingAzaan || isPlayingReminder || simulationActive) && (
              <Button variant="outline" size="sm" onClick={handleStopAudio} icon={<Square size={14} />}>
                Reset / Stop Audio
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 5. Live Scheduled Events Inspector */}
      {scheduledEvents.length > 0 && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <ListCheck size={18} style={{ color: 'var(--brand-primary)' }} />
            <h3 className="heading-3" style={{ margin: 0 }}>Active Event Queue for Today</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {scheduledEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-xs)' }}>
                    {evt.type === 'AZAAN' ? '🕌 Azaan' : '🔔 15m Reminder'} — {evt.prayerName}
                  </div>
                  <div className="text-xs text-muted">
                    {evt.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
                <Badge variant={evt.status === 'PENDING' ? 'emerald' : evt.status === 'TRIGGERED' ? 'gold' : 'gray'}>
                  {evt.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Special Islamic Habit Reminders */}
      <div>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>
          Spiritual Sunnah & Habit Reminders
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
    </div>
  );
};
