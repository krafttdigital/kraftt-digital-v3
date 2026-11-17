export const agencyKinds = [
  'lead', 'clientProfile', 'project', 'retainer', 'teamMember', 'task', 'reminder',
  'meeting', 'documentLink', 'invoice', 'payment', 'expense', 'deliverable',
  'approval', 'progressUpdate', 'activityEvent', 'settings',
] as const;

export type AgencyKind = typeof agencyKinds[number];
export type Money = number; // Integer minor units. Never use floating-point rupees in totals.
export type Currency = 'INR';
export type BaseRecord<K extends AgencyKind> = {
  id: string; kind: K; createdAt: string; updatedAt: string; deletedAt?: string;
};
export type LeadStage = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | string;
export type Lead = BaseRecord<'lead'> & {
  person: string; business: string; email: string; phone: string; website: string;
  interest: string; source: string; value: Money; currency: Currency; stage: LeadStage;
  ownerId: string; notes: string; followUpAt: string; clientId: string; projectId: string;
  closedAt: string;
};
export type ClientProfile = BaseRecord<'clientProfile'> & {
  clientId: string; website: string; notes: string; status: 'active' | 'archived';
  currency: Currency; linkedLeadId: string;
};
export type Project = BaseRecord<'project'> & {
  clientId: string; name: string; description: string; serviceIds: string[];
  ownerId: string; assigneeIds: string[]; status: 'new' | 'ongoing' | 'on_hold' | 'completed' | 'cancelled';
  type: 'one_off' | 'retainer'; budget: Money; currency: Currency; startDate: string;
  deadline: string; domainProvider: string; domainRenewal: string; hostingProvider: string;
  hostingRenewal: string; notes: string; leadId: string;
};
export type Retainer = BaseRecord<'retainer'> & {
  projectId: string; clientId: string; scope: string; fee: Money; currency: Currency;
  frequency: 'monthly' | 'quarterly' | 'yearly'; cycleDay: number; startDate: string;
  endDate: string; status: 'active' | 'paused' | 'ended'; lastInvoiceCycle: string;
};
export type TeamMember = BaseRecord<'teamMember'> & {
  name: string; email: string; phone: string; role: string; type: 'employee' | 'freelancer';
  active: boolean; compensation: Money; currency: Currency; notes: string;
};
export type Task = BaseRecord<'task'> & {
  title: string; description: string; clientId: string; projectId: string; assigneeId: string;
  priority: 'low' | 'normal' | 'high'; status: 'todo' | 'doing' | 'done'; dueDate: string;
  checklist: { id: string; text: string; done: boolean }[]; comments: { id: string; text: string; at: string }[];
  milestoneId: string;
};
export type Reminder = BaseRecord<'reminder'> & {
  title: string; dueAt: string; sourceKind: AgencyKind | 'domain' | 'hosting'; sourceId: string;
  ownerId: string; recurrence: 'none' | 'monthly' | 'yearly'; status: 'open' | 'done' | 'dismissed';
  snoozedUntil: string;
};
export type Meeting = BaseRecord<'meeting'> & {
  clientId: string; projectId: string; title: string; startsAt: string; endsAt: string;
  attendees: string[]; link: string; notes: string;
};
export type DocumentLink = BaseRecord<'documentLink'> & {
  documentId: string; documentType: string; clientId: string; projectId: string;
  issuedSnapshot: string; version: number;
};
export type Invoice = BaseRecord<'invoice'> & {
  clientId: string; projectId: string; documentId: string; number: string;
  issuedAt: string; dueDate: string; feeSubtotal: Money; discount: Money; tax: Money;
  currency: Currency; status: 'draft' | 'issued' | 'void'; retainerCycle: string;
  corrections?: { at: string; reason: string; before: { dueDate: string; feeSubtotal: Money; discount: Money; tax: Money; status: 'issued' | 'void' } }[];
};
export type Payment = BaseRecord<'payment'> & {
  clientId: string; projectId: string; amount: Money; currency: Currency; receivedAt: string;
  reference: string; notes: string; allocations: { invoiceId: string; amount: Money }[];
};
export type Expense = BaseRecord<'expense'> & {
  projectId: string; teamMemberId: string; category: string; amount: Money; currency: Currency;
  date: string; status: 'planned' | 'paid'; note: string; receiptUrl: string;
};
export type Deliverable = BaseRecord<'deliverable'> & {
  clientId: string; projectId: string; title: string; description: string; url: string;
  version: string; status: 'planned' | 'in_progress' | 'ready' | 'approved'; clientVisible: boolean;
};
export type Approval = BaseRecord<'approval'> & {
  clientId: string; projectId: string; deliverableId: string; title: string;
  status: 'pending' | 'approved' | 'changes_requested'; reviewer: string; decidedAt: string;
  comment: string;
};
export type ProgressUpdate = BaseRecord<'progressUpdate'> & {
  clientId: string; projectId: string; title: string; description: string;
  status: 'planned' | 'in_progress' | 'completed'; clientVisible: boolean;
};
export type ActivityEvent = BaseRecord<'activityEvent'> & {
  subjectKind: AgencyKind; subjectId: string; action: string; actor: string; summary: string;
};
export type AgencySettings = BaseRecord<'settings'> & {
  timezone: string; currency: Currency; pipelineStages: { id: string; name: string; outcome: 'open' | 'won' | 'lost'; order: number }[];
};

