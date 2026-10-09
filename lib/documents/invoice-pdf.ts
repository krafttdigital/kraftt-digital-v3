import type { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { Quotation } from '../quotation/model';
import { decimal, inr } from '../quotation/model';
import { Template } from '../quotation/quote-template';
import { invoiceItems, invoicePaymentUri, invoiceTotals, invoiceValue } from './invoice-template';
import type { BusinessDocument } from './model';

const K = 72 / 25.4, L = 45.35, R = 549.91, W = R - L;
const INK = '#1A1712', GOLD = '#8B7355', LINEN = '#EFE9DC', LINE = '#E2DDD3';

export async function renderInvoice(pdf: jsPDF, doc: BusinessDocument, context: Quotation, options: { preview?: boolean; blackAndWhite?: boolean } = {}) {
  const t = new Template(pdf, context, { preview: !!options.preview, blank: false, source: context, blackAndWhite: options.blackAndWhite });
  t.section = 'Invoice';
  const value = (key: string) => invoiceValue(doc, key), placeholder = (key: string) => value(key) || `{{${key}}}`;
  const totals = invoiceTotals(doc, !!options.preview), items = invoiceItems(doc);
  const incomplete = !items.length || items.some(item => !item.amount.trim());
  const money = (amount: number) => options.preview && incomplete ? '₹{{AMOUNT}}' : inr(amount);

  t.label('INVOICE · PAYMENT DETAILS', t.y); t.y += 33;
  for (const title of t.wrap(doc.title || 'Invoice', W, 30)) { t.text(title, L, t.y, 30, false, INK, 'left', 'serif'); t.y += 34; }
  t.y = t.paragraph(doc.project || '{{PROJECT_TITLE}}', L, t.y, W, 8.25, 12) + 3;
  if (value('SCOPE_LABEL')) t.y = t.paragraph(value('SCOPE_LABEL'), L, t.y, W, 8, 12) + 3;
  t.y = t.paragraph(`Reference: ${doc.number || '{{INVOICE_NUMBER}}'} · Invoice date: ${doc.date} · Due: ${value('DUE_DATE') || '{{DUE_DATE}}'}`, L, t.y, W, 7, 10) + 14;

  const from = [placeholder('FROM_NAME'), value('FROM_EMAIL'), value('FROM_PHONE'), placeholder('FROM_ADDRESS')].filter(Boolean);
  const to = [doc.client.contact, doc.client.business || '{{CLIENT_NAME}}', doc.client.address || '{{CLIENT_ADDRESS}}', doc.client.phone, doc.client.email].filter(Boolean);
  const columns = [from, to].map(rows => rows.flatMap((row, index) => t.wrap(row, W / 2 - 24, 8, index === 0).map(text => ({ text, bold: index === 0 }))));
  const billingHeight = 34 + Math.max(...columns.map(rows => rows.length)) * 12;
  if (billingHeight > 610) throw new Error('Shorten the billing details to fit one invoice section.');
  t.ensure(billingHeight, 760);
  t.rule(t.y); t.rule(t.y + billingHeight);
  pdf.setDrawColor(LINE); pdf.setLineWidth(.75 / K); pdf.line((L + W / 2) / K, t.y / K, (L + W / 2) / K, (t.y + billingHeight) / K);
  columns.forEach((rows, column) => {
    const x = L + column * (W / 2 + 12);
    t.label(column ? 'BILL TO' : 'FROM', t.y + 17, x);
    rows.forEach((row, index) => t.text(row.text, x, t.y + 35 + index * 12, 8, row.bold));
  });
  t.y += billingHeight + 20;

  function tableHeader() {
    t.rect(L, t.y, W, 27, LINEN);
    t.label('SERVICE', t.y + 17, L + 10, GOLD);
    t.label('SCOPE SUMMARY', t.y + 17, 184, GOLD);
    t.text('AMOUNT', R - 10, t.y + 17, 7, true, GOLD, 'right');
    t.y += 27;
  }
  t.ensure(85, 760); tableHeader();
  const rows = items.length ? items : [{ id: 'placeholder', service: '', scope: '', amount: '' }];
  for (const item of rows) {
    const service = t.wrap(item.service || '{{SERVICE}}', 113, 8, true), scope = t.wrap(item.scope || '{{SCOPE_SUMMARY}}', 258, 8);
    const amount = item.amount.trim() ? inr(decimal(item.amount, 2, 'Service amount')) : '₹{{AMOUNT}}';
    let offset = 0; const count = Math.max(service.length, scope.length);
    do {
      if (t.y + 58 > 760) { t.page('Invoice services'); tableHeader(); }
      const take = Math.min(count - offset, Math.max(1, Math.floor((760 - t.y - 26) / 12)));
      const height = Math.max(58, take * 12 + 26);
      service.slice(offset, offset + take).forEach((text, index) => t.text(text, L + 10, t.y + 20 + index * 12, 8, true));
      scope.slice(offset, offset + take).forEach((text, index) => t.text(text, 184, t.y + 20 + index * 12, 8, false, '#4A443C'));
      if (offset === 0) {
        let size = 8; while (size > 5 && t.width(amount, size, true) > 85) size -= .25;
        t.text(amount, R - 10, t.y + 20, size, true, INK, 'right');
      }
      t.y += height; t.rule(t.y); offset += take;
    } while (offset < count);
  }

  const uri = incomplete ? '' : invoicePaymentUri(doc, totals.total);
  const qr = uri ? await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 4, width: 300 }) : '';
  const paymentLines = [value('UPI_ID') && `UPI ID: ${value('UPI_ID')}`, value('ACCOUNT_NAME') && `Account name: ${value('ACCOUNT_NAME')}`, value('BANK_DETAILS')].filter(Boolean);
  const methodLines = t.wrap(placeholder('PAYMENT_METHOD'), 268, 18);
  const paymentTextHeight = paymentLines.reduce((height, row) => height + t.wrap(row, 268, 8).length * 12 + 6, 0);
  const showQr = !!qr || !!options.preview && !value('BANK_DETAILS');
  const summaryHeight = Math.max(showQr ? 214 : 108, 33 + methodLines.length * 22 + paymentTextHeight);
  if (summaryHeight > 620) throw new Error('Shorten the payment details to fit one invoice section.');
  t.y += 18; t.ensure(summaryHeight, 760);
  const summaryTop = t.y;
  t.label('PAYMENT DETAILS', summaryTop + 11);
  let y = summaryTop + 36;
  methodLines.forEach(text => { t.text(text, L, y, 18, false, INK, 'left', 'serif'); y += 22; });
  for (const text of paymentLines) y = t.paragraph(text, L, y, 268, 8, 12) + 6;
  const x = L + 288, width = R - x;
  for (const [index, label, amount] of [[0, 'Base value', totals.base], [1, `Tax ${totals.mode === 'exclusive' ? 'added' : 'included'} (${totals.rate}%)`, totals.tax], [2, 'Total payable', totals.total]] as const) {
    const top = summaryTop + index * 32, total = index === 2;
    t.rect(x, top, width, 32, total ? '#0D0D0D' : LINEN);
    t.text(label, x + 10, top + 20, 7.5, total, total ? '#FFFFFF' : INK);
    let size = total ? 10 : 8; const text = money(amount); while (size > 5 && t.width(text, size, true) > 80) size -= .25;
    t.text(text, R - 10, top + 20, size, true, total ? '#FFFFFF' : INK, 'right');
  }
  if (qr) pdf.addImage(qr, 'PNG', x / K, (summaryTop + 110) / K, 94 / K, 94 / K);
  else if (showQr) { t.rect(x, summaryTop + 110, 94, 94, '#FFFFFF'); t.paragraph('Payment QR\nEnter UPI ID, account name and amount', x + 10, summaryTop + 138, 74, 8, 12); }
  t.y = summaryTop + summaryHeight + 14;

  const agreement = placeholder('PAYMENT_AGREEMENT').replaceAll('{{DUE_DATE}}', value('DUE_DATE') || '{{DUE_DATE}}');
  const agreementLines = t.wrap(agreement, W, 8);
  let offset = 0;
  while (offset < agreementLines.length) {
    t.ensure(54, 772);
    const take = Math.min(agreementLines.length - offset, Math.max(1, Math.floor((772 - t.y - 30) / 12)));
    t.rule(t.y); t.label('PAYMENT AGREEMENT' + (offset ? ' · CONTINUED' : ''), t.y + 19);
    agreementLines.slice(offset, offset + take).forEach((text, index) => t.text(text, L, t.y + 36 + index * 12, 8, false, '#4A443C'));
    t.y += 30 + take * 12; offset += take;
    if (offset < agreementLines.length) t.page('Payment agreement');
  }

  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page); t.rule(802);
    const client = `kraftt digital × ${doc.client.business || '{{CLIENT_NAME}}'}`;
    let size = 7; while (size > 5 && t.width(client, size) > 275) size -= .25;
    t.text(client, L, 816, size);
    t.text('Contact . hello@krafttdigital.in', R, 816, 7, false, '#8B8173', 'right');
  }
}
