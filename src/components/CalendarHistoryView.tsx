import React, { useState } from 'react';
import { TargetItem } from '../types';
import {
  INDONESIAN_DAYS,
  INDONESIAN_MONTHS,
  formatDateToISO,
  parseISODate,
  getTodayISO,
  formatShortDate,
} from '../utils/date';
import { ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

interface CalendarHistoryViewProps {
  targets: TargetItem[];
  onSelectDateAndSwitch: (date: string) => void;
}

export const CalendarHistoryView: React.FC<CalendarHistoryViewProps> = ({
  targets,
  onSelectDateAndSwitch,
}) => {
  const todayISO = getTodayISO();
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [previewDate, setPreviewDate] = useState<string>(todayISO);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonthDate(new Date());
  };

  // Build days for month grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days array including padding from previous month
  const calendarCells: Array<{ dateISO: string; dayNum: number; isCurrentMonth: boolean }> = [];

  // Padding from prev month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    calendarCells.push({
      dateISO: formatDateToISO(d),
      dayNum: d.getDate(),
      isCurrentMonth: false,
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const curr = new Date(year, month, d);
    calendarCells.push({
      dateISO: formatDateToISO(curr),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Padding to complete 7-day row
  const remainingCells = 35 - calendarCells.length;
  if (remainingCells > 0) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextD = new Date(year, month + 1, d);
      calendarCells.push({
        dateISO: formatDateToISO(nextD),
        dayNum: d,
        isCurrentMonth: false,
      });
    }
  }

  // Calculate monthly stats
  const currentMonthISO = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTargets = targets.filter((t) => t.date.startsWith(currentMonthISO));
  const monthCompleted = monthTargets.filter((t) => t.isCompleted).length;
  const monthRate =
    monthTargets.length > 0 ? Math.round((monthCompleted / monthTargets.length) * 100) : 0;

  // Selected preview day targets
  const previewTargets = targets.filter((t) => t.date === previewDate);

  return (
    <div className="space-y-6">
      {/* Month Navigator Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Riwayat Kalender & Konsistensi Bulanan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tinjau catatan pencapaian target harian sepanjang bulan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white text-slate-700 rounded-md transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleTodayMonth}
                className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-md transition-colors"
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white text-slate-700 rounded-md transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm font-bold text-slate-900 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              {INDONESIAN_MONTHS[month]} {year}
            </div>
          </div>
        </div>

        {/* Monthly Summary Badges */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50 rounded-lg text-center">
            <div className="text-[11px] text-slate-500">Target Bulan Ini</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
              {monthTargets.length}
            </div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg text-center">
            <div className="text-[11px] text-slate-500">Berhasil Tuntas</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-600">
              {monthCompleted}
            </div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg text-center">
            <div className="text-[11px] text-slate-500">Tingkat Capaian</div>
            <div className="text-lg font-bold font-mono tabular-nums text-indigo-600">
              {monthRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on large) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-slate-400 mb-2">
            {INDONESIAN_DAYS.map((day) => (
              <div key={day} className="py-1">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell) => {
              const dayTargets = targets.filter((t) => t.date === cell.dateISO);
              const total = dayTargets.length;
              const completed = dayTargets.filter((t) => t.isCompleted).length;
              const isSelected = cell.dateISO === previewDate;
              const isToday = cell.dateISO === todayISO;

              return (
                <button
                  key={cell.dateISO}
                  type="button"
                  onClick={() => setPreviewDate(cell.dateISO)}
                  className={`min-h-[70px] p-2 text-left rounded-lg border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/40'
                      : cell.isCurrentMonth
                      ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold tabular-nums ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {total > 0 && (
                      <span className="text-[10px] font-mono tabular-nums text-slate-500">
                        {completed}/{total}
                      </span>
                    )}
                  </div>

                  {total > 0 ? (
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-2">
                      <div
                        className={`h-1 rounded-full ${
                          completed === total ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.round((completed / total) * 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="h-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Drawer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-medium">Rincian Tanggal</span>
                <h3 className="text-sm font-bold text-slate-900">
                  {formatShortDate(previewDate)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectDateAndSwitch(previewDate)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Rencana</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[360px] overflow-y-auto">
              {previewTargets.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Tidak ada target yang tercatat pada tanggal ini.
                </div>
              ) : (
                previewTargets.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-semibold ${
                          t.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-amber-600 font-medium shrink-0">
                          Pending
                        </span>
                      )}
                    </div>
                    {t.type !== 'checklist' && (
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {t.currentValue} / {t.targetValue} {t.unit}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => onSelectDateAndSwitch(previewDate)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors text-center"
            >
              Kelola Target Tanggal Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
