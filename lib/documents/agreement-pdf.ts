import type { jsPDF } from 'jspdf';
import { agreementIntro, agreementScope, agreementTemplateText, agreementValue } from './agreement-template';
import type { BusinessDocument } from './model';
const K = 72 / 25.4;
const backgrounds: Partial<Record<'colour' | 'print', Promise<Uint8Array>>> = {};
async function artwork(blackAndWhite = false) {
  const mode = blackAndWhite ? 'print' : 'colour';
  backgrounds[mode] ??= fetch(`/admin-assets/templates/client-agreement-v1${blackAndWhite ? '-print' : ''}.png`).then(async response => { if (!response.ok) throw new Error('Client Agreement artwork could not be loaded. Please retry.'); return new Uint8Array(await response.arrayBuffer()); }).catch(error => { delete backgrounds[mode]; throw error; });
  return backgrounds[mode]!;
}
export async function renderAgreementTemplate(pdf: jsPDF, document: BusinessDocument, options: { templateData?: Uint8Array; blackAndWhite?: boolean } = {}) {
  // The sanitized original artwork preserves every untouched clause, rule,
  // colour, footer and supplied Kraftt signature at its exact reference position.
  pdf.addPage([595.2 / K, 841.92 / K]); pdf.deletePage(1);
  pdf.addImage(options.templateData || await artwork(options.blackAndWhite), 'PNG', 0, 0, 595.2 / K, 841.92 / K, undefined, 'FAST');
  const client = document.client.business || '{{CLIENT_NAME}}', project = document.project || '{{PROJECT_TITLE}}';
  const substitute = (text: string) => agreementTemplateText(text, client, project, document.client.contact || '{{CONTACT_NAME}}');
  function text(value: string, x: number, y: number, width: number, maxLines: number, size: number, leading: number, bold = false) {
    let lines: string[] = [];
    for (; size >= 6.4; size -= .1) { pdf.setFont('Outfit', bold ? 'bold' : 'normal'); pdf.setFontSize(size); lines = pdf.splitTextToSize(value, width / K); if (lines.length <= maxLines) break; }
    if (lines.length > maxLines) throw new Error('Shorten the client name or project title to fit the original one-page agreement layout.');
    pdf.setTextColor('#4A443C'); pdf.text(lines, x / K, y / K, { lineHeightFactor: leading / size });
  }
  // jsPDF accepts fractional strings to avoid rounding RGB channels; its types only cover the first channel.
  const fill = (r: string, g: string, b: string) => (pdf.setFillColor as unknown as (r: string, g: string, b: string) => jsPDF).call(pdf, r, g, b);
  const rect = (x: number, y: number, width: number, height: number) => { if (options.blackAndWhite) pdf.setFillColor('#FFFFFF'); else fill('0.9647058824', '0.9529411765', '0.9294117647'); pdf.rect(x / K, y / K, width / K, height / K, 'F'); };
  const rule = (y: number) => { pdf.setDrawColor('#E2DDD3'); pdf.setLineWidth(.75 / K); pdf.line(49 / K, y / K, 560 / K, y / K); };
  // Replace the reference masthead, fixed metadata and black footer only.
  rect(0, 0, 595.2, 145);
  pdf.setFont('Cormorant', 'normal'); pdf.setFontSize(21.75); pdf.setTextColor('#1A1712'); pdf.text('Kraftt.', 49 / K, 58.5 / K);
  pdf.setFont('Outfit', 'bold'); pdf.setFontSize(7.5); pdf.text('Perpared for', 560 / K, 48 / K, { align: 'right' });
  pdf.setFont('Outfit', 'normal');
  const headerName = pdf.splitTextToSize(client, 260 / K) as string[];
  pdf.text(headerName, 560 / K, 60 / K, { align: 'right', lineHeightFactor: 1.2 }); rule(Math.max(75.375, 65 + headerName.length * 9));
  pdf.setFont('Cormorant', 'normal'); pdf.setFontSize(32); pdf.text('Client Agreement', 49 / K, 121 / K);
  rect(48, 276, 246, 17); rect(310, 261, 241, 32);
  text(document.client.address || '{{CLIENT_ADDRESS}}', 49, 282, 224, 2, 8.25, 8);
  text('Digital Authority Scope - ' + (agreementValue(document, 'NUMBER_OF_SERVICES') || '{{NUMBER_OF_SERVICES}}') + ' services', 311.8, 269.9, 235.5, 1, 8.25, 9);
  text('Start Date: ' + (agreementValue(document, 'START_DATE') || '{{START_DATE}}'), 311.8, 286, 235.5, 1, 8.25, 9);
  rect(296.2, 676, 3, 119);
  rect(0, 795, 595.2, 46.92); rule(802);
  text('kraftt digital × ' + client, 49, 816, 275, 1, 7, 9);
  pdf.setFont('Outfit', 'normal'); pdf.setFontSize(7); pdf.setTextColor('#8B8173'); pdf.text('Contact . hello@krafttdigital.in', 560 / K, 816 / K, { align: 'right' });
  // Wrap mixed-weight text using each run's actual font metrics.
  const introRuns = agreementIntro.split(/(\{\{CONTACT_NAME\}\}|\{\{CLIENT_NAME\}\})/).flatMap(part => {
    const bold = part === '{{CONTACT_NAME}}' || part === '{{CLIENT_NAME}}';
    return substitute(part).split(/(\s+)/).filter(Boolean).map(value => ({ value, bold }));
  });
  let introSize = 7.875;
  let rows: typeof introRuns[] = [];
  for (; introSize >= 6.4; introSize -= .1) {
    rows = []; let row: typeof introRuns = [], width = 0;
    for (const run of introRuns) {
      pdf.setFont('Outfit', run.bold ? 'bold' : 'normal'); pdf.setFontSize(introSize);
      const w = pdf.getTextWidth(run.value) * K;
      if (width + w > 498.5 && row.length) { rows.push(row); row = []; width = 0; }
      if (!row.length && /^\s+$/.test(run.value)) continue;
      row.push(run); width += w;
    }
    if (row.length) rows.push(row);
    if (rows.length <= 3) break;
  }
  if (rows.length > 3) throw new Error('Shorten the contact name or project title to fit the one-page agreement.');
  rows.forEach((row, index) => { let x = 49;
    row.forEach(run => { pdf.setFont('Outfit', run.bold ? 'bold' : 'normal'); pdf.setFontSize(introSize); pdf.setTextColor('#4A443C'); pdf.text(run.value, x / K, (159 + index * 13.44) / K); x += pdf.getTextWidth(run.value) * K; });
  });
  text(document.client.contact || '{{CONTACT_PERSON}}', 49.0, 252.6, 224, 2, 8.25, 9, true);
  text(client, 49.0, 269.9, 224, 2, 8.25, 9);
  text(project, 311.8, 252.6, 235.5, 2, 8.25, 9);
  fill('0.9372549020', '0.9137254902', '0.8627450980'); pdf.rect(34.7 / K, 294.5 / K, 526.3 / K, 86.5 / K, 'F');
  pdf.setDrawColor('#E2DDD3'); pdf.setLineWidth(.5 / K); pdf.line(207.75 / K, 294.5 / K, 207.75 / K, 381 / K); pdf.line(34.7 / K, 381 / K, 561 / K, 381 / K);
  pdf.setFont('Outfit', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor('#8B7355'); pdf.setCharSpace(1.2 / K); pdf.text('SCOPE', 49 / K, 316 / K); pdf.setCharSpace(0);
  text(substitute(agreementScope), 223.5, 316.0, 323.8, 4, 7.875, 13.2);
}
