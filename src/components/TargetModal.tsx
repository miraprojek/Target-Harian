import React, { useState, useEffect } from 'react';
import { TargetItem, TargetCategory, TargetPriority, TargetType, Subtask } from '../types';
import { X, Clock, Bell, Plus, Trash2, Sparkles } from 'lucide-react';
import { getTodayISO } from '../utils/date';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: Partial<TargetItem>) => void;
  initialTarget?: TargetItem | null;
  selectedDate: string;
}

const TEMPLATES: Array<{
  title: string;
  category: TargetCategory;
  priority: TargetPriority;
  type: TargetType;
  targetValue: number;
  unit: string;
  scheduledTime: string;
  reminderMinutesBefore: number;
  subtasks?: string[];
}> = [
  {
    title: 'Sholat Fardhu 5 Waktu Berjamaah',
    category: 'worship',
    priority: 'high',
    type: 'checklist',
    targetValue: 5,
    unit: 'waktu',
    scheduledTime: '04:30',
    reminderMinutesBefore: 15,
    subtasks: [
      'Sholat Subuh Berjamaah',
      'Sholat Dzuhur Berjamaah',
      'Sholat Ashar Berjamaah',
      'Sholat Maghrib Berjamaah',
      'Sholat Isya Berjamaah',
    ],
  },
  {
    title: 'Tilawah Al-Qur\'an (1 Juz / 10 Lembar)',
    category: 'worship',
    priority: 'high',
    type: 'number',
    targetValue: 10,
    unit: 'lembar',
    scheduledTime: '06:00',
    reminderMinutesBefore: 10,
  },
  {
    title: 'Sholat Sunnah Dhuha (4 Rakaat)',
    category: 'worship',
    priority: 'medium',
    type: 'number',
    targetValue: 4,
    unit: 'rakaat',
    scheduledTime: '08:30',
    reminderMinutesBefore: 15,
  },
  {
    title: 'Qiyamul Lail & Sholat Tahajud',
    category: 'worship',
    priority: 'high',
    type: 'number',
    targetValue: 4,
    unit: 'rakaat',
    scheduledTime: '03:45',
    reminderMinutesBefore: 15,
  },
  {
    title: 'Sholat Rawatib (Qobliyah & Ba\'diyah)',
    category: 'worship',
    priority: 'medium',
    type: 'number',
    targetValue: 6,
    unit: 'rakaat',
    scheduledTime: '12:00',
    reminderMinutesBefore: 10,
  },
  {
    title: 'Dzikir Pagi & Petang Al-Ma\'tsurat',
    category: 'worship',
    priority: 'medium',
    type: 'checklist',
    targetValue: 2,
    unit: 'sesi',
    scheduledTime: '17:30',
    reminderMinutesBefore: 10,
    subtasks: ['Dzikir Pagi sesudah Subuh', 'Dzikir Petang sesudah Ashar'],
  },
  {
    title: 'Minum 8 Gelas Air Mineral',
    category: 'health',
    priority: 'medium',
    type: 'number',
    targetValue: 8,
    unit: 'gelas',
    scheduledTime: '10:00',
    reminderMinutesBefore: 0,
  },
  {
    title: 'Sesi Deep Work Fokus Penuh',
    category: 'career',
    priority: 'high',
    type: 'time',
    targetValue: 90,
    unit: 'menit',
    scheduledTime: '09:00',
    reminderMinutesBefore: 10,
  },
  {
    title: 'Membaca Buku Pengembangan Diri',
    category: 'study',
    priority: 'medium',
    type: 'number',
    targetValue: 20,
    unit: 'halaman',
    scheduledTime: '19:30',
    reminderMinutesBefore: 15,
  },
  {
    title: 'Olahraga Kardio / Jalan Cepat',
    category: 'health',
    priority: 'medium',
    type: 'number',
    targetValue: 5000,
    unit: 'langkah',
    scheduledTime: '16:45',
    reminderMinutesBefore: 15,
  },
];

