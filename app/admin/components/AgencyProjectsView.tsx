'use client';

import { useState } from 'react';
import type { Client } from '../../../lib/quotation/model';
import { amountText, invoiceBalance, money, type Invoice, type Payment, type Project, type Retainer, type Task, type TeamMember } from '../../../lib/admin-system/model';
import { csvExport } from '../../../lib/admin-system/csv';

const statuses: Project['status'][] = ['new', 'ongoing', 'on_hold', 'completed', 'cancelled'];
const label = (status: Project['status']) => status.replaceAll('_', ' ');

export function AgencyProjectsView({ projects, clients, tasks, members, retainers, invoices, payments, query, onAdd, onEdit, onSelect, onTrash, onMove }: {
  projects: Project[]; clients: Client[]; tasks: Task[]; members: TeamMember[]; retainers: Retainer[];
  invoices: Invoice[]; payments: Payment[]; query: string;
  onAdd: () => void; onEdit: (project: Project) => void; onSelect: (id: string) => void;
  onTrash: (project: Project) => void; onMove: (project: Project, status: Project['status']) => void;
}) {
  const [view, setView] = useState<'table' | 'board'>('table');
  const [status, setStatus] = useState<Project['status'] | 'all'>('all');
  const filtered = projects.filter(item => (status === 'all' || item.status === status) &&
    `${item.name} ${item.description} ${clients.find(client => client.id === item.clientId)?.business || ''}`.toLowerCase().includes(query.toLowerCase()));
  const name = (id: string) => clients.find(item => item.id === id)?.business || 'Unlinked client';
  const projectProgress = (project: Project) => {
    const relevant = tasks.filter(item => item.projectId === project.id);
    return `${relevant.filter(item => item.status === 'done').length}/${relevant.length}`;
  };
  const received = payments.reduce((sum, item) => sum + item.amount, 0);
  const monthly = retainers.filter(item => item.status === 'active').reduce((sum, item) => sum + (item.frequency === 'yearly' ? Math.round(item.fee / 12) : item.frequency === 'quarterly' ? Math.round(item.fee / 3) : item.fee), 0);
  function exportCsv() {
    const rows = [['Project', 'Client', 'Status', 'Type', 'Pre-tax budget', 'Deadline'],
      ...filtered.map(item => [item.name, name(item.clientId), item.status, item.type, amountText(item.budget), item.deadline])];
    const url = URL.createObjectURL(new Blob([csvExport(rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'kraftt-projects.csv'; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="agency-card">
    <div className="agency-section-head"><div><h2>Projects</h2><p>Work progress and invoice payments are shown separately.</p></div><div><button className="agency-small" onClick={() => setView(view === 'table' ? 'board' : 'table')}>{view === 'table' ? 'Board view' : 'Table view'}</button><button className="agency-small" onClick={exportCsv}>Export CSV</button><button className="agency-primary" onClick={onAdd}>+ Create project</button></div></div>
    <div className="agency-detail-stats agency-project-summary"><span>Ongoing<strong>{projects.filter(item => item.status === 'ongoing').length}</strong></span><span>One-off agreed · pre-tax<strong>{money(projects.filter(item => item.type === 'one_off').reduce((sum, item) => sum + item.budget, 0))}</strong></span><span>Receipts · gross<strong>{money(received)}</strong></span><span>Active retainer value · monthly equivalent<strong>{money(monthly)}</strong></span></div>
    <div className="agency-filters" aria-label="Filter projects">{(['all', ...statuses] as const).map(item => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{label(item as Project['status'])}</button>)}</div>
    {view === 'table' ? <div className="agency-table-wrap"><table><thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Deadline</th><th>Tasks</th><th>Agreed / invoiced</th><th>Actions</th></tr></thead><tbody>{filtered.map(project => {
      const relevant = invoices.filter(item => item.projectId === project.id && item.status === 'issued');
      const outstanding = relevant.reduce((sum, item) => sum + invoiceBalance(item, payments), 0);
      return <tr key={project.id}><td><button className="agency-link" onClick={() => onSelect(project.id)}>{project.name}</button><small>{project.description || (project.type === 'retainer' ? 'Retainer project' : 'One-off project')}</small></td><td>{name(project.clientId)}</td><td><select aria-label={`Status for ${project.name}`} value={project.status} onChange={event => onMove(project, event.target.value as Project['status'])}>{statuses.map(item => <option key={item} value={item}>{label(item)}</option>)}</select></td><td>{project.deadline || '—'}</td><td>{projectProgress(project)}</td><td>{project.type === 'one_off' ? money(project.budget) : 'Retainer'}<small>{money(outstanding)} invoice balance · incl. tax</small></td><td><button onClick={() => onEdit(project)}>Edit</button><button onClick={() => onTrash(project)}>Trash</button></td></tr>;
    })}</tbody></table></div> : <div className="agency-board agency-project-board">{statuses.map(column => <div className="agency-column" key={column} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const project = projects.find(item => item.id === event.dataTransfer.getData('text/plain')); if (project) onMove(project, column); }}><h3>{label(column)}</h3>{filtered.filter(item => item.status === column).map(project => <article draggable key={project.id} onDragStart={event => event.dataTransfer.setData('text/plain', project.id)}><button className="agency-link" onClick={() => onSelect(project.id)}>{project.name}</button><small>{name(project.clientId)} · {project.deadline || 'No deadline'}</small><small>{members.find(item => item.id === project.ownerId)?.name || 'Unassigned'} · {projectProgress(project)} tasks done</small><select aria-label={`Move ${project.name}`} value={project.status} onChange={event => onMove(project, event.target.value as Project['status'])}>{statuses.map(item => <option key={item} value={item}>{label(item)}</option>)}</select></article>)}</div>)}</div>}
    {!filtered.length && <p className="agency-empty">No projects match this view. Create a project or clear the filter.</p>}
  </section>;
}
