import type { BusinessDocument } from './model';
export const agreementTemplateKey = 'KRAFTT_CLIENT_AGREEMENT_V1';
export const agreementIntro = 'This agreement records that {{CONTACT_NAME}} of {{CLIENT_NAME}} accept the project scope, payment responsibilities and approval process for {{PROJECT_TITLE}}. The client confirms that the information shared is accurate, the engagement is genuine, and all approved invoices will be cleared within the agreed timeline.';
export const agreementScope = 'Prepared for {{CONTACT_NAME}} of {{CLIENT_NAME}}. The scope includes all deliverables outlined in the approved proposal, along with an additional complimentary surprise deliverable to be revealed at final handover. Kraftt Digital will align the work for clarity, trust, conversion and India-ready business use.';
export const agreementFixedTerms = [
  'Prepared for: {{CONTACT_PERSON}}\n{{CLIENT_NAME}}\n{{CLIENT_ADDRESS}}',
  'Project: {{PROJECT_TITLE}}\nDigital Authority Scope - {{NUMBER_OF_SERVICES}} services\nStart Date: {{START_DATE}}',
  'Scope\n' + agreementScope,
  'Payment terms\nInvoices must be cleared by the due date mentioned on the invoice, and not later than 7 days unless a different written schedule is approved by Kraftt Digital. Late or failed payments may pause work, launch, support, handover, access transfer or release of final files. Taxes, gateway charges, TDS handling or bank charges, if applicable, must be handled as agreed in writing.',
  'Approvals\nThe client will provide required content, images, brand assets, platform access, credentials and feedback on time. Delays in approvals, access, payments or content from the client side may extend the project timeline without penalty to Kraftt Digital.',
  'Integrity\nBoth parties agree to work in good faith. Fraudulent chargebacks, false claims, misuse of unpaid work, intentional withholding of access, or continued use of deliverables without clearing approved payments may result in suspension of services and recovery action.',
  'Acceptance\nBy approving this document, paying an invoice, sharing required project material, or asking Kraftt Digital to begin work, the client confirms acceptance of this project agreement and the website terms published at https://krafttdigital.in.',
].join('\n\n');
export function isReferenceAgreement(document: BusinessDocument) { return document.kind === 'agreement' && document.fields.some(field => field.placeholder === agreementTemplateKey && field.value === '1'); }
export function agreementTemplateText(text: string, client: string, project: string, contact = '{{CONTACT_NAME}}') { return text.replaceAll('{{CONTACT_NAME}}', contact).replaceAll('{{PROJECT_TITLE}}', project).replaceAll('{{CLIENT_NAME}}', client); }

export function agreementValue(document: BusinessDocument, key: string) { return document.fields.find(field => field.placeholder === key)?.value || ''; }
export function agreementDocumentText(document: BusinessDocument) { return agreementTemplateText(agreementFixedTerms, document.client.business || '{{CLIENT_NAME}}', document.project || '{{PROJECT_TITLE}}', document.client.contact || '{{CONTACT_NAME}}').replaceAll('{{CONTACT_PERSON}}', document.client.contact || '{{CONTACT_PERSON}}').replaceAll('{{CLIENT_ADDRESS}}', document.client.address || '{{CLIENT_ADDRESS}}').replaceAll('{{START_DATE}}', agreementValue(document, 'START_DATE') || '{{START_DATE}}').replaceAll('{{NUMBER_OF_SERVICES}}', agreementValue(document, 'NUMBER_OF_SERVICES') || '{{NUMBER_OF_SERVICES}}'); }
