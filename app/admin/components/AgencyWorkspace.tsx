'use client';

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Activity, Archive, ArrowRight, CalendarDays, ChevronDown, FileText, FolderKanban, LayoutDashboard, Menu, Plus, Search, Settings2, UsersRound, Wallet, X } from 'lucide-react';
import type { CatalogueItem } from '../../../lib/quotation/catalogue';
import { emptyWorkspace, type Client, type Quotation, type Workspace } from '../../../lib/quotation/model';
import type { BusinessDocument } from '../../../lib/documents/model';
import { invoiceTotals, invoiceValue } from '../../../lib/documents/invoice-template';
import { loadCloudWorkspace, saveCloudWorkspace } from '../../../admin-cloudflare/workspace-api';
import { currentAdmin } from '../../../admin-cloudflare/users-api';
import { active, amountFromDecimal, amountText, financialSummary, invoiceBalance, invoiceStatus, leadWinRate, money, newId, now, validateAgency, type ActivityEvent, type AgencyKind, type AgencyRecord, type AgencySettings, type ClientProfile, type DocumentLink, type Expense, type Invoice, type Lead, type Payment, type Project, type Reminder, type Retainer, type Task, type TeamMember } from '../../../lib/admin-system/model';
import { nextReminderDate } from '../../../lib/admin-system/reminders';
import { agencyPeriodBounds, agencyPeriodOptions, type AgencyPeriod } from '../../../lib/admin-system/periods';
import { AgencyProjectExtras } from './AgencyProjectExtras';
import { AgencyClientDetail } from './AgencyClientDetail';
import { AgencyProjectsView } from './AgencyProjectsView';
import { AgencyTaskFields } from './AgencyTaskFields';
import { AgencyLeadsView } from './AgencyLeadsView';
import { AgencyAgenda } from './AgencyAgenda';
import { AgencyProjectServices } from './AgencyProjectServices';
import { AgencyConvertLead } from './AgencyConvertLead';
import { AgencyCalendar } from './AgencyCalendar';
import { InvoiceCorrectionFields } from './InvoiceCorrectionFields';
const ERPWorkspace = lazy(() => import('./ERPWorkspace').then(module => ({ default: module.ERPWorkspace })));
import { LeadCsvImport } from './LeadCsvImport';
import { AgencyPipelineSettings, defaultStages } from './AgencyPipelineSettings';
import './agency.css';

