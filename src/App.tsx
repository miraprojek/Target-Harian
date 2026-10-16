/**
 * TargetHarian - Aplikasi Perencanaan Target Harian, Analitik Kinerja & Pengingat Otomatis
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TargetItem, ReminderConfig, AppNotification, ViewTab } from './types';
import {
  loadTargets,
  saveTargets,
  loadReminderConfig,
  saveReminderConfig,
  loadNotifications,
  saveNotifications,
} from './utils/storage';
import { getTodayISO, addDays } from './utils/date';
import { sound } from './utils/audio';
import { reminderEngine } from './utils/reminderEngine';
import { Navbar } from './components/Navbar';
import { DailyTargetView } from './components/DailyTargetView';
import { AnalyticsView } from './components/AnalyticsView';
import { RemindersHub } from './components/RemindersHub';
import { CalendarHistoryView } from './components/CalendarHistoryView';
import { TargetModal } from './components/TargetModal';
import { NotificationToast } from './components/NotificationToast';

export default function App() {
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [currentTab, setCurrentTab] = useState<ViewTab>('targets');
  const [config, setConfig] = useState<ReminderConfig>(loadReminderConfig());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetItem | null>(null);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const configRef = useRef(config);
  configRef.current = config;

  // Initialize data on mount
  useEffect(() => {
    const loadedTargets = loadTargets();
    setTargets(loadedTargets);

    const loadedConfig = loadReminderConfig();
    setConfig(loadedConfig);
    sound.setEnabled(loadedConfig.soundEnabled);

    const loadedNotifs = loadNotifications();
    setNotifications(loadedNotifs);
  }, []);

  // Handle incoming notification
  const handleNewNotification = useCallback((notif: AppNotification) => {
    setNotifications((prev) => {
      const updated = [notif, ...prev];
      saveNotifications(updated);
      return updated;
    });
    setActiveToast(notif);
  }, []);

  // Start background reminder engine
  useEffect(() => {
    reminderEngine.start(
      () => targetsRef.current,
      () => configRef.current,
      handleNewNotification
    );

    return () => {
      reminderEngine.stop();
    };
  }, [handleNewNotification]);

  // Sync state changes to storage
  const updateTargets = (newTargets: TargetItem[]) => {
    setTargets(newTargets);
    saveTargets(newTargets);
  };

  const updateConfig = (newConfig: ReminderConfig) => {
    setConfig(newConfig);
    saveReminderConfig(newConfig);
    sound.setEnabled(newConfig.soundEnabled);
  };

  // Toggle complete target
  const handleToggleTargetComplete = (id: string) => {
    const updated = targets.map((t) => {
      if (t.id === id) {
        const nextDone = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextDone,
          currentValue: nextDone ? t.targetValue : t.currentValue,
          completedAt: nextDone
            ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
      }
      return t;
    });
    updateTargets(updated);
  };

  // Increment or decrement progress
  const handleUpdateTargetProgress = (id: string, delta: number) => {
    const updated = targets.map((t) => {
      if (t.id === id) {
        const nextVal = Math.max(0, Math.min(t.targetValue * 2, t.currentValue + delta));
        const autoCompleted = nextVal >= t.targetValue;
        return {
          ...t,
          currentValue: nextVal,
          isCompleted: autoCompleted,
          completedAt: autoCompleted
            ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : t.completedAt,
        };
      }
      return t;
    });
    updateTargets(updated);
  };

  // Toggle Subtask
  const handleToggleSubtask = (targetId: string, subtaskId: string) => {
    const updated = targets.map((t) => {
      if (t.id === targetId) {
        const nextSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allDone = nextSubtasks.length > 0 && nextSubtasks.every((s) => s.completed);
        const completedCount = nextSubtasks.filter((s) => s.completed).length;
        return {
          ...t,
          subtasks: nextSubtasks,
          currentValue: t.subtasks.length > 1 ? completedCount : t.currentValue,
          isCompleted: allDone,
          completedAt: allDone
            ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
      }
      return t;
    });
    updateTargets(updated);
  };

  // Save (Create / Update) Target
  const handleSaveTarget = (targetData: Partial<TargetItem>) => {
    if (targetData.id) {
      // Update existing
      const updated = targets.map((t) =>
        t.id === targetData.id ? ({ ...t, ...targetData } as TargetItem) : t
      );
      updateTargets(updated);
    } else {
      // Create new
      const newItem: TargetItem = {
        id: `target-${Date.now()}`,
        title: targetData.title || 'Target Baru',
        description: targetData.description,
        category: targetData.category || 'career',
        priority: targetData.priority || 'medium',
        type: targetData.type || 'checklist',
        targetValue: targetData.targetValue || 1,
        currentValue: targetData.currentValue || 0,
        unit: targetData.unit || 'tugas',
        subtasks: targetData.subtasks || [],
        date: targetData.date || selectedDate,
        scheduledTime: targetData.scheduledTime,
        reminderEnabled: targetData.reminderEnabled ?? true,
        reminderMinutesBefore: targetData.reminderMinutesBefore ?? 15,
        isCompleted: false,
      };
      updateTargets([newItem, ...targets]);
    }
  };

  // Delete Target
  const handleDeleteTarget = (id: string) => {
    const updated = targets.filter((t) => t.id !== id);
    updateTargets(updated);
  };

  // Duplicate to tomorrow
  const handleDuplicateToTomorrow = (target: TargetItem) => {
    const tomorrow = addDays(target.date, 1);
    const duplicated: TargetItem = {
      ...target,
      id: `target-${Date.now()}`,
      date: tomorrow,
      currentValue: 0,
      isCompleted: false,
      completedAt: undefined,
      subtasks: target.subtasks.map((st) => ({ ...st, completed: false })),
    };
    updateTargets([duplicated, ...targets]);
    setSelectedDate(tomorrow);
    setCurrentTab('targets');
  };

  // Toggle Reminder on single target
  const handleToggleReminder = (id: string) => {
    const updated = targets.map((t) =>
      t.id === id ? { ...t, reminderEnabled: !t.reminderEnabled } : t
    );
    updateTargets(updated);
  };

  // Toggle global sound
  const handleToggleSound = () => {
    const nextVal = !config.soundEnabled;
    updateConfig({ ...config, soundEnabled: nextVal });
  };

  // Mark all notifications as read
  const handleMarkAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  // Clear notifications
  const handleClearNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  // Trigger test notification
  const handleTriggerTestNotification = () => {
    reminderEngine.triggerNotification(
      'Uji Pengingat Otomatis Berhasil',
      'Sistem notifikasi dan bunyi audio chime berfungsi optimal untuk jadwal target Anda.',
      'milestone',
      undefined,
      config.soundEnabled,
      config.browserNotificationsEnabled
    );
  };

  // Add preset worship package to selected date
  const handleAddWorshipPackage = () => {
    const existingTitles = new Set(
      targets.filter((t) => t.date === selectedDate).map((t) => t.title.toLowerCase())
    );

    const worshipDefaults: TargetItem[] = [
      {
        id: `worship-sholat-${Date.now()}-1`,
        title: 'Sholat Fardhu 5 Waktu Berjamaah',
        description: 'Menjaga sholat fardhu tepat waktu berjamaah di masjid/musholla',
        category: 'worship',
        priority: 'high',
        type: 'checklist',
        targetValue: 5,
        currentValue: 0,
        unit: 'waktu',
        subtasks: [
          { id: `sh-sub-${Date.now()}-1`, text: 'Sholat Subuh Berjamaah', completed: false },
          { id: `sh-sub-${Date.now()}-2`, text: 'Sholat Dzuhur Berjamaah', completed: false },
          { id: `sh-sub-${Date.now()}-3`, text: 'Sholat Ashar Berjamaah', completed: false },
          { id: `sh-sub-${Date.now()}-4`, text: 'Sholat Maghrib Berjamaah', completed: false },
          { id: `sh-sub-${Date.now()}-5`, text: 'Sholat Isya Berjamaah', completed: false },
        ],
        date: selectedDate,
        scheduledTime: '04:30',
        reminderEnabled: true,
        reminderMinutesBefore: 15,
        isCompleted: false,
      },
      {
        id: `worship-tilawah-${Date.now()}-2`,
        title: 'Tilawah Al-Qur\'an (1 Juz / 10 Lembar)',
        description: 'Membaca mushaf Al-Qur\'an secara tartil 10 lembar',
        category: 'worship',
        priority: 'high',
        type: 'number',
        targetValue: 10,
        currentValue: 0,
        unit: 'lembar',
        subtasks: [],
        date: selectedDate,
        scheduledTime: '06:00',
        reminderEnabled: true,
        reminderMinutesBefore: 10,
        isCompleted: false,
      },
      {
        id: `worship-dhuha-${Date.now()}-3`,
        title: 'Sholat Sunnah Dhuha (4 Rakaat)',
        description: 'Melaksanakan sholat dhuha pembuka pintu rezeki',
        category: 'worship',
        priority: 'medium',
        type: 'number',
        targetValue: 4,
        currentValue: 0,
        unit: 'rakaat',
        subtasks: [],
        date: selectedDate,
        scheduledTime: '08:30',
        reminderEnabled: true,
        reminderMinutesBefore: 15,
        isCompleted: false,
      },
      {
        id: `worship-tahajud-${Date.now()}-4`,
        title: 'Qiyamul Lail & Sholat Tahajud',
        description: 'Bangun di sepertiga malam terakhir untuk sholat tahajud & witir',
        category: 'worship',
        priority: 'high',
        type: 'number',
        targetValue: 4,
        currentValue: 0,
        unit: 'rakaat',
        subtasks: [],
        date: selectedDate,
        scheduledTime: '03:45',
        reminderEnabled: true,
        reminderMinutesBefore: 15,
        isCompleted: false,
      },
      {
        id: `worship-dzikir-${Date.now()}-5`,
        title: 'Dzikir Pagi & Petang Al-Ma\'tsurat',
        description: 'Wirid dzikir perlindungan pagi dan sore',
        category: 'worship',
        priority: 'medium',
        type: 'checklist',
        targetValue: 2,
        currentValue: 0,
        unit: 'sesi',
        subtasks: [
          { id: `dz-sub-${Date.now()}-1`, text: 'Dzikir Pagi sesudah Subuh', completed: false },
          { id: `dz-sub-${Date.now()}-2`, text: 'Dzikir Petang sesudah Ashar', completed: false },
        ],
        date: selectedDate,
        scheduledTime: '17:30',
        reminderEnabled: true,
        reminderMinutesBefore: 10,
        isCompleted: false,
      },
    ];

    const toAdd = worshipDefaults.filter(
      (w) => !existingTitles.has(w.title.toLowerCase())
    );

    if (toAdd.length > 0) {
      sound.playSuccessChime();
      updateTargets([...toAdd, ...targets]);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const currentDayTargets = targets.filter((t) => t.date === selectedDate);
  const todayTargets = targets.filter((t) => t.date === getTodayISO());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* 3-Zone Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewTargetModal={() => {
          setEditingTarget(null);
          setIsTargetModalOpen(true);
        }}
        unreadCount={unreadNotifCount}
        soundEnabled={config.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'targets' && (
          <DailyTargetView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            targets={currentDayTargets}
            allTargets={targets}
            onToggleTargetComplete={handleToggleTargetComplete}
            onUpdateTargetProgress={handleUpdateTargetProgress}
            onToggleSubtask={handleToggleSubtask}
            onToggleReminder={handleToggleReminder}
            onEditTarget={(target) => {
              setEditingTarget(target);
              setIsTargetModalOpen(true);
            }}
            onDeleteTarget={handleDeleteTarget}
            onDuplicateToTomorrow={handleDuplicateToTomorrow}
            onOpenNewModal={() => {
              setEditingTarget(null);
              setIsTargetModalOpen(true);
            }}
            onAddWorshipPackage={handleAddWorshipPackage}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsView targets={targets} />}

        {currentTab === 'reminders' && (
          <RemindersHub
            config={config}
            onUpdateConfig={updateConfig}
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllNotifsRead}
            onClearNotifications={handleClearNotifications}
            todayTargets={todayTargets}
            onTriggerTestNotification={handleTriggerTestNotification}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarHistoryView
            targets={targets}
            onSelectDateAndSwitch={(date) => {
              setSelectedDate(date);
              setCurrentTab('targets');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">TargetHarian</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Perencanaan Target Harian, Analitik Kinerja & Pengingat Otomatis</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTab('analytics')}
              className="hover:text-slate-900 transition-colors"
            >
              Statistik Kinerja
            </button>
            <button
              onClick={() => setCurrentTab('reminders')}
              className="hover:text-slate-900 transition-colors"
            >
              Pengaturan Alarm
            </button>
          </div>
        </div>
      </footer>

      {/* Target Modal */}
      <TargetModal
        isOpen={isTargetModalOpen}
        onClose={() => {
          setIsTargetModalOpen(false);
          setEditingTarget(null);
        }}
        onSave={handleSaveTarget}
        initialTarget={editingTarget}
        selectedDate={selectedDate}
      />

      {/* Real-time Notification Toast */}
      <NotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onViewTarget={() => {
          setCurrentTab('targets');
        }}
      />
    </div>
  );
}
