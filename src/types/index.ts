export type TargetCategory = 'worship' | 'career' | 'study' | 'health' | 'finance' | 'personal';

export type TargetPriority = 'high' | 'medium' | 'low';

export type TargetType = 'checklist' | 'number' | 'time';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TargetItem {
  id: string;
  title: string;
  description?: string;
  category: TargetCategory;
  priority: TargetPriority;
  type: TargetType;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. 'gelas', 'menit', 'halaman', 'sesi', 'tugas', 'waktu', 'rakaat', 'lembar'
  subtasks: Subtask[];
  date: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm format, e.g. "08:30"
  reminderEnabled: boolean;
  reminderMinutesBefore: number; // 0, 5, 10, 15, 30, 60
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface ReminderConfig {
  browserNotificationsEnabled: boolean;
  soundEnabled: boolean;
  morningReminderEnabled: boolean;
  morningReminderTime: string; // e.g. "07:00"
  eveningReminderEnabled: boolean;
  eveningReminderTime: string; // e.g. "20:30"
  hydrationReminderEnabled: boolean;
  hydrationIntervalMinutes: number; // e.g. 90
  standUpReminderEnabled: boolean;
  // Worship reminders
  worshipTahajudReminderEnabled: boolean;
  worshipTahajudTime: string; // e.g. "03:45"
  worshipDhuhaReminderEnabled: boolean;
  worshipDhuhaTime: string; // e.g. "08:30"
  worshipEveningDzikirReminderEnabled: boolean;
  worshipEveningDzikirTime: string; // e.g. "17:45"
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'target_due' | 'morning_brief' | 'evening_review' | 'wellness' | 'milestone' | 'worship_reminder';
  targetId?: string;
  read: boolean;
}

export interface DayPerformance {
  date: string; // YYYY-MM-DD
  total: number;
  completed: number;
  rate: number; // 0 - 100
  categories: Record<TargetCategory, { total: number; completed: number }>;
}

export type ViewTab = 'targets' | 'analytics' | 'reminders' | 'calendar';
