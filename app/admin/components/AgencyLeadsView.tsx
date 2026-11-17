'use client';

import { useState } from 'react';
import { amountText, leadWinRate, money, type AgencySettings, type Lead, type TeamMember } from '../../../lib/admin-system/model';
import { csvExport } from '../../../lib/admin-system/csv';

type Filters = { stage: string; source: string; owner: string; followUp: 'all' | 'overdue' | 'today' | 'scheduled'; minValue: string };
const initialFilters: Filters = { stage: '', source: '', owner: '', followUp: 'all', minValue: '' };
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export function AgencyLeadsView({ leads, stages, members, query, from, to, onAdd, onEdit, onMove, onBulkMove, onImport, onConvert, onFollowUp, onTrash }: {
  leads: Lead[]; stages: AgencySettings['pipelineStages']; members: TeamMember[];
  query: string; from: string; to: string;
  onAdd: () => void; onEdit: (lead: Lead) => void; onMove: (lead: Lead, stage: string) => void;
  onBulkMove: (leads: Lead[], stage: string) => void; onImport: () => void;
  onConvert: (lead: Lead) => void; onFollowUp: (lead: Lead) => void; onTrash: (lead: Lead) => void;
}) {
  const [view, setView] = useState<'table' | 'board'>('table');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selection, setSelection] = useState<string[]>([]);
  const [bulkStage, setBulkStage] = useState('');
  const outcome = (stage: string) => stages.find(item => item.id === stage)?.outcome || 'open';
  const open = leads.filter(item => outcome(item.stage) === 'open');
  const won = leads.filter(item => outcome(item.stage) === 'won' && item.closedAt >= from && item.closedAt <= to).length;
  const rate = leadWinRate(leads, from, to, stages);
  const filtered = leads.filter(item => {
    if (filters.stage && item.stage !== filters.stage) return false;
    if (filters.source && item.source !== filters.source) return false;
    if (filters.owner && item.ownerId !== filters.owner) return false;
    if (filters.followUp === 'overdue' && !(item.followUpAt && item.followUpAt.slice(0, 10) < today())) return false;
    if (filters.followUp === 'today' && item.followUpAt.slice(0, 10) !== today()) return false;
    if (filters.followUp === 'scheduled' && !item.followUpAt) return false;
    if (filters.minValue && item.value < Math.round(Number(filters.minValue) * 100)) return false;
    return `${item.person} ${item.business} ${item.email} ${item.phone}`.toLowerCase().includes(query.toLowerCase());
  });
  const selectedLeads = leads.filter(item => selection.includes(item.id));
  function exportCsv() {
    const rows = [['Person', 'Business', 'Email', 'Phone', 'Stage', 'Source', 'Owner', 'Estimated value', 'Follow-up'], ...filtered.map(item => [item.person, item.business, item.email, item.phone, stages.find(stage => stage.id === item.stage)?.name || item.stage, item.source, members.find(member => member.id === item.ownerId)?.name || '', amountText(item.value), item.followUpAt])];
    const url = URL.createObjectURL(new Blob([csvExport(rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'kraftt-leads.csv'; link.click(); URL.revokeObjectURL(url);
  }
  const toggle = (id: string) => setSelection(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  return <section className="agency-card">
    <div className="agency-section-head"><div><h2>Lead pipeline</h2><p>Follow each enquiry from first contact to decision.</p></div><div><button className="agency-small" onClick={() => setView(view === 'table' ? 'board' : 'table')}>{view === 'table' ? 'Board view' : 'Table view'}</button><button className="agency-small" onClick={exportCsv}>Export CSV</button><button className="agency-small" onClick={onImport}>Import CSV</button><button className="agency-primary" onClick={onAdd}>+ Add lead</button></div></div>
    <div className="agency-detail-stats agency-project-summary"><span>Open leads · current<strong>{open.length}</strong></span><span>Open pipeline value · estimate<strong>{money(open.reduce((sum, item) => sum + item.value, 0))}</strong></span><span>Won · selected period<strong>{won}</strong></span><span>Win rate · closed in period<strong>{rate === null ? '—' : `${Math.round(rate * 100)}%`}</strong></span></div>
    <div className="agency-filters agency-lead-filters"><select aria-label="Filter by stage" value={filters.stage} onChange={event => setFilters({ ...filters, stage: event.target.value })}><option value="">All stages</option>{stages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="Filter by source" value={filters.source} onChange={event => setFilters({ ...filters, source: event.target.value })}><option value="">All sources</option>{[...new Set(leads.map(item => item.source).filter(Boolean))].map(item => <option key={item}>{item}</option>)}</select><select aria-label="Filter by owner" value={filters.owner} onChange={event => setFilters({ ...filters, owner: event.target.value })}><option value="">All owners</option>{members.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label="Filter by follow-up" value={filters.followUp} onChange={event => setFilters({ ...filters, followUp: event.target.value as Filters['followUp'] })}><option value="all">Any follow-up</option><option value="overdue">Overdue</option><option value="today">Today</option><option value="scheduled">Scheduled</option></select><input aria-label="Minimum estimated value in rupees" type="number" min="0" placeholder="Min value ₹" value={filters.minValue} onChange={event => setFilters({ ...filters, minValue: event.target.value })} /><button onClick={() => setFilters(initialFilters)}>Clear filters</button></div>
    {selection.length > 0 && <div className="agency-bulk"><strong>{selection.length} selected</strong><select aria-label="Bulk move to stage" value={bulkStage} onChange={event => setBulkStage(event.target.value)}><option value="">Move to stage…</option>{stages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={!bulkStage} onClick={() => { onBulkMove(selectedLeads, bulkStage); setSelection([]); setBulkStage(''); }}>Apply</button><button onClick={() => setSelection([])}>Clear selection</button></div>}
    {view === 'table' ? <div className="agency-table-wrap"><table><thead><tr><th><input aria-label="Select visible leads" type="checkbox" checked={filtered.length > 0 && filtered.every(item => selection.includes(item.id))} onChange={event => setSelection(event.target.checked ? [...new Set([...selection, ...filtered.map(item => item.id)])] : selection.filter(id => !filtered.some(item => item.id === id)))} /></th><th>Business / contact</th><th>Stage</th><th>Source / owner</th><th>Value</th><th>Follow-up</th><th>Actions</th></tr></thead><tbody>{filtered.map(lead => <tr key={lead.id}><td><input aria-label={`Select ${lead.business || lead.person}`} type="checkbox" checked={selection.includes(lead.id)} onChange={() => toggle(lead.id)} /></td><td><strong>{lead.business || lead.person}</strong><small>{lead.person} · {lead.email || lead.phone}</small></td><td><select aria-label={`Stage for ${lead.business || lead.person}`} value={lead.stage} onChange={event => onMove(lead, event.target.value)}>{stages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td><td>{lead.source}<small>{members.find(item => item.id === lead.ownerId)?.name || 'Unassigned'}</small></td><td>{money(lead.value)}</td><td className={lead.followUpAt && lead.followUpAt.slice(0, 10) < today() ? 'agency-status-warn' : ''}>{lead.followUpAt ? lead.followUpAt.slice(0, 16) : '—'}</td><td><button onClick={() => onEdit(lead)}>Edit</button><button onClick={() => onFollowUp(lead)}>Follow up</button>{outcome(lead.stage) === 'won' && <button onClick={() => onConvert(lead)}>{lead.clientId ? 'Client' : 'Convert'}</button>}{lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a>}<button onClick={() => onTrash(lead)}>Trash</button></td></tr>)}</tbody></table></div> : <div className="agency-board">{stages.map(stage => <div className="agency-column" key={stage.id} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const lead = leads.find(item => item.id === event.dataTransfer.getData('text/plain')); if (lead) onMove(lead, stage.id); }}><h3>{stage.name}</h3>{filtered.filter(item => item.stage === stage.id).map(lead => <article draggable key={lead.id} onDragStart={event => event.dataTransfer.setData('text/plain', lead.id)}><strong>{lead.business || lead.person}</strong><small>{lead.person} · {money(lead.value)}</small><small>{lead.source} · {members.find(item => item.id === lead.ownerId)?.name || 'Unassigned'}</small><small>{lead.followUpAt ? `Follow-up ${lead.followUpAt.slice(0, 16)}` : 'No follow-up'}</small><select aria-label={`Move ${lead.business || lead.person}`} value={lead.stage} onChange={event => onMove(lead, event.target.value)}>{stages.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button onClick={() => onEdit(lead)}>Edit</button><button onClick={() => onFollowUp(lead)}>Follow up</button></article>)}</div>)}</div>}
    {!filtered.length && <p className="agency-empty">No leads match this view. Add a lead or clear the filters.</p>}
  </section>;
}