export const TargetModal: React.FC<TargetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTarget,
  selectedDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TargetCategory>('career');
  const [priority, setPriority] = useState<TargetPriority>('medium');
  const [type, setType] = useState<TargetType>('checklist');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('tugas');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (initialTarget) {
      setTitle(initialTarget.title);
      setDescription(initialTarget.description || '');
      setCategory(initialTarget.category);
      setPriority(initialTarget.priority);
      setType(initialTarget.type);
      setTargetValue(initialTarget.targetValue);
      setCurrentValue(initialTarget.currentValue);
      setUnit(initialTarget.unit);
      setScheduledTime(initialTarget.scheduledTime || '09:00');
      setReminderEnabled(initialTarget.reminderEnabled);
      setReminderMinutesBefore(initialTarget.reminderMinutesBefore ?? 15);
      setSubtasks(initialTarget.subtasks || []);
    } else {
      // Defaults for a new target
      setTitle('');
      setDescription('');
      setCategory('career');
      setPriority('medium');
      setType('checklist');
      setTargetValue(1);
      setCurrentValue(0);
      setUnit('tugas');
      setScheduledTime('09:00');
      setReminderEnabled(true);
      setReminderMinutesBefore(15);
      setSubtasks([]);
    }
    setNewSubtaskText('');
  }, [initialTarget, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setPriority(tpl.priority);
    setType(tpl.type);
    setTargetValue(tpl.targetValue);
    setCurrentValue(0);
    setUnit(tpl.unit);
    setScheduledTime(tpl.scheduledTime);
    setReminderMinutesBefore(tpl.reminderMinutesBefore);
    setReminderEnabled(true);
    if (tpl.subtasks && tpl.subtasks.length > 0) {
      setSubtasks(
        tpl.subtasks.map((st, idx) => ({
          id: `st-tpl-${idx}-${Date.now()}`,
          text: st,
          completed: false,
        }))
      );
    } else {
      setSubtasks([]);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st-${Date.now()}`, text: newSubtaskText.trim(), completed: false },
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(initialTarget?.id ? { id: initialTarget.id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      type,
      targetValue: Math.max(1, Number(targetValue)),
      currentValue: Math.max(0, Number(currentValue)),
      unit: unit.trim() || 'tugas',
      subtasks,
      date: initialTarget?.date || selectedDate || getTodayISO(),
      scheduledTime: scheduledTime || undefined,
      reminderEnabled,
      reminderMinutesBefore: Number(reminderMinutesBefore),
      isCompleted: initialTarget ? initialTarget.isCompleted : false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialTarget ? 'Ubah Rencana Target' : 'Buat Rencana Target Harian'}
            </h2>
            <p className="text-xs text-slate-500">
              Tetapkan target kuantitatif, jadwal, dan pengingat otomatis untuk hari ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Quick Template Selector */}
          {!initialTarget && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pilih dari Template Siap Pakai:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 rounded text-slate-700 transition-colors text-left"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Target <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Selesaikan Laporan Keuangan Q3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Deskripsi (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Detail capaian atau kriteria keberhasilan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-none"
            />
          </div>

          {/* Category & Priority in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Target
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TargetCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="worship">Ibadah & Spiritual</option>
                <option value="career">Karier & Kerja</option>
                <option value="study">Belajar & Riset</option>
                <option value="health">Kesehatan & Olahraga</option>
                <option value="finance">Keuangan & Finansial</option>
                <option value="personal">Pribadi & Kebiasaan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TargetPriority)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="high">Tinggi (Paling Penting)</option>
                <option value="medium">Sedang (Standar)</option>
                <option value="low">Rendah (Fleksibel)</option>
              </select>
            </div>
          </div>

          {/* Target Type & Quantitative Settings */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Jenis Pengukuran Target
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('checklist');
                  setUnit('tugas');
                  setTargetValue(1);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  type === 'checklist'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Daftar Tugas / Checklist
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('number');
                  setUnit('halaman');
                  setTargetValue(10);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  type === 'number'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Angka / Hitungan
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('time');
                  setUnit('menit');
                  setTargetValue(60);
                }}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  type === 'time'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Durasi Waktu
              </button>
            </div>

            {/* If numeric or time, show target value and unit */}
            {type !== 'checklist' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Target Angka
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg font-mono tabular-nums bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Satuan Ukuran
                  </label>
                  <input
                    type="text"
                    placeholder="gelas, menit, halaman, km"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}

            {/* Subtasks option */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sub-Tugas Tambahan ({subtasks.length})
              </label>
              <div className="space-y-1.5 mb-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded border border-slate-200"
                  >
                    <span className="text-slate-700">{st.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambahkan langkah / sub-tugas..."
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          {/* Schedule & Reminder settings */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Jadwal Waktu & Pengingat Otomatis
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Aktifkan Pengingat</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Waktu Pelaksanaan
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Kirim Notifikasi Sebelum
                </label>
                <select
                  disabled={!reminderEnabled}
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white disabled:opacity-50"
                >
                  <option value={0}>Tepat pada waktunya</option>
                  <option value={5}>5 Menit sebelumnya</option>
                  <option value={10}>10 Menit sebelumnya</option>
                  <option value={15}>15 Menit sebelumnya</option>
                  <option value={30}>30 Menit sebelumnya</option>
                  <option value={60}>1 Jam sebelumnya</option>
                </select>
              </div>
            </div>

            {reminderEnabled && (
              <div className="flex items-center gap-2 text-[11px] text-indigo-700 pt-1">
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Sistem otomatis akan membunyikan audio chime dan memicu notifikasi saat jam{' '}
                  <span className="font-mono font-semibold">{scheduledTime}</span> tiba.
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg shadow-sm transition-all"
            >
              {initialTarget ? 'Simpan Perubahan' : 'Simpan Target Harian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
