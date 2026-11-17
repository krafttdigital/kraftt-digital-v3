'use client';

import { useState } from 'react';
import type { Client, Workspace } from '../../../lib/quotation/model';
import { active, invoiceBalance, money, type AgencyRecord, type ClientProfile, type Invoice, type Meeting, type Payment, type Project, type Retainer } from '../../../lib/admin-system/model';

type Tab = 'overview' | 'projects' | 'retainers' | 'documents' | 'meetings' | 'portal';

export function AgencyClientDetail({ client, records, workspace, onClose, onEdit, onNewProject, onOpenProject, onDocuments }: {
  client: Client; records: AgencyRecord[]; workspace: Workspace | null;
  onClose: () => void; onEdit: () => void; onNewProject: () => void;
  onOpenProject: (id: string) => void; onDocuments: () => void;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const projects = active<Project>(records, 'project').filter(item => item.clientId === client.id);
  const profile = active<ClientProfile>(records, 'clientProfile').find(item => item.clientId === client.id);
  const retainers = active<Retainer>(records, 'retainer').filter(item => item.clientId === client.id);
  const invoices = active<Invoice>(records, 'invoice').filter(item => item.clientId === client.id);
  const payments = active<Payment>(records, 'payment').filter(item => item.clientId === client.id);
  const meetings = active<Meeting>(records, 'meeting').filter(item => item.clientId === client.id);
  const documents = [...(workspace?.documents || []), ...(workspace?.quotations || [])].filter(item => item.client.id === client.id);
  const issued = invoices.filter(item => item.status === 'issued');
  const invoiced = issued.reduce((sum, item) => sum + item.feeSubtotal - item.discount + item.tax, 0);
  const received = payments.reduce((sum, item) => sum + item.amount, 0);
  const outstanding = issued.reduce((sum, item) => sum + invoiceBalance(item, payments), 0);
  const budget = projects.filter(item => item.type === 'one_off').reduce((sum, item) => sum + item.budget, 0);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'projects', label: 'Projects' },
    { id: 'retainers', label: 'Retainers' }, { id: 'documents', label: 'Documents & payments' },
    { id: 'meetings', label: 'Meetings' }, { id: 'portal', label: 'Client portal preview' },
  ];
  return <section className="agency-detail agency-client-detail" aria-label={`${client.business} details`}>
    <button className="agency-close" onClick={onClose} aria-label="Close client details">×</button>
    <p className="agency-eyebrow">Client</p><h2>{client.business}</h2>
    <p>{client.contact || 'No contact person'} · {client.email || client.phone || 'No contact details'}</p>
    <div className="agency-actions"><button onClick={onNewProject}>+ New project</button><button onClick={onDocuments}>Create document</button><button onClick={onEdit}>Edit client</button></div>
    <div className="agency-detail-stats"><span>Agreed one-off value · pre-tax<strong>{money(budget)}</strong></span><span>Invoiced · incl. tax<strong>{money(invoiced)}</strong></span><span>Receipts · gross<strong>{money(received)}</strong></span><span>Outstanding · incl. tax<strong>{money(outstanding)}</strong></span></div>
    <div className="agency-filters" role="tablist" aria-label="Client details">{tabs.map(item => <button key={item.id} role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>
    {tab === 'overview' && <div><h3>Contact</h3><p>{client.contact || 'No contact person'}<br />{client.email || 'No email'} · {client.phone || 'No phone'}<br />{client.address || 'No billing address'}<br />{profile?.website || 'No website'}</p>{profile?.notes && <><h3>Internal notes</h3><p>{profile.notes}</p></>}<h3>At a glance</h3><p>{projects.length} projects · {retainers.filter(item => item.status === 'active').length} active retainers · {meetings.length} meetings</p></div>}
    {tab === 'projects' && <div>{projects.map(item => <button className="agency-list-row" key={item.id} onClick={() => onOpenProject(item.id)}><span><strong>{item.name}</strong><small>{item.status.replaceAll('_', ' ')} · {item.deadline || 'No deadline'}</small></span><span>{item.type === 'one_off' ? money(item.budget) : 'Retainer'}</span></button>)}{!projects.length && <p className="agency-empty">No projects linked yet.</p>}</div>}
    {tab === 'retainers' && <div>{retainers.map(item => <div className="agency-list-row" key={item.id}><span><strong>{item.scope || 'Retainer'}</strong><small>{item.status} · billing day {item.cycleDay} · from {item.startDate}{item.endDate ? ` to ${item.endDate}` : ''}</small></span><span>{money(item.fee)} / {item.frequency}</span></div>)}{!retainers.length && <p className="agency-empty">No retainers linked yet. Add one from a project.</p>}</div>}
    {tab === 'documents' && <div><div className="agency-actions"><button onClick={onDocuments}>Open document generators</button></div>{documents.map(item => <div className="agency-list-row" key={item.id}><span><strong>{item.number}</strong><small>{'kind' in item ? item.kind : 'Quote & Terms'} · {item.status}</small></span></div>)}{!documents.length && <p className="agency-empty">No saved documents for this client.</p>}<h3>Invoice ledger</h3>{invoices.map(item => <div className="agency-list-row" key={item.id}><span><strong>{item.number}</strong><small>{item.status} · due {item.dueDate || 'not set'}</small></span><span>{money(invoiceBalance(item, payments))} due</span></div>)}{!invoices.length && <p className="agency-empty">No invoice ledger records.</p>}</div>}
    {tab === 'meetings' && <div>{meetings.map(item => <div className="agency-list-row" key={item.id}><span><strong>{item.title}</strong><small>{item.startsAt || 'Time not set'} · {item.notes || 'No notes'}</small></span>{item.link && <a href={item.link} target="_blank" rel="noreferrer">Open link</a>}</div>)}{!meetings.length && <p className="agency-empty">No meetings recorded. Schedule from a project.</p>}</div>}
    {tab === 'portal' && <div className="agency-portal-notice"><strong>Private portal preview only</strong><p>A live client login and private file delivery require separate client-scoped authentication and storage. This preview does not grant access or send invitations.</p></div>}
  </section>;
}
