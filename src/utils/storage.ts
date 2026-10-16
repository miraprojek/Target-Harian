import { TargetItem, ReminderConfig, AppNotification, TargetCategory } from '../types';
import { getTodayISO, addDays } from './date';

const STORAGE_KEYS = {
  TARGETS: 'targetharian_targets_v2',
  CONFIG: 'targetharian_config_v2',
  NOTIFICATIONS: 'targetharian_notifications_v1',
};

export const DEFAULT_CONFIG: ReminderConfig = {
  browserNotificationsEnabled: false,
  soundEnabled: true,
  morningReminderEnabled: true,
  morningReminderTime: '07:30',
  eveningReminderEnabled: true,
  eveningReminderTime: '20:30',
  hydrationReminderEnabled: true,
  hydrationIntervalMinutes: 120,
  standUpReminderEnabled: true,
  worshipTahajudReminderEnabled: true,
  worshipTahajudTime: '03:45',
  worshipDhuhaReminderEnabled: true,
  worshipDhuhaTime: '08:30',
  worshipEveningDzikirReminderEnabled: true,
  worshipEveningDzikirTime: '17:45',
};

export const CATEGORY_LABELS: Record<TargetCategory, { label: string; color: string; border: string; bg: string }> = {
  worship: {
    label: 'Ibadah & Spiritual',
    color: 'text-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
  },
  career: {
    label: 'Karier & Kerja',
    color: 'text-blue-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
  },
  study: {
    label: 'Belajar & Riset',
    color: 'text-indigo-700',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
  },
  health: {
    label: 'Kesehatan & Olahraga',
    color: 'text-teal-700',
    border: 'border-teal-200',
    bg: 'bg-teal-50',
  },
  finance: {
    label: 'Keuangan & Finansial',
    color: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
  personal: {
    label: 'Pribadi & Kebiasaan',
    color: 'text-purple-700',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
  },
};

/**
 * Generate rich seed data including today and past 14 days with comprehensive worship items
 */
export function generateSeedData(): TargetItem[] {
  const today = getTodayISO();
  const list: TargetItem[] = [];

  // 1. TODAY'S TARGETS (Featuring comprehensive Islamic worship targets alongside career, study, health)
  list.push(
    {
      id: 'today-worship-sholat5',
      title: 'Sholat Fardhu 5 Waktu Berjamaah',
      description: 'Menjaga sholat fardhu tepat waktu berjamaah di masjid/musholla',
      category: 'worship',
      priority: 'high',
      type: 'checklist',
      targetValue: 5,
      currentValue: 3,
      unit: 'waktu',
      subtasks: [
        { id: 'sh-1', text: 'Sholat Subuh Berjamaah', completed: true },
        { id: 'sh-2', text: 'Sholat Dzuhur Berjamaah', completed: true },
        { id: 'sh-3', text: 'Sholat Ashar Berjamaah', completed: true },
        { id: 'sh-4', text: 'Sholat Maghrib Berjamaah', completed: false },
        { id: 'sh-5', text: 'Sholat Isya Berjamaah', completed: false },
      ],
      date: today,
      scheduledTime: '04:30',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      isCompleted: false,
    },
    {
      id: 'today-worship-tilawah',
      title: 'Tilawah Al-Qur\'an (One Day One Juz)',
      description: 'Membaca mushaf minimal 10 lembar / 1 juz dengan tartil',
      category: 'worship',
      priority: 'high',
      type: 'number',
      targetValue: 10,
      currentValue: 6,
      unit: 'lembar',
      subtasks: [],
      date: today,
      scheduledTime: '06:00',
      reminderEnabled: true,
      reminderMinutesBefore: 10,
      isCompleted: false,
    },
    {
      id: 'today-worship-dhuha',
      title: 'Sholat Sunnah Dhuha (4 Rakaat)',
      description: 'Sholat dhuha memohon kelapangan rezeki dan ketenangan',
      category: 'worship',
      priority: 'medium',
      type: 'number',
      targetValue: 4,
      currentValue: 4,
      unit: 'rakaat',
      subtasks: [],
      date: today,
      scheduledTime: '08:30',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      isCompleted: true,
      completedAt: '08:45',
    },
    {
      id: 'today-worship-tahajud',
      title: 'Qiyamul Lail & Sholat Tahajud + Witir',
      description: 'Sholat malam sepertiga akhir sebelum waktu fajar',
      category: 'worship',
      priority: 'high',
      type: 'number',
      targetValue: 4,
      currentValue: 0,
      unit: 'rakaat',
      subtasks: [],
      date: today,
      scheduledTime: '03:45',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      isCompleted: false,
    },
    {
      id: 'today-worship-dzikir',
      title: 'Dzikir Pagi & Petang (Al-Ma\'tsurat)',
      description: 'Wirid doa perlindungan pagi hari dan sore hari',
      category: 'worship',
      priority: 'medium',
      type: 'checklist',
      targetValue: 2,
      currentValue: 1,
      unit: 'sesi',
      subtasks: [
        { id: 'dz-1', text: 'Dzikir Pagi sesudah Subuh', completed: true },
        { id: 'dz-2', text: 'Dzikir Petang sesudah Ashar', completed: false },
      ],
      date: today,
      scheduledTime: '17:30',
      reminderEnabled: true,
      reminderMinutesBefore: 10,
      isCompleted: false,
    },
    {
      id: 'today-worship-sedekah',
      title: 'Sedekah Subuh / Infaq Harian',
      description: 'Menyisihkan infaq istiqomah setiap pagi untuk keberkahan hari',
      category: 'worship',
      priority: 'medium',
      type: 'checklist',
      targetValue: 1,
      currentValue: 1,
      unit: 'tugas',
      subtasks: [],
      date: today,
      scheduledTime: '05:30',
      reminderEnabled: false,
      reminderMinutesBefore: 0,
      isCompleted: true,
      completedAt: '05:35',
    },
    {
      id: 'today-1',
      title: 'Tuntaskan Presentasi Strategi Kuartal',
      description: 'Finalisasi slide deck analisis performa dan target tim',
      category: 'career',
      priority: 'high',
      type: 'checklist',
      targetValue: 1,
      currentValue: 1,
      unit: 'tugas',
      subtasks: [
        { id: 'st-1', text: 'Analisis metrik pencapaian tim', completed: true },
        { id: 'st-2', text: 'Visualisasi grafik pertumbuhan', completed: true },
        { id: 'st-3', text: 'Kirim draf ke manajer', completed: true },
      ],
      date: today,
      scheduledTime: '09:30',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      isCompleted: true,
      completedAt: '11:15',
    },
    {
      id: 'today-2',
      title: 'Penuhi Target Minum Air Mineral',
      description: 'Menjaga hidrasi tubuh selama jam kerja',
      category: 'health',
      priority: 'medium',
      type: 'number',
      targetValue: 8,
      currentValue: 5,
      unit: 'gelas',
      subtasks: [],
      date: today,
      scheduledTime: '13:00',
      reminderEnabled: true,
      reminderMinutesBefore: 0,
      isCompleted: false,
    },
    {
      id: 'today-3',
      title: 'Deep Work: Coding & Refactor Modul Analitik',
      description: 'Fokus tanpa distraksi selama 2 sesi Pomodoro',
      category: 'career',
      priority: 'high',
      type: 'time',
      targetValue: 90,
      currentValue: 60,
      unit: 'menit',
      subtasks: [],
      date: today,
      scheduledTime: '14:00',
      reminderEnabled: true,
      reminderMinutesBefore: 10,
      isCompleted: false,
    },
    {
      id: 'today-4',
      title: 'Membaca Buku "Atomic Habits"',
      description: 'Target membaca 20 halaman setiap sore',
      category: 'study',
      priority: 'medium',
      type: 'number',
      targetValue: 20,
      currentValue: 0,
      unit: 'halaman',
      subtasks: [],
      date: today,
      scheduledTime: '17:30',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      isCompleted: false,
    },
    {
      id: 'today-5',
      title: 'Jogging Sore & Jalan Cepat',
      description: 'Kardio ringan untuk kebugaran jantung',
      category: 'health',
      priority: 'medium',
      type: 'number',
      targetValue: 6000,
      currentValue: 3500,
      unit: 'langkah',
      subtasks: [],
      date: today,
      scheduledTime: '17:00',
      reminderEnabled: true,
      reminderMinutesBefore: 30,
      isCompleted: false,
    },
    {
      id: 'today-6',
      title: 'Pencatatan Arus Kas & Pengeluaran Harian',
      description: 'Input struk belanja dan update sheet pengeluaran',
      category: 'finance',
      priority: 'low',
      type: 'checklist',
      targetValue: 1,
      currentValue: 0,
      unit: 'tugas',
      subtasks: [],
      date: today,
      scheduledTime: '20:00',
      reminderEnabled: true,
      reminderMinutesBefore: 0,
      isCompleted: false,
    },
    {
      id: 'today-7',
      title: 'Jurnal Refleksi & Evaluasi Malam',
      description: 'Tuliskan 3 hal yang disyukuri dan rencana esok hari',
      category: 'personal',
      priority: 'low',
      type: 'checklist',
      targetValue: 1,
      currentValue: 0,
      unit: 'tugas',
      subtasks: [],
      date: today,
      scheduledTime: '21:00',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      isCompleted: false,
    }
  );

  // 2. HISTORICAL DATA FOR PAST 14 DAYS (With worship included!)
  const pastTemplates = [
    { title: 'Sholat Fardhu 5 Waktu', cat: 'worship' as TargetCategory, unit: 'waktu', val: 5, prio: 'high' as const },
    { title: 'Tilawah Al-Qur\'an', cat: 'worship' as TargetCategory, unit: 'lembar', val: 10, prio: 'high' as const },
    { title: 'Sholat Dhuha / Rawatib', cat: 'worship' as TargetCategory, unit: 'rakaat', val: 4, prio: 'medium' as const },
    { title: 'Olahraga Pagi 30 Menit', cat: 'health' as TargetCategory, unit: 'menit', val: 30, prio: 'medium' as const },
    { title: 'Minum 8 Gelas Air Sehari', cat: 'health' as TargetCategory, unit: 'gelas', val: 8, prio: 'medium' as const },
    { title: 'Selesaikan Tugas Prioritas Tim', cat: 'career' as TargetCategory, unit: 'tugas', val: 1, prio: 'high' as const },
    { title: 'Belajar Bahasa / Teknologi Baru', cat: 'study' as TargetCategory, unit: 'menit', val: 45, prio: 'medium' as const },
    { title: 'Catat Pengeluaran & Anggaran', cat: 'finance' as TargetCategory, unit: 'tugas', val: 1, prio: 'low' as const },
    { title: 'Dzikir & Muhasabah Harian', cat: 'worship' as TargetCategory, unit: 'sesi', val: 2, prio: 'low' as const },
  ];

  for (let i = 1; i <= 14; i++) {
    const pastDate = addDays(today, -i);
    const daySeed = i % 7;
    const completedCount = daySeed === 0 ? 6 : daySeed === 4 ? 8 : daySeed === 2 ? 7 : 7;

    pastTemplates.slice(0, 8).forEach((tpl, idx) => {
      const isDone = idx < completedCount;
      list.push({
        id: `past-${i}-${idx}`,
        title: tpl.title,
        category: tpl.cat,
        priority: tpl.prio,
        type: tpl.unit === 'tugas' ? 'checklist' : 'number',
        targetValue: tpl.val,
        currentValue: isDone ? tpl.val : Math.floor(tpl.val * 0.5),
        unit: tpl.unit,
        subtasks: [],
        date: pastDate,
        reminderEnabled: false,
        reminderMinutesBefore: 0,
        isCompleted: isDone,
        completedAt: isDone ? `${18 - idx}:00` : undefined,
      });
    });
  }

  return list;
}

export function loadTargets(): TargetItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TARGETS);
    if (!raw) {
      const seed = generateSeedData();
      saveTargets(seed);
      return seed;
    }
    const parsed: TargetItem[] = JSON.parse(raw);
    const hasWorship = parsed.some((t) => t.category === 'worship');
    if (!hasWorship) {
      const seed = generateSeedData();
      saveTargets(seed);
      return seed;
    }
    return parsed;
  } catch {
    return generateSeedData();
  }
}