export type AgencyRecord = Lead | ClientProfile | Project | Retainer | TeamMember | Task |
  Reminder | Meeting | DocumentLink | Invoice | Payment | Expense | Deliverable |
  Approval | ProgressUpdate | ActivityEvent | AgencySettings;
export type AgencyData = { revision: number; records: AgencyRecord[] };

export function amountFromDecimal(input: string): Money {
  const value = input.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error('Enter a non-negative amount with at most two decimals.');
  const [whole, fraction = ''] = value.split('.');
  const amount = Number(BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, '0')));
  if (!Number.isSafeInteger(amount) || amount > 100_000_000_000) throw new Error('Amount is too large.');
  return amount;
}
export const amountText = (minor: Money) => (minor / 100).toFixed(2);
export const money = (minor: Money) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100);
export const active = <T extends AgencyRecord>(records: AgencyRecord[], kind: T['kind']): T[] => records.filter((record): record is T => record.kind === kind && !record.deletedAt);
export const byId = <T extends AgencyRecord>(records: AgencyRecord[], kind: T['kind'], id: string): T | undefined => active<T>(records, kind).find(record => record.id === id);
export const invoiceTotal = (invoice: Invoice) => Math.max(0, invoice.feeSubtotal - invoice.discount) + invoice.tax;
export function invoiceApplied(invoice: Invoice, payments: Payment[]) {
  return payments.reduce((sum, payment) => sum + payment.allocations.filter(row => row.invoiceId === invoice.id).reduce((n, row) => n + row.amount, 0), 0);
}
export function invoiceBalance(invoice: Invoice, payments: Payment[]) {
  return invoice.status !== 'issued' ? 0 : Math.max(0, invoiceTotal(invoice) - invoiceApplied(invoice, payments));
}
export function invoiceStatus(invoice: Invoice, payments: Payment[], today: string): 'draft' | 'void' | 'paid' | 'partial' | 'overdue' | 'open' {
  if (invoice.status !== 'issued') return invoice.status;
  const applied = invoiceApplied(invoice, payments);
  if (applied >= invoiceTotal(invoice)) return 'paid';
  if (invoice.dueDate && invoice.dueDate < today) return 'overdue';
  return applied ? 'partial' : 'open';
}
// Cumulative proportional split keeps partial-payment rounding deterministic.
export function invoiceCollectedFees(invoice: Invoice, payments: Payment[]) {
  const total = invoiceTotal(invoice);
  if (!total) return 0;
  const applied = Math.min(total, invoiceApplied(invoice, payments));
  const fees = Math.max(0, invoice.feeSubtotal - invoice.discount);
  return applied === total ? fees : Number(BigInt(applied) * BigInt(fees) / BigInt(total));
}
export function paymentUnapplied(payment: Payment) {
  return payment.amount - payment.allocations.reduce((sum, row) => sum + row.amount, 0);
}
export function validateAllocations(payment: Payment, invoices: Invoice[], otherPayments: Payment[]) {
  if (!Number.isSafeInteger(payment.amount) || payment.amount <= 0) throw new Error('Payment must be greater than zero.');
  if (paymentUnapplied(payment) < 0) throw new Error('Allocations exceed the payment.');
  const seen = new Set<string>();
  for (const row of payment.allocations) {
    if (seen.has(row.invoiceId)) throw new Error('An invoice can appear only once per payment.');
    seen.add(row.invoiceId);
    const invoice = invoices.find(item => item.id === row.invoiceId && item.status === 'issued');
    if (!invoice || invoice.clientId !== payment.clientId || invoice.currency !== payment.currency) throw new Error('Allocation invoice does not match this client and currency.');
    if (!Number.isSafeInteger(row.amount) || row.amount <= 0 || row.amount > invoiceBalance(invoice, otherPayments)) throw new Error('Allocation exceeds the available invoice balance.');
  }
}
export function financialSummary(records: AgencyRecord[], from: string, to: string) {
  const invoices = active<Invoice>(records, 'invoice');
  const payments = active<Payment>(records, 'payment');
  const expenses = active<Expense>(records, 'expense');
  const received = payments.filter(p => p.receivedAt >= from && p.receivedAt <= to);
  const periodExpenses = expenses.filter(e => e.status === 'paid' && e.date >= from && e.date <= to);
  const ordered = [...payments].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  let fees = 0;
  for (const invoice of invoices) {
    const prior: Payment[] = [];
    for (const payment of ordered) {
      if (!payment.allocations.some(row => row.invoiceId === invoice.id)) continue;
      const before = invoiceCollectedFees(invoice, prior);
      prior.push(payment);
      if (payment.receivedAt >= from && payment.receivedAt <= to) fees += invoiceCollectedFees(invoice, prior) - before;
    }
  }
  const unapplied = received.reduce((sum, payment) => sum + paymentUnapplied(payment), 0);
  const paidExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'issued').reduce((sum, invoice) => sum + invoiceBalance(invoice, payments), 0);
  return { fees, unapplied, paidExpenses, cashSurplus: fees - paidExpenses, outstanding };
}
export function leadWinRate(leads: Lead[], from: string, to: string, stages?: AgencySettings['pipelineStages']) {
  const outcome = (stage: string) => stages?.find(item => item.id === stage)?.outcome || (stage === 'won' || stage === 'lost' ? stage : 'open');
  const closed = leads.filter(lead => lead.closedAt >= from && lead.closedAt <= to && ['won', 'lost'].includes(outcome(lead.stage)));
  return closed.length ? closed.filter(lead => outcome(lead.stage) === 'won').length / closed.length : null;
}
// Finds the oldest due cycle without an invoice. The invoice's retainerCycle key is unique.
export function nextUnbilledRetainerCycle(retainer: Retainer, invoices: Invoice[], asOf: string): string | null {
  if (retainer.status !== 'active' || !/^\d{4}-\d{2}-\d{2}$/.test(retainer.startDate)) return null;
  const [year, month] = retainer.startDate.split('-').map(Number);
  const step = retainer.frequency === 'yearly' ? 12 : retainer.frequency === 'quarterly' ? 3 : 1;
  const issued = new Set(invoices.filter(invoice => invoice.retainerCycle.startsWith(`${retainer.id}:`)).map(invoice => invoice.retainerCycle));
  for (let index = 0; index < 600; index++) {
    const candidate = new Date(Date.UTC(year, month - 1 + index * step, retainer.cycleDay)).toISOString().slice(0, 10);
    if (candidate < retainer.startDate) continue;
    if (candidate > asOf || (retainer.endDate && candidate > retainer.endDate)) return null;
    if (!issued.has(`${retainer.id}:${candidate}`)) return candidate;
  }
  return null;
}
export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

