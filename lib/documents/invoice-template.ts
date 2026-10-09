import { decimal, uid, type Brand } from '../quotation/model';
import type { BusinessDocument, DocumentField } from './model';

export type InvoiceItem = { id: string; service: string; scope: string; amount: string };
export const invoiceValue = (doc: BusinessDocument, key: string) => doc.fields.find(field => field.placeholder === key)?.value || '';
export const invoiceAgreement = 'Payment is due by {{DUE_DATE}} unless another written schedule is approved. Work, launch, support, access transfer or final file release may pause if payment is delayed. This invoice is issued for the approved scope; GST, TDS, bank charges or platform charges apply only where agreed and applicable.';
export function createInvoiceFields(brand: Brand): DocumentField[] {
  return Object.entries({ SCOPE_LABEL: '', DUE_DATE: '', FROM_NAME: brand.signatory || brand.company, FROM_EMAIL: brand.email, FROM_PHONE: brand.phone, FROM_ADDRESS: brand.address, PAYMENT_METHOD: 'UPI / Bank Transfer', UPI_ID: '', ACCOUNT_NAME: '', BANK_DETAILS: '', TAX_MODE: 'none', TAX_RATE: '0', PAYMENT_AGREEMENT: invoiceAgreement, INVOICE_ITEM_1: JSON.stringify({ id: uid(), service: '', scope: '', amount: '' }) }).map(([placeholder, value]) => ({ id: uid(), label: placeholder, placeholder, value }));
}
export function setInvoiceValue(doc: BusinessDocument, key: string, value: string): BusinessDocument {
  return { ...doc, fields: doc.fields.some(field => field.placeholder === key) ? doc.fields.map(field => field.placeholder === key ? { ...field, value } : field) : [...doc.fields, { id: uid(), label: key, placeholder: key, value }] };
}
export function invoiceItems(doc: BusinessDocument): InvoiceItem[] {
  return doc.fields.filter(field => field.placeholder.startsWith('INVOICE_ITEM_')).map(field => {
    const item: unknown = JSON.parse(field.value);
    if (!item || typeof item !== 'object' || !['id', 'service', 'scope', 'amount'].every(key => typeof (item as Record<string, unknown>)[key] === 'string')) throw new Error('An invoice service row is invalid.');
    return item as InvoiceItem;
  });
}
export function setInvoiceItems(doc: BusinessDocument, items: InvoiceItem[]): BusinessDocument {
  return { ...doc, fields: [...doc.fields.filter(field => !field.placeholder.startsWith('INVOICE_ITEM_')), ...items.map(item => ({ id: item.id, label: 'Invoice service', placeholder: `INVOICE_ITEM_${item.id}`, value: JSON.stringify(item) }))] };
}
export function invoiceTotals(doc: BusinessDocument, preview = false) {
  const subtotal = invoiceItems(doc).reduce((sum, item) => sum + decimal(item.amount || (preview ? '0' : ''), 2, 'Service amount'), 0);
  if (!Number.isSafeInteger(subtotal)) throw new Error('Invoice total is too large.');
  const mode = invoiceValue(doc, 'TAX_MODE') || 'none';
  if (!['none', 'inclusive', 'exclusive'].includes(mode)) throw new Error('Choose a valid tax treatment.');
  const rate = mode === 'none' ? 0 : decimal(invoiceValue(doc, 'TAX_RATE') || (preview ? '0' : ''), 2, 'Tax rate');
  if (rate > 10000) throw new Error('Tax rate must be between 0 and 100.');
  const rounded = (numerator: bigint, denominator: bigint) => Number((numerator + denominator / BigInt(2)) / denominator);
  const tax = mode === 'inclusive' ? rounded(BigInt(subtotal) * BigInt(rate), BigInt(10000 + rate)) : rounded(BigInt(subtotal) * BigInt(rate), BigInt(10000));
  const base = mode === 'inclusive' ? subtotal - tax : subtotal;
  const total = base + tax;
  if (!Number.isSafeInteger(total)) throw new Error('Invoice total is too large.');
  return { subtotal, base, tax, total, mode, rate: rate / 100 };
}
export function invoicePaymentUri(doc: BusinessDocument, total: number) {
  const upi = invoiceValue(doc, 'UPI_ID').trim(), name = invoiceValue(doc, 'ACCOUNT_NAME').trim();
  if (!upi || !name || total <= 0) return '';
  return `upi://pay?${new URLSearchParams({ pa: upi, pn: name, am: (total / 100).toFixed(2), cu: 'INR', tn: doc.number })}`;
}
export function invoiceErrors(doc: BusinessDocument) {
  const errors: string[] = [], due = invoiceValue(doc, 'DUE_DATE');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(Date.parse(due)) || new Date(due + 'T12:00:00Z').toISOString().slice(0, 10) !== due) errors.push('Choose a valid payment due date.');
  else if (due < doc.date) errors.push('Due date cannot be before the invoice date.');
  try {
    const items = invoiceItems(doc);
    if (!items.length || items.some(item => !item.service.trim() || !item.scope.trim())) errors.push('Enter a service and scope summary for every invoice row.');
    if (new Set(items.map(item => item.id)).size !== items.length) errors.push('Invoice service IDs must be unique.');
    invoiceTotals(doc);
  } catch (cause) { errors.push((cause as Error).message); }
  if (!invoiceValue(doc, 'FROM_NAME').trim() || !invoiceValue(doc, 'FROM_ADDRESS').trim()) errors.push('Complete the sender name and address.');
  if (!doc.client.address.trim()) errors.push('Enter the billing client address.');
  if (!invoiceValue(doc, 'PAYMENT_METHOD').trim() || !invoiceValue(doc, 'ACCOUNT_NAME').trim()) errors.push('Enter a payment method and account name.');
  const upi = invoiceValue(doc, 'UPI_ID').trim();
  if (upi && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upi)) errors.push('Enter a valid UPI ID.');
  if (!upi && !invoiceValue(doc, 'BANK_DETAILS').trim()) errors.push('Enter a UPI ID or bank transfer details.');
  if (!invoiceValue(doc, 'PAYMENT_AGREEMENT').trim()) errors.push('Enter the payment agreement.');
  return errors;
}