export function saveTargets(targets: TargetItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
  } catch (e) {
    console.error('Failed to save targets to localStorage', e);
  }
}

export function loadReminderConfig(): ReminderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveReminderConfig(config: ReminderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
}

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      const initial: AppNotification[] = [
        {
          id: 'notif-welcome',
          title: 'Selamat Datang di TargetHarian!',
          message: 'Atur perencanaan target hari ini termasuk target ibadah, karier, dan kesehatan.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          type: 'milestone',
          read: false,
        },
      ];
      saveNotifications(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(notifs: AppNotification[]): void {
  try {
    const trimmed = notifs.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

/**
 * Export targets and data as JSON
 */
export function exportDataAsJSON(): string {
  const data = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    targets: loadTargets(),
    config: loadReminderConfig(),
    notifications: loadNotifications(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Export targets as CSV for spreadsheets
 */
export function exportTargetsAsCSV(): string {
  const targets = loadTargets();
  const headers = ['ID', 'Tanggal', 'Judul', 'Kategori', 'Prioritas', 'Tipe', 'Nilai Target', 'Nilai Tercapai', 'Satuan', 'Status Selesai'];
  const rows = targets.map((t) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.priority}"`,
    `"${t.type}"`,
    t.targetValue,
    t.currentValue,
    `"${t.unit}"`,
    t.isCompleted ? 'Selesai' : 'Belum Selesai',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
