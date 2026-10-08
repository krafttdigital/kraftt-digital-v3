import type { jsPDF } from 'jspdf';
import type { Quotation } from '../quotation/model';
import { Template } from '../quotation/quote-template';
import type { BusinessDocument } from './model';

const LEFT = 45.35, RIGHT = 549.91, WIDTH = RIGHT - LEFT;

export function renderWelcomeLetter(pdf: jsPDF, document: BusinessDocument, context: Quotation, options: { preview?: boolean; blackAndWhite?: boolean } = {}) {
  const t = new Template(pdf, context, { preview: !!options.preview, blank: false, source: context, blackAndWhite: options.blackAndWhite });
  const value = (key: string) => { const field = document.fields.find(f => f.placeholder === key); return field?.value || `{{${key}}}`; };
  t.section = 'Welcome';
  t.label('WELCOME · PROJECT ONBOARDING', 99);
  const title = document.title || 'Welcome Letter';
  let titleY = 132;
  for (const line of t.wrap(title, WIDTH, 30)) { t.text(line, LEFT, titleY, 30, false, '#1A1712', 'left', 'serif'); titleY += 34; }
  t.y = titleY + 1;
  t.y = t.paragraph(document.project || '{{PROJECT_TITLE}}', LEFT, t.y, WIDTH, 8.25, 12) + 6;
  t.y = t.paragraph(`Date: ${document.date} · Reference: ${document.number}`, LEFT, t.y, WIDTH, 7, 10) + 16;
  t.rule(t.y); t.y += 23;
  const recipient = document.client.contact || document.client.business || '{{CONTACT_NAME}}';
  t.y = t.paragraph(`Dear ${recipient},`, LEFT, t.y, WIDTH, 9, 13, true, '#231F1A') + 6;
  t.y = t.paragraph(value('WELCOME_MESSAGE'), LEFT, t.y, WIDTH, 8.5, 13) + 14;

  function section(label: string, body: string) {
    t.ensure(48, 714); t.label(label, t.y); t.y += 15;
    t.y = t.paragraph(body, LEFT, t.y, WIDTH, 8.25, 12.5) + 15;
  }
  section('YOUR PROJECT', value('CONFIRMED_SCOPE_AND_GOALS'));
  section('PEOPLE & COMMUNICATION', value('CONTACTS_CHANNELS_AND_REVIEW_PROCESS'));

  // Split long onboarding requirements into shaded continuation panels instead of clipping.
  const handover = t.wrap(value('CONTENT_ASSETS_AND_ACCESS_REQUIRED'), WIDTH - 24, 8.25);
  let offset = 0;
  while (offset < handover.length) {
    t.ensure(72, 714);
    const count = Math.max(1, Math.min(handover.length - offset, Math.floor((714 - t.y - 43) / 12.5)));
    const height = 43 + count * 12.5;
    t.rect(LEFT, t.y, WIDTH, height, '#EFE9DC');
    t.label(offset ? 'GETTING STARTED - CONTINUED' : 'GETTING STARTED', t.y + 18, LEFT + 12, '#8B7355', 6.75);
    handover.slice(offset, offset + count).forEach((line, index) => t.text(line, LEFT + 12, t.y + 36 + index * 12.5, 8.25, false, '#4A443C'));
    t.y += height + 18; offset += count;
    if (offset < handover.length) t.page('Getting started');
  }
  section('TIMELINE & FIRST MILESTONE', value('KICKOFF_DATE_AND_FIRST_MILESTONE'));
  section('YOUR NEXT STEPS', value('CLIENT_ONBOARDING_ACTIONS'));
  t.ensure(73, 755);
  t.y = t.paragraph('Thank you for choosing Kraftt Digital. We look forward to working with you.', LEFT, t.y, WIDTH, 8.25, 12.5) + 17;
  t.text('Warm regards,', LEFT, t.y, 8.25, false, '#4A443C'); t.y += 16;
  t.text(document.brand.signatory || 'The Kraftt Digital team', LEFT, t.y, 9, true, '#231F1A');

  const count = pdf.getNumberOfPages();
  for (let page = 1; page <= count; page++) {
    pdf.setPage(page); t.rule(802);
    let size = 7; const client = `kraftt digital × ${document.client.business || '{{CLIENT_NAME}}'}`;
    while (size > 5 && t.width(client, size) > 275) size -= .1;
    t.text(client, LEFT, 816, size, false, '#8B8173');
    t.text('Contact . hello@krafttdigital.in', RIGHT, 816, 7, false, '#8B8173', 'right');
  }
}
