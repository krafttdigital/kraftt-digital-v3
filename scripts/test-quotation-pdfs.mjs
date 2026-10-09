import { fillInvoice } from './invoice-fixtures.mjs';
import { fillProposal } from './proposal-fixtures.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { loadQuotationModule } from './quotation-test-modules.mjs';
import { referenceQuotation } from './quotation-fixtures.mjs';

const m = loadQuotationModule('model'), { generateQuotationPdf } = loadQuotationModule('pdf');
const fontData = Object.fromEntries(fs.readdirSync('public/admin-assets/fonts').filter(name => name.endsWith('.ttf')).map(name => [name, fs.readFileSync(`public/admin-assets/fonts/${name}`).toString('base64')]));
const workspace = m.emptyWorkspace(), kaushal = referenceQuotation(m, workspace), aggarwal = referenceQuotation(m, workspace, 'aggarwal');
kaushal.number = 'KD-KS-001'; aggarwal.number = 'KD-AC-001';
const general = m.createQuotation(workspace); general.client.business = 'Itemised Studio'; general.project = 'Digital presence'; general.number = 'KD-IS-001'; general.packages[0].lines[0].name = 'Digital presence bundle'; general.packages[0].lines[0].fee = '30000'; general.packages[0].lines[0].pricing = 'bundle'; general.packages[0].lines[0].included = ['Website', 'Brand foundation', 'Launch SEO']; general.orderDiscount = { kind: 'percent', value: '15' };
const long = m.copy(aggarwal); long.client.business = 'Long Scope Studio'; long.number = 'KD-LONG-001'; long.introduction = Array(12).fill('A detailed quotation with responsive websites, agreed branding and structured handover.').join(' '); long.packages.forEach(pkg => { for (let i = 0; i < 6; i++) { const line = m.blankLine(`Additional scope ${i + 1}`, '150'); line.description = Array(12).fill('This line specifies clear deliverables, approvals and responsibilities for the agreed work.').join(' '); line.deliverables = ['Detailed service output', 'Final review and handover']; pkg.lines.push(line); } });
long.clauses = Array.from({ length: 26 }, (_, index) => ({ ...m.copy(aggarwal.clauses[index % aggarwal.clauses.length]), id: m.uid(), title: `Detailed clause ${index + 1}`, body: Array(5).fill(aggarwal.clauses[index % aggarwal.clauses.length].body).join(' ') }));
fs.mkdirSync('outputs/quotation-qa', { recursive: true });
for (const [name, q] of [['kaushal', kaushal], ['aggarwal', aggarwal], ['general', general], ['long', long]]) {
  const result = await generateQuotationPdf(q, { fontData });
  fs.writeFileSync(`outputs/quotation-qa/${name}.pdf`, Buffer.from(result.pdf.output('arraybuffer')));
  assert.ok(result.blob.size > 1000); if (name === 'long') assert.ok(result.pages > 2);
  console.log(`${name}: ${result.pages} A4 pages, ${result.blob.size} bytes`);
}
const unsupported = m.copy(general); unsupported.client.business = 'বাংলা'; await assert.rejects(() => generateQuotationPdf(unsupported, { fontData }), /does not support/);
console.log('PDF generation and unsupported-font checks passed. Inspect rendered fixtures before delivery.');

