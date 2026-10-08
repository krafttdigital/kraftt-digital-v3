'use client';
import { reportFieldsFor, reportValue } from '../../../lib/documents/report-template';
import type { BusinessDocument } from '../../../lib/documents/model';
import { Field, TextField } from './Fields';
export function ReportFields({ document: doc, onChange, activePart }: { activePart?: string; document: BusinessDocument; onChange: (doc: BusinessDocument) => void }) {
  const reportFields = reportFieldsFor(doc);
  const set = (key: string, value: string) => onChange({ ...doc, fields: doc.fields.map(f => f.placeholder === key ? { ...f, value } : f) });
  return <><div hidden={activePart==='client'}><p className="admin-help">Enter verified metrics for the same reporting period. State the reporting basis for each source (for example, Search Console impressions/clicks and GA4 sessions). Enter CTR and scroll depth as percentages, active time with units, and one item per line for ranked lists.</p>{[...new Set(reportFields.map(f => f.group))].filter(group=>!activePart||activePart===group).map(group => <details className="admin-detail-card" key={group} open><summary>{group}</summary><div className="admin-detail-inner">{reportFields.filter(f => f.group === group).map(spec => 'type' in spec ? <Field key={spec.key} label={`${spec.label} · {{${spec.key}}}`} type={spec.type === 'short' ? 'text' : 'number'} value={reportValue(doc, spec.key)} onChange={value => set(spec.key, value)} /> : <TextField key={spec.key} label={`${spec.label} · {{${spec.key}}}`} value={reportValue(doc, spec.key)} rows={4} onChange={value => set(spec.key, value)} />)}</div></details>)}</div></>;
}
