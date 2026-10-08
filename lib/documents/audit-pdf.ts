import type { jsPDF } from 'jspdf';
import { auditValue, auditExtras } from './audit-template';
import type { BusinessDocument } from './model';
const K = 72 / 25.4, LEFT = 45.35, RIGHT = 549.91, WIDTH = RIGHT - LEFT;
type Card = { title: string; body: string; score?: string };
class AuditCanvas {
  y = 99; dark = false; section = 'Audit snapshot'; themes: boolean[] = [];
  constructor(readonly pdf: jsPDF, readonly doc: BusinessDocument, readonly print: boolean) {}
  get ink() { return this.dark ? '#E8DCC8' : '#1A1712'; }
  get body() { return this.dark ? '#B7AD9B' : '#4A443C'; }
  font(size: number, bold = false, serif = false, color = this.body) { this.pdf.setFont(serif ? 'Cormorant' : 'TemplateOutfit', bold ? 'bold' : 'normal'); this.pdf.setFontSize(size); this.pdf.setTextColor(color); }
  text(value: string, x: number, y: number, size = 8.25, bold = false, serif = false, color = this.body, align: 'left' | 'right' = 'left') { this.font(size, bold, serif, color); this.pdf.text(value, x / K, y / K, { align }); }
  wrap(value: string, width: number, size = 8.25, bold = false, serif = false) { this.font(size, bold, serif); return this.pdf.splitTextToSize(value.replace(/\t/g, '  '), width / K) as string[]; }
  rect(x: number, y: number, w: number, h: number, color: string) { this.pdf.setFillColor(color); this.pdf.rect(x / K, y / K, w / K, h / K, 'F'); }
  rule(y: number, x = LEFT, end = RIGHT) { this.pdf.setDrawColor(this.dark ? '#38332B' : '#E2DDD3'); this.pdf.setLineWidth(.5 / K); this.pdf.line(x / K, y / K, end / K, y / K); }
  label(value: string, y = this.y, x = LEFT) { this.pdf.setCharSpace(.8 / K); this.text(value.toUpperCase(), x, y, 6.75, true, false, '#8B7355'); this.pdf.setCharSpace(0); }
  page(section: string, dark = false, continuation = false) {
    if (this.themes.length) this.pdf.addPage();
    this.dark = dark && !this.print; this.section = section; this.themes.push(this.dark);
    this.rect(0, 0, 596, 843, this.print ? '#FFFFFF' : this.dark ? '#0D0D0D' : '#F6F3ED');
    this.text('Kraftt.', LEFT, 58.5, 21.75, false, true, this.ink);
    this.text('Perpared for', RIGHT, 48, 7.5, true, false, this.ink, 'right');
    const name = this.wrap(this.doc.client.business || '{{CLIENT_NAME}}', 260, 7.5);
    name.forEach((line, index) => this.text(line, RIGHT, 60 + index * 9, 7.5, false, false, this.body, 'right'));
    const titleLines = this.wrap(this.doc.title || 'Business Transformation Audit', 235, 6.5);
    titleLines.forEach((line, index) => this.text(line, LEFT, 70 + index * 8, 6.5, true, false, '#8B7355'));
    const headerBottom = Math.max(75.375, 65 + name.length * 9, 74 + (titleLines.length - 1) * 8); this.rule(headerBottom); this.y = Math.max(99, headerBottom + 24);
    if (continuation) { this.label(section + ' — continued'); this.y += 24; }
  }
  ensure(height: number) { if (this.y + height > 755) this.page(this.section, this.dark, true); }
  paragraph(value: string, width = WIDTH, x = LEFT, size = 8.25, leading = 12.5, bold = false, serif = false) {
    for (const line of this.wrap(value, width, size, bold, serif)) { this.ensure(leading); this.text(line, x, this.y, size, bold, serif, bold || serif ? this.ink : this.body); this.y += leading; }
  }
  heading(label: string, title: string, summary: string) {
    this.label(label); this.y += 31;
    this.paragraph(title, 450, LEFT, 27, 31, false, true); this.y += 8;
    this.paragraph(summary, WIDTH, LEFT, 8.5, 13); this.y += 20;
  }
  cards(cards: Card[], columns = cards.length, highlight = false) {
    const gap = 12, width = (WIDTH - gap * (columns - 1)) / columns;
    for (let rowStart = 0; rowStart < cards.length; rowStart += columns) {
      const row = cards.slice(rowStart, rowStart + columns);
      const prepared = row.map(card => ({ ...card, titles: this.wrap(card.title, width - 24, 8, true), lines: this.wrap(card.body, width - 24, 8) }));
      let offset = 0;
      const total = Math.max(...prepared.map(c => c.lines.length));
      do {
        const titleHeight = Math.max(...prepared.map(c => c.titles.length)) * 11;
        const scoreHeight = prepared.some(c => c.score !== undefined) ? 34 : 0;
        this.ensure(titleHeight + scoreHeight + 52);
        const count = Math.max(1, Math.min(total - offset, Math.floor((755 - this.y - 28 - titleHeight - scoreHeight) / 11.5)));
        const h = 28 + titleHeight + scoreHeight + count * 11.5;
        prepared.forEach((card, index) => {
          const x = LEFT + index * (width + gap);
          this.rect(x, this.y, width, h, highlight ? '#EFE9DC' : this.dark ? '#1A1712' : '#FFFFFF');
          this.pdf.setDrawColor(this.dark ? '#38332B' : '#E2DDD3'); this.pdf.setLineWidth(.5 / K); this.pdf.rect(x / K, this.y / K, width / K, h / K);
          card.titles.forEach((line, i) => this.text(line, x + 12, this.y + 18 + i * 11, 8, true, false, this.ink));
          let bodyTop = this.y + 22 + titleHeight;
          if (card.score !== undefined) { this.text(card.score, x + 12, bodyTop + 20, 27, false, true, this.ink); bodyTop += 34; }
          card.lines.slice(offset, offset + count).forEach((line, i) => this.text(line, x + 12, bodyTop + i * 11.5, 8));
        });
        this.y += h + 14; offset += count;
        if (offset < total) this.page(this.section, this.dark, true);
      } while (offset < total);
    }
  }
  footer() {
    const count = this.pdf.getNumberOfPages();
    for (let page = 1; page <= count; page++) {
      this.pdf.setPage(page); this.dark = this.themes[page - 1]; this.rule(793.125);
      const name = `kraftt digital × ${this.doc.client.business || '{{CLIENT_NAME}}'}`;
      const line = this.wrap(name, 270, 6.5)[0];
      this.text(line, LEFT, 808, 6.5, false, false, this.body);
      this.text(`Contact . hello@krafttdigital.in · ${page} / ${count}`, RIGHT, 808, 6.5, false, false, this.body, 'right');
    }
  }
}
export function renderAuditTemplate(pdf: jsPDF, doc: BusinessDocument, options: { blackAndWhite?: boolean } = {}) {
  const p = new AuditCanvas(pdf, doc, !!options.blackAndWhite);
  const value = (key: string) => auditValue(doc, key) || `{{${key}}}`;
  const points = (key: string) => value(key).split('\n').map(line => line.trim()).filter(Boolean).map(line => '— ' + line.replace(/^[•—-]\s*/, '')).join('\n');
  const score = (key: string) => auditValue(doc, key) ? auditValue(doc, key) + '%' : (key === 'OVERALL_SCORE' ? '{{SCORE}}%' : '{{#}}%');
  p.page('Audit snapshot', true);
  p.heading('01 — Audit snapshot', value('SNAPSHOT_HEADLINE'), value('SNAPSHOT_SUMMARY'));
  p.paragraph(doc.project || '{{AUDIT_SCOPE}}', WIDTH, LEFT, 7, 10);
  p.paragraph(`Date: ${doc.date} · Reference: ${doc.number}`, WIDTH, LEFT, 7, 10); p.y += 15;
  if (auditValue(doc, 'INCLUDE_SCORES') !== '0') {
    const overallWidth = 240, gap = 12, smallWidth = (WIDTH - overallWidth - gap - 10) / 2;
    const small = ['BRAND', 'DIGITAL', 'OPERATIONS', 'GROWTH'].map(key => ({ title: value(key + '_LABEL'), score: score(key + '_SCORE'), lines: p.wrap(value(key + '_NOTE'), smallWidth - 20, 7.5) }));
    const rowHeights = [0, 2].map(offset => Math.max(...small.slice(offset, offset + 2).map(c => 66 + c.lines.length * 10.5 + Math.max(0, p.wrap(c.title, smallWidth - 20, 6.5, true).length - 1) * 8)));
    const overallLines = p.wrap(value('OVERALL_INTERPRETATION') + '\n' + value('TAKEAWAY'), overallWidth - 24, 8);
    const height = Math.max(rowHeights[0] + rowHeights[1] + 10, 95 + overallLines.length * 11.5);
    if (height > 580) {
      p.cards([{ title: 'Overall readiness', score: score('OVERALL_SCORE'), body: value('OVERALL_INTERPRETATION') + '\n' + value('TAKEAWAY') }], 1);
      p.cards(['BRAND', 'DIGITAL', 'OPERATIONS', 'GROWTH'].map(key => ({ title: value(key + '_LABEL'), score: score(key + '_SCORE'), body: value(key + '_NOTE') })), 2);
    } else {
      p.ensure(height + 14);
      const top = p.y, fill = p.dark ? '#1A1712' : '#FFFFFF';
      p.rect(LEFT, top, overallWidth, height, fill); p.pdf.setDrawColor(p.dark ? '#38332B' : '#E2DDD3'); p.pdf.rect(LEFT / K, top / K, overallWidth / K, height / K); p.label('Overall readiness', top + 20, LEFT + 12);
      p.text(score('OVERALL_SCORE'), LEFT + 12, top + 64, 34, false, true, p.ink);
      overallLines.forEach((line, i) => p.text(line, LEFT + 12, top + 89 + i * 11.5, 8));
      small.forEach((card, index) => {
        const row = Math.floor(index / 2), x = LEFT + overallWidth + gap + index % 2 * (smallWidth + 10), y = top + (row ? rowHeights[0] + 10 : 0);
        p.rect(x, y, smallWidth, rowHeights[row], fill); p.pdf.rect(x / K, y / K, smallWidth / K, rowHeights[row] / K);
        const titleLines = p.wrap(card.title, smallWidth - 20, 6.5, true);
        titleLines.forEach((line, i) => p.text(line, x + 10, y + 15 + i * 8, 6.5, true, false, '#8B7355'));
        const shift = Math.max(0, titleLines.length - 1) * 8;
        p.text(card.score, x + 10, y + 43 + shift, 22, false, true, p.ink);
        card.lines.forEach((line, i) => p.text(line, x + 10, y + 59 + shift + i * 10.5, 7.5));
      });
      p.y = top + height + 18;
    }
  }
  p.ensure(72); p.label('Top findings'); p.y += 18;
  p.cards([{ title: 'What is already strong', body: points('STRENGTHS') }, { title: 'What needs attention first', body: points('ISSUES') }], 2);
  if (auditValue(doc, 'KRAFTT_LINE')) { p.y += 6; p.paragraph(value('KRAFTT_LINE'), WIDTH, LEFT, 12, 17, false, true); }

  for (const extra of auditExtras(doc)) {
    p.page('Detailed findings & evidence');
    p.heading('Detailed finding / visual evidence', extra.title || '{{FINDING_TITLE}}', extra.source ? 'Evidence / source: ' + extra.source : '');
    if (extra.image) {
      const info = pdf.getImageProperties(extra.image), height = Math.min(285, WIDTH * info.height / info.width), width = height * info.width / info.height;
      p.ensure(height + 15); pdf.addImage(extra.image, LEFT / K, p.y / K, width / K, height / K); p.y += height + 20;
    }
    p.paragraph(extra.body || '{{FINDING_OBSERVATIONS_IMPACT_AND_RECOMMENDATIONS}}');
  }

  p.page('Priority map');
  p.heading('02 — Priority map', value('PRIORITY_HEADLINE'), value('PRIORITY_SUMMARY'));
  p.cards(['FIX_NOW', 'BUILD_NEXT', 'LATER'].map(key => ({ title: key.replaceAll('_', ' ') + '\n' + value(key + '_TITLE'), body: points(key + '_ACTIONS') })), 3);
  p.ensure(65); p.label('How Kraftt would move this forward'); p.y += 19;
  const stages = value('ROADMAP').split('\n').map(stage => stage.trim()).filter(Boolean);
  let chipX = LEFT, chipBottom = p.y;
  stages.forEach((stage, index) => {
    if (stage.length > 180) { p.y = chipBottom + 12; p.paragraph(stage); chipX = LEFT; chipBottom = p.y; return; }
    const lines = p.wrap(stage.toUpperCase(), 145, 7, true); p.font(7, true);
    const width = Math.min(165, Math.max(...lines.map(line => pdf.getTextWidth(line) * K)) + 18), height = 14 + lines.length * 10;
    if (chipX + width > RIGHT) { p.y = chipBottom + 9; chipX = LEFT; }
    const pageBefore = pdf.getNumberOfPages(); p.ensure(height + 10);
    if (pdf.getNumberOfPages() !== pageBefore) { chipX = LEFT; chipBottom = p.y; }
    p.rect(chipX, p.y, width, height, index % 2 ? '#EFE9DC' : '#0D0D0D');
    lines.forEach((line, i) => p.text(line, chipX + 9, p.y + 15 + i * 10, 7, true, false, index % 2 ? '#1A1712' : '#E8DCC8'));
    chipBottom = Math.max(chipBottom, p.y + height); chipX += width + 15;
  });
  p.y = chipBottom + 17;
  p.paragraph(value('ROADMAP_NOTE')); p.y += 22;
  p.cards([{ title: value('FIRST_MOVE') + '\nWhat Kraftt would start with', body: value('FIRST_SCOPE') }, { title: value('NEXT_STEP') + '\nWhat happens after this audit', body: value('NEXT_STEP_NOTE') }], 2, true);

  p.footer();
}
