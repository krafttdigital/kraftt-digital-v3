import type { jsPDF as PdfDocument } from 'jspdf';
import { blankLine, calculations, copy, inr, localDate, validateQuotation, type Quotation } from './model';

const fontFiles = ['Outfit-Bold.ttf', 'Outfit-Regular.ttf', 'Outfit-Semibold.ttf', 'Cormorant-Light.ttf', 'Cormorant-Semibold.ttf', 'Cormorant-SemiboldItalic.ttf', 'NotoSans-Regular.ttf', 'NotoSans-Bold.ttf'];
let fontCache: Promise<Record<string, string>> | undefined;
function base64(buffer: ArrayBuffer) {
  let text = ''; for (const value of new Uint8Array(buffer)) text += String.fromCharCode(value);
  return btoa(text);
}
async function fonts() {
  fontCache ??= Promise.all(fontFiles.map(async file => {
    const response = await fetch(`/admin-assets/fonts/${file}`);
    if (!response.ok) throw new Error('The document fonts could not be loaded. Retry when local assets are available.');
    return [file, base64(await response.arrayBuffer())] as const;
  })).then(Object.fromEntries).catch(error => { fontCache = undefined; throw error; });
  return fontCache;
}
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/\t/g, '  ').replace(/\u2011/g, '-');
const filenamePart = (value: string) => value.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'Document';
export const quotationFilename = (q: Quotation) => `Kraftt_Quotation_${filenamePart(q.client.business)}_${filenamePart(q.number)}.pdf`;

