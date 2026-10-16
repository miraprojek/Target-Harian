import React, { useState } from 'react';
import { TargetItem, TargetCategory } from '../types';
import { CATEGORY_LABELS } from '../utils/storage';
import {
  formatIndonesianDate,
  getRelativeDateLabel,
  addDays,
  getTodayISO,
  parseISODate,
  INDONESIAN_DAYS,
} from '../utils/date';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  BellOff,
  MoreVertical,
  Plus,
  Minus,
  CheckCheck,
  Calendar,
  Search,
  Copy,
  Trash2,
  Edit3,
  BookOpen,
} from 'lucide-react';

interface DailyTargetViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  targets: TargetItem[];
  allTargets: TargetItem[];
  onToggleTargetComplete: (id: string) => void;
  onUpdateTargetProgress: (id: string, delta: number) => void;
  onToggleSubtask: (targetId: string, subtaskId: string) => void;
  onToggleReminder: (id: string) => void;
  onEditTarget: (target: TargetItem) => void;
  onDeleteTarget: (id: string) => void;
  onDuplicateToTomorrow: (target: TargetItem) => void;
  onOpenNewModal: () => void;
  onAddWorshipPackage: () => void;
}

export const DailyTargetView: React.FC<DailyTargetViewProps> = ({
  selectedDate,
  onSelectDate,
  targets,
  allTargets,
  onToggleTargetComplete,
  onUpdateTargetProgress,
  onToggleSubtask,
  onToggleReminder,
  onEditTarget,
  onDeleteTarget,
  onDuplicateToTomorrow,
  onOpenNewModal,
  onAddWorshipPackage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const todayISO = getTodayISO();
  const isToday = selectedDate === todayISO;

  // Filter targets for the selected date
  const filteredTargets = targets.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (statusFilter === 'pending' && t.isCompleted) return false;
    if (statusFilter === 'completed' && !t.isCompleted) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Calculate day metrics
  const totalCount = targets.length;
  const completedCount = targets.filter((t) => t.isCompleted).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    let curr = todayISO;
    while (true) {
      const dayItems = allTargets.filter((t) => t.date === curr);
      if (dayItems.length === 0) break;
      const done = dayItems.filter((t) => t.isCompleted).length;
      if (done > 0 && done === dayItems.length) {
        streak++;
        curr = addDays(curr, -1);
      } else if (curr === todayISO && done < dayItems.length) {
        // Today is still in progress, check yesterday
        curr = addDays(curr, -1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  // Mini 7-day strip (current week context)
  const getWeekDates = () => {
    const dates: string[] = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(selectedDate, i));
    }
    return dates;
  };

  const weekStrip = getWeekDates();

  const handleCompleteClick = (target: TargetItem) => {
    const willBeCompleted = !target.isCompleted;
    onToggleTargetComplete(target.id);

    if (willBeCompleted) {
      sound.playSuccessChime();

      // If completing this target makes 100% of today's targets complete!
      const remainingIncomplete = targets.filter((t) => !t.isCompleted && t.id !== target.id);
      if (remainingIncomplete.length === 0 && targets.length > 0) {
        sound.playCelebrationFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => onSelectDate(addDays(selectedDate, -1))}
                title="Hari Sebelumnya"
                className="p-1.5 hover:bg-white text-slate-700 rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectDate(todayISO)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  isToday ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => onSelectDate(addDays(selectedDate, 1))}
                title="Hari Berikutnya"
                className="p-1.5 hover:bg-white text-slate-700 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {formatIndonesianDate(selectedDate)}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{getRelativeDateLabel(selectedDate)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {completedCount} dari {totalCount} target tuntas
                </span>
              </div>
            </div>
          </div>

          {/* Quick Date Input for hopping to any date */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onSelectDate(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
            <button
              onClick={onAddWorshipPackage}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Tambahkan paket target ibadah harian (Sholat 5 waktu, Tilawah Qur'an, Dhuha, Dzikir)"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Paket Ibadah</span>
            </button>
            <button
              onClick={onOpenNewModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Target</span>
            </button>
          </div>
        </div>

        {/* 7-Day Context Ribbon */}
        <div className="grid grid-cols-7 gap-1.5 mt-4 pt-4 border-t border-slate-100">
          {weekStrip.map((dateStr) => {
            const isCurrentSelected = dateStr === selectedDate;
            const dObj = parseISODate(dateStr);
            const dayName = INDONESIAN_DAYS[dObj.getDay()].slice(0, 3);
            const dayNum = dObj.getDate();

            const dayItems = allTargets.filter((t) => t.date === dateStr);
            const dayTotal = dayItems.length;
            const dayDone = dayItems.filter((t) => t.isCompleted).length;
            const isFull = dayTotal > 0 && dayDone === dayTotal;

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`py-2 px-1 text-center rounded-lg border transition-all text-xs ${
                  isCurrentSelected
                    ? 'bg-indigo-50/80 border-indigo-400 font-bold text-indigo-950 ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase font-medium">{dayName}</div>
                <div className="text-sm font-semibold font-mono tabular-nums">{dayNum}</div>
                <div className="mt-1 flex justify-center">
                  {dayTotal === 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  ) : isFull ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Quantitative Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Target Terencana</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {totalCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">Target harian aktif</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Target Tuntas</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {completedCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Sisa {Math.max(0, totalCount - completedCount)} target
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Tingkat Ketercapaian</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600">
              {progressPercent}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Rangkaian Konsistensi</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1">
            {streakDays} <span className="text-xs font-sans font-normal text-slate-500">Hari</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Pencapaian berturut-turut</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({targets.length})
            </button>
            {(['worship', 'career', 'study', 'health', 'finance', 'personal'] as TargetCategory[]).map((cat) => {
              const count = targets.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat].label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Sub-Filter: Status */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              statusFilter === 'all'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Selesai ({targets.filter((t) => !t.isCompleted).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuntas ({targets.filter((t) => t.isCompleted).length})
          </button>
        </div>
      </div>

      {/* Target Items List */}
      <div className="space-y-3">
        {filteredTargets.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Belum ada target pada tanggal ini
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Mulai hari dengan perencanaan yang terarah. Tambahkan target baru atau gunakan template
              siap pakai.
            </p>
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Rencanakan Target Pertama</span>
            </button>
          </div>
        ) : (
          filteredTargets.map((target) => {
            const catInfo = CATEGORY_LABELS[target.category];
            const isDone = target.isCompleted;
            const hasSubtasks = target.subtasks && target.subtasks.length > 0;
            const completedSubtasks = hasSubtasks
              ? target.subtasks.filter((s) => s.completed).length
              : 0;

            const priorityLabels = {
              high: { text: 'Prioritas Tinggi', color: 'text-rose-600' },
              medium: { text: 'Prioritas Sedang', color: 'text-amber-600' },
              low: { text: 'Prioritas Rendah', color: 'text-slate-500' },
            };

            const progressRatio =
              target.targetValue > 0
                ? Math.min(100, Math.round((target.currentValue / target.targetValue) * 100))
                : 0;

            return (
              <div
                key={target.id}
                className={`group bg-white rounded-xl border transition-all p-4 ${
                  isDone
                    ? 'border-slate-200 bg-slate-50/60 opacity-90'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Complete Check Affordance */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleCompleteClick(target)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                      title={isDone ? 'Tandai belum selesai' : 'Tandai tuntas'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Quiet Inline Metadata (No Pills!) */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span className={`font-semibold ${catInfo.color}`}>{catInfo.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className={priorityLabels[target.priority].color}>
                          {priorityLabels[target.priority].text}
                        </span>
                        {target.scheduledTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 font-mono tabular-nums text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {target.scheduledTime}
                            </span>
                          </>
                        )}
                        {target.reminderEnabled && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 text-indigo-600 font-medium">
                              <Bell className="w-3 h-3" />
                              {target.reminderMinutesBefore === 0
                                ? 'Tepat Waktu'
                                : `-${target.reminderMinutesBefore}m`}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-sm sm:text-base font-semibold text-slate-900 transition-all ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {target.title}
                      </h3>

                      {/* Description */}
                      {target.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {target.description}
                        </p>
                      )}

                      {/* Quantitative Counter / Progress Tracker */}
                      {target.type !== 'checklist' && (
                        <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-medium text-slate-600">
                              Capaian:{' '}
                              <span className="font-mono tabular-nums font-bold text-slate-900">
                                {target.currentValue}
                              </span>
                              {' / '}
                              <span className="font-mono tabular-nums text-slate-500">
                                {target.targetValue} {target.unit}
                              </span>
                            </div>
                            <span className="text-xs font-mono tabular-nums text-indigo-600 font-semibold">
                              ({progressRatio}%)
                            </span>
                          </div>

                          {/* Quick Increment buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                sound.playTick();
                                onUpdateTargetProgress(target.id, -1);
                              }}
                              disabled={target.currentValue <= 0}
                              className="p-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded disabled:opacity-40 transition-colors"
                              title="-1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playTick();
                                onUpdateTargetProgress(target.id, 1);
                              }}
                              className="p-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                              title="+1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            {target.type === 'number' && target.targetValue >= 10 && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playTick();
                                  onUpdateTargetProgress(
                                    target.id,
                                    target.targetValue >= 1000 ? 500 : 5
                                  );
                                }}
                                className="px-1.5 py-1 text-[11px] font-mono text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                                title="Tambah porsi"
                              >
                                +{target.targetValue >= 1000 ? '500' : '5'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                sound.playSuccessChime();
                                onUpdateTargetProgress(target.id, target.targetValue - target.currentValue);
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1"
                              title="Set 100% Penuh"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Penuh</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Subtasks Accordion */}
                      {hasSubtasks && (
                        <div className="mt-2.5 space-y-1.5 pt-1.5 border-t border-slate-100">
                          <div className="text-[11px] font-medium text-slate-500 mb-1">
                            Langkah / Sub-tugas ({completedSubtasks}/{target.subtasks.length}):
                          </div>
                          {target.subtasks.map((st) => (
                            <label
                              key={st.id}
                              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
                            >
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => {
                                  sound.playTick();
                                  onToggleSubtask(target.id, st.id);
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                              />
                              <span className={st.completed ? 'line-through text-slate-400' : ''}>
                                {st.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Actions Menu */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId(activeMenuId === target.id ? null : target.id)
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === target.id && (
                      <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onEditTarget(target);
                          }}
                          className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ubah Rencana</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onToggleReminder(target.id);
                          }}
                          className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          {target.reminderEnabled ? (
                            <>
                              <BellOff className="w-3.5 h-3.5 text-slate-400" />
                              <span>Matikan Pengingat</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5 text-slate-400" />
                              <span>Aktifkan Pengingat</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDuplicateToTomorrow(target);
                          }}
                          className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duplikat ke Esok Hari</span>
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteTarget(target.id);
                          }}
                          className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Target</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