const { loadProjectModule } = await import('./quotation-test-modules.mjs');
const d = loadProjectModule('lib/documents/model.ts'), { generateBusinessPdf } = loadProjectModule('lib/documents/pdf.ts');
for (const kind of d.documentKinds) {
  const doc = d.createBusinessDocument(kind, workspace); const blank = await generateBusinessPdf(doc, { fontData, templateData: fs.readFileSync('public/admin-assets/templates/client-agreement-v1.png'), preview: true });
  fs.writeFileSync('outputs/quotation-qa/' + kind + '-blank.pdf', Buffer.from(blank.pdf.output('arraybuffer')));
  doc.client.business = 'Acme Client'; doc.project = 'Digital engagement'; doc.fields.filter(f => kind !== 'invoice' && kind !== 'proposal' && f.placeholder !== 'KRAFTT_CLIENT_AGREEMENT_V1').forEach(f => { f.value = 'Agreed project details, verified observations and next actions for the client.'; });
  if (kind === 'agreement') { doc.client.contact = 'Alex Smith'; doc.client.address = 'Bathinda, Punjab, India'; doc.fields.find(f => f.placeholder === 'START_DATE').value = '2026-10-06'; doc.fields.find(f => f.placeholder === 'NUMBER_OF_SERVICES').value = '4'; }
  if (kind === 'audit') doc.fields.forEach(f => { if (f.placeholder.endsWith('_SCORE')) f.value = '50'; if (f.placeholder === 'KRAFTT_AUDIT_V1' || f.placeholder === 'INCLUDE_SCORES') f.value = '1'; });
  if (kind === 'invoice') { fillInvoice(doc); doc.client.business = 'Acme Client'; }
  if (kind === 'proposal') fillProposal(doc);
  if (kind === 'report') doc.fields.forEach(f => { if (f.placeholder === 'KRAFTT_MONTHLY_REPORT_V2') f.value = '1'; if (['TOTAL_IMPRESSIONS','TOTAL_CLICKS','UNKNOWN_TRAFFIC','SEARCH_TRAFFIC','SOCIAL_TRAFFIC'].includes(f.placeholder)) f.value = '100'; if (['AVG_CTR','AVG_SCROLL_DEPTH'].includes(f.placeholder)) f.value = '10'; });
  const result = await generateBusinessPdf(doc, { fontData, templateData: fs.readFileSync('public/admin-assets/templates/client-agreement-v1.png') }); assert.ok(result.pages >= 1);
  fs.writeFileSync('outputs/quotation-qa/' + kind + '.pdf', Buffer.from(result.pdf.output('arraybuffer'))); console.log(kind + ': ' + result.pages + ' pages');
}
const empty = m.createQuotation(workspace); empty.headline = 'Your project. A clear investment.'; empty.packages[0].lines = [];
const blankQuote = await generateQuotationPdf(empty, { fontData, preview: true }); fs.writeFileSync('outputs/quotation-qa/quote-blank.pdf', Buffer.from(blankQuote.pdf.output('arraybuffer')));
assert.equal(empty.packages[0].lines.length, 0, 'Preview must not mutate the blank document');
const compact = m.copy(general); compact.headline = 'Your project. A clear investment.'; compact.packages[0].lines[0].description = 'Five responsive pages, one enquiry form and editable handover files.';
const result = await generateQuotationPdf(compact, { fontData }); fs.writeFileSync('outputs/quotation-qa/quote-filled.pdf', Buffer.from(result.pdf.output('arraybuffer'))); console.log('Filled quotation: ' + result.pages + ' pages; blank template: ' + blankQuote.pages + ' pages');

assert.equal(blankQuote.pages, 2, 'Reference blank template is two A4 pages');
assert.equal(result.pages, 2, 'Ordinary filled quotation is two A4 pages');
const customWording = m.copy(compact);
customWording.includedServicesHeading = 'Included Services - Monthly Retainer';
customWording.addOns = [
  { ...m.blankLine('Social Content', '5000'), selected: false, appliesTo: [], description: 'Monthly creative support.', note: 'Optional monthly service; begins after written confirmation.' },
  { ...m.blankLine('SEO Reporting', '1500'), selected: false, appliesTo: [], description: 'Monthly performance report.', note: 'Available from the second month.' },
];
const customWordingPdf = await generateQuotationPdf(customWording, { fontData });
fs.writeFileSync('outputs/quotation-qa/quote-custom-wording.pdf', Buffer.from(customWordingPdf.pdf.output('arraybuffer')));

