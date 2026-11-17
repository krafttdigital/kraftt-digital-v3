import { active, nextUnbilledRetainerCycle, type AgencyRecord, type Invoice, type Lead, type Meeting, type Project, type Reminder, type Retainer, type Task } from './model';

export type AgendaItem = { id: string; title: string; date: string; kind: string; ownerId: string };

export function agencyAgenda(records: AgencyRecord[], today: string, horizonDays = 7): AgendaItem[] {
  const through = new Date(`${today}T00:00:00.000Z`);
  through.setUTCDate(through.getUTCDate() + horizonDays);
  const last = through.toISOString().slice(0, 10);
  const items: AgendaItem[] = [];
  const push = (id: string, title: string, date: string, kind: string, ownerId = '') => {
    const day = date.slice(0, 10);
    if (day && day <= last) items.push({ id, title, date, kind, ownerId });
  };
  for (const item of active<Task>(records, 'task')) if (item.status !== 'done') push(item.id, item.title, item.dueDate, 'Task', item.assigneeId);
  const reminders = active<Reminder>(records, 'reminder').filter(item => item.status === 'open');
  for (const item of reminders) push(item.id, item.title, item.snoozedUntil || item.dueAt, 'Reminder', item.ownerId);
  const remindedLeads = new Set(reminders.filter(item => item.sourceKind === 'lead').map(item => item.sourceId));
  for (const item of active<Lead>(records, 'lead')) if (item.followUpAt && !remindedLeads.has(item.id)) push(item.id, `Follow up: ${item.business || item.person}`, item.followUpAt, 'Lead', item.ownerId);
  for (const item of active<Meeting>(records, 'meeting')) push(item.id, item.title, item.startsAt, 'Meeting');
  for (const item of active<Invoice>(records, 'invoice')) if (item.status === 'issued') push(item.id, `Invoice due: ${item.number}`, item.dueDate, 'Invoice');
  for (const item of active<Project>(records, 'project')) {
    if (item.status === 'cancelled' || item.status === 'completed') continue;
    push(item.id + ':deadline', `Project deadline: ${item.name}`, item.deadline, 'Project', item.ownerId);
    push(item.id + ':domain', `Domain renewal: ${item.name}`, item.domainRenewal, 'Domain', item.ownerId);
    push(item.id + ':hosting', `Hosting renewal: ${item.name}`, item.hostingRenewal, 'Hosting', item.ownerId);
  }
  const invoices = active<Invoice>(records, 'invoice');
  for (const item of active<Retainer>(records, 'retainer')) {
    const cycle = nextUnbilledRetainerCycle(item, invoices, last);
    if (cycle) push(item.id, `Retainer billing: ${item.scope || 'Service'}`, cycle, 'Retainer');
  }
  const unique = new Map<string, AgendaItem>();
  for (const item of items) {
    const key = `${item.kind}:${item.id}:${item.date.slice(0, 10)}`;
    if (!unique.has(key)) unique.set(key, item);
  }
  return [...unique.values()].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
