'use client';
import { useState } from 'react';
import { newId, now, type AgencySettings } from '../../../lib/admin-system/model';

export const defaultStages: AgencySettings['pipelineStages'] = [
  { id: 'new', name: 'New', outcome: 'open', order: 0 },
  { id: 'contacted', name: 'Contacted', outcome: 'open', order: 1 },
  { id: 'qualified', name: 'Qualified', outcome: 'open', order: 2 },
  { id: 'won', name: 'Won', outcome: 'won', order: 3 },
  { id: 'lost', name: 'Lost', outcome: 'lost', order: 4 },
];
export function AgencyPipelineSettings({ value, inUse, onSave }: { value?: AgencySettings; inUse: string[]; onSave: (next: AgencySettings) => Promise<boolean> }) {
  const [rows, setRows] = useState(value?.pipelineStages || defaultStages), [busy, setBusy] = useState(false), [error, setError] = useState('');
  function update(index: number, patch: Partial<AgencySettings['pipelineStages'][number]>) { setRows(rows.map((row, i) => i === index ? { ...row, ...patch } : row)); }
  async function save() {
    const names = rows.map(row => row.name.trim().toLowerCase());
    if (rows.some(row => !row.name.trim()) || new Set(names).size !== rows.length || !rows.some(row => row.outcome === 'won') || !rows.some(row => row.outcome === 'lost')) { setError('Use unique names and include at least one Won and one Lost outcome.'); return; }
    const timestamp = now();
    const next: AgencySettings = { id: value?.id || newId(), kind: 'settings', createdAt: value?.createdAt || timestamp, updatedAt: timestamp, timezone: 'Asia/Kolkata', currency: 'INR', pipelineStages: rows.map((row, order) => ({ ...row, name: row.name.trim(), order })) };
    setBusy(true); try { if (await onSave(next)) setError(''); } finally { setBusy(false); }
  }
  return <section className="agency-card"><div className="agency-section-head"><div><h2>Lead stages</h2><p>Each stage maps to an open, won or lost outcome. Closed-period win rate uses this mapping.</p></div><button className="agency-primary" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save stages'}</button></div>{error && <p className="agency-error" role="alert">{error}</p>}{rows.map((row, index) => <div className="agency-stage-row" key={row.id}><span>{String(index + 1).padStart(2, '0')}</span><input aria-label={`Stage ${index + 1} name`} value={row.name} onChange={event => update(index, { name: event.target.value })} /><select aria-label={`Outcome for ${row.name}`} value={row.outcome} onChange={event => update(index, { outcome: event.target.value as typeof row.outcome })}><option value="open">Open</option><option value="won">Won</option><option value="lost">Lost</option></select><button disabled={index === 0} onClick={() => setRows(rows.map((item, i) => i === index ? rows[index - 1] : i === index - 1 ? row : item))} aria-label={`Move ${row.name} up`}>↑</button><button disabled={index === rows.length - 1} onClick={() => setRows(rows.map((item, i) => i === index ? rows[index + 1] : i === index + 1 ? row : item))} aria-label={`Move ${row.name} down`}>↓</button><button disabled={inUse.includes(row.id)} onClick={() => setRows(rows.filter(item => item.id !== row.id))} aria-label={`Remove ${row.name}`}>×</button></div>)}<button className="agency-small" onClick={() => setRows([...rows, { id: newId(), name: 'New stage', outcome: 'open', order: rows.length }])}>+ Add stage</button><p className="agency-help">Stages used by existing leads cannot be removed. Reassign those leads first.</p></section>;
}
