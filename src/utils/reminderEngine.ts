import { TargetItem, ReminderConfig, AppNotification } from '../types';
import { sound } from './audio';
import { getTodayISO } from './date';

export type ReminderCallback = (notification: AppNotification) => void;

class ReminderEngine {
  private timer: number | null = null;
  private notifiedKeys: Set<string> = new Set();
  private callbacks: Set<ReminderCallback> = new Set();

  public subscribe(cb: ReminderCallback) {
    this.callbacks.add(cb);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public start(getTargets: () => TargetItem[], getConfig: () => ReminderConfig, onNotify: (n: AppNotification) => void) {
    this.stop();

    // Check immediately, then every 20 seconds
    const check = () => {
      this.runCheck(getTargets(), getConfig(), onNotify);
    };

    check();
    this.timer = window.setInterval(check, 20000);
  }

  public stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Send notification through browser Notification API, Web Audio sound, and in-app callback
   */
  public triggerNotification(
    title: string,
    message: string,
    type: AppNotification['type'],
    targetId?: string,
    soundEnabled: boolean = true,
    browserEnabled: boolean = true
  ): AppNotification {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type,
      targetId,
      read: false,
    };

    // 1. Play sound chime
    if (soundEnabled) {
      sound.playReminderAlert();
    }

    // 2. Browser native notification if supported and granted
    if (browserEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          tag: notif.id,
        });
      } catch {
        // Ignore native notification errors
      }
    }

    // 3. Dispatch to all in-app listeners
    this.callbacks.forEach((cb) => cb(notif));

    return notif;
  }

  private runCheck(
    targets: TargetItem[],
    config: ReminderConfig,
    onNotify: (n: AppNotification) => void
  ) {
    const now = new Date();
    const todayISO = getTodayISO();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // 1. Target-specific scheduled reminders
    targets.forEach((target) => {
      if (
        target.date === todayISO &&
        target.reminderEnabled &&
        !target.isCompleted &&
        target.scheduledTime
      ) {
        const [targetH, targetM] = target.scheduledTime.split(':').map(Number);
        const targetTotalMinutes = targetH * 60 + targetM;
        const triggerMinutes = targetTotalMinutes - (target.reminderMinutesBefore || 0);

        // Within 1 minute window
        if (Math.abs(currentTotalMinutes - triggerMinutes) <= 1) {
          const key = `target-${target.id}-${todayISO}-${triggerMinutes}`;
          if (!this.notifiedKeys.has(key)) {
            this.notifiedKeys.add(key);

            const timingText =
              target.reminderMinutesBefore > 0
                ? `${target.reminderMinutesBefore} menit lagi`
                : 'saat ini';

            const notif = this.triggerNotification(
              `Pengingat Target: ${target.title}`,
              `Jadwal target ${timingText} (${target.scheduledTime}). Capaian saat ini: ${target.currentValue}/${target.targetValue} ${target.unit}.`,
              'target_due',
              target.id,
              config.soundEnabled,
              config.browserNotificationsEnabled
            );
            onNotify(notif);
          }
        }
      }
    });

    // 2. Morning Briefing Reminder
    if (config.morningReminderEnabled && config.morningReminderTime) {
      const [mH, mM] = config.morningReminderTime.split(':').map(Number);
      const morningTotal = mH * 60 + mM;
      if (Math.abs(currentTotalMinutes - morningTotal) <= 1) {
        const key = `morning-${todayISO}`;
        if (!this.notifiedKeys.has(key)) {
          this.notifiedKeys.add(key);
          const todaysTargets = targets.filter((t) => t.date === todayISO);
          const notif = this.triggerNotification(
            'Perencanaan Pagi Hari!',
            `Selamat pagi! Anda memiliki ${todaysTargets.length} target harian terencana untuk hari ini. Mari mulai dengan penuh fokus.`,
            'morning_brief',
            undefined,
            config.soundEnabled,
            config.browserNotificationsEnabled
          );
          onNotify(notif);
        }
      }
    }

    // 3. Evening Review Reminder
    if (config.eveningReminderEnabled && config.eveningReminderTime) {
      const [eH, eM] = config.eveningReminderTime.split(':').map(Number);
      const eveningTotal = eH * 60 + eM;
      if (Math.abs(currentTotalMinutes - eveningTotal) <= 1) {
        const key = `evening-${todayISO}`;
        if (!this.notifiedKeys.has(key)) {
          this.notifiedKeys.add(key);
          const todaysTargets = targets.filter((t) => t.date === todayISO);
          const completed = todaysTargets.filter((t) => t.isCompleted).length;
          const pct = todaysTargets.length > 0 ? Math.round((completed / todaysTargets.length) * 100) : 0;

          const notif = this.triggerNotification(
            'Evaluasi Target Harian',
            `Sudah malam, mari periksa target hari ini! Capaian Anda saat ini: ${completed} dari ${todaysTargets.length} selesai (${pct}%).`,
            'evening_review',
            undefined,
            config.soundEnabled,
            config.browserNotificationsEnabled
          );
          onNotify(notif);
        }
      }
    }

    // 4. Hydration check reminder (every N minutes between 09:00 and 19:00)
    if (config.hydrationReminderEnabled && currentHours >= 9 && currentHours <= 19) {
      const interval = config.hydrationIntervalMinutes || 120;
      if (currentTotalMinutes % interval === 0) {
        const key = `hydration-${todayISO}-${currentTotalMinutes}`;
        if (!this.notifiedKeys.has(key)) {
          this.notifiedKeys.add(key);
          const hydrationTarget = targets.find(
            (t) => t.date === todayISO && t.category === 'health' && t.unit.toLowerCase().includes('gelas')
          );
          const currentWater = hydrationTarget ? hydrationTarget.currentValue : 0;
          const targetWater = hydrationTarget ? hydrationTarget.targetValue : 8;

          const notif = this.triggerNotification(
            'Pengingat Minum Air',
            `Jangan lupa minum segelas air untuk menjaga hidrasi & konsentrasi kerja. (Tercatat: ${currentWater}/${targetWater} gelas)`,
            'wellness',
            hydrationTarget?.id,
            config.soundEnabled,
            config.browserNotificationsEnabled
          );
          onNotify(notif);
        }
      }
    }

    // 5. Worship: Qiyamul Lail / Tahajud Reminder
    if (config.worshipTahajudReminderEnabled && config.worshipTahajudTime) {
      const [tH, tM] = config.worshipTahajudTime.split(':').map(Number);
      const tahajudTotal = tH * 60 + tM;
      if (Math.abs(currentTotalMinutes - tahajudTotal) <= 1) {
        const key = `tahajud-${todayISO}`;
        if (!this.notifiedKeys.has(key)) {
          this.notifiedKeys.add(key);
          const notif = this.triggerNotification(
            'Waktunya Qiyamul Lail & Sholat Tahajud',
            'Saatnya bermunajat di sepertiga malam terakhir. Segera ambil wudhu untuk sholat tahajud dan witir.',
            'worship_reminder',
            undefined,
            config.soundEnabled,
            config.browserNotificationsEnabled
          );
          onNotify(notif);
        }
      }
    }

    // 6. Worship: Sholat Dhuha Reminder
    if (config.worshipDhuhaReminderEnabled && config.worshipDhuhaTime) {
      const [dH, dM] = config.worshipDhuhaTime.split(':').map(Number);
      const dhuhaTotal = dH * 60 + dM;
      if (Math.abs(currentTotalMinutes - dhuhaTotal) <= 1) {
        const key = `dhuha-${todayISO}`;
        if (!this.notifiedKeys.has(key)) {
          this.notifiedKeys.add(key);
          const notif = this.triggerNotification(
            'Waktunya Sholat Sunnah Dhuha',
            'Luangkan waktu 5-10 menit untuk sholat dhuha (2-4 rakaat) sebagai sedekah persendian dan penarik kelapangan rezeki.',
            'worship_reminder',
            undefined,
            config.soundEnabled,
            config.browserNotificationsEnabled
          );
          onNotify(notif);
        }
      }
    }

    // 7. Worship: Dzikir Petang & Tilawah Reminder
    if (config.worshipEveningDzikirReminderEnabled && config.worshipEveningDzikirTime) {
      const [dzH, dzM] = config.worshipEveningDzikirTime.split(':').map(Number);
      const dzikirTotal = dzH * 60 + dzM;
      if (Math.abs(currentTotalMinutes - dzikirTotal) <= 1) {
        const key = `dzikir-petang-${todayISO}`;
        if (!this.notifiedKeys.has(key)) {
          this.notifiedKeys.add(key);
          const notif = this.triggerNotification(
            'Pengingat Dzikir Petang & Tilawah Al-Qur\'an',
            'Matahari mulai condong ke barat. Luangkan waktu untuk dzikir petang dan membaca beberapa lembar Al-Qur\'an sebelum Maghrib.',
            'worship_reminder',
            undefined,
            config.soundEnabled,
            config.browserNotificationsEnabled
          );
          onNotify(notif);
        }
      }
    }
  }
}

export const reminderEngine = new ReminderEngine();
