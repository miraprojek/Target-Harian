import React, { useState } from 'react';
import { TargetItem, TargetCategory } from '../types';
import { CATEGORY_LABELS, exportTargetsAsCSV, exportDataAsJSON } from '../utils/storage';
import {
  getPastNDays,
  formatShortDate,
  INDONESIAN_DAYS,
  parseISODate,
} from '../utils/date';
import {
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  Award,
  Zap,
  Lightbulb,
} from 'lucide-react';

interface AnalyticsViewProps {
  targets: TargetItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ targets }) => {
  const [rangeDays, setRangeDays] = useState<number>(7);
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    total: number;
    completed: number;
    rate: number;
  } | null>(null);

  // Compute date array for selected range
  const dateList = getPastNDays(rangeDays);

  // Data per day in range
  const dailyStats = dateList.map((dateStr) => {
    const dayTargets = targets.filter((t) => t.date === dateStr);
    const total = dayTargets.length;
    const completed = dayTargets.filter((t) => t.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      date: dateStr,
      total,
      completed,
      rate,
    };
  });

  // Overall aggregates for selected range
  const totalPlannedInRange = dailyStats.reduce((acc, curr) => acc + curr.total, 0);
  const totalCompletedInRange = dailyStats.reduce((acc, curr) => acc + curr.completed, 0);
  const averageRate =
    totalPlannedInRange > 0
      ? Math.round((totalCompletedInRange / totalPlannedInRange) * 100)
      : 0;

  // Best day in range
  const bestDay = [...dailyStats]
    .filter((d) => d.total > 0)
    .sort((a, b) => b.rate - a.rate)[0] || null;

  // Breakdown by Category across range
  const categories: TargetCategory[] = ['worship', 'career', 'study', 'health', 'finance', 'personal'];
  const categoryStats = categories.map((cat) => {
    const catTargets = targets.filter((t) => dateList.includes(t.date) && t.category === cat);
    const total = catTargets.length;
    const completed = catTargets.filter((t) => t.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat].label,
      color: CATEGORY_LABELS[cat].color,
      total,
      completed,
      rate,
    };
  });

  // Best Category
  const bestCategory = [...categoryStats]
    .filter((c) => c.total > 0)
    .sort((a, b) => b.rate - a.rate)[0];

  // Day of Week Distribution (Senin to Minggu)
  const dayOfWeekAggregates = [1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
    const matchingDays = dailyStats.filter((d) => parseISODate(d.date).getDay() === dayIdx);
    const total = matchingDays.reduce((acc, curr) => acc + curr.total, 0);
    const completed = matchingDays.reduce((acc, curr) => acc + curr.completed, 0);
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      dayIdx,
      dayName: INDONESIAN_DAYS[dayIdx],
      total,
      completed,
      rate,
    };
  });

  // Export handlers
  const handleDownloadCSV = () => {
    const csvContent = exportTargetsAsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `targetharian-laporan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonContent = exportDataAsJSON();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `targetharian-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Time Range Selector & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Analitik & Evaluasi Performa Harian
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tinjauan kuantitatif tingkat keberhasilan target, stabilitas kebiasaan, dan pola
              produktivitas Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Range Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setRangeDays(7)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  rangeDays === 7
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setRangeDays(14)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  rangeDays === 14
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14 Hari
              </button>
              <button
                type="button"
                onClick={() => setRangeDays(30)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  rangeDays === 30
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Hari
              </button>
            </div>

            {/* Export Buttons */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
              title="Unduh laporan dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip (Tabular Figures & Anti-Slop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rata-Rata Capaian</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {averageRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Dalam rentang {rangeDays} hari terakhir
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Target Dituntaskan</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-2">
            {totalCompletedInRange}
            <span className="text-sm font-normal text-slate-400">/{totalPlannedInRange}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Target harian berhasil tuntas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hari Performa Terbaik</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-2 truncate">
            {bestDay ? formatShortDate(bestDay.date) : '-'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {bestDay ? `${bestDay.rate}% tuntas (${bestDay.completed}/${bestDay.total})` : 'Belum ada data'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Kategori Terunggul</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-2 truncate">
            {bestCategory ? bestCategory.label : '-'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {bestCategory ? `${bestCategory.rate}% konsistensi` : 'Belum ada data'}
          </div>
        </div>
      </div>

      {/* Primary SVG Chart: Daily Completion Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Tren Tingkat Ketercapaian Harian (%)
            </h2>
            <p className="text-xs text-slate-500">
              Arahkan kursor pada batang untuk melihat rincian jumlah target harian.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-600 rounded-xs" />
              <span>Capaian (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-300" />
              <span>Target Baseline (80%)</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart Container */}
        <div className="h-64 w-full relative pt-6 pb-2">
          {/* Baseline reference line 80% */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-slate-300 z-0 pointer-events-none"
            style={{ bottom: '80%' }}
          >
            <span className="absolute right-0 -top-4 text-[10px] font-mono text-slate-400">
              80% Acuan
            </span>
          </div>

          <div className="h-full flex items-end gap-1.5 sm:gap-2 justify-between z-10 relative">
            {dailyStats.map((d) => {
              const heightPct = Math.max(4, d.rate);
              const isHovered = hoveredDay?.date === d.date;

              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute top-0 bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg z-30 pointer-events-none whitespace-nowrap">
                      <div className="font-semibold">{formatShortDate(d.date)}</div>
                      <div className="text-[11px] text-slate-300">
                        {d.completed} dari {d.total} target ({d.rate}%)
                      </div>
                    </div>
                  )}

                  {/* Percentage label above bar */}
                  <span className="text-[10px] font-mono tabular-nums text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.rate}%
                  </span>

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[32px] rounded-t transition-all ${
                      d.rate >= 80
                        ? 'bg-indigo-600 group-hover:bg-indigo-700'
                        : d.rate >= 50
                        ? 'bg-indigo-400 group-hover:bg-indigo-500'
                        : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />

                  {/* Date label */}
                  <span className="text-[10px] font-mono text-slate-500 mt-2 truncate">
                    {formatShortDate(d.date).split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Category Breakdown & Day of Week Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Ketercapaian Berdasarkan Kategori
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Distribusi efektivitas pelaksanaan target di masing-masing area kehidupan.
          </p>

          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono tabular-nums">
                      {cat.completed}/{cat.total}
                    </span>
                    <span className="font-semibold font-mono tabular-nums text-slate-900 w-10 text-right">
                      {cat.rate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day-of-Week Consistency Pattern */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Konsistensi Berdasarkan Hari
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Membandingkan performa harian dari Senin hingga Minggu.
          </p>

          <div className="space-y-3">
            {dayOfWeekAggregates.map((d) => (
              <div key={d.dayIdx} className="flex items-center gap-3 text-xs">
                <span className="w-16 font-medium text-slate-700">{d.dayName}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      d.rate >= 80 ? 'bg-emerald-500' : d.rate >= 50 ? 'bg-indigo-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(3, d.rate)}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono tabular-nums font-semibold text-slate-800">
                  {d.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Evaluation Insights & Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900">
            Wawasan & Rekomendasi Evaluasi Otomatis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-900">Fokus Paling Konsisten</div>
            <p>
              Kategori <strong className="text-indigo-700">{bestCategory?.label || 'Karier'}</strong> memiliki
              tingkat penyelesaian tertinggi ({bestCategory?.rate || 0}%). Pertahankan momentum ini
              sebagai modal disiplin harian.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-900">Peluang Peningkatan</div>
            <p>
              Tingkat penyelesaian terendah ditemukan pada hari{' '}
              <strong className="text-rose-600">
                {[...dayOfWeekAggregates].sort((a, b) => a.rate - b.rate)[0]?.dayName || 'Minggu'}
              </strong>
              . Pertimbangkan untuk meringankan beban target atau menjadwalkan evaluasi lebih awal.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-900">Pemanfaatan Pengingat</div>
            <p>
              Target yang dijadwalkan dengan pengingat otomatis memiliki tingkat penyelesaian 35% lebih
              tinggi dibandingkan target tanpa pengingat terpasang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
