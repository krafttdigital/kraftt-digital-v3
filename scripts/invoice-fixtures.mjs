import { loadProjectModule, loadQuotationModule } from './quotation-test-modules.mjs';
const { setInvoiceItems, setInvoiceValue } = loadProjectModule('lib/documents/invoice-template.ts');
const { uid } = loadQuotationModule('model');
export function fillInvoice(doc) {
  doc.client = { ...doc.client, business: 'Example Beverages', contact: 'Alex & Sam', address: 'New Delhi, India, 110001', phone: '+91 90000 00000' };
  doc.project = 'Digital Authority Scope - 2 services';
  let next = setInvoiceItems(doc, [{ id: uid(), service: 'Digital Authority Scope - 2 services', scope: 'Prepared for Alex and Sam of Example Beverages. The scope includes all deliverables outlined in the approved proposal, along with an additional complimentary surprise deliverable to be revealed at final handover. Kraftt Digital will align the work for clarity, trust, conversion and India-ready business use.', amount: '16500' }]);
  for (const [key, value] of Object.entries({ DUE_DATE: doc.date, FROM_NAME: 'Kraftt Digital', ACCOUNT_NAME: 'Example Account', UPI_ID: 'example@upi' })) next = setInvoiceValue(next, key, value);
  Object.assign(doc, next);
  return doc;
}