export class Writer {
  templatePrices = false;
  y = 42;
  section = 'Quotation';
  readonly left = 16;
  readonly width = 178;
  readonly bottom = 274;
  constructor(readonly pdf: PdfDocument, readonly q: Quotation) { this.header(); }
  colour(value: string) { this.pdf.setTextColor(value); }
  font(size = 9, bold = false, serif = false, currency = false) { this.pdf.setFont(serif ? 'Cormorant' : currency ? 'NotoSans' : 'Outfit', bold ? 'bold' : 'normal'); this.pdf.setFontSize(size); this.colour(this.q.brand.ink); }
  header() {
    const { pdf, q } = this;
    pdf.setFillColor(q.brand.cream); pdf.rect(0, 0, 210, 297, 'F');
    this.font(26, false, true); pdf.text('Kraftt.', this.left, 23);
    this.font(7.5); this.colour(q.brand.gold); pdf.text('Prepared for', 194, 17, { align: 'right' });
    this.font(9, true);
    const client = pdf.splitTextToSize(clean(q.client.business || '{{CLIENT_NAME}}'), 110) as string[];
    pdf.text(client, 194, 23, { align: 'right', lineHeightFactor: 1.2 });
    pdf.setDrawColor('#D8D0C2'); pdf.setLineWidth(0.25); pdf.line(this.left, 32, 194, 32);
    this.y = 41;
  }
  page(section = this.section) {
    this.section = section; this.pdf.addPage(); this.header();
    this.label(`${section} - continued`); this.y += 2;
  }
  ensure(height: number) { if (this.y + height > this.bottom) this.page(); }
  space(amount = 3) { this.y += amount; }
  label(value: string) { this.ensure(8); this.font(7.5, true); this.colour(this.q.brand.gold); this.pdf.text(clean(value.toUpperCase()), this.left, this.y); this.y += 6; }
  paragraph(value: string, size = 9, width = this.width, x = this.left, bold = false, gap = 1, serif = false) {
    if (!value.trim()) return;
    this.font(size, bold, serif, value.includes('₹'));
    const lines: string[] = this.pdf.splitTextToSize(clean(value), width);
    const leading = size * 0.352778 * (serif ? 1.13 : 1.35);
    this.ensure(Math.min(lines.length, 2) * leading + gap);
    for (const line of lines) { this.ensure(leading + 1); this.font(size, bold, serif, value.includes('₹')); this.pdf.text(line, x, this.y); this.y += leading; }
    this.y += gap;
  }
  heading(title: string, size = 27) { this.ensure(size * 0.352778 * 2); this.space(size * 0.352778 * .65); this.paragraph(title, size, this.width, this.left, false, 2, true); }
  rule() { this.ensure(4); this.pdf.setDrawColor('#D8D0C2'); this.pdf.setLineWidth(0.2); this.pdf.line(this.left, this.y, 194, this.y); this.y += 5; }
  bullet(value: string) { this.ensure(6); this.font(8.5); this.colour(this.q.brand.gold); this.pdf.text('•', this.left + 2, this.y); this.paragraph(value, 8.5, this.width - 8, this.left + 8, false, .4); }
  amount(label: string, value: number, strong = false) {
    this.font(strong ? 10 : 8.5, strong);
    const lines: string[] = this.pdf.splitTextToSize(clean(label), this.width - 55);
    this.ensure(lines.length * 4.5 + 4);
    if (strong) { this.pdf.setFillColor(this.q.brand.ink); this.pdf.roundedRect(this.left, this.y - 4, this.width, lines.length * 4.5 + 5, 1, 1, 'F'); this.colour(this.q.brand.cream); }
    this.pdf.text(lines, this.left + (strong ? 3 : 0), this.y);
    this.font(strong ? 10 : 8.5, strong, false, true); if (strong) this.colour(this.q.brand.cream);
    this.pdf.text(this.templatePrices ? `₹{{${strong ? 'GRAND_TOTAL' : /Subtotal/.test(label) ? 'SUBTOTAL' : 'AMOUNT'}}}` : inr(value), 194 - (strong ? 3 : 0), this.y, { align: 'right' });
    this.y += lines.length * 4.5 + (strong ? 7 : 2);
  }
  card(title: string, amount: number, recommended: boolean) {
    this.font(19, true, true);
    const titleLines: string[] = this.pdf.splitTextToSize(clean(title), 115);
    const height = Math.max(18, titleLines.length * 7 + 11);
    this.ensure(height + 17);
    this.pdf.setFillColor(recommended ? this.q.brand.ink : '#EDE7DA');
    this.pdf.roundedRect(this.left, this.y - 4, this.width, height, 1.5, 1.5, 'F');
    this.font(6.5, true); this.colour(recommended ? '#CDBB9D' : this.q.brand.gold);
    this.pdf.text(recommended ? 'RECOMMENDED' : 'PACKAGE / SCOPE', this.left + 4, this.y);
    this.font(19, true, true); this.colour(recommended ? this.q.brand.cream : this.q.brand.ink);
    this.pdf.text(titleLines, this.left + 4, this.y + 7);
    this.font(13, true, false, true); this.colour(recommended ? this.q.brand.cream : this.q.brand.ink);
    this.pdf.text(this.templatePrices ? '₹{{AMOUNT}}' : inr(amount), 190, this.y + 7, { align: 'right' });
    this.font(6.5); this.colour(recommended ? '#CDBB9D' : '#5C574E'); this.pdf.text('Base one-time fee', 190, this.y + 12, { align: 'right' });
    this.y += height;
  }
  table(headers: string[], rows: string[][]) {
    // Milestones are columns in groups of up to three, with repeated heading rows.
    const widths = [66, ...Array(headers.length - 1).fill((this.width - 66) / (headers.length - 1))] as number[];
    const renderHeader = () => {
      this.font(7, true); const lines = headers.map((h, i) => this.pdf.splitTextToSize(clean(h), widths[i] - 4) as string[]);
      const height = Math.max(...lines.map(l => l.length)) * 3.5 + 5;
      this.ensure(height + 9); this.pdf.setFillColor('#EDE7DA'); this.pdf.rect(this.left, this.y - 3, this.width, height, 'F');
      let x = this.left;
      lines.forEach((cell, i) => { this.pdf.text(cell, x + 2, this.y, { lineHeightFactor: 1.35 }); x += widths[i]; }); this.y += height;
    };
    renderHeader();
    for (const row of rows) {
      this.font(8);
      const cells = row.map((cell, i) => { this.font(8, false, false, cell.includes('₹')); return this.pdf.splitTextToSize(clean(cell), widths[i] - 4) as string[]; });
      const height = Math.max(...cells.map(c => c.length)) * 3.8 + 4;
      if (this.y + height > this.bottom) { this.page(); renderHeader(); }
      // A single unusually long row is split with headings on each continuation.
      let offset = 0;
      const longest = Math.max(...cells.map(c => c.length));
      while (offset < longest) {
        const fit = Math.max(1, Math.floor((this.bottom - this.y - 4) / 3.8));
        const count = Math.min(longest - offset, fit); let x = this.left;
        cells.forEach((cell, i) => { this.font(8, false, false, row[i].includes('₹')); this.pdf.text(cell.slice(offset, offset + count), x + 2, this.y, { lineHeightFactor: 1.35 }); x += widths[i]; });
        this.y += count * 3.8 + 4; offset += count;
        if (offset < longest) { this.page(); renderHeader(); }
      }
      this.pdf.setDrawColor('#E2DDD3'); this.pdf.line(this.left, this.y - 2, 194, this.y - 2);
    }
    this.space(3);
  }
  footer() {
    const count = this.pdf.getNumberOfPages();
    for (let page = 1; page <= count; page++) {
      this.pdf.setPage(page); this.pdf.setDrawColor('#D8D0C2'); this.pdf.line(this.left, 281, 194, 281);
      this.font(7); this.colour('#8B8173');
      const client = this.pdf.splitTextToSize(clean(`Kraftt Digital × ${this.q.client.business || '{{CLIENT_NAME}}'}`), 160)[0] || '';
      this.pdf.text(client, this.left, 286);
      this.pdf.text(`${page} / ${count}`, 194, 286, { align: 'right' });
    }
  }
}
export async function createPdfCanvas(q: Quotation, options: { fontData?: Record<string, string>; pageFormat?: [number, number] } = {}) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: options.pageFormat || 'a4', compress: true, putOnlyUsedFonts: true });
  const data = options.fontData || await fonts();
  for (const file of fontFiles) pdf.addFileToVFS(file, data[file]);
  pdf.addFont('Outfit-Regular.ttf', 'TemplateOutfit', 'normal'); pdf.addFont('Outfit-Bold.ttf', 'TemplateOutfit', 'bold');
  pdf.addFont('Cormorant-SemiboldItalic.ttf', 'Cormorant', 'bolditalic');
  pdf.addFont('Outfit-Regular.ttf', 'Outfit', 'normal'); pdf.addFont('Outfit-Semibold.ttf', 'Outfit', 'bold');
  pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal'); pdf.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
  pdf.addFont('Cormorant-Light.ttf', 'Cormorant', 'normal'); pdf.addFont('Cormorant-Semibold.ttf', 'Cormorant', 'bold'); pdf.addFont('Cormorant-SemiboldItalic.ttf', 'Cormorant', 'italic');
  function supported(value: string, family = 'Outfit') {
    pdf.setFont(family === 'Outfit' && value.includes('₹') ? 'NotoSans' : family, 'normal');
    const metadata = pdf.getFont().metadata as { characterToGlyph?: (code: number) => number };
    for (const character of clean(value)) {
      if (/\s/.test(character)) continue;
      if (!metadata.characterToGlyph?.(character.codePointAt(0)!)) throw new Error(`The bundled ${family} font does not support “${character}”. Use supported Latin text for PDF export.`);
    }
  }
  function inspect(value: unknown, key = '') {
    if (typeof value === 'string' && key !== 'logo') supported(value);
    else if (Array.isArray(value)) value.forEach(item => inspect(item));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([name, item]) => inspect(item, name));
  }
  inspect(q);
  supported(q.headline || q.project, 'Cormorant'); supported(q.brand.wordmark || q.brand.company, 'Cormorant'); q.packages.forEach(p => supported(p.name, 'Cormorant'));
  pdf.setProperties({ title: `${q.number} - ${q.client.business} - Quotation & Terms`, author: q.brand.company, subject: q.project, creator: 'Kraftt Digital Document Workspace' });
  return { pdf, writer: new Writer(pdf, q) };
}
export async function generateQuotationPdf(source: Quotation, options: { fontData?: Record<string, string>; preview?: boolean; blackAndWhite?: boolean } = {}) {
  const q = copy(source);
  if (options.preview) {
    q.client.business ||= '{{CLIENT_NAME}}'; q.project ||= '{{PROJECT_NAME}}'; q.number ||= '{{QUOTE_NO}}'; q.issueDate ||= localDate(); q.validUntil ||= q.issueDate;
    for (const pkg of q.packages) if (!pkg.lines.length) pkg.lines.push(blankLine('', ''));
    for (const pkg of q.packages) pkg.lines.forEach((line, index) => { line.name ||= `{{SERVICE_${index + 1}}}`; line.fee ||= '0'; line.description ||= line.deliverables.length ? '' : `{{DELIVERABLES_${index + 1} — specify quantities, features and handover format}}`; });
    q.addOns.forEach(a => { a.fee ||= '0'; a.description ||= '{{OPTIONAL_SERVICE_MAIN_POINTS}}'; });
    q.recurring.forEach(r => { r.fee ||= '0'; r.coverage ||= '{{COVERAGE_AND_START_DETAILS}}'; });
  }
  const errors = validateQuotation(q); if (errors.length) throw new Error(errors.join('\n'));
  const { pdf } = await createPdfCanvas(q, options), results = calculations(q);
  const { renderQuoteTemplate } = await import('./quote-template');
  renderQuoteTemplate(pdf, q, results, { blackAndWhite: options.blackAndWhite, preview: !!options.preview, blank: source.packages.every(p => !p.lines.length || p.lines.every(l => !l.name.trim())), source });
  return { pdf, blob: pdf.output('blob'), filename: options.blackAndWhite ? quotationFilename(q).replace(/\.pdf$/, '_BW_Print.pdf') : quotationFilename(q), pages: pdf.getNumberOfPages() };
}
