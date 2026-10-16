import React, { useState, useEffect } from 'react';
import { ReminderConfig, AppNotification, TargetItem } from '../types';
import { reminderEngine } from '../utils/reminderEngine';
import { sound } from '../utils/audio';
import { getTodayISO } from '../utils/date';
import {
  Bell,
  Clock,
  Droplets,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  CheckCheck,
  ShieldCheck,
  Sunrise,
  Sunset,
  Moon,
  BookOpen,
} from 'lucide-react';

interface RemindersHubProps {
  config: ReminderConfig;
  onUpdateConfig: (newConfig: ReminderConfig) => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  todayTargets: TargetItem[];
  onTriggerTestNotification: () => void;
}

export const RemindersHub: React.FC<RemindersHubProps> = ({
  config,
  onUpdateConfig,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
  todayTargets,
  onTriggerTestNotification,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPermissionStatus(reminderEngine.getPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const result = await reminderEngine.requestNotificationPermission();
    setPermissionStatus(result);
    if (result === 'granted') {
      onUpdateConfig({ ...config, browserNotificationsEnabled: true });
    }
  };

  const scheduledToday = todayTargets.filter((t) => t.reminderEnabled && t.scheduledTime);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Pusat Pengingat Otomatis
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola waktu alarm rutin, integrasi notifikasi browser, dan jadwal pengingat target harian.
            </p>
          </div>

          {/* Quick Sound & Test Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playReminderAlert();
                onTriggerTestNotification();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Uji Bunyi & Alarm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Browser Notification Permission Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Status Izin Notifikasi Browser
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {permissionStatus === 'granted'
                  ? 'Izin notifikasi browser aktif. Anda akan menerima notifikasi desktop saat waktu target tiba.'
                  : permissionStatus === 'denied'
                  ? 'Izin notifikasi ditolak di peramban. Pengingat tetap akan bersuara dan muncul sebagai toast di dalam aplikasi.'
                  : 'Aktifkan izin peramban agar Anda tidak melewatkan target saat tab berada di latar belakang.'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {permissionStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>Terhubung & Aktif</span>
              </span>
            ) : permissionStatus === 'denied' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>Izin Ditolak Browser</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Izinkan Notifikasi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Routine Automatic Reminders Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Pengingat Rutin Terjadwal Otomatis
          </h2>
          <p className="text-xs text-slate-500">
            Sistem pengingat berkala untuk membangun ritme harian yang konsisten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Morning Briefing */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900">Perencanaan Pagi</span>
              </div>
              <input
                type="checkbox"
                checked={config.morningReminderEnabled}
                onChange={(e) =>
                  onUpdateConfig({ ...config, morningReminderEnabled: e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Notifikasi pembuka hari untuk mereviu dan mengatur target prioritas.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Jam Pengingat Pagi:
              </label>
              <input
                type="time"
                value={config.morningReminderTime}
                onChange={(e) =>
                  onUpdateConfig({ ...config, morningReminderTime: e.target.value })
                }
                disabled={!config.morningReminderEnabled}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Evening Review */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900">Evaluasi Malam</span>
              </div>
              <input
                type="checkbox"
                checked={config.eveningReminderEnabled}
                onChange={(e) =>
                  onUpdateConfig({ ...config, eveningReminderEnabled: e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Notifikasi penutup hari untuk mencatat pencapaian dan mengunci progres.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Jam Evaluasi Malam:
              </label>
              <input
                type="time"
                value={config.eveningReminderTime}
                onChange={(e) =>
                  onUpdateConfig({ ...config, eveningReminderTime: e.target.value })
                }
                disabled={!config.eveningReminderEnabled}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Periodic Hydration */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-900">Hidrasi Minum Air</span>
              </div>
              <input
                type="checkbox"
                checked={config.hydrationReminderEnabled}
                onChange={(e) =>
                  onUpdateConfig({ ...config, hydrationReminderEnabled: e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Pengingat berkala otomatis untuk minum air selama jam produktif kerja.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Interval Pengingat:
              </label>
              <select
                value={config.hydrationIntervalMinutes}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    hydrationIntervalMinutes: Number(e.target.value),
                  })
                }
                disabled={!config.hydrationReminderEnabled}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-50"
              >
                <option value={60}>Setiap 60 Menit (1 Jam)</option>
                <option value={90}>Setiap 90 Menit (1.5 Jam)</option>
                <option value={120}>Setiap 120 Menit (2 Jam)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Worship & Spiritual Reminders */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Pengingat Rutin Ibadah & Spiritual
          </h2>
          <p className="text-xs text-slate-500">
            Pengingat otomatis untuk sholat sunnah, qiyamul lail, dzikir, dan membaca Al-Qur'an.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Qiyamul Lail / Tahajud */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">Tahajud & Witir</span>
              </div>
              <input
                type="checkbox"
                checked={config.worshipTahajudReminderEnabled}
                onChange={(e) =>
                  onUpdateConfig({ ...config, worshipTahajudReminderEnabled: e.target.checked })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-600">
              Pengingat sepertiga malam terakhir untuk bangun bermunajat sebelum fajar.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Jam Pengingat Tahajud:
              </label>
              <input
                type="time"
                value={config.worshipTahajudTime}
                onChange={(e) =>
                  onUpdateConfig({ ...config, worshipTahajudTime: e.target.value })
                }
                disabled={!config.worshipTahajudReminderEnabled}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Sholat Dhuha */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">Sholat Sunnah Dhuha</span>
              </div>
              <input
                type="checkbox"
                checked={config.worshipDhuhaReminderEnabled}
                onChange={(e) =>
                  onUpdateConfig({ ...config, worshipDhuhaReminderEnabled: e.target.checked })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-600">
              Pengingat di waktu dhuha untuk 2-4 rakaat sedekah persendian dan penarik rezeki.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Jam Pengingat Dhuha:
              </label>
              <input
                type="time"
                value={config.worshipDhuhaTime}
                onChange={(e) =>
                  onUpdateConfig({ ...config, worshipDhuhaTime: e.target.value })
                }
                disabled={!config.worshipDhuhaReminderEnabled}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Evening Dzikir & Tilawah */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">Dzikir Petang & Tilawah</span>
              </div>
              <input
                type="checkbox"
                checked={config.worshipEveningDzikirReminderEnabled}
                onChange={(e) =>
                  onUpdateConfig({ ...config, worshipEveningDzikirReminderEnabled: e.target.checked })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-600">
              Pengingat sore sesudah Ashar untuk wirid dzikir petang dan membaca Al-Qur'an.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Jam Pengingat Petang:
              </label>
              <input
                type="time"
                value={config.worshipEveningDzikirTime}
                onChange={(e) =>
                  onUpdateConfig({ ...config, worshipEveningDzikirTime: e.target.value })
                }
                disabled={!config.worshipEveningDzikirReminderEnabled}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Target Reminders Today */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Pengingat Target Terjadwal Hari Ini ({scheduledToday.length})
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Daftar target yang memiliki alarm waktu spesifik untuk dieksekusi hari ini.
        </p>

        {scheduledToday.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
            Tidak ada target dengan pengingat aktif untuk hari ini. Anda dapat mengaktifkannya pada formulir target.
          </div>
        ) : (
          <div className="space-y-2">
            {scheduledToday.map((target) => (
              <div
                key={target.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800">
                    {target.scheduledTime}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">{target.title}</div>
                    <div className="text-slate-500 text-[11px]">
                      Notifikasi: {target.reminderMinutesBefore === 0 ? 'Tepat Waktu' : `${target.reminderMinutesBefore} menit sebelum`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      target.isCompleted ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {target.isCompleted ? 'Sudah Tuntas' : 'Menunggu Pelaksanaan'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Activity History */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Riwayat Notifikasi Aplikasi
            </h2>
            <p className="text-xs text-slate-500">
              Semua peringatan dan pesan otomatis yang telah terkirim.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Dibaca</span>
            </button>
            <button
              type="button"
              onClick={onClearNotifications}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
            Belum ada riwayat notifikasi.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 text-xs flex items-start justify-between gap-3 ${
                  notif.read ? 'bg-white' : 'bg-indigo-50/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-slate-100 text-slate-600 mt-0.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{notif.title}</div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{notif.message}</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                  {notif.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