const printDoc = d.createBusinessDocument('agreement', workspace);
const printPdf = await generateBusinessPdf(printDoc, { fontData, preview: true, blackAndWhite: true, templateData: fs.readFileSync('public/admin-assets/templates/client-agreement-v1-print.png') });
assert.equal(printPdf.pages, 1); assert.ok(printPdf.filename.includes('_BW_Print'));
fs.writeFileSync('outputs/quotation-qa/agreement-print.pdf', Buffer.from(printPdf.pdf.output('arraybuffer')));

const printQuote = await generateQuotationPdf(empty, { fontData, preview: true, blackAndWhite: true });
assert.equal(printQuote.pages, blankQuote.pages); assert.ok(printQuote.filename.includes('_BW_Print'));
fs.writeFileSync('outputs/quotation-qa/quote-print.pdf', Buffer.from(printQuote.pdf.output('arraybuffer')));

const letter = d.createBusinessDocument('thankyou', workspace);
letter.client.business = 'Acme Client'; letter.client.contact = 'Alex Smith'; letter.project = 'Website and brand identity';
const letterValues = ['Thank you for choosing Kraftt Digital. It has been a pleasure working with you to bring your website and brand identity together. We appreciate the time, feedback and trust you shared throughout the project.', 'A responsive five-page website, a brand identity kit and final launch checks have been completed for the agreed project scope.', 'Your final files, website access and handover notes are available in the shared project folder. Please keep a copy of the delivered files and confirm that you can access the resources.', 'For any questions about your delivered work, contact hello@krafttdigital.in. Support follows the scope and period agreed in your quotation.', 'Review the handover resources and let us know if you need help locating an item. We would be happy to hear how the new presence is working for your business.'];
letter.fields.forEach((field, index) => { field.value = letterValues[index]; });
const letterPdf = await generateBusinessPdf(letter, { fontData });
assert.equal(letterPdf.pages, 1);
fs.writeFileSync('outputs/quotation-qa/thankyou-letter.pdf', Buffer.from(letterPdf.pdf.output('arraybuffer')));
const letterPrint = await generateBusinessPdf(letter, { fontData, blackAndWhite: true });
assert.equal(letterPrint.pages, letterPdf.pages);
fs.writeFileSync('outputs/quotation-qa/thankyou-print.pdf', Buffer.from(letterPrint.pdf.output('arraybuffer')));
const longLetter = m.copy(letter); longLetter.fields[2].value = Array(90).fill(letterValues[2]).join(' ');
const continued = await generateBusinessPdf(longLetter, { fontData }); assert.ok(continued.pages > 1);
fs.writeFileSync('outputs/quotation-qa/thankyou-long.pdf', Buffer.from(continued.pdf.output('arraybuffer')));
console.log('Thank You letter: one-page filled template, print variant and long handover continuation verified.');

const auditDoc = d.createBusinessDocument('audit', workspace); auditDoc.client.business = 'Reference Client'; auditDoc.project = 'Business transformation audit';
auditDoc.fields.forEach(f => { if (!f.value) f.value = f.placeholder.endsWith('_SCORE') ? '58' : 'Verified foundations are present. Improve clarity, consistency and the enquiry journey.'; });
const auditOptions = { fontData };
const auditPdf = await generateBusinessPdf(auditDoc, auditOptions); assert.equal(auditPdf.pages, 2);
fs.writeFileSync('outputs/quotation-qa/audit-filled.pdf', Buffer.from(auditPdf.pdf.output('arraybuffer')));
const auditPrint = await generateBusinessPdf(auditDoc, { ...auditOptions, blackAndWhite: true }); assert.equal(auditPrint.pages, auditPdf.pages);
fs.writeFileSync('outputs/quotation-qa/audit-print.pdf', Buffer.from(auditPrint.pdf.output('arraybuffer')));
const expandedAudit = m.copy(auditDoc);
expandedAudit.fields.push(...['TITLE', 'BODY', 'SOURCE', 'IMAGE'].map(key => ({ id: m.uid(), label: key, placeholder: 'AUDIT_EXTRA_example_' + key, value: key === 'TITLE' ? 'Detailed search and operations findings' : key === 'BODY' ? Array(130).fill('Document the verified evidence, customer impact and recommended operational changes.').join(' ') : key === 'IMAGE' ? 'data:image/png;base64,' + fs.readFileSync('public/admin-assets/templates/client-agreement-v1-print.png').toString('base64') : 'Website review and discovery conversation' })));
// The image fixture is supplied directly for renderer QA; real editor uploads are compressed.
const expandedPdf = await generateBusinessPdf(expandedAudit, { ...auditOptions, preview: true }); assert.ok(expandedPdf.pages > 3);
fs.writeFileSync('outputs/quotation-qa/audit-expanded.pdf', Buffer.from(expandedPdf.pdf.output('arraybuffer')));
console.log('Audit PDF tests passed: two core pages, print variant and extended findings/evidence.');

