'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { auditFields, auditValue, auditExtras } from '../../../lib/documents/audit-template';
import type { BusinessDocument } from '../../../lib/documents/model';
import { uid } from '../../../lib/quotation/model';
import { Field, TextField, Check } from './Fields';

export function AuditFields({ document: doc, onChange, activePart }: { activePart?: string; document: BusinessDocument; onChange: (doc: BusinessDocument) => void }) {
  const [error, setError] = useState('');
  const latest = useRef(doc); useEffect(() => { latest.current = doc; }, [doc]);
  const set = (key: string, value: string) => onChange({ ...doc, fields: doc.fields.map(f => f.placeholder === key ? { ...f, value } : f) });
  const scores = auditValue(doc, 'INCLUDE_SCORES') !== '0';
  async function upload(id: string, file?: File) {
    if (!file) return; setError('');
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8000000) throw new Error('Choose a PNG, JPG or WebP image under 8 MB.');
      const bitmap = await createImageBitmap(file);
      try {
        if (bitmap.width * bitmap.height > 36000000) throw new Error('Use an evidence image below 36 megapixels.');
        const canvas = window.document.createElement('canvas'); const ratio = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio);
        const context = canvas.getContext('2d'); if (!context) throw new Error('Evidence image processing is unavailable.');
        context.fillStyle = '#FFFFFF'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        let quality = .85, data = canvas.toDataURL('image/jpeg', quality);
        while (data.length > 400000 && quality > .25) { quality -= .1; data = canvas.toDataURL('image/jpeg', quality); }
        if (data.length > 400000) throw new Error('Crop or resize this image before uploading.');
        const current = latest.current, key = `AUDIT_EXTRA_${id}_IMAGE`;
        if (current.id !== doc.id || current.status === 'finalised' || !current.fields.some(f => f.placeholder === key)) return;
        onChange({ ...current, fields: current.fields.map(f => f.placeholder === key ? { ...f, value: data } : f) });
      } finally { bitmap.close(); }
    } catch (cause) { setError((cause as Error).message); }
  }
  return <><div hidden={!!activePart && activePart!=='settings'}><p className="admin-help">Fill verified observations from your discovery and review. Scores are manual assessments; no findings or scores are generated automatically.</p>
    <Check label="Include readiness scores" checked={scores} onChange={checked => set('INCLUDE_SCORES', checked ? '1' : '0')} /></div>{activePart==='Readiness'&&!scores&&<p className="admin-help">Readiness scores are switched off. Enable them in Audit settings to edit this section.</p>}
    {[...new Set(auditFields.map(f => f.group))].filter(group => (!activePart || activePart===group) && (scores || group !== 'Readiness')).map(group => <details className="admin-detail-card" key={group} open><summary>{group}</summary><div className="admin-detail-inner">{auditFields.filter(f => f.group === group).map(spec => spec.type ? <Field key={spec.key} label={`${spec.label} · {{${spec.key}}}`} type={spec.type === 'score' ? 'number' : 'text'} maxLength={180} value={auditValue(doc, spec.key)} onChange={value => set(spec.key, value)} /> : <TextField key={spec.key} label={`${spec.label}${spec.optional ? ' (optional)' : ''} · {{${spec.key}}}`} rows={3} value={auditValue(doc, spec.key)} onChange={value => set(spec.key, value)} />)}</div></details>)}
    <div hidden={!!activePart && activePart!=='evidence'}><h3>Additional findings &amp; visual evidence</h3><p className="admin-help">Add website, search, brand, conversion, social, operations or application findings as needed. Each becomes an additional audit section. Images and notes are saved with this document.</p>
    {auditExtras(doc).map((extra, index) => <details key={extra.id} className="admin-detail-card" open><summary>Finding {index + 1}: {extra.title || 'New finding'}</summary><div className="admin-detail-inner"><Field label="Finding title" value={extra.title} onChange={value => set(`AUDIT_EXTRA_${extra.id}_TITLE`, value)} /><TextField label="Observations, business impact and recommendation" value={extra.body} rows={6} onChange={value => set(`AUDIT_EXTRA_${extra.id}_BODY`, value)} /><TextField label="Evidence source, URL, review date or image caption (optional)" value={extra.source} onChange={value => set(`AUDIT_EXTRA_${extra.id}_SOURCE`, value)} /><label className="admin-field"><span>Evidence image / visual direction (optional)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => void upload(extra.id, event.target.files?.[0])} /></label>{extra.image && <><Image src={extra.image} alt={extra.title || 'Audit evidence'} width={1400} height={900} unoptimized style={{ width: '100%', height: 'auto' }} /><button className="admin-small-button" onClick={() => set(`AUDIT_EXTRA_${extra.id}_IMAGE`, '')}>Remove image</button></>}<button className="admin-small-button" onClick={() => onChange({ ...doc, fields: doc.fields.filter(f => !f.placeholder.startsWith(`AUDIT_EXTRA_${extra.id}_`)) })}>Remove finding</button></div></details>)}
    <button className="admin-small-button" disabled={doc.fields.length > 396} onClick={() => { const id = uid(); onChange({ ...doc, fields: [...doc.fields, ...['TITLE', 'BODY', 'SOURCE', 'IMAGE'].map(key => ({ id: uid(), label: key, placeholder: `AUDIT_EXTRA_${id}_${key}`, value: '' }))] }); }}>+ Add finding / evidence page</button>{error && <p className="admin-help admin-error" role="alert">{error}</p>}
  </div></>;
}