export function validateAgency(value: unknown): AgencyRecord[] {
  if (!value || typeof value !== 'object' || !('records' in value) || !Array.isArray(value.records) || value.records.length > 5000) throw new Error('Invalid agency records.');
  const records = value.records as unknown[];
  const ids = new Set<string>();
  for (const item of records) {
    if (!item || typeof item !== 'object') throw new Error('Invalid agency record.');
    const record = item as Record<string, unknown>;
    if (!agencyKinds.includes(record.kind as AgencyKind) || typeof record.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(record.id) || ids.has(record.id)) throw new Error('Invalid or duplicate agency record ID.');
    ids.add(record.id);
    if (typeof record.createdAt !== 'string' || typeof record.updatedAt !== 'string' || !Number.isFinite(Date.parse(record.createdAt)) || !Number.isFinite(Date.parse(record.updatedAt))) throw new Error('Invalid record timestamp.');
    if (record.deletedAt !== undefined && (typeof record.deletedAt !== 'string' || !Number.isFinite(Date.parse(record.deletedAt)))) throw new Error('Invalid deletion timestamp.');
    for (const [key, field] of Object.entries(record)) {
      if (typeof field === 'string' && field.length > 20_000) throw new Error(`${key} is too long.`);
      if (['value', 'budget', 'fee', 'compensation', 'feeSubtotal', 'discount', 'tax', 'amount'].includes(key) && (!Number.isSafeInteger(field) || Number(field) < 0 || Number(field) > 100_000_000_000)) throw new Error(`${key} must be a valid amount.`);
    }
  }
  const typed = records as AgencyRecord[];
  const settings = active<AgencySettings>(typed, 'settings');
  if (settings.length > 1) throw new Error('Only one agency settings record is allowed.');
  if (settings.length) {
    const stages = settings[0].pipelineStages;
    if (!Array.isArray(stages) || stages.length < 2 || stages.length > 30 || stages.some(item => !item || typeof item.id !== 'string' || !/^[a-z0-9_-]{1,40}$/i.test(item.id) || typeof item.name !== 'string' || !item.name.trim() || !['open', 'won', 'lost'].includes(item.outcome) || !Number.isSafeInteger(item.order)) || new Set(stages.map(item => item.id)).size !== stages.length || !stages.some(item => item.outcome === 'won') || !stages.some(item => item.outcome === 'lost')) throw new Error('Lead pipeline stages are invalid.');
    if (active<Lead>(typed, 'lead').some(lead => !stages.some(item => item.id === lead.stage))) throw new Error('A lead uses a missing pipeline stage.');
  }
  const invoices = active<Invoice>(typed, 'invoice');
  const numbers = new Set<string>();
  const cycles = new Set<string>();
  const invoiceDocuments = new Set<string>();
  const payments = active<Payment>(typed, 'payment');
  for (const invoice of invoices) {
    if (!['draft', 'issued', 'void'].includes(invoice.status)) throw new Error('Invalid invoice status.');
    if (invoice.corrections !== undefined && (!Array.isArray(invoice.corrections) || invoice.corrections.length > 100 || invoice.corrections.some(item =>
      !item || typeof item.at !== 'string' || !Number.isFinite(Date.parse(item.at)) || typeof item.reason !== 'string' || !item.reason.trim() || item.reason.length > 500 ||
      !item.before || typeof item.before.dueDate !== 'string' || !['issued', 'void'].includes(item.before.status) ||
      [item.before.feeSubtotal, item.before.discount, item.before.tax].some(amount => !Number.isSafeInteger(amount) || amount < 0 || amount > 100_000_000_000)
    ))) throw new Error('Invoice correction history is invalid.');
    if (invoice.discount > invoice.feeSubtotal) throw new Error('Invoice discount exceeds its fee subtotal.');
    if (invoice.status === 'issued' && !invoice.number.trim()) throw new Error('An issued invoice needs a number.');
    if (invoice.number) { if (numbers.has(invoice.number.toLowerCase())) throw new Error('Invoice numbers must be unique.'); numbers.add(invoice.number.toLowerCase()); }
    if (invoice.retainerCycle) { if (cycles.has(invoice.retainerCycle)) throw new Error('A retainer cycle already has an invoice.'); cycles.add(invoice.retainerCycle); }
    if (invoice.documentId) { if (invoiceDocuments.has(invoice.documentId)) throw new Error('A document already has an invoice ledger record.'); invoiceDocuments.add(invoice.documentId); }
  }
  for (const retainer of active<Retainer>(typed, 'retainer')) {
    if (!Number.isSafeInteger(retainer.cycleDay) || retainer.cycleDay < 1 || retainer.cycleDay > 28) throw new Error('Retainer billing day must be between 1 and 28.');
    if (retainer.endDate && retainer.startDate && retainer.endDate < retainer.startDate) throw new Error('Retainer end date precedes its start date.');
  }
  const profiles = active<ClientProfile>(typed, 'clientProfile');
  if (new Set(profiles.map(item => item.clientId)).size !== profiles.length) throw new Error('A client has more than one profile.');
  const documentLinks = active<DocumentLink>(typed, 'documentLink');
  if (new Set(documentLinks.map(item => item.documentId)).size !== documentLinks.length) throw new Error('A document can link to only one project.');
  for (const payment of payments) {
    if (!Array.isArray(payment.allocations)) throw new Error('Payment allocations are invalid.');
    validateAllocations(payment, invoices, payments.filter(item => item.id !== payment.id));
  }
  for (const project of active<Project>(typed, 'project')) if (project.startDate && project.deadline && project.deadline < project.startDate) throw new Error('Project deadline precedes its start date.');
  const existing = (kind: AgencyKind, id: string) => !id || typed.some(item => item.kind === kind && item.id === id && !item.deletedAt);
  const projectFor = (id: string) => id ? active<Project>(typed, 'project').find(item => item.id === id) : undefined;
  for (const link of documentLinks) if (!projectFor(link.projectId) || projectFor(link.projectId)?.clientId !== link.clientId) throw new Error('Document client and project do not match.');
  for (const project of active<Project>(typed, 'project')) {
    if (!Array.isArray(project.assigneeIds) || !Array.isArray(project.serviceIds)) throw new Error('Project assignments are invalid.');
    if (!existing('teamMember', project.ownerId) || project.assigneeIds.some(id => !existing('teamMember', id))) throw new Error('Project links to a missing team member.');
  }
  for (const task of active<Task>(typed, 'task')) {
    if (!existing('project', task.projectId) || !existing('teamMember', task.assigneeId)) throw new Error('Task links to a missing project or assignee.');
    if (projectFor(task.projectId) && task.clientId && task.clientId !== projectFor(task.projectId)?.clientId) throw new Error('Task client does not match its project.');
  }
  for (const retainer of active<Retainer>(typed, 'retainer')) if (!projectFor(retainer.projectId) || projectFor(retainer.projectId)?.clientId !== retainer.clientId) throw new Error('Retainer client and project do not match.');
  for (const invoice of invoices) {
    if (!existing('project', invoice.projectId)) throw new Error('Invoice links to a missing project.');
    if (projectFor(invoice.projectId) && projectFor(invoice.projectId)?.clientId !== invoice.clientId) throw new Error('Invoice client does not match its project.');
  }
  for (const payment of payments) {
    if (!existing('project', payment.projectId)) throw new Error('Payment links to a missing project.');
    if (projectFor(payment.projectId) && projectFor(payment.projectId)?.clientId !== payment.clientId) throw new Error('Payment client does not match its project.');
  }
  for (const expense of active<Expense>(typed, 'expense')) if (!existing('project', expense.projectId) || !existing('teamMember', expense.teamMemberId)) throw new Error('Expense links to a missing project or team member.');
  return typed;
}