const monthlyDoc = d.createBusinessDocument('report', workspace); monthlyDoc.client.business = 'Monthly Client'; monthlyDoc.project = 'Website performance';
const monthlyValues = { REPORT_PERIOD: 'September 2026', DATA_SOURCE: 'Search Console impressions/clicks · GA4 sessions and engagement', TOTAL_IMPRESSIONS: '17334', TOTAL_CLICKS: '1465', AVG_CTR: '8.45', TOP_PAGES: '1. Home\n2. Services\n3. About us', UNKNOWN_TRAFFIC: '2330', HIGHEST_TRAFFIC_SOURCE: 'Social Media', SEARCH_TRAFFIC: '5402', SOCIAL_TRAFFIC: '9299', TRAFFIC_INSIGHT: 'Social traffic contributed the most visits this month. Continue testing service-led content.', TOP_QUERIES: '1. Website design\n2. Brand identity\n3. Kraftt Digital', TOP_COUNTRIES: '1. India\n2. United States\n3. United Kingdom', AVG_SCROLL_DEPTH: '67', AVG_ACTIVE_TIME: '2m 30s', BEHAVIOUR_INSIGHT: 'Visitors are engaging with the site. Review the enquiry journey for clearer calls to action.', UPDATES_IMPROVEMENTS: 'Updated service content, reviewed mobile spacing and completed the agreed website maintenance checks.' };
monthlyDoc.fields.forEach(f => { if (f.placeholder in monthlyValues) f.value = monthlyValues[f.placeholder]; });
const monthlyPdf = await generateBusinessPdf(monthlyDoc, { fontData }); assert.equal(monthlyPdf.pages, 1);
fs.writeFileSync('outputs/quotation-qa/report-filled.pdf', Buffer.from(monthlyPdf.pdf.output('arraybuffer')));
const monthlyPrint = await generateBusinessPdf(monthlyDoc, { fontData, blackAndWhite: true }); assert.equal(monthlyPrint.pages, 1);
fs.writeFileSync('outputs/quotation-qa/report-print.pdf', Buffer.from(monthlyPrint.pdf.output('arraybuffer')));
monthlyDoc.fields.find(f => f.placeholder === 'UPDATES_IMPROVEMENTS').value = Array(90).fill(monthlyValues.UPDATES_IMPROVEMENTS).join(' ');
const extendedMonthly = await generateBusinessPdf(monthlyDoc, { fontData }); assert.ok(extendedMonthly.pages > 1);
fs.writeFileSync('outputs/quotation-qa/report-long.pdf', Buffer.from(extendedMonthly.pdf.output('arraybuffer')));
console.log('Monthly Report PDF: one-page filled metrics, white print variant and extended updates verified.');

