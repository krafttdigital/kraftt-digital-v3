import type { jsPDF } from 'jspdf';
import { calculateLine, decimal, inr, standardClauses, type Calculation, type LineItem, type Quotation } from './model';

// Reference PDF measurements are in points. Keep this renderer isolated from the
// shared writer used by the other six company document modules.
const K = 72 / 25.4, LEFT = 45.35, RIGHT = 549.91, WIDTH = RIGHT - LEFT;
const PAPER = '#F6F3ED', INK = '#1A1712', GOLD = '#8B7355', LINE = '#E2DDD3';
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/\t/g, '  ').replace(/\u2011/g, '-');
type Options = { preview: boolean; blank: boolean; source: Quotation; blackAndWhite?: boolean };

export class Template {
  y = 0;
  section = 'Quotation';
  constructor(readonly pdf: jsPDF, readonly q: Quotation, readonly options: Options) { this.header(); }
  font(size: number, bold = false, colour = INK, style: 'body' | 'serif' | 'italic' = 'body') {
    this.pdf.setFont(style === 'body' ? 'TemplateOutfit' : 'Cormorant', style === 'italic' ? 'bolditalic' : bold ? 'bold' : 'normal');
    this.pdf.setFontSize(size); this.pdf.setTextColor(colour);
  }
  width(value: string, size: number, bold = false) {
    this.font(size, bold); let width = 0;
    for (const part of clean(value).split(/(₹)/)) { this.pdf.setFont(part === '₹' ? 'NotoSans' : 'TemplateOutfit', bold ? 'bold' : 'normal'); width += this.pdf.getTextWidth(part) * K; }
    return width;
  }
  text(value: string, x: number, y: number, size = 7.5, bold = false, colour = INK, align: 'left' | 'right' | 'center' = 'left', style: 'body' | 'serif' | 'italic' = 'body') {
    value = clean(value); this.font(size, bold, colour, style);
    if (style !== 'body' || !value.includes('₹')) { this.pdf.text(value, x / K, y / K, { align }); return; }
    const total = this.width(value, size, bold); let cursor = x - (align === 'right' ? total : align === 'center' ? total / 2 : 0);
    for (const part of value.split(/(₹)/)) { this.font(size, bold, colour); this.pdf.setFont(part === '₹' ? 'NotoSans' : 'TemplateOutfit', bold ? 'bold' : 'normal'); this.pdf.text(part, cursor / K, y / K); cursor += this.pdf.getTextWidth(part) * K; }
  }
  wrap(value: string, width = WIDTH, size = 7.5, bold = false) {
    const lines: string[] = [];
    for (const paragraph of clean(value).split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (this.width((line ? line + ' ' : '') + word, size, bold) <= width) { line += (line ? ' ' : '') + word; continue; }
        if (line) { lines.push(line); line = ''; }
        let chunk = '';
        for (const character of word) { if (chunk && this.width(chunk + character, size, bold) > width) { lines.push(chunk); chunk = ''; } chunk += character; }
        line = chunk;
      }
      lines.push(line);
    }
    return lines;
  }
  paragraph(value: string, x: number, y: number, width = WIDTH, size = 7.5, leading = 12, bold = false, colour = '#4A443C') {
    for (const line of this.wrap(value, width, size, bold)) { if (y > 776) { this.page(this.section); y = this.y; } this.text(line, x, y, size, bold, colour); y += leading; }
    return y;
  }
  italicParagraph(value: string, y: number) {
    for (const line of this.wrap(value, WIDTH, 7.2)) {
      if (y > 776) { this.page(this.section); y = this.y; }
      this.font(7.2, false, '#5C574E');
      this.pdf.advancedAPI(doc => doc.text(line, LEFT / K, y / K, {}, doc.Matrix(1, 0, -.2, 1, 0, 0)));
      y += 11;
    }
    return y;
  }
  rule(y: number, x = LEFT, right = RIGHT, colour = LINE) { this.pdf.setDrawColor(colour); this.pdf.setLineWidth(.75 / K); this.pdf.line(x / K, y / K, right / K, y / K); }
  rect(x: number, y: number, width: number, height: number, colour: string) { this.pdf.setFillColor(colour); this.pdf.rect(x / K, y / K, width / K, height / K, 'F'); }
  label(value: string, y: number, x = LEFT, colour = GOLD, size = 6.75) {
    this.font(size, true, colour); if (value.startsWith('01 —') || value.startsWith('02 —')) this.pdf.setFont('Outfit', 'bold'); this.pdf.setCharSpace((value.startsWith('01 —') || value.startsWith('02 —') ? 1.215 : size === 6 ? .78 : .945) / K); this.pdf.text(value, x / K, y / K); this.pdf.setCharSpace(0);
  }
  header() {
    this.rect(0, 0, 596, 843, this.options.blackAndWhite ? '#FFFFFF' : PAPER);
    this.pdf.setCharSpace(-.75 / K); this.text('Kraftt.', LEFT, 58.5, 21.75, false, INK, 'left', 'serif'); this.pdf.setCharSpace(0);
    this.text('Perpared for', RIGHT, 48, 7.5, true, '#231F1A', 'right');
    const name = this.q.client.business || '{{CLIENT_BUSINESS_NAME}}';
    const lines = this.wrap(name, 260, 7.5);
    lines.forEach((line, i) => this.text(line, RIGHT, 60 + i * 9, 7.5, false, '#5C574E', 'right'));
    this.rule(Math.max(75.375, 65 + lines.length * 9), LEFT, RIGHT, '#D8D0C2'); this.y = Math.max(99, 89 + lines.length * 9);
  }
  page(section: string) { this.pdf.addPage(); this.header(); this.label(section.toUpperCase() + ' — CONTINUED', this.y); this.y += 22; }
  ensure(height: number, limit = 700) { if (this.y + height > limit) this.page(this.section); }
  headline(first: string, italic: string) {
    this.pdf.setCharSpace(-.15 / K); this.text(first, LEFT, 130.5, 26.25, false, INK, 'left', 'serif'); this.font(26.25, false, INK, 'serif');
    const start = LEFT + this.pdf.getTextWidth(first) * K - first.length * .15;
    this.text(italic, start, 130.5, 26.25, false, INK, 'left', 'italic'); this.pdf.setCharSpace(0);
  }
  footer() {
    const count = this.pdf.getNumberOfPages();
    for (let page = 1; page <= count; page++) {
      this.pdf.setPage(page); this.rule(793.125);
      const client = this.options.blank ? '{{CLIENT_BUSINESS}}' : this.q.client.business;
      const text = 'KRAFTT DIGITAL × ' + client;
      let size = 5.55; while (size > 4 && this.width(text, size) > 235) size -= .15;
      this.pdf.setCharSpace(.2775 / K); this.text(text, LEFT, 806.25, size, false, '#9C9186');
      this.text('HELLO@KRAFTTDIGITAL.IN · 7986769102', 348.5, 806.25, 5.55, false, '#8B8173', 'center');
      this.text(`${page} / ${count}`, RIGHT, 806.25, 5.55, false, '#9C9186', 'right'); this.pdf.setCharSpace(0);
    }
  }
  // Reference clauses use a bold title inline with regular text and a hanging number.
  clause(index: number, title: string, body: string) {
    const words = [...(title + '.').split(/\s+/).map(text => ({ text, bold: true })), ...clean(body).split(/\s+/).map(text => ({ text, bold: false }))];
    const rows: typeof words[] = []; let row: typeof words = [], used = 0;
    for (const word of words) {
      const width = this.width((row.length ? ' ' : '') + word.text, 7.8, word.bold);
      if (row.length && used + width > WIDTH - 18.75) { rows.push(row); row = []; used = 0; }
      // Split exceptionally long unbroken tokens rather than allowing overflow.
      if (this.width(word.text, 7.8, word.bold) > WIDTH - 18.75) {
        const chunks = this.wrap(word.text, WIDTH - 18.75, 7.8, word.bold);
        chunks.slice(0, -1).forEach(text => rows.push([{ text, bold: word.bold }])); row = [{ text: chunks.at(-1)!, bold: word.bold }]; used = this.width(row[0].text, 7.8, word.bold);
      } else { row.push(word); used += width; }
    }
    if (row.length) rows.push(row);
    this.ensure(Math.min(rows.length, 2) * 12.75 + 8, 663);
    this.text(String(index + 1).padStart(2, '0'), LEFT, this.y - .75, 6.75, false, GOLD);
    for (const words of rows) {
      if (this.y > 776) { this.page(this.section); }
      let x = LEFT + 18.75;
      words.forEach((word, i) => { const value = (i ? ' ' : '') + word.text; this.text(value, x, this.y, 7.8, word.bold, word.bold ? '#231F1A' : '#4A443C'); x += this.width(value, 7.8, word.bold); }); this.y += 12.75;
    }
    this.y += 6.75;
  }
}

