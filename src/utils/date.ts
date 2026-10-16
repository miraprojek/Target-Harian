/**
 * Date manipulation and Indonesian formatting utilities
 */

export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayISO(): string {
  return formatDateToISO(new Date());
}

export function formatIndonesianDate(iso: string): string {
  const d = parseISODate(iso);
  const dayName = INDONESIAN_DAYS[d.getDay()];
  const day = d.getDate();
  const monthName = INDONESIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  const day = d.getDate();
  const month = INDONESIAN_MONTHS[d.getMonth()].slice(0, 3);
  return `${day} ${month}`;
}

export function getRelativeDateLabel(iso: string): string {
  const today = getTodayISO();
  if (iso === today) return 'Hari Ini';

  const dToday = parseISODate(today);
  const dTarget = parseISODate(iso);
  const diffTime = dTarget.getTime() - dToday.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return 'Kemarin';
  if (diffDays === 1) return 'Besok';
  if (diffDays > 1 && diffDays <= 6) return `${diffDays} hari lagi`;
  if (diffDays < -1 && diffDays >= -6) return `${Math.abs(diffDays)} hari lalu`;

  return formatShortDate(iso);
}

export function addDays(iso: string, amount: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + amount);
  return formatDateToISO(d);
}

export function getDayOfWeekIndex(iso: string): number {
  return parseISODate(iso).getDay();
}

/**
 * Returns past N days starting from latest down to past
 */
export function getPastNDays(n: number, endDateISO: string = getTodayISO()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(addDays(endDateISO, -i));
  }
  return days;
}

/**
 * Format timestamp into HH:mm
 */
export function formatTimeFromDate(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
