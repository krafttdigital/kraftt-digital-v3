'use client';

import { amountText, type Invoice } from '../../../lib/admin-system/model';

export function InvoiceCorrectionFields({ value, onChange }: { value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void }) {
  const corrections = (value.corrections || []) as NonNullable<Invoice['corrections']>;
  return <section className="agency-correction">
    <strong>Correct this issued invoice</strong>
    <p>Amounts and due date can be corrected. Each change is recorded with the previous values and a reason. The client, invoice number and issue date stay fixed.</p>
    {Boolean(value.documentId) && <p className="agency-correction-warning">This only corrects the finance ledger. The previously issued PDF stays unchanged; issue a corrected document separately.</p>}
    <label>Reason for correction<textarea required maxLength={500} value={String(value.correctionReason || '')} onChange={event => onChange({ ...value, correctionReason: event.target.value })} placeholder="What was incorrect?" /></label>
    {corrections.length > 0 && <details><summary>Correction history ({corrections.length})</summary>{corrections.slice().reverse().map((item, index) => <p key={`${item.at}-${index}`}><strong>{new Date(item.at).toLocaleString('en-IN')}</strong> · {item.reason}<br />Previous: ₹{amountText(item.before.feeSubtotal - item.before.discount + item.before.tax)} · due {item.before.dueDate || 'not set'}</p>)}</details>}
  </section>;
}
