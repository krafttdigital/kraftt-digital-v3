'use client';

import { useState } from 'react';
import type { Client } from '../../../lib/quotation/model';
import type { Lead } from '../../../lib/admin-system/model';

export function AgencyConvertLead({ lead, clients, onClose, onConvert }: {
  lead: Lead; clients: Client[]; onClose: () => void;
  onConvert: (clientId: string, createProject: boolean) => Promise<boolean>;
}) {
  const [clientId, setClientId] = useState(''), [createProject, setCreateProject] = useState(false), [busy, setBusy] = useState(false);
  return <div className="agency-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="agency-modal agency-convert-modal" role="dialog" aria-modal="true" aria-labelledby="agency-convert-title">
    <div className="agency-section-head"><div><p className="agency-eyebrow">Won lead</p><h2 id="agency-convert-title">Convert {lead.business || lead.person}</h2></div><button className="agency-icon-button" aria-label="Close conversion" onClick={onClose}>×</button></div>
    <p>Use an existing client or create one from this lead. The original lead stays linked.</p>
    <label className="agency-convert-choice">Client<select value={clientId} onChange={event => setClientId(event.target.value)}><option value="">Create a new client</option>{clients.map(item => <option key={item.id} value={item.id}>{item.business}</option>)}</select></label>
    <label className="agency-convert-check"><input type="checkbox" checked={createProject} onChange={event => setCreateProject(event.target.checked)} />Create a project using this lead’s estimated value as the initial pre-tax budget</label>
    <p className="agency-help">Review the project budget and scope before treating it as agreed.</p>
    <div className="agency-modal-actions"><button className="agency-small" onClick={onClose}>Cancel</button><button className="agency-primary" disabled={busy} onClick={() => { setBusy(true); void onConvert(clientId, createProject).then(ok => { if (ok) onClose(); }).finally(() => setBusy(false)); }}>{busy ? 'Converting…' : 'Convert lead'}</button></div>
  </section></div>;
}
