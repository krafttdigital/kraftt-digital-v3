export type AgencyPeriod = 'month' | 'last' | 'last3' | 'last6' | 'year';

export const agencyPeriodOptions: { value: AgencyPeriod; label: string }[] = [
  { value: 'month', label: 'This month' },
  { value: 'last', label: 'Last month' },
  { value: 'last3', label: 'Last 3 months' },
  { value: 'last6', label: 'Last 6 months' },
  { value: 'year', label: 'This year' },
];

export function agencyPeriodBounds(period: AgencyPeriod, today: string): { from: string; to: string } {
  const [year, month] = today.split('-').map(Number);
  if (!year || !month || month > 12) throw new Error('Invalid local date.');
  const firstOfMonth = (offset: number) => new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 10);
  if (period === 'last') return { from: firstOfMonth(-1), to: new Date(Date.UTC(year, month - 1, 0)).toISOString().slice(0, 10) };
  if (period === 'last3') return { from: firstOfMonth(-2), to: today };
  if (period === 'last6') return { from: firstOfMonth(-5), to: today };
  if (period === 'year') return { from: `${year}-01-01`, to: today };
  return { from: firstOfMonth(0), to: today };
}