function scopeDescription(line: LineItem) {
  return [line.description, ...line.deliverables.filter(Boolean), line.pricing === 'bundle' && line.included.length ? 'Included: ' + line.included.filter(Boolean).join('; ') : '', line.pricing === 'quantity' ? `Quantity: ${line.quantity} × ${inr(decimal(line.unitRate, 2, 'Unit rate'))}` : '', line.delivery ? 'Delivery: ' + line.delivery : '', line.complimentary ? 'Complimentary; no separate charge.' : '', line.referenceValue ? 'Reference value: ' + inr(calculateLine(line).reference) : ''].filter(Boolean).join('\n');
}

export function renderQuoteTemplate(pdf: jsPDF, q: Quotation, results: Calculation[], options: Options) {
  const t = new Template(pdf, q, options), blank = options.blank && options.preview;
  if (blank) q.client.business = '{{CLIENT_BUSINESS_NAME}}';
  // Repaint the shared writer's first page with the quotation-only reference design.
  t.header(); t.label('01 — QUOTATION', 99); t.headline('Your project. ', 'A clear investment.');
  const introEnd = t.paragraph(`${blank ? '{{PROJECT_NAME}}' : q.project} — defined scope, transparent pricing and a clear way forward.`, LEFT, 153.75, WIDTH, 8.25, 12);
  const clientTop = Math.max(171.375, introEnd + 5.625);
  t.rule(clientTop); t.label('PREPARED FOR', clientTop + 17.625, LEFT, GOLD, 6); t.label('PROJECT DETAILS', clientTop + 17.625, 332.83, GOLD, 6);
  const nameEnd = t.paragraph(q.client.business, LEFT, clientTop + 34.875, 267, 9, 12, true, INK);
  const projectEnd = t.paragraph(blank ? '{{PROJETC_TITLE}}' : q.project, 332.83, clientTop + 34.125, RIGHT - 332.83, 7.875, 11, false, INK);
  const contact = blank ? '{{CONTACT_NAME}} · {{CONTACT_ROLE}}' : [q.client.contact, q.client.role].filter(Boolean).join(' · ');
  const contactEnd = t.paragraph(contact, LEFT, Math.max(clientTop + 48.375, nameEnd + 1.5), 267, 7.875, 11);
  const packages = q.mode === 'comparison' ? q.packages : q.packages.filter(p => p.id === q.selectedPackageId);
  const serviceCount = packages.reduce((n, p) => n + p.lines.length, 0);
  const countEnd = t.paragraph(blank ? '{{NUMBER_OF_SERVICES}}' : `${serviceCount} service${serviceCount === 1 ? '' : 's'}${q.mode === 'comparison' ? ' across alternative options' : ''}`, 332.83, Math.max(clientTop + 47.625, projectEnd + 2.5), RIGHT - 332.83, 7.875, 11, false, INK);
  const clientBottom = Math.max(clientTop + 63, contactEnd + 3.625, countEnd + 4.375);
  t.rule(clientBottom); t.label('INCLUDED SERVICES · ONE-TIME INVESTMENT', clientBottom + 20.625, LEFT, INK);
  t.y = clientBottom + 28.875;
  const lineRows = blank ? Array.from({ length: 3 }, (_, index) => ({ ...q.packages[0].lines[0], name: `{{SERVICE_${index + 1}}}`, description: `{{DELIVERABLES_${index + 1} — specify quantities, features and handover format}}`, deliverables: [], included: [], delivery: '', fee: '0' })) : null;
  const sourceFeeBlank = (line: LineItem) => options.preview && [...options.source.packages.flatMap(p => p.lines), ...options.source.addOns].some(l => l.id === line.id && l.fee === '');
  let amountIndex = 0, firstTableRow = false;
  function startTable() { firstTableRow = true; }
  function row(line: LineItem) {
    const description = scopeDescription(line), nameLines = t.wrap(line.name, WIDTH - 140, 8.625, true), bodyLines = t.wrap(description, 332, 7.5);
    const height = Math.max(44.25, 15 + nameLines.length * 11 + bodyLines.length * 12 + 6);
    t.ensure(height <= 579 ? height : 70); let top = t.y; const initialPage = t.pdf.getNumberOfPages();
    t.pdf.setDrawColor(INK); t.pdf.setLineWidth(.6 / K); if (firstTableRow) {
      const u = (n: number) => n / K;
      t.pdf.path([{ op: 'm', c: [u(LEFT), u(top + 3)] }, { op: 'c', c: [u(LEFT), u(top + 1.35), u(LEFT + 1.35), u(top), u(LEFT + 3), u(top)] }, { op: 'l', c: [u(RIGHT - 3), u(top)] }, { op: 'c', c: [u(RIGHT - 1.35), u(top), u(RIGHT), u(top + 1.35), u(RIGHT), u(top + 3)] }]).stroke();
    }
    const borderStart = top + (firstTableRow ? 3 : 0); firstTableRow = false;
    t.pdf.line(LEFT / K, borderStart / K, LEFT / K, (top + Math.min(height, 700 - top)) / K); t.pdf.line(RIGHT / K, borderStart / K, RIGHT / K, (top + Math.min(height, 700 - top)) / K);
    t.paragraph(line.name, LEFT + 11.25, top + 18, WIDTH - 140, 8.625, 11, true, INK);
    t.text(blank || sourceFeeBlank(line) ? `₹{{AMOUNT_${++amountIndex}}}` : inr(calculateLine(line).net), RIGHT - 11.25, top + 18, 8.625, true, INK, 'right');
    let y = top + 18 + nameLines.length * 11 + 1.75;
    for (const value of bodyLines) {
      if (y > 686) { t.y = y; t.page(t.section); top = t.y; t.text(line.name + ' (continued)', LEFT + 11.25, top + 12, 8.625, true); y = top + 28; }
      t.text(value, LEFT + 11.25, y, 7.5, false, '#4A443C'); y += 12;
    }
    t.y = t.pdf.getNumberOfPages() === initialPage ? Math.max(top + Math.min(height, 700 - top), y + 1.5) : y + 1.5;
    if (t.pdf.getNumberOfPages() !== initialPage) { t.pdf.setDrawColor(INK); t.pdf.line(LEFT / K, top / K, LEFT / K, t.y / K); t.pdf.line(RIGHT / K, top / K, RIGHT / K, t.y / K); }
    t.rule(t.y); 
  }
  function summary(result: Calculation) {
    const placeholder = blank || options.preview && result.lines.some(l => sourceFeeBlank(l.line));
    const values: [string, string][] = [
      ['Subtotal', placeholder ? '₹{{SUBTOTAL}}' : inr(result.subtotal)],
      [`Discount · ${blank ? '{{DISCOUNT_OR_NA}}' : result.orderDiscount ? q.orderDiscount.kind === 'percent' ? q.orderDiscount.value + '%' : q.discountLabel : 'Not applicable'}`, placeholder ? '₹{{DISCOUNT_AMOUNT}}' : inr(-result.orderDiscount)],
      [`Tax · ${blank ? '{{TAX_RATE_OR_NA}}' : q.tax.enabled ? `${q.tax.label} ${q.tax.rate}%${q.tax.treatment === 'inclusive' ? ' included' : ''}` : 'Not applicable'}`, placeholder ? '₹{{TAX_AMOUNT}}' : inr(result.taxAmount)],
    ];
    if (result.adjustment) values.splice(2, 0, [q.adjustmentLabel, inr(result.adjustment)]);
    for (const [label, amount] of values) { t.ensure(21); t.text(label, LEFT + 11.25, t.y + 13.5); t.text(amount, RIGHT - 11.25, t.y + 13.5, 7.5, true, INK, 'right'); t.pdf.setDrawColor(INK); t.pdf.line(LEFT / K, t.y / K, LEFT / K, (t.y + 21) / K); t.pdf.line(RIGHT / K, t.y / K, RIGHT / K, (t.y + 21) / K); t.y += 21; t.rule(t.y); }
    t.ensure(32.25); t.pdf.setFillColor(INK); t.pdf.roundedRect(LEFT / K, t.y / K, WIDTH / K, 32.25 / K, 3 / K, 3 / K, 'F'); t.rect(LEFT, t.y, WIDTH, 4, INK); t.text('Total project investment', LEFT + 11.25, t.y + 18, 8.625, true, PAPER); t.text(placeholder ? '₹{{GRAND_TOTAL}}' : inr(result.total), RIGHT - 11.25, t.y + 18, 10.875, true, PAPER, 'right'); t.y += 32.25;
  }
  if (lineRows) { startTable(); lineRows.forEach(row); summary(results[0]); }
  else for (const pkg of packages) {
    if (q.mode === 'comparison') { t.ensure(32); t.label(pkg.name.toUpperCase() + ' — INDEPENDENT OPTION', t.y + 15, LEFT, INK); t.y += 25; }
    startTable(); pkg.lines.forEach(row);
    const base = results.find(r => r.package?.id === pkg.id && !r.scenario.addOnIds.length);
    if (q.mode === 'selected') summary(results[0]); else if (base) summary(base);
    t.y += q.mode === 'comparison' ? 15 : 0;
  }
  t.y += 21; t.ensure(85); t.label('ONGOING / OPTIONAL SERVICES', t.y, LEFT, INK); t.y += 24;
  const offers = [...q.addOns.map(item => ({ name: item.name, price: options.preview && options.source.addOns.some(a => a.id === item.id && a.fee === '') ? '₹{{FEE}}' : inr(calculateLine(item).net), description: [item.description, ...item.deliverables].filter(Boolean).join('; '), notes: results.some(r => r.scenario.addOnIds.includes(item.id)) ? 'Included only in the selected payment scenario(s).' : 'Optional one-time service; excluded until approved.' })), ...q.recurring.map(item => ({ name: item.name, price: `${options.preview && options.source.recurring.some(r => r.id === item.id && r.fee === '') ? '₹{{FEE}}' : inr(decimal(item.fee, 2, 'Recurring fee'))} / ${item.period}`, description: [item.coverage, item.start].filter(Boolean).join(' · '), notes: item.notes }))];
  if (!offers.length) offers.push({ name: blank ? '{{SERVICE_OR_NOT_INCLUDED}}' : 'Not included', price: blank ? '₹{{FEE}} / {{PERIOD}}' : 'Not applicable', description: blank ? '{{COVERAGE_AND_START_DATE_OR_NA}}' : 'No ongoing or optional services have been selected.', notes: '' });
  for (const offer of offers) {
    t.ensure(60); const nameBottom = t.paragraph(offer.name, LEFT, t.y, WIDTH - 160, 7.5, 11, true, INK); t.text(offer.price, RIGHT, t.y, 7.5, true, INK, 'right'); t.y = Math.max(t.y + 12, nameBottom);
    t.y = t.paragraph(offer.description, LEFT, t.y, WIDTH, 7.5, 12); if (offer.notes) t.y = t.paragraph(offer.notes, LEFT, t.y, WIDTH, 7.2, 11); t.rule(t.y); t.y += 14;
  }
  t.y = t.italicParagraph(`Excluded from the project total. Start only after written approval. Tax: ${blank ? '{{RECURRING_TAX_OR_NA}}' : q.recurring.map(r => r.notes).filter(Boolean).join('; ') || 'Confirm separately where applicable'}.`, t.y);
  const exclusions = [...new Set(packages.flatMap(p => p.lines.map(l => l.exclusions).filter(Boolean)))].join('; ') || 'Work and third-party costs outside the stated deliverables.';
  const handover = [...new Set(packages.flatMap(p => p.lines.map(l => l.handover).filter(Boolean)))].join('; ') || 'Agreed final files, access and deliverables in the specified formats, after full payment.';
  const details = [['Not included:', blank ? '{{EXCLUSIONS_AND_THIRD_PARTY_COSTS}}' : exclusions], ['Handover:', blank ? '{{FINAL_FILES_ACCESS_AND_DELIVERABLES}}' : handover], ['Next step:', 'Confirm this quotation and the terms on page 2, then clear the agreed advance to schedule kickoff.']];
  const detailHeight = details.reduce((height, [label, text]) => height + t.wrap(label + ' ' + text, WIDTH - 21).length * 12 + 4.5, 13.5);
  if (detailHeight > 400) {
    details.forEach(([label, suppliedText], index) => { t.ensure(28, 775); const text = index === 2 ? suppliedText.replace('page 2', 'page ' + (pdf.getNumberOfPages() + 1)) : suppliedText; t.y = t.paragraph(label + ' ' + text, LEFT + 10.5, t.y, WIDTH - 21, 7.5, 12); t.y += 5; });
  } else {
  t.y += 10; t.ensure(detailHeight, 780); const detailTop = Math.max(t.y, 786 - detailHeight);
  t.rect(LEFT, detailTop, WIDTH, detailHeight, '#EFE9DC'); let dy = detailTop + 17.25;
  details.forEach(([label, suppliedText], index) => { const text = index === 2 ? suppliedText.replace('page 2', 'page ' + (pdf.getNumberOfPages() + 1)) : suppliedText; t.text(label, LEFT + 10.5, dy, 7.5, true); const x = LEFT + 10.5 + t.width(label + ' ', 7.5, true); const lines = t.wrap(text, RIGHT - 10.5 - x); lines.forEach((line, index) => t.text(line, index ? LEFT + 10.5 : x, dy + index * 12)); dy += lines.length * 12 + 4.5; });
  }

  t.section = 'Payment & terms'; pdf.addPage(); t.header(); t.label('02 — PAYMENT & TERMS', 99); t.headline('The practical ', 'details.');
  t.paragraph(`These terms apply to quotation created for ${blank ? '{{CLIENT_BUSINESS}}' : q.client.business}.`, LEFT, 153.75, WIDTH, 8.25, 12); t.y = 181.5;
  t.label('PAYMENT SCHEDULE', t.y, LEFT, INK, 7.275); t.y = 189.75;
  for (const result of results) {
    if (results.length > 1) { t.ensure(30); t.text(result.scenario.name + ' · ' + inr(result.total), LEFT, t.y + 10, 8.25, true); t.y += 23; }
    const extraTriggers: string[] = [];
    t.ensure(43, 640); const top = t.y, count = result.payments.length, cellWidth = WIDTH / count;
    pdf.setFillColor('#DAD3C2'); pdf.roundedRect(LEFT / K, top / K, WIDTH / K, 36 / K, 3 / K, 3 / K, 'F');
    result.payments.forEach((payment, index) => { const x = LEFT + index * cellWidth, dark = index === 0; if (dark) { pdf.setFillColor('#0D0D0D'); pdf.roundedRect(x / K, top / K, cellWidth / K, 36 / K, 3 / K, 3 / K, 'F'); if (count > 1) t.rect(x + cellWidth - 3, top, 3, 36, '#0D0D0D'); }
      const percent = blank ? index === 0 ? '{{ADVANCE_PERCENT}}' : '{{BALANCE_PERCENT}}' : payment.milestone.mode === 'percent' ? payment.milestone.value : payment.milestone.name;
      const amount = blank ? index === 0 ? '₹{{ADVANCE_AMOUNT}}' : '₹{{BALANCE_AMOUNT}}' : options.preview && result.lines.some(l => sourceFeeBlank(l.line)) ? '₹{{AMOUNT}}' : inr(payment.amount);
      const value = `${percent}${payment.milestone.mode === 'percent' ? '%' : ''} · ${amount}`;
      let size = 8.25; while (size > 6 && t.width(value, size, true) > cellWidth - 18) size -= .25;
      t.text(value, x + cellWidth / 2, top + 15.75, size, true, dark ? '#E8DCC8' : INK, 'center');
      const originalTrigger = payment.milestone.trigger;
      const trigger = blank || originalTrigger === 'On acceptance, before work begins' || originalTrigger === 'After final review, before launch / handover' ? index === 0 ? 'On acceptance · before work begins' : 'After final approval · before handover / launch' : originalTrigger;
      const triggerSize = count > 2 ? 5.5 : 6.75;
      const triggerLines = t.wrap(trigger, cellWidth - 18, triggerSize);
      (triggerLines.length > 2 ? ['Timing details below'] : triggerLines).forEach((line, i) => t.text(line, x + cellWidth / 2, top + 27 + i * 7, triggerSize, false, dark ? '#F1E9DA' : INK, 'center'));
      if (triggerLines.length > 2) extraTriggers.push(payment.milestone.name + ': ' + trigger);
    }); t.y += 51;
    extraTriggers.forEach(text => { t.ensure(28); t.y = t.paragraph(text, LEFT, t.y); });
    result.payments.filter(p => p.milestone.note || p.milestone.dueDate).forEach(p => { t.ensure(28); t.y = t.paragraph([p.milestone.name, p.milestone.dueDate && 'Due ' + p.milestone.dueDate, p.milestone.note].filter(Boolean).join(' · '), LEFT, t.y); });
  }
  t.y = t.paragraph(`Invoices are payable within ${blank ? '{{PAYMENT_DAYS}}' : q.termSettings.paymentDays} days. Payment details are shared on the invoice. Recurring services, where agreed, are billed in advance each ${blank ? '{{BILLING_PERIOD_OR_NA}}' : [...new Set(q.recurring.map(r => r.period))].join(' / ') || 'agreed billing period'}.`, LEFT, t.y, WIDTH, 7.5, 12); t.y += 9;
  const clauses = blank ? standardClauses({ ...q.termSettings, reviewDays: '{{REVIEW_DAYS}}', revisionRounds: '{{REVISION_ROUNDS}}', supportPeriod: '{{SUPPORT_PERIOD_AND_COVERAGE_OR_NONE}}', cancellationNotice: '{{NOTICE_PERIOD_OR_NA}}' }) : q.clauses;
  clauses.forEach((clause, index) => t.clause(index, clause.title, blank && clause.templateKey === 'scope' ? clause.body.replace('listed in this quotation', 'listed on page 1') : clause.body));
  t.y += 12; t.ensure(105, 780); const acceptanceTop = Math.max(t.y, 681);
  t.rule(acceptanceTop, LEFT, RIGHT, '#D8D0C2'); t.label('ACCEPTANCE', acceptanceTop + 15.75, LEFT, GOLD, 6);
  const defaultAcceptance = 'I accept the scope, pricing, payment schedule and terms of this quotation. Acceptance may be recorded by signature below or written confirmation quoting the quotation reference.';
  const acceptance = !blank && q.acceptance.note && q.acceptance.note !== defaultAcceptance ? q.acceptance.note : `I accept the scope, pricing, payment schedule and terms of this quotation. Acceptance may be recorded by signature below or written confirmation quoting ${blank ? '{{QUOTE_NO}}' : q.number}.`;
  const acceptanceEnd = t.paragraph(acceptance, LEFT, acceptanceTop + 29.25, WIDTH, 7.5, 12);
  t.y = acceptanceEnd + 18; t.ensure(28, 785);
  const signatureY = Math.max(768.375, t.y + 10);
  t.rule(signatureY, 308.25, RIGHT, '#B7AD9B'); t.text(`Client name / signature · ${blank ? '{{CLIENT_SIGN_DATE}}' : 'Date: ____________________'}`, 308.25, signatureY + 13.125, 7.125);
  t.footer();
}
