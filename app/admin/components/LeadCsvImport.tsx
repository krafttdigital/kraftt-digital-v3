'use client';
import { useMemo, useState } from 'react';
import { amountFromDecimal, newId, now, type AgencySettings, type Lead } from '../../../lib/admin-system/model';
import { parseCsv } from '../../../lib/admin-system/csv';

const keys = ['person', 'business', 'email', 'phone', 'stage', 'source', 'value'] as const;
const names: Record<typeof keys[number], string> = { person: 'Contact person', business: 'Business', email: 'Email', phone: 'Phone', stage: 'Stage', source: 'Source', value: 'Estimated value' };
type Mapping = Record<typeof keys[number], number>;
const emptyMapping = (): Mapping => ({ person: -1, business: -1, email: -1, phone: -1, stage: -1, source: -1, value: -1 });
export function LeadCsvImport({ existing, stages, onClose, onImport }: { existing: Lead[]; stages: AgencySettings['pipelineStages']; onClose: () => void; onImport: (rows: Lead[]) => Promise<boolean> }) {
  const [rows, setRows] = useState<string[][]>([]), [mapping, setMapping] = useState<Mapping>(emptyMapping), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const header = rows[0] || [];
  const preview = useMemo(() => {
    const knownEmails = new Set(existing.map(lead => lead.email.trim().toLowerCase()).filter(Boolean));
    const knownPhones = new Set(existing.map(lead => lead.phone.replace(/\D/g, '')).filter(Boolean));
    return rows.slice(1).map((cells, index) => {
      const get = (key: typeof keys[number]) => mapping[key] < 0 ? '' : cells[mapping[key]]?.trim() || '';
      const person = get('person'), business = get('business'), email = get('email'), phone = get('phone');
      const stage = get('stage').toLowerCase() || stages[0]?.id || 'new';
      let reason = !person && !business ? 'Person or business is required' : !email && !phone ? 'Email or phone is required' : !stages.some(item => item.id.toLowerCase() === stage || item.name.toLowerCase() === stage) ? 'Unknown stage' : '';
      const stageId = stages.find(item => item.id.toLowerCase() === stage || item.name.toLowerCase() === stage)?.id || stage;
      const emailKey = email.toLowerCase(), phoneKey = phone.replace(/\D/g, '');
      if (!reason && ((emailKey && knownEmails.has(emailKey)) || (phoneKey && knownPhones.has(phoneKey)))) reason = 'Duplicate email or phone';
      if (emailKey) knownEmails.add(emailKey);
      if (phoneKey) knownPhones.add(phoneKey);
      let value = 0;
      if (!reason && get('value')) try { value = amountFromDecimal(get('value').replace(/[₹,\s]/g, '')); } catch { reason = 'Invalid value'; }
      const timestamp = now();
      const lead: Lead = { id: newId(), kind: 'lead', createdAt: timestamp, updatedAt: timestamp, person, business, email, phone, website: '', interest: '', source: get('source') || 'Other', value, currency: 'INR', stage: stageId, ownerId: '', notes: '', followUpAt: '', clientId: '', projectId: '', closedAt: stages.find(item => item.id === stageId)?.outcome !== 'open' ? timestamp.slice(0, 10) : '' };
      return { line: index + 2, reason, lead };
    });
  }, [rows, mapping, existing, stages]);
  async function select(file?: File) {
    if (!file) return;
    try {
      const parsed = parseCsv(await file.text()); const columns = parsed[0].map(value => value.toLowerCase().replace(/[^a-z]/g, ''));
      const next = emptyMapping();
      for (const key of keys) next[key] = columns.findIndex(column => column === key || column === key.replace('person', 'contact') || column === key.replace('value', 'estimatedvalue'));
      setRows(parsed); setMapping(next); setError('');
    } catch (cause) { setError((cause as Error).message); setRows([]); }
  }
  const valid = preview.filter(row => !row.reason);
  return <div className="agency-modal-backdrop"><section className="agency-modal" role="dialog" aria-modal="true" aria-labelledby="csv-title"><div className="agency-section-head"><div><p className="agency-eyebrow">Leads</p><h2 id="csv-title">Import CSV</h2></div><button className="agency-icon-button" onClick={onClose} aria-label="Close import">×</button></div><p>Map your columns, review invalid or duplicate rows, then import the valid leads.</p><label className="agency-csv-file">Choose CSV file<input type="file" accept=".csv,text/csv" onChange={event => { void select(event.target.files?.[0]); }} /></label>{error && <p className="agency-error" role="alert">{error}</p>}{rows.length > 0 && <><div className="agency-form-grid">{keys.map(key => <label key={key}><span>{names[key]}</span><select value={mapping[key]} onChange={event => setMapping({ ...mapping, [key]: Number(event.target.value) })}><option value={-1}>Skip</option>{header.map((column, index) => <option key={index} value={index}>{column}</option>)}</select></label>)}</div><p>{valid.length} valid · {preview.length - valid.length} skipped</p><div className="agency-table-wrap"><table><thead><tr><th>Row</th><th>Business / person</th><th>Contact</th><th>Result</th></tr></thead><tbody>{preview.slice(0, 20).map(item => <tr key={item.line}><td>{item.line}</td><td>{item.lead.business || item.lead.person}</td><td>{item.lead.email || item.lead.phone}</td><td>{item.reason || 'Ready'}</td></tr>)}</tbody></table></div>{preview.length > 20 && <p>Showing first 20 rows. All rows are validated on import.</p>}<div className="agency-modal-actions"><button className="agency-small" onClick={onClose}>Cancel</button><button className="agency-primary" disabled={!valid.length || busy} onClick={() => { setBusy(true); void onImport(valid.map(item => item.lead)).then(ok => { if (ok) onClose(); }).finally(() => setBusy(false)); }}>{busy ? 'Importing…' : `Import ${valid.length} leads`}</button></div></>}</section></div>;
}