const welcome = d.createBusinessDocument('welcome', workspace);
welcome.client.business = 'Acme Client'; welcome.client.contact = 'Alex Smith'; welcome.project = 'Website and brand identity';
const welcomeValues = [
  'Welcome to Kraftt Digital. We are pleased to begin this project with you and bring your business goals into one clear digital presence. This letter outlines how we will get started together.',
  'The agreed project covers a responsive website and brand identity. Deliverables and responsibilities follow the approved quotation and agreement.',
  'Your primary contact is the Kraftt Digital team at hello@krafttdigital.in. Share consolidated feedback through the agreed project channel and nominate one person for approvals.',
  'Please share your approved business information, brand files, photographs and website content. Provide required platform access through the agreed secure access method.',
  'Kickoff: 12 October 2026. First milestone: review of the website structure and brand direction on 19 October 2026, subject to receipt of the agreed inputs.',
  'Confirm your project contact, share the onboarding materials and review the kickoff details. Let us know about any constraints before work begins.'
];
welcome.fields.forEach((field, index) => { field.value = welcomeValues[index]; });
const welcomePdf = await generateBusinessPdf(welcome, { fontData }); assert.equal(welcomePdf.pages, 1);
fs.writeFileSync('outputs/quotation-qa/welcome-letter.pdf', Buffer.from(welcomePdf.pdf.output('arraybuffer')));
const welcomePrint = await generateBusinessPdf(welcome, { fontData, blackAndWhite: true });
assert.equal(welcomePrint.pages, welcomePdf.pages); assert.ok(welcomePrint.filename.includes('_BW_Print'));
fs.writeFileSync('outputs/quotation-qa/welcome-print.pdf', Buffer.from(welcomePrint.pdf.output('arraybuffer')));
const longWelcome = m.copy(welcome); longWelcome.fields[3].value = Array(90).fill(welcomeValues[3]).join(' ');
const welcomeContinued = await generateBusinessPdf(longWelcome, { fontData }); assert.ok(welcomeContinued.pages > 1);
fs.writeFileSync('outputs/quotation-qa/welcome-long.pdf', Buffer.from(welcomeContinued.pdf.output('arraybuffer')));
console.log('Welcome Letter: one-page filled template, white-background print and long onboarding continuation verified.');

const proposalDoc=fillProposal(d.createBusinessDocument('proposal',workspace),{beyond:true});
const proposalPdf=await generateBusinessPdf(proposalDoc,{fontData});assert.ok(proposalPdf.pages>=10);
fs.writeFileSync('outputs/quotation-qa/proposal-filled.pdf',Buffer.from(proposalPdf.pdf.output('arraybuffer')));
const proposalPrint=await generateBusinessPdf(proposalDoc,{fontData,blackAndWhite:true});assert.equal(proposalPrint.pages,proposalPdf.pages);
fs.writeFileSync('outputs/quotation-qa/proposal-print.pdf',Buffer.from(proposalPrint.pdf.output('arraybuffer')));
const proposalLib=loadProjectModule('lib/documents/proposal-template.ts');
const bundleDoc=fillProposal(d.createBusinessDocument('proposal',workspace),{bundle:true});
const bundlePdf=await generateBusinessPdf(bundleDoc,{fontData});fs.writeFileSync('outputs/quotation-qa/proposal-bundle.pdf',Buffer.from(bundlePdf.pdf.output('arraybuffer')));
const expandedProposal=m.copy(proposalDoc),scopeField=expandedProposal.fields.find(f=>f.placeholder.startsWith('PROPOSAL_SERVICE_')),longScope=JSON.parse(scopeField.value);longScope.description=Array(50).fill('Verified deliverables, quantities, source materials, approval responsibilities, handover format and exclusions.').join(' ');scopeField.value=JSON.stringify(longScope);
const expandedSection=expandedProposal.fields.find(f=>f.placeholder.startsWith('PROPOSAL_SECTION_')&&JSON.parse(f.value).kind==='overview'),section=JSON.parse(expandedSection.value);section.body=Array(60).fill('Verified context and agreed project recommendations with clear responsibilities and next steps.').join(' ');expandedSection.value=JSON.stringify(section);
const continuedProposal=await generateBusinessPdf(expandedProposal,{fontData});assert.ok(continuedProposal.pages>proposalPdf.pages);
fs.writeFileSync('outputs/quotation-qa/proposal-long.pdf',Buffer.from(continuedProposal.pdf.output('arraybuffer')));
console.log('Proposal PDF tests passed: flexible components, itemised/bundled scopes, optional page omission, white-background print and long content continuations.');
