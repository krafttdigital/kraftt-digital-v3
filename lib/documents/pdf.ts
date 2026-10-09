import { isTemplateProposal } from './proposal-template';
import { isTemplateReport } from './report-template';
import { isTemplateAudit } from './audit-template';
import { isReferenceAgreement } from './agreement-template';
import { createQuotation, emptyWorkspace } from '../quotation/model';
import { createPdfCanvas } from '../quotation/pdf';
import { documentErrors, type BusinessDocument } from './model';

export async function generateBusinessPdf(document: BusinessDocument, options: { preview?: boolean; fontData?: Record<string, string>; templateData?: Uint8Array; blackAndWhite?: boolean } = {}) {
  if (!options.preview) { const errors = documentErrors(document); if (errors.length) throw new Error(errors.join('\n')); }
  const context = createQuotation(emptyWorkspace()); context.client = document.client; context.brand = document.brand; context.number = document.number; context.project = document.project; context.headline = document.title;
  context.introduction = document.fields.filter(f => !f.placeholder.endsWith('_IMAGE')).map(f => [f.label, f.placeholder, f.value].join('\n')).join('\n') + document.terms;
  const { pdf, writer } = await createPdfCanvas(context, { ...options, pageFormat: isReferenceAgreement(document) ? [595.2 / (72 / 25.4), 841.92 / (72 / 25.4)] : undefined });
  pdf.setProperties({ title: `${document.number} - ${document.title}`, author: 'Kraftt Digital', subject: document.project });
  if (document.kind === 'invoice') {
    const { renderInvoice } = await import('./invoice-pdf');
    pdf.addPage(); pdf.deletePage(1); await renderInvoice(pdf, document, context, options);
    const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
    return { pdf, blob: pdf.output('blob'), filename: `Kraftt_Invoice_${part(document.client.business)}_${part(document.number)}${options.blackAndWhite ? '_BW_Print' : ''}.pdf`, pages: pdf.getNumberOfPages() };
  }
  if (isReferenceAgreement(document)) {
    const { renderAgreementTemplate } = await import('./agreement-pdf'); await renderAgreementTemplate(pdf, document, options);
    const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
    return { pdf, blob: pdf.output('blob'), filename: `Kraftt_Client_Agreement_${part(document.client.business)}_${part(document.number)}${options.blackAndWhite ? '_BW_Print' : ''}.pdf`, pages: 1 };
  }
  if (isTemplateProposal(document)) {
    const { renderProposal } = await import('./proposal-pdf');
    pdf.addPage(); pdf.deletePage(1); renderProposal(pdf, document, context, options);
    const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
    return { pdf, blob: pdf.output('blob'), filename: `Kraftt_Proposal_${part(document.client.business)}_${part(document.number)}${options.blackAndWhite ? '_BW_Print' : ''}.pdf`, pages: pdf.getNumberOfPages() };
  }
  if (isTemplateAudit(document)) {
    const { renderAuditTemplate } = await import('./audit-pdf');
    pdf.addPage(); pdf.deletePage(1); renderAuditTemplate(pdf, document, options);
    const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
    return { pdf, blob: pdf.output('blob'), filename: `Kraftt_Audit_${part(document.client.business)}_${part(document.number)}${options.blackAndWhite ? '_BW_Print' : ''}.pdf`, pages: pdf.getNumberOfPages() };
  }
  if (isTemplateReport(document)) {
    const { renderMonthlyReport } = await import('./report-pdf');
    pdf.addPage(); pdf.deletePage(1); renderMonthlyReport(pdf, document, context, options);
    const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
    return { pdf, blob: pdf.output('blob'), filename: `Kraftt_Monthly_Report_${part(document.client.business)}_${part(document.number)}${options.blackAndWhite ? '_BW_Print' : ''}.pdf`, pages: pdf.getNumberOfPages() };
  }
  if (document.kind === 'welcome') {
    const { renderWelcomeLetter } = await import('./welcome-pdf');
    pdf.addPage(); pdf.deletePage(1); renderWelcomeLetter(pdf, document, context, options);
    const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
    return { pdf, blob: pdf.output('blob'), filename: `Kraftt_Welcome_${part(document.client.business)}_${part(document.number)}${options.blackAndWhite ? '_BW_Print' : ''}.pdf`, pages: pdf.getNumberOfPages() };
  }
  if (document.kind === 'thankyou') {
    const { renderThankYouLetter } = await import('./thankyou-pdf');
    // Discard the generic writer header before rendering the letter's shared template.
    pdf.addPage(); pdf.deletePage(1); renderThankYouLetter(pdf, document, context, options);
    const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
    return { pdf, blob: pdf.output('blob'), filename: `Kraftt_Thank_You_${part(document.client.business)}_${part(document.number)}${options.blackAndWhite ? '_BW_Print' : ''}.pdf`, pages: pdf.getNumberOfPages() };
  }
  writer.section = document.title;
  writer.label(document.kind === 'report' ? 'Monthly Report' : document.title); writer.heading(document.title, 26);
  writer.paragraph(document.project || '{{PROJECT_NAME}}', 10);
  writer.paragraph(`Reference: ${document.number} · ${document.date}`, 8); writer.rule();
  for (const field of document.fields) { writer.ensure(17); writer.paragraph(field.label, 11, writer.width, writer.left, true, 2); writer.paragraph(field.value || `{{${field.placeholder}}}`, 9); writer.space(4); }
  if (document.kind === 'agreement') { writer.label('Standard project terms'); writer.paragraph(document.terms, 8.5); writer.ensure(27); writer.space(8); pdf.line(16, writer.y, 96, writer.y); pdf.line(114, writer.y, 194, writer.y); writer.font(8); pdf.text('Client signature / date', 16, writer.y + 6); pdf.text('For Kraftt Digital / date', 114, writer.y + 6); }
  writer.footer();
  const part = (text: string) => text.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 70) || 'Client';
  return { pdf, blob: pdf.output('blob'), filename: `Kraftt_${part(document.title)}_${part(document.client.business)}_${part(document.number)}.pdf`, pages: pdf.getNumberOfPages() };
}
