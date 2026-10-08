import { createProposalFields, isTemplateProposal, proposalErrors } from './proposal-template';
import { reportFields, reportTemplateKey, isTemplateReport, reportErrors } from './report-template';
import { auditFields, auditTemplateKey, isTemplateAudit, auditErrors } from './audit-template';
import { agreementFixedTerms, agreementTemplateKey, isReferenceAgreement, agreementValue } from './agreement-template';
import { blankClient, copy, localDate, standardClauses, uid, type Brand, type Client, type Workspace } from '../quotation/model';

export const documentKinds = ['audit', 'proposal', 'agreement', 'welcome', 'thankyou', 'report'] as const;
export type DocumentKind = typeof documentKinds[number];
export const documentNames: Record<DocumentKind, string> = { audit: 'Audit Generator', proposal: 'Proposal', agreement: 'Client Agreement', welcome: 'Welcome', thankyou: 'Thank You', report: 'Monthly Report' };
export type DocumentField = { id: string; label: string; placeholder: string; value: string };
export type BusinessDocument = { id: string; kind: DocumentKind; number: string; client: Client; brand: Brand; title: string; project: string; date: string; status: 'draft' | 'finalised'; createdAt: string; modifiedAt: string; finalisedAt: string; revisionOf: string; fields: DocumentField[]; terms: string };
const templates: Record<DocumentKind, [string, string][]> = {
  audit: [['Business & audit scope', 'BUSINESS_CONTEXT_AND_AUDIT_SCOPE'], ['Current presence', 'WEBSITE_SOCIAL_SEARCH_AND_SYSTEMS'], ['Observations', 'VERIFIED_OBSERVATIONS_AND_EVIDENCE'], ['Gaps & opportunities', 'GAPS_AND_BUSINESS_IMPACT'], ['Priorities', 'PRIORITY_ACTIONS_AND_RATIONALE'], ['Recommendations', 'RECOMMENDED_SERVICES_AND_NEXT_STEPS']],
  proposal: [['Objectives', 'PROJECT_OBJECTIVES'], ['Recommended approach', 'APPROACH_AND_STRATEGY'], ['Scope & deliverables', 'SERVICES_DELIVERABLES_AND_QUANTITIES'], ['Timeline', 'MILESTONES_AND_DELIVERY_DATES'], ['Investment', 'INVESTMENT_AND_PAYMENT_TERMS'], ['Responsibilities', 'CLIENT_INPUTS_AND_RESPONSIBILITIES'], ['Next steps', 'APPROVAL_AND_KICKOFF_STEPS']],
  agreement: [['Parties & reference', 'PARTIES_ADDRESSES_AND_QUOTATION_REFERENCE'], ['Agreed scope', 'AGREED_SERVICES_AND_DELIVERABLES'], ['Dates & milestones', 'START_DATE_DELIVERY_AND_MILESTONES'], ['Fees & payments', 'AGREED_FEES_TAX_AND_PAYMENT_SCHEDULE'], ['Additional agreed conditions', 'ADDITIONAL_CONDITIONS_OR_NONE'], ['Acceptance', 'CLIENT_AND_KRAFTT_SIGNATORY_NAMES_AND_DATES']],
  welcome: [['Welcome message', 'WELCOME_MESSAGE'], ['Project overview', 'CONFIRMED_SCOPE_AND_GOALS'], ['People & communication', 'CONTACTS_CHANNELS_AND_REVIEW_PROCESS'], ['Getting started', 'CONTENT_ASSETS_AND_ACCESS_REQUIRED'], ['Timeline', 'KICKOFF_DATE_AND_FIRST_MILESTONE'], ['Next steps', 'CLIENT_ONBOARDING_ACTIONS']],
  thankyou: [['Thank you', 'THANK_YOU_MESSAGE'], ['Work completed', 'DELIVERED_SERVICES_AND_OUTPUTS'], ['Handover', 'FILES_LINKS_ACCESS_AND_FORMATS'], ['Support', 'AGREED_SUPPORT_AND_CONTACT'], ['Next steps', 'FOLLOW_UP_AND_NEXT_ACTIONS']],
  report: [['Reporting period', 'MONTH_AND_REPORTING_DATES'], ['Objectives', 'AGREED_GOALS'], ['Work delivered', 'SERVICES_ACTIVITIES_AND_QUANTITIES'], ['Performance', 'VERIFIED_METRICS_AND_COMPARISON_PERIOD'], ['Insights', 'FINDINGS_AND_INTERPRETATION'], ['Next month', 'NEXT_MONTH_PLAN_AND_PRIORITIES'], ['Client actions', 'APPROVALS_INPUTS_AND_ACTIONS_REQUIRED']],
};
export function createBusinessDocument(kind: DocumentKind, workspace: Workspace): BusinessDocument {
  const now = new Date().toISOString(), prefix = `KD-${kind.toUpperCase()}-${localDate().replaceAll('-', '')}-`;
  let serial = 1; while (workspace.documents.some(d => d.number === prefix + String(serial).padStart(3, '0'))) serial++;
  return { id: uid(), kind, number: prefix + String(serial).padStart(3, '0'), client: blankClient(), brand: copy(workspace.settings.brand), title: kind === 'audit' ? 'Business Transformation Audit' : kind === 'agreement' ? 'Client Agreement' : kind === 'thankyou' ? 'Thank You Letter' : kind === 'welcome' ? 'Welcome Letter' : kind === 'proposal' ? 'Growth Proposal' : documentNames[kind] === 'Audit Generator' ? 'Business Audit' : documentNames[kind], project: '', date: localDate(), status: 'draft', createdAt: now, modifiedAt: now, finalisedAt: '', revisionOf: '', fields: kind === 'proposal' ? createProposalFields() : kind === 'report' ? [{ id: uid(), label: 'Monthly report template', placeholder: reportTemplateKey, value: '1' }, ...reportFields.map(f => ({ id: uid(), label: f.label, placeholder: f.key, value: '' }))] : kind === 'audit' ? [{ id: uid(), label: 'Audit template', placeholder: auditTemplateKey, value: '1' }, { id: uid(), label: 'Include scores', placeholder: 'INCLUDE_SCORES', value: '1' }, ...auditFields.map(f => ({ id: uid(), label: f.label, placeholder: f.key, value: f.initial || '' }))] : kind === 'agreement' ? [{ id: uid(), label: 'Client Agreement', placeholder: agreementTemplateKey, value: '1' }, { id: uid(), label: 'Start date', placeholder: 'START_DATE', value: '' }, { id: uid(), label: 'Number of services', placeholder: 'NUMBER_OF_SERVICES', value: '' }] : templates[kind].map(([label, placeholder]) => ({ id: uid(), label, placeholder, value: '' })), terms: kind === 'agreement' ? agreementFixedTerms : standardClauses(workspace.settings.terms).map((c, i) => `${i + 1}. ${c.title}. ${c.body}`).join('\n\n') };
}
export function documentErrors(doc: BusinessDocument): string[] {
  const errors = [];
  if (!doc.client.business.trim()) errors.push('Choose a client.');
  if (!doc.title.trim() || !doc.project.trim() || !doc.number.trim()) errors.push('Complete the title, project and document number.');
  if (doc.number.length > 60 || doc.title.length > 180) errors.push('Keep the number within 60 and title within 180 characters.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.date) || Number.isNaN(Date.parse(doc.date)) || new Date(doc.date + 'T12:00:00Z').toISOString().slice(0, 10) !== doc.date) errors.push('Choose a valid document date.');
  if (isReferenceAgreement(doc) && (doc.title !== 'Client Agreement')) errors.push('Restore the original Client Agreement template wording and title.');
  if (isReferenceAgreement(doc) && (doc.client.business.length > 80 || doc.project.length > 120)) errors.push('For the original one-page agreement, keep the client name within 80 and project title within 120 characters.');
  if (isReferenceAgreement(doc)) {
    if (!doc.client.contact.trim() || doc.client.contact.length > 80) errors.push('Enter a contact person within 80 characters.');
    if (!doc.client.address.trim() || doc.client.address.length > 160) errors.push('Enter a client address within 160 characters.');
    const start = agreementValue(doc, 'START_DATE');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || Number.isNaN(Date.parse(start)) || new Date(start + 'T12:00:00Z').toISOString().slice(0, 10) !== start) errors.push('Choose a valid agreement start date.');
    if (!/^[1-9]\d{0,2}$/.test(agreementValue(doc, 'NUMBER_OF_SERVICES'))) errors.push('Enter a number of services between 1 and 999.');
  }
  if (isTemplateProposal(doc)) errors.push(...proposalErrors(doc));
  if (isTemplateReport(doc)) errors.push(...reportErrors(doc));
  if (isTemplateAudit(doc)) errors.push(...auditErrors(doc));
  if (!isTemplateProposal(doc) && !isTemplateAudit(doc) && !isTemplateReport(doc) && doc.fields.some(field => !field.value.trim())) errors.push('Complete each template section (use “None” when not applicable).');
  return errors;
}
export function finaliseDocument(doc: BusinessDocument) { const errors = documentErrors(doc); if (errors.length) throw new Error(errors.join('\n')); return { ...copy(doc), status: 'finalised' as const, finalisedAt: new Date().toISOString(), modifiedAt: new Date().toISOString() }; }
