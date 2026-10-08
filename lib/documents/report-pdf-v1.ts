import type { jsPDF } from 'jspdf';
import type { Quotation } from '../quotation/model';
import { Template } from '../quotation/quote-template';
import { reportValue } from './report-template';
import type { BusinessDocument } from './model';
const K = 72 / 25.4, LEFT = 45.35, RIGHT = 549.91, WIDTH = RIGHT - LEFT;
export function renderLegacyMonthlyReport(pdf: jsPDF, doc: BusinessDocument, context: Quotation, options: { preview?: boolean; blackAndWhite?: boolean } = {}) {
  const t = new Template(pdf, context, { preview: !!options.preview, blank: false, source: context, blackAndWhite: options.blackAndWhite });
  const value = (key: string) => reportValue(doc, key) || `{{${key}}}`;
  const count = (key: string) => /^\d+$/.test(reportValue(doc, key)) && Number.isSafeInteger(Number(reportValue(doc, key))) ? Number(reportValue(doc, key)).toLocaleString('en-IN') : value(key);
  const percent = (key: string) => value(key) + '%';
  t.section = 'Monthly Report'; t.label('MONTHLY PERFORMANCE', 99);
  t.y = 132;
  for (const line of t.wrap(doc.title || 'Monthly Report', WIDTH, 30)) { t.text(line, LEFT, t.y, 30, false, '#1A1712', 'left', 'serif'); t.y += 34; }
  t.y = t.paragraph(doc.project || '{{PROJECT_TITLE}}', LEFT, t.y + 1, WIDTH, 8.25, 12) + 4;
  t.y = t.paragraph(`Period: ${value('REPORT_PERIOD')} · Issued: ${doc.date}`, LEFT, t.y, WIDTH, 7.5, 11) + 2;
  t.y = t.paragraph(`Source: ${value('DATA_SOURCE')} · Reference: ${doc.number}`, LEFT, t.y, WIDTH, 7, 10) + 10;
  if (reportValue(doc, 'REPORT_SUMMARY')) t.y = t.paragraph(value('REPORT_SUMMARY'), LEFT, t.y, WIDTH, 8.25, 12) + 12;

  function metrics(label: string, cells: { label: string; value: string; list?: boolean }[]) {
    t.ensure(107, 755); t.section = label; t.label(label.toUpperCase(), t.y); t.y += 15;
    const width = WIDTH / cells.length;
    const sizes = cells.map(cell => { let size = cell.list ? 7.5 : 16; while (!cell.list && size > 9 && t.width(cell.value, size, true) > width - 20) size -= .5; return size; });
    const rows = cells.map((cell, index) => t.wrap(cell.value, width - 20, sizes[index], !cell.list));
    let offset = 0; const total = Math.max(...rows.map(lines => lines.length));
    do {
      t.ensure(72, 755);
      const count = Math.max(1, Math.min(total - offset, Math.floor((755 - t.y - 53) / 18)));
      const height = 53 + count * 18;
      t.rect(LEFT, t.y, WIDTH, 25, '#0D0D0D'); t.rect(LEFT, t.y + 25, WIDTH, height - 25, '#EFE9DC');
      cells.forEach((cell, index) => {
        const x = LEFT + index * width;
        let size = 6.25; while (size > 4.5 && t.width(cell.label.toUpperCase(), size, true) > width - 14) size -= .25;
        t.text(cell.label.toUpperCase(), x + width / 2, t.y + 16, size, true, '#E8DCC8', 'center');
        rows[index].slice(offset, offset + count).forEach((line, i) => t.text(line, cell.list ? x + 10 : x + width / 2, t.y + 48 + i * 18, sizes[index], !cell.list, '#1A1712', cell.list ? 'left' : 'center'));
        if (index) { pdf.setDrawColor('#D8D0C2'); pdf.line(x / K, (t.y + 25) / K, x / K, (t.y + height) / K); }
      });
      pdf.setDrawColor('#E2DDD3'); pdf.rect(LEFT / K, (t.y + 25) / K, WIDTH / K, (height - 25) / K);
      t.y += height + 15; offset += count;
      if (offset < total) t.page(label);
    } while (offset < total);
  }
  function note(text: string) { t.y = t.paragraph(text, LEFT, t.y, WIDTH, 8, 12) + 15; }
  metrics('Traffic insight', [{ label: 'Total visitors', value: count('TOTAL_VISITORS') }, { label: 'Unique visitors', value: count('UNIQUE_VISITORS') }, { label: 'Top pages', value: value('TOP_PAGES'), list: true }]);
  metrics('Traffic sources', [{ label: 'Direct', value: count('DIRECT_TRAFFIC') }, { label: 'Google / SEO', value: count('SEARCH_TRAFFIC') }, { label: 'Social media', value: count('SOCIAL_TRAFFIC') }]);
  note(value('TRAFFIC_INSIGHT'));
  metrics('User behaviour', [{ label: 'Average session duration', value: value('SESSION_DURATION') }, { label: 'Bounce rate', value: percent('BOUNCE_RATE') }, { label: 'Conversion rate', value: percent('CONVERSION_RATE') }]);
  if (reportValue(doc, 'CONVERSION_DEFINITION')) note('Conversion measured: ' + value('CONVERSION_DEFINITION'));
  note(value('BEHAVIOUR_INSIGHT'));
  t.ensure(44, 755); t.section = 'Updates & improvements'; t.rule(t.y); t.y += 19; t.label('UPDATES & IMPROVEMENTS', t.y); t.y += 17;
  note(value('UPDATES_IMPROVEMENTS'));
  if (reportValue(doc, 'ADDITIONAL_NOTES')) { t.ensure(44, 755); t.label('NEXT MONTH & CLIENT ACTIONS', t.y); t.y += 17; note(value('ADDITIONAL_NOTES')); }
  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page); t.rule(802);
    const client = `kraftt digital × ${doc.client.business || '{{CLIENT_NAME}}'}`; let size = 7;
    while (size > 4.5 && t.width(client, size) > 270) size -= .1;
    t.text(client, LEFT, 816, size, false, '#8B8173'); t.text('Contact . hello@krafttdigital.in', RIGHT, 816, 7, false, '#8B8173', 'right');
  }
}
