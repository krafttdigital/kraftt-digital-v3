import type { jsPDF } from 'jspdf';
import type { Quotation } from '../quotation/model';
import { Template } from '../quotation/quote-template';
import { isCurrentReport, reportValue } from './report-template';
import { renderLegacyMonthlyReport } from './report-pdf-v1';
import type { BusinessDocument } from './model';
const K = 72 / 25.4, LEFT = 45.35, RIGHT = 549.91, WIDTH = RIGHT - LEFT;
export function renderMonthlyReport(pdf: jsPDF, doc: BusinessDocument, context: Quotation, options: { preview?: boolean; blackAndWhite?: boolean } = {}) {
  if (!isCurrentReport(doc)) return renderLegacyMonthlyReport(pdf, doc, context, options);
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
    t.ensure(112, 755); t.section = label; t.label(label.toUpperCase(), t.y); t.y += 15;
    const width = WIDTH / cells.length;
    const headers = cells.map(cell => t.wrap(cell.label.toUpperCase(), width - 18, 6.5, true));
    const headerHeight = Math.max(...headers.map(lines => lines.length)) * 9 + 17;
    // Match the documents' Cormorant display figures and Outfit supporting text.
    // Unfilled placeholders and text lists stay in Outfit for legibility.
    const display = cells.map(cell => !cell.list && !cell.value.startsWith('{{'));
    const sizes = cells.map((cell, index) => {
      let size = display[index] ? 22 : 7.5;
      if (cell.value.startsWith('{{')) while (size > 5 && t.width(cell.value, size) > width - 20) size -= .25;
      if (display[index]) {
        t.font(size, false, '#1A1712', 'serif');
        while (size > 10 && pdf.getTextWidth(cell.value) * K > width - 20) { size -= .5; t.font(size, false, '#1A1712', 'serif'); }
      }
      return size;
    });
    const rows: string[][] = cells.map((cell, index) => {
      if (!display[index]) return t.wrap(cell.value, width - 20, sizes[index]);
      t.font(sizes[index], false, '#1A1712', 'serif');
      return pdf.splitTextToSize(cell.value, (width - 20) / K) as string[];
    });
    let offset = 0; const total = Math.max(...rows.map(lines => lines.length));
    do {
      t.ensure(headerHeight + 51, 755);
      const rowCount = Math.max(1, Math.min(total - offset, Math.floor((755 - t.y - headerHeight - 28) / 18)));
      const height = headerHeight + 28 + rowCount * 18;
      t.rect(LEFT, t.y, WIDTH, headerHeight, '#0D0D0D');
      t.rect(LEFT, t.y + headerHeight, WIDTH, height - headerHeight, '#EFE9DC');
      cells.forEach((cell, index) => {
        const x = LEFT + index * width;
        headers[index].forEach((line, i) => t.text(line, x + width / 2, t.y + (headerHeight - headers[index].length * 9) / 2 + 7 + i * 9, 6.5, true, '#E8DCC8', 'center'));
        rows[index].slice(offset, offset + rowCount).forEach((line, i) => t.text(line, cell.list ? x + 10 : x + width / 2, t.y + headerHeight + 25 + i * 18, sizes[index], false, '#1A1712', cell.list ? 'left' : 'center', display[index] ? 'serif' : 'body'));
        if (index) { pdf.setDrawColor('#D8D0C2'); pdf.line(x / K, (t.y + headerHeight) / K, x / K, (t.y + height) / K); }
      });
      pdf.setDrawColor('#E2DDD3'); pdf.rect(LEFT / K, (t.y + headerHeight) / K, WIDTH / K, (height - headerHeight) / K);
      t.y += height + 15; offset += rowCount;
      if (offset < total) t.page(label);
    } while (offset < total);
  }
  function note(text: string) { t.y = t.paragraph(text, LEFT, t.y, WIDTH, 8, 12) + 15; }
  metrics('Traffic Insights', [{ label: 'Total Impressions', value: count('TOTAL_IMPRESSIONS') }, { label: 'Total Clicks', value: count('TOTAL_CLICKS') }, { label: 'Avg. CTR', value: percent('AVG_CTR') }, { label: 'Top Pages', value: value('TOP_PAGES'), list: true }]);
  metrics('Traffic Sources', [{ label: 'Google / Search Engines', value: count('SEARCH_TRAFFIC') }, { label: 'Social Media', value: count('SOCIAL_TRAFFIC') }, { label: 'Unknown Sources', value: count('UNKNOWN_TRAFFIC') }, { label: 'Highest Traffic Source', value: value('HIGHEST_TRAFFIC_SOURCE'), list: true }]);
  note(value('TRAFFIC_INSIGHT'));
  metrics('User Behavior', [{ label: 'Top Queries', value: value('TOP_QUERIES'), list: true }, { label: 'Top Countries', value: value('TOP_COUNTRIES'), list: true }, { label: 'Avg. Scroll Depth', value: percent('AVG_SCROLL_DEPTH') }, { label: 'Avg. Active Time', value: value('AVG_ACTIVE_TIME') }]);
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
