import type { CaseStudy, CaseStudyPermission } from './model';

type ExportField = { label: string; value: string };
type ExportSection = { letter: string; title: string; fields: ExportField[] };

const permission = (value: CaseStudyPermission) => value === 'not_confirmed' ? 'Not confirmed' : value === 'yes' ? 'Yes' : 'No';
const field = (label: string, value: string): ExportField => ({ label, value: value.trim() });

export function caseStudySections(study: CaseStudy): ExportSection[] {
  const { basics, before, brief, decisions, results, voice, hooks } = study;
  return [
    { letter: 'A', title: 'Basics', fields: [
      field('Client name', basics.clientName), field('Business / project', basics.business), field('Industry', basics.industry), field('City', basics.city),
      field('Live website', basics.website), field('Project dates', basics.projectDates), field('Services delivered', basics.services),
      field('Name, logo and screenshots approved?', permission(basics.assetPermission)), field('Approved by', basics.approvedBy),
      field('Approval date', basics.approvedOn), field('Happy to be tagged or do a collab post?', permission(basics.tagCollab)),
    ] },
    { letter: 'B', title: 'Before', fields: [
      field('What the business does and who its customers are', before.businessCustomers), field('How customers found them before', before.discoveryChannels),
      field('Visible problems with the old site or presence', before.visibleProblems), field('Old desktop screenshot', before.desktopScreenshot),
      field('Desktop screenshot date', before.desktopDate), field('Old mobile screenshot', before.mobileScreenshot), field('Mobile screenshot date', before.mobileDate),
    ] },
    { letter: 'C', title: 'The brief', fields: [
      field('What the client asked for, in their own words', brief.clientWords), field('What they actually needed', brief.actualNeed),
      field('Constraints', brief.constraints),
    ] },
    { letter: 'D', title: 'What we did: key decisions', fields: decisions.flatMap((item, index) => [
      field(`Decision ${index + 1}`, item.decision), field('Why we made it', item.reason), field('What changed visibly', item.visibleChange),
    ]) },
    { letter: 'E', title: 'Results (verified only)', fields: [
      ...results.metrics.flatMap((item, index) => [
        field(`Result ${index + 1}: metric`, item.metric), field('Number or result', item.value),
        field('Date range', item.dateRange), field('Source / evidence', item.source),
      ]),
      field('Enquiry changes the client confirmed', results.enquiryChanges), field('Message or screenshot evidence', results.enquiryEvidence),
      field('What we cannot claim', results.cannotClaim),
    ] },
    { letter: 'F', title: 'Client voice', fields: [
      field('Testimonial', voice.testimonial), field('Voice note', voice.voiceNote),
      field('Permission to publish testimonial?', permission(voice.publishPermission)), field('One thing the client worried about at the start', voice.startingConcern),
    ] },
    { letter: 'G', title: 'Story hooks', fields: [
      field('The most surprising thing we found', hooks.surprise), field('A decision we debated, and what we chose', hooks.debatedDecision),
      field('A common mistake in this industry’s old sites', hooks.commonMistake), field('What we would do differently next time', hooks.nextTime),
      field('One line an owner in this industry would relate to', hooks.relatableLine),
    ] },
  ];
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const htmlValue = (value: string) => escapeHtml(value || 'Not provided').replace(/\r?\n/g, '<br>');
export function caseStudyFilename(study: CaseStudy, extension: 'html' | 'pdf') {
  const name = (study.basics.clientName || study.basics.business || 'Untitled_Project').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'Untitled_Project';
  return `Kraftt_Case_Study_${name}.${extension}`;
}

export function generateCaseStudyHtml(study: CaseStudy): string {
  const title = study.basics.clientName || study.basics.business || 'Untitled project';
  const sections = caseStudySections(study);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} · Case study intake · Kraftt Digital</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f6f3ed;color:#231f1a;font:15px/1.55 Arial,sans-serif}main{max-width:900px;margin:auto;padding:50px 32px 80px}.eyebrow{color:#8b7355;letter-spacing:.16em;text-transform:uppercase;font-size:11px;font-weight:700}.masthead{border-bottom:1px solid #d8d0c2;padding-bottom:28px;margin-bottom:28px}.brand{font:44px/1 Georgia,serif;margin:0 0 24px}.brand span{color:#8b7355}h1{font:normal clamp(36px,6vw,62px)/1.05 Georgia,serif;margin:12px 0}h2{font:normal 32px/1.1 Georgia,serif;margin:0 0 22px}p{margin:0}.meta{color:#6d6255;font-size:13px}.section{background:#fcfaf6;border:1px solid #ded7cb;margin:18px 0;padding:26px 30px;break-inside:avoid-page}.section-head{border-bottom:1px solid #ded7cb;margin-bottom:16px;padding-bottom:12px}.row{display:grid;grid-template-columns:minmax(150px,30%) 1fr;gap:20px;border-bottom:1px solid #ebe5db;padding:11px 0;break-inside:avoid}.row:last-child{border:0}.label{font-weight:700;color:#65553f;font-size:12px}.value{overflow-wrap:anywhere;white-space:normal}.empty{color:#8f8578;font-style:italic}footer{border-top:1px solid #d8d0c2;margin-top:30px;padding-top:15px;color:#6d6255;font-size:12px}@media(max-width:640px){main{padding:30px 16px}.section{padding:20px 16px}.row{display:block}.label{display:block;margin-bottom:4px}}@media print{body{background:#fff}main{max-width:none;padding:0}.section{background:#fff;margin:12px 0;padding:16px 20px;break-inside:auto}.row{break-inside:avoid}@page{size:A4;margin:16mm}}
</style></head><body><main><header class="masthead"><div class="brand">Kraftt<span>.</span></div><div class="eyebrow">Case study intake · private working notes</div><h1>${escapeHtml(title)}</h1><p class="meta">Last edited ${escapeHtml(new Date(study.modifiedAt).toLocaleDateString('en-IN'))} · Permission and evidence details are recorded below.</p></header>
${sections.map(section => `<section class="section"><div class="section-head"><div class="eyebrow">${section.letter} / G</div><h2>${escapeHtml(section.title)}</h2></div>${section.fields.map(item => `<div class="row"><div class="label">${escapeHtml(item.label)}</div><div class="value${item.value ? '' : ' empty'}">${htmlValue(item.value)}</div></div>`).join('')}</section>`).join('\n')}
<footer>Working notes · Verify every result and permission before public use.</footer></main></body></html>`;
}

let fontCache: Promise<Record<string, string>> | undefined;
async function fontData() {
  fontCache ??= Promise.all(['NotoSans-Regular.ttf', 'NotoSans-Bold.ttf', 'Cormorant-Semibold.ttf'].map(async name => {
    const response = await fetch(`/admin-assets/fonts/${name}`);
    if (!response.ok) throw new Error('Case-study PDF fonts could not be loaded. Try again when the admin assets are available.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
    return [name, btoa(binary)] as const;
  })).then(Object.fromEntries).catch(error => { fontCache = undefined; throw error; });
  return fontCache;
}

export async function generateCaseStudyPdf(study: CaseStudy, suppliedFonts?: Record<string, string>): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
  const fonts = suppliedFonts || await fontData();
  for (const [file, data] of Object.entries(fonts)) pdf.addFileToVFS(file, data);
  pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  pdf.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
  pdf.addFont('Cormorant-Semibold.ttf', 'Cormorant', 'normal');
  const ink = '#231F1A', umber = '#8B7355', line = '#D8D0C2', left = 18, right = 192, bottom = 273;
  let y = 0, currentSection = '';
  const safe = (value: string, family = 'NotoSans') => {
    pdf.setFont(family, 'normal');
    const metadata = pdf.getFont().metadata as { characterToGlyph?: (code: number) => number };
    for (const char of value) if (!/[\s\u0000-\u001f]/.test(char) && !metadata.characterToGlyph?.(char.codePointAt(0)!)) throw new Error(`PDF font cannot display “${char}”. Download HTML to preserve this character.`);
    return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/\r\n/g, '\n');
  };
  const font = (size: number, weight: 'normal' | 'bold' = 'normal', family = 'NotoSans', color = ink) => { pdf.setFont(family, weight); pdf.setFontSize(size); pdf.setTextColor(color); };
  const startPage = () => {
    pdf.setFillColor('#F6F3ED'); pdf.rect(0, 0, 210, 297, 'F');
    font(22, 'normal', 'Cormorant'); pdf.text('Kraftt.', left, 23);
    pdf.setDrawColor(line); pdf.line(left, 30, right, 30);
    y = 40;
  };
  const nextPage = () => { pdf.addPage(); startPage(); if (currentSection) { font(8, 'bold', 'NotoSans', umber); pdf.text(`${currentSection.toUpperCase()} · CONTINUED`, left, y); y += 9; } };
  const ensure = (height: number) => { if (y + height > bottom) nextPage(); };
  startPage();
  const title = study.basics.clientName || study.basics.business || 'Untitled project';
  font(8, 'bold', 'NotoSans', umber); pdf.text('CASE STUDY INTAKE · PRIVATE WORKING NOTES', left, y); y += 11;
  font(27, 'normal', 'Cormorant');
  for (const item of pdf.splitTextToSize(safe(title, 'Cormorant'), right - left) as string[]) { ensure(10); pdf.text(item, left, y); y += 10; }
  y += 5;
  for (const section of caseStudySections(study)) {
    currentSection = `${section.letter} / G · ${section.title}`;
    ensure(19); pdf.setDrawColor(line); pdf.line(left, y, right, y); y += 7;
    font(8, 'bold', 'NotoSans', umber); pdf.text(`${section.letter} / G`, left, y); y += 8;
    font(18, 'normal', 'Cormorant'); pdf.text(safe(section.title, 'Cormorant'), left, y); y += 8;
    for (const item of section.fields) {
      const label = safe(item.label), value = safe(item.value || 'Not provided');
      font(8, 'bold'); const labelLines = pdf.splitTextToSize(label, right - left) as string[];
      font(9); const valueLines = pdf.splitTextToSize(value, right - left) as string[];
      ensure(labelLines.length * 4 + Math.min(valueLines.length, 2) * 5 + 5);
      font(8, 'bold', 'NotoSans', umber);
      for (const text of labelLines) { ensure(5); pdf.text(text, left, y); y += 4; }
      font(9);
      for (const text of valueLines) { ensure(5); pdf.text(text, left, y); y += 5; }
      y += 3;
    }
    y += 5;
  }
  const count = pdf.getNumberOfPages();
  for (let page = 1; page <= count; page++) {
    pdf.setPage(page); pdf.setDrawColor(line); pdf.line(left, 281, right, 281);
    font(7, 'normal', 'NotoSans', umber); pdf.text('Working notes · Verify results and permissions before public use', left, 287);
    pdf.text(`${page} / ${count}`, right, 287, { align: 'right' });
  }
  pdf.setProperties({ title: `${title} · Case study intake`, author: 'Kraftt Digital', creator: 'Kraftt Digital Admin' });
  return pdf.output('blob');
}
