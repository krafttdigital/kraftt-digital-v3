import type { Invoice } from './model';

const identity = ['clientId', 'projectId', 'documentId', 'number', 'issuedAt', 'currency', 'retainerCycle'] as const;
const correctable = ['dueDate', 'feeSubtotal', 'discount', 'tax', 'status'] as const;

export function correctIssuedInvoice(old: Invoice, proposed: Invoice & { correctionReason?: string }, at: string): Invoice {
  if (old.status !== 'issued') throw new Error('Only issued invoices can be corrected.');
  if (identity.some(key => proposed[key] !== old[key])) throw new Error('Issued invoice identity is fixed. Create a replacement invoice to change its client or number.');
  if (proposed.status !== 'issued' && proposed.status !== 'void') throw new Error('An issued invoice cannot return to draft.');
  const { correctionReason, ...invoice } = proposed;
  const changed = correctable.some(key => invoice[key] !== old[key]);
  if (!changed) return { ...invoice, corrections: old.corrections || [] };
  const reason = correctionReason?.trim();
  if (!reason || reason.length > 500) throw new Error('Enter a correction reason of up to 500 characters.');
  if ((old.corrections?.length || 0) >= 100) throw new Error('This invoice has reached the correction history limit.');
  return {
    ...invoice,
    corrections: [...(old.corrections || []), {
      at,
      reason,
      before: { dueDate: old.dueDate, feeSubtotal: old.feeSubtotal, discount: old.discount, tax: old.tax, status: old.status },
    }],
  };
}
