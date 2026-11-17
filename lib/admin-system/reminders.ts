import type { Reminder } from './model';

/** Keep the original calendar day when a short month temporarily clamps it. */
export function nextReminderDate(dueAt: string, recurrence: Reminder['recurrence'], afterDay: string): string {
  if (recurrence === 'none') return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}(?::\d{2})?)?$/.exec(dueAt);
  if (!match) return '';
  const [, yearText, monthText, dayText, time = ''] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  const step = recurrence === 'monthly' ? 1 : 12;
  for (let interval = step; interval <= 1200; interval += step) {
    const target = new Date(Date.UTC(year, month - 1 + interval, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    const date = `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
    if (date > afterDay) return `${date}${time}`;
  }
  return '';
}