type Page = 'dashboard' | 'leads' | 'clients' | 'projects' | 'tasks' | 'team' | 'finance' | 'documents' | 'case-studies' | 'settings' | 'trash';
const routes: { page: Page; label: string; group: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', group: 'Overview', icon: LayoutDashboard },
  { page: 'leads', label: 'Leads', group: 'Work', icon: Activity },
  { page: 'clients', label: 'Clients', group: 'Work', icon: UsersRound },
  { page: 'projects', label: 'Projects', group: 'Work', icon: FolderKanban },
  { page: 'tasks', label: 'Tasks & Calendar', group: 'Work', icon: CalendarDays },
  { page: 'team', label: 'Team', group: 'Operations', icon: UsersRound },
  { page: 'finance', label: 'Finance', group: 'Operations', icon: Wallet },
  { page: 'documents', label: 'Documents', group: 'Content', icon: FileText },
  { page: 'case-studies', label: 'Case Studies', group: 'Content', icon: FileText },
  { page: 'settings', label: 'Settings', group: 'Account', icon: Settings2 },
  { page: 'trash', label: 'Trash', group: 'Account', icon: Archive },
];
const pageFromPath = (): Page => {
  const segment = window.location.pathname.split('/').filter(Boolean).at(-1);
  return routes.find(item => item.page === segment)?.page || 'dashboard';
};
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
type Field = { key: string; label: string; type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'datetime-local' | 'money' | 'textarea' | 'client' | 'project' | 'member' | 'select' | 'boolean'; options?: string[]; required?: boolean };
const fields: Partial<Record<AgencyKind, Field[]>> = {
  lead: [
    { key: 'person', label: 'Contact person', required: true }, { key: 'business', label: 'Business', required: true },
    { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone / WhatsApp', type: 'tel' },
    { key: 'website', label: 'Website', type: 'url' }, { key: 'interest', label: 'Service interest' },
    { key: 'source', label: 'Source', type: 'select', options: ['Website', 'Referral', 'Instagram', 'LinkedIn', 'Ads', 'Cold call', 'Other'] },
    { key: 'value', label: 'Estimated value (₹)', type: 'money' }, { key: 'stage', label: 'Stage', type: 'select', options: ['new', 'contacted', 'qualified', 'won', 'lost'] },
    { key: 'ownerId', label: 'Owner', type: 'member' }, { key: 'followUpAt', label: 'Next follow-up', type: 'datetime-local' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  project: [
    { key: 'name', label: 'Project name', required: true }, { key: 'clientId', label: 'Client', type: 'client', required: true },
    { key: 'description', label: 'Description', type: 'textarea' }, { key: 'type', label: 'Type', type: 'select', options: ['one_off', 'retainer'] },
    { key: 'status', label: 'Status', type: 'select', options: ['new', 'ongoing', 'on_hold', 'completed', 'cancelled'] },
    { key: 'budget', label: 'Agreed pre-tax budget (₹)', type: 'money' }, { key: 'ownerId', label: 'Owner', type: 'member' },
    { key: 'startDate', label: 'Start date', type: 'date' }, { key: 'deadline', label: 'Deadline', type: 'date' },
    { key: 'domainProvider', label: 'Domain provider' }, { key: 'domainRenewal', label: 'Domain renewal', type: 'date' },
    { key: 'hostingProvider', label: 'Hosting provider' }, { key: 'hostingRenewal', label: 'Hosting renewal', type: 'date' },
    { key: 'notes', label: 'Internal notes', type: 'textarea' },
  ],
  task: [
    { key: 'title', label: 'Task', required: true }, { key: 'projectId', label: 'Project', type: 'project' },
    { key: 'assigneeId', label: 'Assignee', type: 'member' }, { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high'] },
    { key: 'status', label: 'Status', type: 'select', options: ['todo', 'doing', 'done'] }, { key: 'dueDate', label: 'Due date', type: 'date' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  teamMember: [
    { key: 'name', label: 'Name', required: true }, { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' }, { key: 'role', label: 'Role' },
    { key: 'type', label: 'Type', type: 'select', options: ['employee', 'freelancer'] },
    { key: 'active', label: 'Active team member', type: 'boolean' },
    { key: 'compensation', label: 'Agreed compensation (₹)', type: 'money' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  reminder: [
    { key: 'title', label: 'Reminder', required: true }, { key: 'dueAt', label: 'When', type: 'datetime-local', required: true },
    { key: 'ownerId', label: 'Owner', type: 'member' }, { key: 'recurrence', label: 'Repeat', type: 'select', options: ['none', 'monthly', 'yearly'] },
    { key: 'status', label: 'Status', type: 'select', options: ['open', 'done', 'dismissed'] },
    { key: 'snoozedUntil', label: 'Snoozed until', type: 'datetime-local' },
  ],
  invoice: [
    { key: 'clientId', label: 'Client', type: 'client', required: true }, { key: 'projectId', label: 'Project', type: 'project' },
    { key: 'number', label: 'Invoice number', required: true }, { key: 'issuedAt', label: 'Issue date', type: 'date' },
    { key: 'dueDate', label: 'Due date', type: 'date' }, { key: 'feeSubtotal', label: 'Pre-tax fees (₹)', type: 'money' },
    { key: 'discount', label: 'Discount (₹)', type: 'money' }, { key: 'tax', label: 'Configured tax (₹)', type: 'money' },
    { key: 'status', label: 'Status', type: 'select', options: ['draft', 'issued', 'void'] },
  ],
  payment: [
    { key: 'clientId', label: 'Client', type: 'client', required: true }, { key: 'projectId', label: 'Project', type: 'project' },
    { key: 'amount', label: 'Amount received (₹)', type: 'money', required: true },
    { key: 'receivedAt', label: 'Received on', type: 'date' }, { key: 'reference', label: 'Reference' }, { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  expense: [
    { key: 'category', label: 'Category', required: true }, { key: 'amount', label: 'Amount (₹)', type: 'money', required: true },
    { key: 'date', label: 'Date', type: 'date' }, { key: 'status', label: 'Status', type: 'select', options: ['planned', 'paid'] },
    { key: 'projectId', label: 'Project', type: 'project' }, { key: 'teamMemberId', label: 'Team payout to', type: 'member' },
    { key: 'receiptUrl', label: 'Receipt link', type: 'url' }, { key: 'note', label: 'Notes', type: 'textarea' },
  ],
  retainer: [
    { key: 'clientId', label: 'Client', type: 'client', required: true }, { key: 'projectId', label: 'Project', type: 'project', required: true },
    { key: 'scope', label: 'Service scope', type: 'textarea' }, { key: 'fee', label: 'Recurring fee (₹)', type: 'money' },
    { key: 'frequency', label: 'Billing frequency', type: 'select', options: ['monthly', 'quarterly', 'yearly'] },
    { key: 'cycleDay', label: 'Billing day (1–28)' }, { key: 'startDate', label: 'Start date', type: 'date' },
    { key: 'endDate', label: 'End date', type: 'date' }, { key: 'status', label: 'Status', type: 'select', options: ['active', 'paused', 'ended'] },
  ],
  meeting: [
    { key: 'title', label: 'Meeting title', required: true }, { key: 'clientId', label: 'Client', type: 'client' },
    { key: 'projectId', label: 'Project', type: 'project' }, { key: 'startsAt', label: 'Starts', type: 'datetime-local' },
    { key: 'endsAt', label: 'Ends', type: 'datetime-local' }, { key: 'link', label: 'Meeting link', type: 'url' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  progressUpdate: [
    { key: 'title', label: 'Update title', required: true }, { key: 'projectId', label: 'Project', type: 'project', required: true },
    { key: 'status', label: 'Status', type: 'select', options: ['planned', 'in_progress', 'completed'] },
    { key: 'clientVisible', label: 'Share in client portal preview', type: 'boolean' },
    { key: 'description', label: 'Update', type: 'textarea' },
  ],
  deliverable: [
    { key: 'title', label: 'Deliverable', required: true }, { key: 'projectId', label: 'Project', type: 'project', required: true },
    { key: 'description', label: 'Description', type: 'textarea' }, { key: 'url', label: 'File or link URL', type: 'url' },
    { key: 'version', label: 'Version' }, { key: 'status', label: 'Status', type: 'select', options: ['planned', 'in_progress', 'ready', 'approved'] },
    { key: 'clientVisible', label: 'Share in client portal preview', type: 'boolean' },
  ],
  approval: [
    { key: 'title', label: 'Approval request', required: true }, { key: 'projectId', label: 'Project', type: 'project', required: true },
    { key: 'reviewer', label: 'Reviewer' }, { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'changes_requested'] },
    { key: 'decidedAt', label: 'Decision date', type: 'date' }, { key: 'comment', label: 'Comment', type: 'textarea' },
  ],
};
const titleFor = (record: AgencyRecord) => 'business' in record ? String(record.business) : 'name' in record ? String(record.name) : 'title' in record ? String(record.title) : 'number' in record ? String(record.number) : record.id;
function fresh(kind: AgencyKind): AgencyRecord {
  const base = { id: newId(), kind, createdAt: now(), updatedAt: now() };
  const common = { currency: 'INR' };
  const defaults: Record<string, Record<string, unknown>> = {
    lead: { ...common, person: '', business: '', email: '', phone: '', website: '', interest: '', source: 'Website', value: 0, stage: 'new', ownerId: '', notes: '', followUpAt: '', clientId: '', projectId: '', closedAt: '' },
    project: { ...common, clientId: '', name: '', description: '', serviceIds: [], ownerId: '', assigneeIds: [], status: 'new', type: 'one_off', budget: 0, startDate: '', deadline: '', domainProvider: '', domainRenewal: '', hostingProvider: '', hostingRenewal: '', notes: '', leadId: '' },
    task: { title: '', description: '', clientId: '', projectId: '', assigneeId: '', priority: 'normal', status: 'todo', dueDate: '', checklist: [], comments: [], milestoneId: '' },
    teamMember: { ...common, name: '', email: '', phone: '', role: '', type: 'freelancer', active: true, compensation: 0, notes: '' },
    reminder: { title: '', dueAt: '', sourceKind: 'lead', sourceId: '', ownerId: '', recurrence: 'none', status: 'open', snoozedUntil: '' },
    invoice: { ...common, clientId: '', projectId: '', documentId: '', number: `KD-INV-${today().replaceAll('-', '')}-${base.id.slice(0, 8).toUpperCase()}`, issuedAt: today(), dueDate: '', feeSubtotal: 0, discount: 0, tax: 0, status: 'draft', retainerCycle: '' },
    payment: { ...common, clientId: '', projectId: '', amount: 0, receivedAt: today(), reference: '', notes: '', allocations: [] },
    expense: { ...common, projectId: '', teamMemberId: '', category: '', amount: 0, date: today(), status: 'planned', note: '', receiptUrl: '' },
    retainer: { ...common, projectId: '', clientId: '', scope: '', fee: 0, frequency: 'monthly', cycleDay: 1, startDate: today(), endDate: '', status: 'active', lastInvoiceCycle: '' },
    meeting: { clientId: '', projectId: '', title: '', startsAt: '', endsAt: '', attendees: [], link: '', notes: '' },
    progressUpdate: { clientId: '', projectId: '', title: '', description: '', status: 'planned', clientVisible: false },
    deliverable: { clientId: '', projectId: '', title: '', description: '', url: '', version: '1', status: 'planned', clientVisible: false },
    approval: { clientId: '', projectId: '', deliverableId: '', title: '', status: 'pending', reviewer: '', decidedAt: '', comment: '' },
    clientProfile: { clientId: '', website: '', notes: '', status: 'active', currency: 'INR', linkedLeadId: '' },
  };
  return { ...base, ...defaults[kind] } as AgencyRecord;
}
export function AgencyWorkspace({ catalogue, onLogout }: { catalogue: CatalogueItem[]; onLogout: () => void }) {
  const [owner, setOwner] = useState<boolean | null>(null), [page, setPage] = useState<Page>('dashboard');
  const [records, setRecords] = useState<AgencyRecord[]>([]), [revision, setRevision] = useState(0), [clients, setClients] = useState<Client[]>([]), [legacy, setLegacy] = useState<Workspace | null>(null);
  const [status, setStatus] = useState('Opening agency records…'), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [collapsed, setCollapsed] = useState(false), [mobileNav, setMobileNav] = useState(false), [query, setQuery] = useState('');
  const [editor, setEditor] = useState<Record<string, unknown> | null>(null), [editingKind, setEditingKind] = useState<AgencyKind | 'client' | null>(null);
  const [selectedClient, setSelectedClient] = useState(''), [selectedProject, setSelectedProject] = useState('');
  const [documentContext, setDocumentContext] = useState<{ clientId: string; projectTitle: string; projectId: string } | null>(null);
  const [period, setPeriod] = useState<AgencyPeriod>('month');
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'done'>('all');
  const [importOpen, setImportOpen] = useState(false);
  const [conversionLead, setConversionLead] = useState<Lead | null>(null);
  useEffect(() => {
    let live = true;
    void currentAdmin().then(async identity => {
      if (!live) return;
      setPage(pageFromPath());
      setOwner(identity.canManageUsers);
      if (!identity.canManageUsers) return;
      try {
        const [agencyResponse, workspace] = await Promise.all([fetch('/api/agency', { cache: 'no-store' }), loadCloudWorkspace()]);
        const body = await agencyResponse.json() as { revision?: number; records?: AgencyRecord[]; error?: string };
        if (!agencyResponse.ok) throw new Error(body.error || 'Agency records unavailable.');
        if (!live) return;
        setRecords(validateAgency(body)); setRevision(body.revision || 0); setClients(workspace.workspace?.clients || []); setLegacy(workspace.workspace); setStatus('Saved to Cloudflare D1');
      } catch (cause) { if (live) { setError((cause as Error).message); setStatus('Agency records unavailable; Documents remain available.'); } }
    }).catch(() => { if (live) setOwner(false); });
    const pop = () => setPage(pageFromPath()); window.addEventListener('popstate', pop);
    return () => { live = false; window.removeEventListener('popstate', pop); };
  }, []);
  useEffect(() => {
    if (!editingKind) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => document.querySelector<HTMLElement>('.agency-modal form input, .agency-modal form select, .agency-modal form textarea')?.focus(), 0);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setEditor(null); setEditingKind(null); } };
    document.addEventListener('keydown', onKey);
    return () => { window.clearTimeout(timer); document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [editingKind]);
  const leads = active<Lead>(records, 'lead'), projects = active<Project>(records, 'project'), tasks = active<Task>(records, 'task');
  const members = active<TeamMember>(records, 'teamMember'), invoices = active<Invoice>(records, 'invoice');
  const profiles = active<ClientProfile>(records, 'clientProfile');
  const documentLinks = active<DocumentLink>(records, 'documentLink');
  const visibleClients = clients.filter(client => !profiles.some(profile => profile.clientId === client.id && profile.status === 'archived'));
  const settings = active<AgencySettings>(records, 'settings')[0], stages = settings?.pipelineStages || defaultStages;
  const stageOutcome = (stage: string) => stages.find(item => item.id === stage)?.outcome || (stage === 'won' || stage === 'lost' ? stage : 'open');
  const payments = active<Payment>(records, 'payment'), expenses = active<Expense>(records, 'expense'), reminders = active<Reminder>(records, 'reminder');
  const bounds = agencyPeriodBounds(period, today());
  const finance = useMemo(() => financialSummary(records, bounds.from, bounds.to), [records, bounds.from, bounds.to]);
  const filtered = (items: AgencyRecord[]) => items.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  const clientName = (id: string) => clients.find(item => item.id === id)?.business || 'Unlinked client';
  const memberName = (id: string) => members.find(item => item.id === id)?.name || 'Unassigned';
  const activityTitle = (event: ActivityEvent) => {
    const subject = records.find(item => item.id === event.subjectId);
    if (!subject) return `${event.subjectKind.replace(/([A-Z])/g, ' $1')} ${event.action}`;
    if (subject.kind === 'expense') return `Expense · ${subject.category} · ${money(subject.amount)}`;
    if (subject.kind === 'payment') return `Payment · ${clientName(subject.clientId)} · ${money(subject.amount)}`;
    if (subject.kind === 'invoice') return `Invoice · ${subject.number} · ${clientName(subject.clientId)}`;
    if (subject.kind === 'clientProfile') return `Client · ${clientName(subject.clientId)}`;
    if (subject.kind === 'retainer') return `Retainer · ${subject.scope || clientName(subject.clientId)}`;
    return `${event.subjectKind.replace(/([A-Z])/g, ' $1')} · ${titleFor(subject)}`;
  };
  function navigate(next: Page) { if (['documents', 'case-studies', 'settings'].includes(page) && next !== page) void refreshDocuments(); setPage(next); setMobileNav(false); setQuery(''); setSelectedClient(''); setSelectedProject(''); setDocumentContext(null); window.history.pushState({}, '', `/admin/${next === 'dashboard' ? '' : next}`); }
  async function save(next: AgencyRecord[]) {
    if (saving.current) { setError('Wait for the current save to finish, then try again.'); return false; }
    saving.current = true;
    setBusy(true); setError('');
    try {
      const changed = next.filter(item => item.kind !== 'activityEvent' && JSON.stringify(item) !== JSON.stringify(records.find(old => old.id === item.id)));
      const events = changed.map(item => ({ id: newId(), kind: 'activityEvent' as const, createdAt: now(), updatedAt: now(), subjectKind: item.kind, subjectId: item.id, action: records.some(old => old.id === item.id) ? item.deletedAt ? 'trashed' : 'updated' : 'created', actor: 'krafttdigital@gmail.com', summary: `${item.kind.replace(/([A-Z])/g, ' $1')}: ${titleFor(item).slice(0, 100)}` }));
      const persisted: AgencyRecord[] = [...next, ...events];
      validateAgency({ records: persisted });
      const result = await fetch('/api/agency', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision, records: persisted }) });
      const body = await result.json() as { revision?: number; records?: AgencyRecord[]; error?: string };
      if (!result.ok || !Number.isSafeInteger(body.revision)) throw new Error(body.error || 'Could not save agency records.');
      setRecords(body.records || persisted); setRevision(body.revision!); setStatus('Saved to Cloudflare D1'); return true;
    } catch (cause) { setError((cause as Error).message); setStatus('Not saved'); return false; }
    finally { saving.current = false; setBusy(false); }
  }
  function begin(kind: AgencyKind, record?: AgencyRecord) {
    const source = record || fresh(kind);
    const draft = { ...source } as Record<string, unknown>;
    for (const field of fields[kind] || []) if (field.type === 'money') draft[field.key] = amountText(Number(draft[field.key] || 0));
    setEditingKind(kind); setEditor(draft);
  }
  function beginClient(client: Client) {
    const profile = profiles.find(item => item.clientId === client.id);
    setEditingKind('client'); setEditor({ ...client, website: profile?.website || '', notes: profile?.notes || '' });
  }
  function beginForProject(kind: AgencyKind, project: Project) {
    begin(kind);
    setEditor(value => value ? { ...value, projectId: project.id, clientId: project.clientId } : value);
  }
  async function saveEditor() {
    if (!editor || !editingKind) return;
    if (editingKind === 'client') {
      const value = editor as unknown as Client & { website?: string; notes?: string };
      if (!value.business?.trim()) { setError('Enter a business name.'); return; }
      setBusy(true);
      try { const current = await loadCloudWorkspace(); const state = current.workspace || emptyWorkspace();
        const legacyClient: Client = { id: value.id, business: value.business.trim(), contact: value.contact || '', role: value.role || '', address: value.address || '', email: value.email || '', phone: value.phone || '', gstin: value.gstin || '', projectTitle: value.projectTitle || '' };
        const next = { ...state, clients: [...state.clients.filter(item => item.id !== value.id), legacyClient] };
        await saveCloudWorkspace(next, current.revision); setClients(next.clients); setLegacy(next);
        const currentProfile = profiles.find(item => item.clientId === value.id);
        const profile = { ...(currentProfile || fresh('clientProfile')), clientId: value.id, website: value.website || '', notes: value.notes || '', updatedAt: now() } as ClientProfile;
        if (await save([...records.filter(item => item.id !== profile.id), profile])) { setEditor(null); setEditingKind(null); setStatus('Client saved to cloud'); }
      } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); }
      return;
    }
    try {
      const updated = { ...editor, updatedAt: now() } as unknown as AgencyRecord;
      for (const field of fields[editingKind] || []) if (field.type === 'money') (updated as unknown as Record<string, unknown>)[field.key] = amountFromDecimal(String(editor[field.key] || '0'));
      if (updated.kind === 'lead') updated.closedAt = stageOutcome(updated.stage) !== 'open' ? updated.closedAt || today() : '';
      if (updated.kind === 'task') updated.clientId = projects.find(item => item.id === updated.projectId)?.clientId || '';
      if (['progressUpdate', 'deliverable', 'approval'].includes(updated.kind)) (updated as unknown as Record<string, unknown>).clientId = projects.find(item => item.id === String((updated as unknown as Record<string, unknown>).projectId))?.clientId || '';
      if (updated.kind === 'retainer') updated.cycleDay = Number(updated.cycleDay);
      const next = [...records.filter(item => item.id !== updated.id), updated];
      if (await save(next)) { setEditor(null); setEditingKind(null); }
    } catch (cause) { setError((cause as Error).message); }
  }
  async function changeRecord(record: AgencyRecord) { await save(records.map(item => item.id === record.id ? { ...record, updatedAt: now() } : item)); }
  async function completeReminder(item: Reminder) {
    if (item.status !== 'open') { await changeRecord({ ...item, status: 'open' }); return; }
    const nextDate = nextReminderDate(item.dueAt, item.recurrence, today());
    const next: AgencyRecord[] = records.map(record => record.id === item.id ? { ...item, status: 'done', updatedAt: now(), snoozedUntil: '' } : record);
    if (nextDate) next.push({ ...item, id: newId(), createdAt: now(), updatedAt: now(), dueAt: nextDate, snoozedUntil: '', status: 'open' });
    await save(next);
  }
  async function snoozeReminder(item: Reminder) {
    const base = new Date(`${today()}T00:00:00.000Z`);
    base.setUTCDate(base.getUTCDate() + 1);
    await changeRecord({ ...item, snoozedUntil: `${base.toISOString().slice(0, 10)}${item.dueAt.slice(10) || 'T09:00'}` });
  }
  async function moveLead(lead: Lead, stage: string) {
    if (lead.stage === stage) return;
    await changeRecord({ ...lead, stage, closedAt: stageOutcome(stage) === 'open' ? '' : today() });
  }
  async function scheduleFollowUp(lead: Lead) {
    if (!lead.followUpAt) { begin('lead', lead); setError('Choose a next follow-up time, then save the lead.'); return; }
    const existing = reminders.find(item => item.sourceKind === 'lead' && item.sourceId === lead.id && item.status === 'open');
    const reminder: Reminder = existing
      ? { ...existing, dueAt: lead.followUpAt, ownerId: lead.ownerId, updatedAt: now() }
      : { ...fresh('reminder'), title: `Follow up: ${lead.business || lead.person}`, dueAt: lead.followUpAt, sourceKind: 'lead', sourceId: lead.id, ownerId: lead.ownerId } as Reminder;
    await save([...records.filter(item => item.id !== reminder.id), reminder]);
  }
  async function archiveClient(clientId: string, archived: boolean) {
    const current = profiles.find(item => item.clientId === clientId);
    const profile: ClientProfile = current ? { ...current, status: archived ? 'archived' : 'active', updatedAt: now() } : { ...fresh('clientProfile'), clientId, status: archived ? 'archived' : 'active' } as ClientProfile;
    await save([...records.filter(item => item.id !== profile.id), profile]);
  }
  async function trash(record: AgencyRecord) { if (!window.confirm(`Move ${titleFor(record)} to Trash?`)) return; await changeRecord({ ...record, deletedAt: now() }); }
  async function convert(lead: Lead, existingClientId: string, createProject: boolean): Promise<boolean> {
    if (lead.clientId) { navigate('clients'); setSelectedClient(lead.clientId); return true; }
    setBusy(true); setError('');
    try {
      const current = await loadCloudWorkspace(); const workspace = current.workspace || emptyWorkspace();
      const clientId = existingClientId || lead.id; // New-client ID is deterministic for safe retries.
      const client: Client = { id: clientId, business: lead.business || lead.person, contact: lead.person, role: '', address: '', email: lead.email, phone: lead.phone, gstin: '', projectTitle: '' };
      if (existingClientId && !workspace.clients.some(item => item.id === existingClientId)) throw new Error('Choose an existing client from the directory.');
      if (!existingClientId && !workspace.clients.some(item => item.id === clientId)) await saveCloudWorkspace({ ...workspace, clients: [...workspace.clients, client] }, current.revision);
      const profile = profiles.find(item => item.clientId === clientId) || { ...fresh('clientProfile'), clientId, website: lead.website, linkedLeadId: lead.id } as ClientProfile;
      const project = createProject && !projects.some(item => item.leadId === lead.id)
        ? { ...fresh('project'), clientId, leadId: lead.id, name: lead.business ? `${lead.business} project` : `${lead.person} project`, description: lead.interest, ownerId: lead.ownerId, budget: lead.value } as Project : undefined;
      const projectId = project?.id || projects.find(item => item.leadId === lead.id)?.id || '';
      const next = [...records.map(item => item.id === lead.id ? { ...lead, clientId, projectId, stage: stages.find(item => item.outcome === 'won')?.id || 'won', closedAt: lead.closedAt || today(), updatedAt: now() } : item), ...(profiles.some(item => item.clientId === clientId) ? [] : [profile]), ...(project ? [project] : [])];
      if (await save(next)) { if (!existingClientId) setClients(list => list.some(item => item.id === clientId) ? list : [...list, client]); navigate(projectId ? 'projects' : 'clients'); if (projectId) setSelectedProject(projectId); else setSelectedClient(clientId); return true; }
      return false;
    } catch (cause) { setError((cause as Error).message); return false; } finally { setBusy(false); }
  }
  async function refreshDocuments() {
    try { const current = await loadCloudWorkspace(); setLegacy(current.workspace); setClients(current.workspace?.clients || []); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  }
  async function addIssuedInvoice(doc: BusinessDocument, projectId: string) {
    if (doc.status !== 'finalised' || doc.kind !== 'invoice') return;
    if (invoices.some(item => item.documentId === doc.id)) { setError('This document is already linked to an invoice ledger record.'); return; }
    try {
      const totals = invoiceTotals(doc);
      const invoice = { ...fresh('invoice'), clientId: doc.client.id, projectId, documentId: doc.id, number: doc.number, issuedAt: doc.date, dueDate: invoiceValue(doc, 'DUE_DATE'), feeSubtotal: totals.base, discount: 0, tax: totals.tax, status: 'issued' } as Invoice;
      if (await save([...records, invoice])) navigate('finance');
    } catch (cause) { setError((cause as Error).message); }
  }
  async function linkDocument(doc: BusinessDocument | Quotation, projectId: string) {
    const project = projects.find(item => item.id === projectId);
    if (!project || project.clientId !== doc.client.id) { setError('Choose a project belonging to this document client.'); return; }
    const current = active<DocumentLink>(records, 'documentLink').find(item => item.documentId === doc.id);
    const snapshot = doc.status === 'finalised' ? JSON.stringify({ number: doc.number, status: doc.status, finalisedAt: doc.finalisedAt }) : '';
    const link: DocumentLink = current
      ? { ...current, projectId, clientId: doc.client.id, issuedSnapshot: snapshot, updatedAt: now() }
      : { id: newId(), kind: 'documentLink', createdAt: now(), updatedAt: now(), documentId: doc.id,
        documentType: 'kind' in doc ? doc.kind : 'quote', clientId: doc.client.id, projectId,
        issuedSnapshot: snapshot, version: 1 };
    await save([...records.filter(item => item.id !== link.id), link]);
  }
  async function billRetainer(retainer: Retainer, cycle: string) {
    const key = `${retainer.id}:${cycle}`;
    if (invoices.some(item => item.retainerCycle === key)) { setError('This retainer cycle already has an invoice.'); return; }
    const invoice = { ...fresh('invoice'), clientId: retainer.clientId, projectId: retainer.projectId,
      number: `KD-RET-${cycle.replaceAll('-', '')}-${retainer.id.slice(0, 8).toUpperCase()}`,
      issuedAt: cycle, feeSubtotal: retainer.fee, retainerCycle: key, status: 'draft' } as Invoice;
    if (await save([...records, invoice])) { navigate('finance'); begin('invoice', invoice); }
  }
  if (owner === null) return <main className="admin-root admin-gate"><p>Opening Kraftt Admin…</p></main>;
  if (!owner) return <Suspense fallback={<main className="admin-root admin-gate"><p>Opening document workspace…</p></main>}><ERPWorkspace catalogue={catalogue} cloud onLogout={onLogout} initialView={page === 'documents' ? 'quote' : 'clients'} documentTabs={page === 'documents'} /></Suspense>;
  const headline = routes.find(item => item.page === page)?.label || 'Dashboard';
  const quick: { label: string; kind: AgencyKind | 'client'; page: Page }[] = [
    { label: 'Add lead', kind: 'lead', page: 'leads' }, { label: 'Add client', kind: 'client', page: 'clients' },
    { label: 'Create project', kind: 'project', page: 'projects' }, { label: 'Add task', kind: 'task', page: 'tasks' },
    { label: 'Record payment', kind: 'payment', page: 'finance' }, { label: 'Add expense', kind: 'expense', page: 'finance' },
  ];
  function quickAdd(kind: AgencyKind | 'client', destination: Page) { navigate(destination); if (kind === 'client') { setEditingKind('client'); setEditor({ id: newId(), business: '', contact: '', role: '', address: '', email: '', phone: '', gstin: '', projectTitle: '', website: '', notes: '' }); } else begin(kind); }
  const isIssuedInvoice = editingKind === 'invoice' && invoices.some(item => item.id === editor?.id && item.status === 'issued');
  const periodControl = (label: string) => <div className="agency-period"><label>{label}<select value={period} onChange={event => setPeriod(event.target.value as AgencyPeriod)}>{agencyPeriodOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><span>{bounds.from} to {bounds.to}</span></div>;
  return <main className={`agency ${collapsed ? 'agency-collapsed' : ''}`} aria-busy={busy}>
    {busy && <div className="agency-saving-overlay" aria-hidden="true" />}
    <aside className={`agency-sidebar ${mobileNav ? 'agency-sidebar-open' : ''}`}>
      <div className="agency-sidebar-head"><button className="agency-brand" onClick={() => navigate('dashboard')} aria-label="Kraftt Admin home"><Image className="agency-wordmark" src="/admin-assets/brand/kraftt-primary-transparent.webp" alt="Kraftt Digital" width={136} height={68} unoptimized /><Image className="agency-mark" src="/admin-assets/brand/kraftt-mark-dark.webp" alt="" width={31} height={31} unoptimized /></button><button className="agency-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><ChevronDown size={18} /></button></div>
      <nav aria-label="Admin navigation">{['Overview', 'Work', 'Operations', 'Content', 'Account'].map(group => <div className="agency-nav-group" key={group}><span className="agency-nav-label">{group}</span>{routes.filter(item => item.group === group).map(item => { const Icon = item.icon; return <button key={item.page} className={page === item.page ? 'active' : ''} title={collapsed ? item.label : undefined} aria-current={page === item.page ? 'page' : undefined} onClick={() => navigate(item.page)}><Icon size={18} /><span>{item.label}</span></button>; })}</div>)}</nav>
      <div className="agency-sidebar-foot"><button onClick={onLogout}>Sign out</button><small>Saved to Cloudflare D1</small></div>
    </aside>
    {mobileNav && <button className="agency-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <div className="agency-body"><header className="agency-topbar"><button className="agency-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="agency-breadcrumb">Kraftt Admin <span>/</span> <strong>{headline}</strong></div>{page !== 'documents' && <label className="agency-search"><Search size={17} /><input aria-label="Search current page" placeholder={`Search ${headline.toLowerCase()}`} value={query} onChange={event => setQuery(event.target.value)} /></label>}<details className="agency-quick"><summary><Plus size={17} /> Quick add</summary><div>{quick.map(item => <button key={item.label} onClick={() => quickAdd(item.kind, item.page)}>{item.label}</button>)}</div></details><button className="agency-alert-button" onClick={() => navigate('tasks')} aria-label="Open reminders"><CalendarDays size={18} /><span>{reminders.filter(item => item.status === 'open' && item.dueAt.slice(0, 10) <= today()).length || ''}</span></button><span className="agency-account" title="krafttdigital@gmail.com">KD</span></header>
      <div className={`agency-content ${page === 'dashboard' ? 'agency-dashboard-content' : page === 'documents' ? 'agency-documents-content' : ''}`}>{error && <div role="alert" className="agency-error">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
        <div className="agency-heading"><div><p className="agency-eyebrow">{page === 'dashboard' ? 'Company overview' : routes.find(item => item.page === page)?.group}</p><h1>{headline}</h1></div><span role="status" className="agency-save-status">{status}</span></div>
        {page === 'dashboard' && <>
          <div className="agency-dashboard-tools"><div className="agency-dashboard-actions"><div><strong>Quick actions</strong><span>Keep work moving</span></div><div>{quick.map(item => <button key={item.label} onClick={() => quickAdd(item.kind, item.page)}><Plus size={16} /> {item.label}</button>)}<button onClick={() => navigate('documents')}><FileText size={16} /> Create document</button></div></div>{periodControl('Period')}</div>
          <div className="agency-metrics">{[
            ['Fees collected (excl. tax)', money(finance.fees), 'finance'], ['Expenses paid', money(finance.paidExpenses), 'finance'],
            ['Net cash surplus', money(finance.cashSurplus), 'finance'], ['Outstanding invoices · current', money(finance.outstanding), 'finance'],
            ['Active clients · current', String(visibleClients.length), 'clients'], ['Active team · current', String(members.filter(item => item.active).length), 'team'],
            ['Ongoing projects · current', String(projects.filter(item => item.status === 'ongoing').length), 'projects'],
            ['Overdue tasks · current', String(tasks.filter(item => item.status !== 'done' && item.dueDate && item.dueDate < today()).length), 'tasks'],
          ].map(([label, value, target]) => <button className="agency-metric" key={label} onClick={() => navigate(target as Page)}><span>{label}</span><strong>{value}</strong><ArrowRight size={15} /></button>)}</div>
          <div className="agency-grid-two"><section className="agency-card"><h2>Cash movement</h2><p>Selected period · collected fees exclude tax</p><div className="agency-bars"><span>Fees collected</span><div><i style={{ width: `${finance.fees || finance.paidExpenses ? Math.round(finance.fees / Math.max(finance.fees, finance.paidExpenses) * 100) : 0}%` }} /></div><strong>{money(finance.fees)}</strong><span>Expenses paid</span><div><i className="expense" style={{ width: `${finance.fees || finance.paidExpenses ? Math.round(finance.paidExpenses / Math.max(finance.fees, finance.paidExpenses) * 100) : 0}%` }} /></div><strong>{money(finance.paidExpenses)}</strong></div>{!finance.fees && !finance.paidExpenses && <p className="agency-empty">No cash records for this period. <button onClick={() => quickAdd('payment', 'finance')}>Record payment</button></p>}</section><section className="agency-card"><h2>Lead pipeline</h2><p>{leads.filter(item => stageOutcome(item.stage) === 'open').length} open leads · {money(leads.filter(item => stageOutcome(item.stage) === 'open').reduce((sum, item) => sum + item.value, 0))} estimated value</p><p>Win rate for closed leads this period: {leadWinRate(leads, bounds.from, bounds.to, stages) === null ? '—' : `${Math.round(leadWinRate(leads, bounds.from, bounds.to, stages)! * 100)}%`}</p><button className="agency-text-button" onClick={() => navigate('leads')}>Open leads <ArrowRight size={15} /></button></section></div>
          <div className="agency-grid-two"><section className="agency-card"><h2>Ongoing projects</h2>{projects.filter(item => item.status === 'ongoing').slice(0, 6).map(item => <button key={item.id} className="agency-list-row" onClick={() => { navigate('projects'); setSelectedProject(item.id); }}><span><strong>{item.name}</strong><small>{clientName(item.clientId)} · {memberName(item.ownerId)}</small></span><span>{tasks.filter(task => task.projectId === item.id && task.status === 'done').length}/{tasks.filter(task => task.projectId === item.id).length} tasks</span></button>)}{!projects.some(item => item.status === 'ongoing') && <p className="agency-empty">No ongoing projects. <button onClick={() => quickAdd('project', 'projects')}>Create one</button></p>}</section><AgencyAgenda records={records} today={today()} onOpenTasks={() => navigate('tasks')} /></div>
          <section className="agency-card"><h2>Recent activity</h2>{active<ActivityEvent>(records, 'activityEvent').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(item => <div className="agency-list-row" key={item.id}><span><strong>{activityTitle(item)}</strong><small>{item.action} · {new Date(item.createdAt).toLocaleString('en-IN')}</small></span></div>)}{!records.some(item => item.kind === 'activityEvent') && <p className="agency-empty">Activity appears as records change.</p>}</section>
        </>}
        {page === 'leads' && <>{periodControl('Win-rate period')}<AgencyLeadsView leads={leads} stages={stages} members={members} query={query} from={bounds.from} to={bounds.to} onAdd={() => begin('lead')} onEdit={lead => begin('lead', lead)} onMove={(lead, stage) => void moveLead(lead, stage)} onBulkMove={(selected, stage) => { const ids = new Set(selected.map(item => item.id)); void save(records.map(item => item.kind === 'lead' && ids.has(item.id) ? { ...item, stage, closedAt: stageOutcome(stage) === 'open' ? '' : today(), updatedAt: now() } : item)); }} onImport={() => setImportOpen(true)} onConvert={lead => { if (lead.clientId) { navigate('clients'); setSelectedClient(lead.clientId); } else setConversionLead(lead); }} onFollowUp={lead => void scheduleFollowUp(lead)} onTrash={lead => void trash(lead)} /></>}
        {page === 'clients' && <section className="agency-card"><div className="agency-section-head"><div><h2>Client directory</h2><p>Existing document clients stay linked to their saved documents.</p></div><button className="agency-primary" onClick={() => quickAdd('client', 'clients')}><Plus size={17} /> Add client</button></div><div className="agency-table-wrap"><table><thead><tr><th>Business</th><th>Contact</th><th>Projects</th><th>Invoiced</th><th>Received</th><th>Actions</th></tr></thead><tbody>{visibleClients.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())).map(client => <tr key={client.id}><td><button className="agency-link" onClick={() => setSelectedClient(client.id)}>{client.business}</button></td><td>{client.contact}<small>{client.email}</small></td><td>{projects.filter(item => item.clientId === client.id).length}</td><td>{money(invoices.filter(item => item.clientId === client.id && item.status === 'issued').reduce((sum, item) => sum + item.feeSubtotal - item.discount + item.tax, 0))}</td><td>{money(payments.filter(item => item.clientId === client.id).reduce((sum, item) => sum + item.amount, 0))}</td><td><button onClick={() => beginClient(client)}>Edit</button><button onClick={() => { quickAdd('project', 'projects'); setEditor(value => value ? { ...value, clientId: client.id } : value); }}>New project</button><button onClick={() => { if (window.confirm(`Archive ${client.business}? Documents and finance links stay intact.`)) void archiveClient(client.id, true); }}>Archive</button></td></tr>)}</tbody></table></div>{selectedClient && clients.some(item => item.id === selectedClient) && <AgencyClientDetail client={clients.find(item => item.id === selectedClient)!} records={records} workspace={legacy} onClose={() => setSelectedClient('')} onEdit={() => beginClient(clients.find(item => item.id === selectedClient)!)} onNewProject={() => { const clientId = selectedClient; navigate('projects'); begin('project'); setEditor(value => value ? { ...value, clientId } : value); }} onOpenProject={id => { navigate('projects'); setSelectedProject(id); }} onDocuments={() => { const clientId = selectedClient; navigate('documents'); setDocumentContext({ clientId, projectTitle: '', projectId: '' }); }} />}</section>}
        {page === 'projects' && <AgencyProjectsView projects={projects} clients={clients} tasks={tasks} members={members} retainers={active(records, 'retainer')} invoices={invoices} payments={payments} query={query} onAdd={() => begin('project')} onEdit={project => begin('project', project)} onSelect={setSelectedProject} onTrash={project => void trash(project)} onMove={(project, status) => void changeRecord({ ...project, status })} />}
        {page === 'projects' && selectedProject && projects.some(item => item.id === selectedProject) && <AgencyProjectExtras project={projects.find(item => item.id === selectedProject)!} records={records} clients={clients} workspace={legacy} catalogue={catalogue} onAdd={beginForProject} onEdit={record => begin(record.kind, record)} onBillRetainer={billRetainer} onDocuments={project => { navigate('documents'); setDocumentContext({ clientId: project.clientId, projectTitle: project.name, projectId: project.id }); }} />}
        {page === 'tasks' && <><section className="agency-card"><div className="agency-section-head"><div><h2>Tasks</h2><p>Date-only deadlines use Asia/Kolkata calendar days.</p></div><button className="agency-primary" onClick={() => begin('task')}><Plus size={17} /> Add task</button></div><div className="agency-filters">{(['all', 'today', 'upcoming', 'overdue', 'done'] as const).map(filter => <button className={taskFilter === filter ? 'active' : ''} key={filter} onClick={() => setTaskFilter(filter)}>{filter}</button>)}</div>{filtered(tasks.filter(item => taskFilter === 'done' ? item.status === 'done' : taskFilter === 'overdue' ? item.status !== 'done' && !!item.dueDate && item.dueDate < today() : taskFilter === 'today' ? item.status !== 'done' && item.dueDate === today() : taskFilter === 'upcoming' ? item.status !== 'done' && item.dueDate > today() : true)).map(item => { const task = item as Task; return <div className="agency-list-row" key={task.id}><span><strong>{task.title}</strong><small>{projects.find(project => project.id === task.projectId)?.name || 'General'} · {memberName(task.assigneeId)} · {task.dueDate || 'No due date'}</small></span><div><button onClick={() => void changeRecord({ ...task, status: task.status === 'done' ? 'todo' : 'done' })}>{task.status === 'done' ? 'Reopen' : 'Complete'}</button><button onClick={() => begin('task', task)}>Edit</button><button onClick={() => void trash(task)}>Trash</button></div></div>; })}</section><section className="agency-card"><div className="agency-section-head"><h2>Reminders</h2><button className="agency-small" onClick={() => begin('reminder')}>Add reminder</button></div>{reminders.map(item => <div className="agency-list-row" key={item.id}><span><strong>{item.title}</strong><small>{item.dueAt.slice(0, 16)} · {item.recurrence}</small></span><div><button onClick={() => void completeReminder(item)}>{item.status === 'open' ? 'Done' : 'Reopen'}</button><button onClick={() => void snoozeReminder(item)} disabled={item.status !== 'open'}>Snooze 1 day</button><button onClick={() => void changeRecord({ ...item, status: 'dismissed' })} disabled={item.status !== 'open'}>Dismiss</button><button onClick={() => begin('reminder', item)}>Edit</button></div></div>)}{!reminders.length && <p className="agency-empty">No reminders scheduled. In-app reminders appear here; email notifications are not connected.</p>}</section><AgencyCalendar records={records} /></>}
        {page === 'team' && <section className="agency-card"><div className="agency-section-head"><div><h2>Team</h2><p>Team records do not grant admin login access.</p></div><button className="agency-primary" onClick={() => begin('teamMember')}><Plus size={17} /> Add team member</button></div>{filtered(members).map(item => { const member = item as TeamMember; return <div className="agency-list-row" key={member.id}><span><strong>{member.name}</strong><small>{member.role} · {member.type} · {member.email}</small></span><div><span className="agency-pill">{member.active ? 'Active' : 'Inactive'}</span><button onClick={() => begin('teamMember', member)}>Edit</button></div></div>; })}{!members.length && <p className="agency-empty">No team members yet.</p>}</section>}
        {page === 'finance' && <>{periodControl('Period')}<div className="agency-actions agency-finance-actions"><button onClick={() => begin('invoice')}><Plus size={17} /> Create invoice record</button><button onClick={() => begin('payment')}><Plus size={17} /> Record payment</button><button onClick={() => begin('expense')}><Plus size={17} /> Add expense</button></div><div className="agency-metrics agency-finance-metrics"><div className="agency-metric"><span>Fees collected · period</span><strong>{money(finance.fees)}</strong></div><div className="agency-metric"><span>Expenses paid · period</span><strong>{money(finance.paidExpenses)}</strong></div><div className="agency-metric"><span>Outstanding invoices · current</span><strong>{money(finance.outstanding)}</strong></div><div className="agency-metric"><span>Unapplied receipts · period</span><strong>{money(finance.unapplied)}</strong></div></div><section className="agency-card"><h2>Invoices</h2><p>Generated PDFs stay in Documents. This ledger tracks issued totals and payment allocations.</p><div className="agency-table-wrap"><table><thead><tr><th>Number</th><th>Client</th><th>Fee + tax</th><th>Outstanding</th><th>Status</th><th></th></tr></thead><tbody>{filtered(invoices).map(item => { const invoice = item as Invoice; return <tr key={invoice.id}><td>{invoice.number || 'Draft'}</td><td>{clientName(invoice.clientId)}</td><td>{money(invoice.feeSubtotal - invoice.discount)} + {money(invoice.tax)}</td><td>{money(invoiceBalance(invoice, payments))}</td><td>{invoiceStatus(invoice, payments, today())}</td><td><button onClick={() => begin('invoice', invoice)}>Open</button></td></tr>; })}</tbody></table></div></section><section className="agency-card"><h2>Payments</h2>{filtered(payments).map(item => { const payment = item as Payment; return <div className="agency-list-row" key={payment.id}><span><strong>{money(payment.amount)} · {clientName(payment.clientId)}</strong><small>{payment.receivedAt} · {payment.reference || 'No reference'} · {money(payment.amount - payment.allocations.reduce((sum, row) => sum + row.amount, 0))} unapplied</small></span><button onClick={() => begin('payment', payment)}>Allocate / edit</button></div>; })}</section><section className="agency-card"><h2>Expenses</h2>{filtered(expenses).map(item => { const expense = item as Expense; return <div className="agency-list-row" key={expense.id}><span><strong>{expense.category} · {money(expense.amount)}</strong><small>{expense.date} · {expense.status} {expense.teamMemberId ? `· payout to ${memberName(expense.teamMemberId)}` : ''}</small></span><button onClick={() => begin('expense', expense)}>Edit</button></div>; })}</section></>}
        {page === 'settings' && <AgencyPipelineSettings value={settings} inUse={leads.map(item => item.stage)} onSave={value => save([...records.filter(item => item.kind !== 'settings'), value])} />}
        {(page === 'documents' || page === 'case-studies' || page === 'settings') && <div className="agency-legacy">
          {page !== 'documents' && <p className="agency-legacy-note">Existing Kraftt templates, case study intake, saved records and PDF exports remain available here.</p>}
          <Suspense fallback={<div className="agency-card">Opening document tools…</div>}><ERPWorkspace key={page} catalogue={catalogue} cloud documentTabs={page === 'documents'} historyProjectActions={page === 'documents' ? { links: documentLinks, projects, invoices, error, onLink: (doc, projectId) => void linkDocument(doc, projectId), onAddLedger: (doc, projectId) => void addIssuedInvoice(doc, projectId) } : undefined} initialClientId={documentContext?.clientId} initialProjectTitle={documentContext?.projectTitle} initialView={page === 'case-studies' ? 'case-studies' : page === 'settings' ? 'defaults' : 'quote'} onLogout={onLogout} onWorkspaceSaved={() => void refreshDocuments()} onFinalised={doc => { const projectId = documentContext?.projectId || documentLinks.find(item => item.documentId === doc.id)?.projectId; if (projectId) void linkDocument(doc, projectId); }} /></Suspense>
        </div>}
        {page === 'trash' && <section className="agency-card"><h2>Recently removed</h2><p>Restore a record with its original ID and links.</p>{records.filter(item => !!item.deletedAt).map(item => <div className="agency-list-row" key={item.id}><span><strong>{titleFor(item)}</strong><small>{item.kind} · removed {item.deletedAt?.slice(0, 10)}</small></span><button onClick={() => void changeRecord({ ...item, deletedAt: undefined })}>Restore</button></div>)}{profiles.filter(item => item.status === 'archived').map(item => <div className="agency-list-row" key={item.id}><span><strong>{clientName(item.clientId)}</strong><small>Archived client</small></span><button onClick={() => void archiveClient(item.clientId, false)}>Restore</button></div>)}{!records.some(item => item.deletedAt) && !profiles.some(item => item.status === 'archived') && <p className="agency-empty">Trash is empty.</p>}</section>}
      </div>
    </div>
    {importOpen && <LeadCsvImport existing={leads} stages={stages} onClose={() => setImportOpen(false)} onImport={rows => save([...records, ...rows])} />}
    {conversionLead && <AgencyConvertLead lead={conversionLead} clients={clients} onClose={() => setConversionLead(null)} onConvert={(clientId, createProject) => convert(conversionLead, clientId, createProject)} />}
    {editor && editingKind && <div className="agency-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) { setEditor(null); setEditingKind(null); } }}><section className="agency-modal" role="dialog" aria-modal="true" aria-labelledby="agency-editor-title"><div className="agency-section-head"><div><p className="agency-eyebrow">Kraftt Admin</p><h2 id="agency-editor-title">{editor.id && records.some(item => item.id === editor.id) ? 'Edit' : 'Add'} {editingKind === 'client' ? 'client' : editingKind.replace(/([A-Z])/g, ' $1')}</h2></div><button className="agency-icon-button" onClick={() => { setEditor(null); setEditingKind(null); }} aria-label="Close form"><X size={20} /></button></div>{error && <p className="agency-error" role="alert">{error}</p>}<form onSubmit={event => { event.preventDefault(); void saveEditor(); }}><div className="agency-form-grid">{(editingKind === 'client' ? [
      { key: 'business', label: 'Business name', required: true }, { key: 'contact', label: 'Contact person' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' }, { key: 'address', label: 'Billing address', type: 'textarea' }, { key: 'gstin', label: 'Tax registration, if applicable' }, { key: 'projectTitle', label: 'Default project title' }, { key: 'website', label: 'Website', type: 'url' }, { key: 'notes', label: 'Client notes', type: 'textarea' },
    ] as Field[] : fields[editingKind] || []).map(field => <label key={field.key} className={field.type === 'textarea' ? 'agency-span' : ''}><span>{field.label}</span>{field.type === 'boolean' ? <input type="checkbox" checked={Boolean(editor[field.key])} onChange={event => setEditor({ ...editor, [field.key]: event.target.checked })} /> : field.type === 'textarea' ? <textarea value={String(editor[field.key] || '')} onChange={event => setEditor({ ...editor, [field.key]: event.target.value })} /> : ['select', 'client', 'project', 'member'].includes(field.type || '') ? <select disabled={isIssuedInvoice && ['clientId', 'projectId'].includes(field.key)} required={field.required} value={String(editor[field.key] || '')} onChange={event => setEditor({ ...editor, [field.key]: event.target.value })}><option value="">Choose…</option>{(field.type === 'client' ? clients.map(item => [item.id, item.business]) : field.type === 'project' ? projects.map(item => [item.id, item.name]) : field.type === 'member' ? members.map(item => [item.id, item.name]) : (field.key === 'stage' ? stages.map(item => [item.id, item.name]) : field.options?.map(item => [item, item])) || []).map(([value, label]) => <option key={value} value={value}>{label.replaceAll('_', ' ')}</option>)}</select> : <input disabled={isIssuedInvoice && ['number', 'issuedAt'].includes(field.key)} required={field.required} type={field.type === 'money' ? 'text' : field.type || 'text'} inputMode={field.type === 'money' ? 'decimal' : undefined} value={String(editor[field.key] || '')} onChange={event => setEditor({ ...editor, [field.key]: event.target.value })} />}</label>)}</div>{editingKind === 'task' && <AgencyTaskFields value={editor} onChange={setEditor} />}{editingKind === 'project' && <fieldset className="agency-assignees"><legend>Project team</legend>{members.map(member => <label key={member.id}><input type="checkbox" checked={Array.isArray(editor.assigneeIds) && editor.assigneeIds.includes(member.id)} onChange={event => { const current = Array.isArray(editor.assigneeIds) ? editor.assigneeIds as string[] : []; setEditor({ ...editor, assigneeIds: event.target.checked ? [...current, member.id] : current.filter(id => id !== member.id) }); }} />{member.name}</label>)}{!members.length && <p>Add team members to assign them to this project.</p>}</fieldset>}{editingKind === 'project' && <AgencyProjectServices catalogue={catalogue} selected={Array.isArray(editor.serviceIds) ? editor.serviceIds as string[] : []} onChange={serviceIds => setEditor({ ...editor, serviceIds })} />}{editingKind === 'payment' && <div className="agency-allocation"><h3>Apply to invoices</h3><p>Unallocated money remains client credit. Allocations cannot exceed either balance.</p>{invoices.filter(item => item.clientId === editor.clientId && item.status === 'issued').map(invoice => { const rows = (editor.allocations || []) as Payment['allocations']; const current = rows.find(row => row.invoiceId === invoice.id)?.amount || 0; return <label key={invoice.id}>{invoice.number} · available {money(invoiceBalance(invoice, payments.filter(item => item.id !== editor.id)))}<input type="text" inputMode="decimal" value={current ? amountText(current) : ''} placeholder="0.00" onChange={event => { const next = rows.filter(row => row.invoiceId !== invoice.id); try { if (event.target.value.trim()) next.push({ invoiceId: invoice.id, amount: amountFromDecimal(event.target.value) }); setEditor({ ...editor, allocations: next }); } catch { setError('Enter a valid allocation amount.'); } }} /></label>; })}</div>}{isIssuedInvoice && <InvoiceCorrectionFields value={editor} onChange={setEditor} />}<div className="agency-modal-actions"><button type="button" className="agency-small" onClick={() => { setEditor(null); setEditingKind(null); }}>Cancel</button><button disabled={busy} className="agency-primary" type="submit">{busy ? 'Saving…' : 'Save'}</button></div></form></section></div>}
  </main>;
}
