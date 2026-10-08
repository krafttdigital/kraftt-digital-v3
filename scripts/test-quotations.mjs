import { fillProposal } from './proposal-fixtures.mjs';
import assert from 'node:assert/strict';
import { loadQuotationModule, loadProjectModule } from './quotation-test-modules.mjs';
import { referenceQuotation } from './quotation-fixtures.mjs';

const m = loadQuotationModule('model'), s = loadQuotationModule('storage');
const initial = m.emptyWorkspace();
const kaushal = referenceQuotation(m, initial), aggarwal = referenceQuotation(m, initial, 'aggarwal');
assert.deepEqual(m.calculations(kaushal).map(r => [r.total, ...r.payments.map(p => p.amount)]), [[4500000, 2250000, 2250000], [2500000, 1250000, 1250000]]);
assert.deepEqual(m.calculations(aggarwal).map(r => [r.total, ...r.payments.map(p => p.amount)]), [[4500000, 2250000, 2250000], [2500000, 1250000, 1250000], [5700000, 2850000, 2850000], [3700000, 1850000, 1850000]]);
assert.deepEqual(m.validateQuotation(kaushal), []); assert.deepEqual(m.validateQuotation(aggarwal), []);
const base = m.createQuotation(initial); base.client.business = 'Calculation fixture'; base.project = 'Calculation fixture'; base.packages[0].lines[0].name = 'Bundle'; base.packages[0].lines[0].fee = '30000';
base.packages[0].lines[0].pricing = 'bundle'; base.packages[0].lines[0].included = ['Website', 'SEO', 'Brand elements']; base.orderDiscount = { kind: 'percent', value: '15' };
assert.equal(m.calculations(base)[0].total, 2550000);
const line = m.blankLine('Quantity', '0'); line.pricing = 'quantity'; line.quantity = '30'; line.unitRate = '150'; assert.equal(m.calculateLine(line).net, 450000);
line.quantity = '0.333'; line.unitRate = '0.05'; assert.equal(m.calculateLine(line).net, 2);
line.quantity = '-1'; assert.throws(() => m.calculateLine(line)); line.quantity = '1';
line.discount = { kind: 'percent', value: '101' }; assert.throws(() => m.calculateLine(line));
line.discount = { kind: 'fixed', value: '0.06' }; assert.throws(() => m.calculateLine(line));
line.discount = { kind: 'none', value: '' }; line.complimentary = true; line.referenceValue = '100'; assert.equal(m.calculateLine(line).net, 0); assert.equal(m.calculateLine(line).complimentaryValue, 10000);
const fixed = m.copy(base); fixed.orderDiscount = { kind: 'fixed', value: '1000' }; assert.equal(m.calculations(fixed)[0].total, 2900000);
fixed.tax = { enabled: true, label: 'Configured tax', rate: '18', treatment: 'exclusive' }; assert.equal(m.calculations(fixed)[0].total, 3422000); assert.equal(m.calculations(fixed)[0].taxAmount, 522000);
fixed.tax.treatment = 'inclusive'; assert.equal(m.calculations(fixed)[0].total, 2900000); assert.equal(m.calculations(fixed)[0].taxBase + m.calculations(fixed)[0].taxAmount, 2900000);
fixed.tax.rate = ''; assert.ok(m.validateQuotation(fixed).some(e => e.includes('Tax rate')));
const small = m.createQuotation(initial); small.client.business = 'Rounding'; small.packages[0].lines[0].fee = '0.01';
const third = ['33.33', '33.33', '33.34'].map((value, index) => ({ id: m.uid(), name: String(index), mode: 'percent', value, trigger: '', dueDate: '', note: '' }));
assert.deepEqual(m.paymentSchedule(1, third).map(p => p.amount), [0, 0, 1]);
assert.throws(() => m.paymentSchedule(1, third.slice(0, 2)), /reconcile/);
small.milestones = [{ ...third[0], mode: 'fixed', value: '0.01' }, { ...third[1], mode: 'balance', value: '' }]; assert.deepEqual(m.calculations(small)[0].payments.map(p => p.amount), [1, 0]);
small.milestones[0].value = '0.02'; assert.ok(m.calculations(small)[0].errors.length);
assert.throws(() => m.decimal('NaN', 2, 'Fee')); assert.throws(() => m.decimal('1.001', 2, 'Fee'));
const add = m.copy(kaushal); add.mode = 'selected'; add.selectedPackageId = add.packages[1].id; add.addOns.forEach(a => { a.selected = false; }); add.recurring[0].selected = true; assert.equal(m.calculations(add)[0].total, 2500000);
add.addOns[0].selected = true; assert.equal(m.calculations(add)[0].total, 2900000); add.selectedPackageId = add.packages[0].id; assert.equal(m.calculations(add)[0].total, 4500000);
add.recurring[1].selected = true; assert.ok(m.validateQuotation(add).some(e => e.includes('only one recurring')));
const duplicates = m.copy(aggarwal); duplicates.scenarios[0].addOnIds = [duplicates.addOns[1].id, duplicates.addOns[1].id]; assert.ok(m.calculations(duplicates)[0].errors.length);
const snapshot = m.finalise(kaushal); initial.presets.push(m.clonePackage(kaushal.packages[0])); let workspace = s.upsertQuotation(initial, snapshot);
workspace.settings.brand.company = 'Changed default'; workspace.presets[0].name = 'Changed preset'; snapshot.client.business = 'Changed outside';
assert.equal(workspace.quotations[0].brand.company, 'Kraftt Digital'); assert.equal(workspace.quotations[0].client.business, 'Kaushal Studio');
assert.throws(() => s.upsertQuotation(workspace, snapshot), /read-only/);
const revision = m.duplicateQuotation(workspace.quotations[0], workspace, true); assert.equal(revision.status, 'draft'); assert.equal(revision.revisionOf, workspace.quotations[0].id); assert.equal(revision.revision, 1); assert.notEqual(revision.number, workspace.quotations[0].number);
workspace = s.upsertQuotation(workspace, revision); const collision = m.copy(revision); collision.number = workspace.quotations[1].number.toLowerCase(); assert.throws(() => s.upsertQuotation(workspace, collision), /already exists/);
const preset = m.clonePackage(workspace.presets[0]); preset.lines[0].fee = '1'; assert.equal(workspace.presets[0].lines[0].fee, '45000'); assert.notEqual(preset.lines[0].id, workspace.presets[0].lines[0].id);
const memory = new Map(), storage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
s.saveWorkspace(storage, workspace); assert.deepEqual(s.loadWorkspace(storage), workspace); assert.deepEqual(s.importBackup(JSON.stringify(workspace)), workspace);
assert.throws(() => s.saveWorkspace({ setItem() { throw Error('Quota exceeded'); } }, workspace), /Quota exceeded/);
assert.throws(() => s.loadWorkspace({ getItem() { throw Error('Blocked'); } }), /Blocked/);
for (const raw of ['<script>alert(1)</script>', '{}', JSON.stringify({ ...workspace, schemaVersion: 99 }), JSON.stringify({ ...workspace, executable: '<script>bad</script>' })]) assert.throws(() => s.importBackup(raw));
const bad = m.copy(workspace); bad.quotations[0].scenarios[0].packageId = 'missing'; assert.throws(() => s.importBackup(JSON.stringify(bad)), /missing/);
const unsafe = m.copy(workspace); unsafe.settings.brand.logo = 'javascript:alert(1)'; assert.throws(() => s.importBackup(JSON.stringify(unsafe)), /Logos/);
const literal = m.copy(workspace); literal.quotations[0].introduction = '<script>alert(1)</script>'; assert.equal(s.importBackup(JSON.stringify(literal)).quotations[0].introduction, '<script>alert(1)</script>');
const changedTerms = m.copy(base); changedTerms.clauses[0].body = 'Manually agreed text'; changedTerms.clauses[0].manual = true; changedTerms.termSettings.reviewDays = '10'; changedTerms.termsReview = true; assert.equal(changedTerms.clauses[0].body, 'Manually agreed text'); assert.ok(m.validateQuotation(changedTerms).some(e => e.includes('Review the clauses')));
// Exercise the full site's real catalogue, not studio-specific production presets.
const c = loadQuotationModule('catalogue');
const { services } = loadProjectModule('app/data/services.ts'), { bundles } = loadProjectModule('app/data/bundles.ts');
const catalogue = c.buildCatalogue(services, bundles);
assert.equal(catalogue.length, services.reduce((n, service) => n + service.tiers.length, 0) + bundles.length);
services.forEach(service => assert.ok(catalogue.some(item => item.group === service.name), service.name));
const fresh = m.createQuotation(m.emptyWorkspace()); assert.equal(fresh.client.business, ''); assert.equal(fresh.packages[0].lines[0].fee, ''); assert.equal(m.emptyWorkspace().presets.length, 0);
const brand = catalogue.find(item => item.id.startsWith('service-brand-identity-') && item.fee === '12000');
const store = catalogue.find(item => item.id.startsWith('service-ecommerce-store-development-') && item.fee === '22000');
assert.ok(brand && store, 'Brand and store catalogue tiers exist');
let joint = c.addCatalogueItem(fresh, brand, 'scope', fresh.selectedPackageId); joint = c.addCatalogueItem(joint, store, 'scope', joint.selectedPackageId);
assert.equal(joint.packages[0].lines.length, 2); assert.equal(m.calculations(joint)[0].total, 3400000);
let alternatives = m.createQuotation(initial, 'comparison'); alternatives = c.addCatalogueItem(alternatives, brand, 'alternative', ''); alternatives = c.addCatalogueItem(alternatives, store, 'alternative', '');
assert.equal(alternatives.packages.length, 2); assert.deepEqual(m.calculations(alternatives).map(r => r.total), [1200000, 2200000]);
alternatives = c.addCatalogueItem(alternatives, catalogue.find(item => item.group === 'Web Design & Development' && item.fee === '25000'), 'addon', '');
assert.deepEqual(m.calculations(alternatives).map(r => r.total), [1200000, 2200000]);
alternatives.scenarios.push({ id: m.uid(), name: 'Brand + website', packageId: alternatives.packages[0].id, addOnIds: [alternatives.addOns[0].id], display: true });
assert.deepEqual(m.calculations(alternatives).map(r => r.total), [1200000, 2200000, 3700000]);
const blankBundle = m.createQuotation(initial, 'bundle'), bundleItem = catalogue.find(item => item.kind === 'bundle');
let bundled = c.addCatalogueItem(blankBundle, bundleItem, 'scope', blankBundle.selectedPackageId);
const beforeComponent = m.calculations(bundled)[0].total;
bundled = c.addCatalogueItem(bundled, brand, 'component', bundled.selectedPackageId);
assert.equal(m.calculations(bundled)[0].total, beforeComponent); assert.equal(beforeComponent, Number(bundleItem.fee) * 100);
const monthly = catalogue.find(item => item.period === 'month');
assert.throws(() => c.addCatalogueItem(joint, monthly, 'scope', joint.selectedPackageId), /recurring pricing/);
const recurring = c.addCatalogueItem(joint, monthly, 'recurring', ''); assert.equal(m.calculations(recurring)[0].total, 3400000); assert.equal(recurring.recurring[0].selected, false);
const custom = catalogue.find(item => item.group === 'App Development'); assert.equal(custom.fee, '');
const customQuote = c.addCatalogueItem(fresh, custom, 'scope', fresh.selectedPackageId); assert.ok(m.calculations(customQuote)[0].errors.some(e => e.includes('valid non-negative number')));
assert.equal(fresh.packages[0].lines[0].name, '', 'Catalogue changes are immutable');
assert.equal(store.fee, '22000', 'Editing quotation fees does not alter the catalogue');
console.log('Quotation tests passed: exact fees, discounts, tax, rounding, alternatives, recurring exclusions, backups, storage failures and immutable snapshots.');
console.log(`Catalogue tests passed: ${services.length} service families, ${bundles.length} bundles, ${catalogue.length} entries; joint services, arbitrary alternatives, add-ons, included components and recurring pricing.`);

// ERP templates, checkbox selections, migration and payment schedules.
const d = loadProjectModule('lib/documents/model.ts'), selections = loadQuotationModule('selections');
const legacy = m.copy(workspace); legacy.schemaVersion = 1; delete legacy.documents; delete legacy.documentTrash;
const migrated = s.importBackup(JSON.stringify(legacy)); assert.equal(migrated.schemaVersion, 2); assert.deepEqual(migrated.quotations, workspace.quotations); assert.deepEqual(migrated.documents, []);
assert.throws(() => s.importBackup(JSON.stringify({ ...legacy, documents: [] })), /Unexpected/);
let erp = m.emptyWorkspace(); erp.clients.push({ ...m.blankClient(), business: 'Acme Client' });
for (const kind of d.documentKinds) {
  const doc = d.createBusinessDocument(kind, erp); assert.ok(kind === 'audit' || kind === 'proposal' || doc.fields.every(f => f.value === '' || (kind === 'agreement' || kind === 'report') && f.value === '1')); assert.equal(doc.client.business, '');
  assert.ok(d.documentErrors(doc).length); doc.client = m.copy(erp.clients[0]); doc.project = 'Client engagement'; doc.fields.filter(f => kind !== 'proposal' && f.placeholder !== 'KRAFTT_CLIENT_AGREEMENT_V1').forEach(f => { f.value = 'Agreed information for this section.'; });
  if (kind === 'agreement') { doc.client.contact = 'Alex Smith'; doc.client.address = 'Bathinda, Punjab'; doc.fields.find(f => f.placeholder === 'START_DATE').value = '2026-10-06'; doc.fields.find(f => f.placeholder === 'NUMBER_OF_SERVICES').value = '4'; }
  if (kind === 'audit') doc.fields.forEach(f => { if (f.placeholder.endsWith('_SCORE')) f.value = '50'; if (f.placeholder === 'KRAFTT_AUDIT_V1' || f.placeholder === 'INCLUDE_SCORES') f.value = '1'; });
  if (kind === 'proposal') fillProposal(doc);
  if (kind === 'report') doc.fields.forEach(f => { if (f.placeholder === 'KRAFTT_MONTHLY_REPORT_V2') f.value = '1'; if (['TOTAL_IMPRESSIONS','TOTAL_CLICKS','UNKNOWN_TRAFFIC','SEARCH_TRAFFIC','SOCIAL_TRAFFIC'].includes(f.placeholder)) f.value = '100'; if (['AVG_CTR','AVG_SCROLL_DEPTH'].includes(f.placeholder)) f.value = '10'; });
  assert.deepEqual(d.documentErrors(doc), []); const final = d.finaliseDocument(doc); erp.documents.push(final);
  doc.client.business = 'Changed draft'; assert.equal(final.client.business, 'Acme Client');
}
assert.deepEqual(s.importBackup(JSON.stringify(erp)), erp);
const invalidDate = m.copy(erp.documents[0]); invalidDate.date = '2026-02-30'; assert.ok(d.documentErrors(invalidDate).some(e => e.includes('date')));
let checkbox = selections.toggleService(fresh, brand, fresh.selectedPackageId, true);
checkbox = selections.toggleService(checkbox, store, checkbox.selectedPackageId, true);
assert.equal(checkbox.packages[0].lines.length, 2); assert.equal(m.calculations(checkbox)[0].total, 3400000);
assert.ok(m.validateQuotation(checkbox).some(e => e.includes('deliverable points')));
checkbox = selections.toggleOptional(checkbox, brand, true); checkbox.addOns[0].selected = true;
assert.ok(m.calculations(checkbox)[0].errors.some(e => e.includes('already included')));
checkbox.addOns[0].selected = false;
checkbox = selections.toggleOngoing(checkbox, monthly, true); assert.equal(m.calculations(checkbox)[0].total, 3400000);
for (const schedule of ['50/50', '60/40', '70/30']) {
  const payments = m.paymentSchedule(100001, m.paymentPreset(schedule)); assert.equal(payments.reduce((n,p) => n+p.amount, 0), 100001);
  assert.equal(payments[0].amount, Math.round(100001 * Number(schedule.split('/')[0]) / 100));
}
const deselected = selections.toggleService(checkbox, store, checkbox.selectedPackageId, false); assert.equal(deselected.packages[0].lines.length, 1); assert.equal(checkbox.packages[0].lines.length, 2);
console.log('ERP tests passed: six blank templates, client snapshots, backup migration, checkbox selections, duplicate charge prevention and 50/50, 60/40, 70/30 schedules.');

const a = loadProjectModule('lib/documents/agreement-template.ts');
const agreement = d.createBusinessDocument('agreement', m.emptyWorkspace()); assert.ok(a.isReferenceAgreement(agreement));
assert.equal(agreement.title, 'Client Agreement'); assert.ok(agreement.terms.includes('Start Date: {{START_DATE}}')); assert.ok(agreement.terms.includes('{{NUMBER_OF_SERVICES}}')); assert.ok(agreement.terms.includes('{{CLIENT_ADDRESS}}'));
assert.ok(d.documentErrors(agreement).some(e => e.includes('start date')));
assert.ok(d.documentErrors(agreement).some(e => e.includes('client address')));
assert.ok(!agreement.terms.includes('Elixir') && !agreement.terms.includes('Yash') && !agreement.terms.includes('Ayushman'));
assert.equal(a.agreementTemplateText('{{CLIENT_NAME}} / {{CLIENT_NAME}} / {{PROJECT_TITLE}}', 'Selected client', 'Selected project'), 'Selected client / Selected client / Selected project');
const legacyAgreement = m.copy(agreement); legacyAgreement.fields = [{ id: m.uid(), label: 'Legacy', placeholder: 'PARTIES', value: 'Existing scope' }]; assert.equal(a.isReferenceAgreement(legacyAgreement), false);
console.log('Client Agreement template tests passed: placeholder mappings, fixed source details and legacy template preservation.');

assert.equal(a.agreementTemplateText('{{CONTACT_NAME}} of {{CLIENT_NAME}}', 'Business', 'Project', 'Contact'), 'Contact of Business');
assert.ok(agreement.terms.includes('Digital Authority Scope - {{NUMBER_OF_SERVICES}} services'));
assert.ok(agreement.terms.includes('{{CONTACT_PERSON}}'));

const auditModule = loadProjectModule('lib/documents/audit-template.ts');
const audit = d.createBusinessDocument('audit', m.emptyWorkspace()); assert.ok(auditModule.isTemplateAudit(audit));
audit.client.business = 'Audit Client'; audit.project = 'Digital presence audit';
audit.fields.forEach(f => { if (!f.value) f.value = f.placeholder.endsWith('_SCORE') ? '58' : 'Verified observations.'; });
assert.deepEqual(d.documentErrors(audit), []);
audit.fields.find(f => f.placeholder === 'OVERALL_SCORE').value = '101'; assert.ok(d.documentErrors(audit).some(e => e.includes('between 0 and 100')));
audit.fields.find(f => f.placeholder === 'INCLUDE_SCORES').value = '0'; assert.deepEqual(d.documentErrors(audit), []);
const auditBackup = m.emptyWorkspace(); auditBackup.documents.push(audit); assert.deepEqual(s.importBackup(JSON.stringify(auditBackup)), auditBackup);
console.log('Audit template tests passed: manual scores, optional score omission and backup round-trip.');

const evidenceAudit = m.copy(audit); evidenceAudit.fields.push(...['TITLE', 'BODY', 'SOURCE', 'IMAGE'].map(key => ({ id: m.uid(), label: key, placeholder: 'AUDIT_EXTRA_backup_' + key, value: key === 'TITLE' ? 'Visual evidence' : key === 'BODY' ? 'Verified observation.' : key === 'IMAGE' ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlAAAAABJRU5ErkJggg==' : '' })));
const withEvidence = m.emptyWorkspace(); withEvidence.documents.push(evidenceAudit); assert.deepEqual(s.importBackup(JSON.stringify(withEvidence)), withEvidence);
assert.equal(auditModule.auditExtras(evidenceAudit).length, 1);

const reportModule = loadProjectModule('lib/documents/report-template.ts');
const monthlyReport = d.createBusinessDocument('report', m.emptyWorkspace()); assert.ok(reportModule.isTemplateReport(monthlyReport));
assert.ok(monthlyReport.fields.every(f => f.value === '' || f.placeholder === reportModule.reportTemplateKey));
monthlyReport.client.business = 'Monthly Client'; monthlyReport.project = 'Website performance';
monthlyReport.fields.forEach(f => { if (!f.value) f.value = ['TOTAL_IMPRESSIONS','TOTAL_CLICKS','UNKNOWN_TRAFFIC','SEARCH_TRAFFIC','SOCIAL_TRAFFIC'].includes(f.placeholder) ? '0' : ['AVG_CTR','AVG_SCROLL_DEPTH'].includes(f.placeholder) ? '0' : 'Verified information.'; });
assert.deepEqual(d.documentErrors(monthlyReport), []);
monthlyReport.fields.find(f => f.placeholder === 'AVG_CTR').value = '101'; assert.ok(d.documentErrors(monthlyReport).some(e => e.includes('between 0 and 100')));
monthlyReport.fields.find(f => f.placeholder === 'AVG_CTR').value = '10'; monthlyReport.fields.find(f => f.placeholder === 'TOTAL_IMPRESSIONS').value = '-1'; assert.ok(d.documentErrors(monthlyReport).some(e => e.includes('whole number')));
const previousReport = m.copy(monthlyReport); previousReport.fields = [{ id: m.uid(), label: 'Legacy', placeholder: 'MONTH_AND_REPORTING_DATES', value: 'Saved report' }]; assert.equal(reportModule.isTemplateReport(previousReport), false);
console.log('Monthly report tests passed: blank metrics, zero values, bounds and legacy report preservation.');

const v1Report = m.copy(monthlyReport); v1Report.fields = [{ id: m.uid(), label: 'Template', placeholder: reportModule.legacyReportTemplateKey, value: '1' }, ...reportModule.legacyReportFields.map(spec => ({ id: m.uid(), label: spec.label, placeholder: spec.key, value: spec.type === 'count' ? '123' : spec.type === 'percent' ? '10' : 'Verified information.' }))];
assert.ok(reportModule.isTemplateReport(v1Report)); assert.equal(reportModule.isCurrentReport(v1Report), false); assert.deepEqual(d.documentErrors(v1Report), []);
assert.ok(reportModule.reportFieldsFor(v1Report).some(f => f.key === 'TOTAL_VISITORS'));
assert.ok(reportModule.reportFieldsFor(monthlyReport).some(f => f.key === 'TOTAL_IMPRESSIONS'));
assert.equal(reportModule.reportValue(v1Report, 'TOTAL_IMPRESSIONS'), '');

const projectClient = { ...m.blankClient(), business: 'Project Client', projectTitle: 'Digital Authority System' };
const clientWorkspace = m.emptyWorkspace(); clientWorkspace.clients.push(projectClient);
for (const kind of d.documentKinds) {
  const blankDoc = d.createBusinessDocument(kind, clientWorkspace);
  const selected = m.selectDocumentClient(blankDoc, projectClient);
  assert.equal(selected.project, projectClient.projectTitle); assert.equal(blankDoc.project, '');
  assert.notEqual(selected.client, projectClient);
  selected.project = 'Document-specific title'; assert.equal(projectClient.projectTitle, 'Digital Authority System');
}
const selectedQuote = m.selectDocumentClient(m.createQuotation(clientWorkspace), projectClient);
assert.equal(selectedQuote.project, 'Digital Authority System');
clientWorkspace.quotations.push(selectedQuote);
assert.deepEqual(s.importBackup(JSON.stringify(clientWorkspace)), clientWorkspace);
const legacyClientBackup = m.copy(clientWorkspace);
legacyClientBackup.clients.forEach(client => { delete client.projectTitle; });
legacyClientBackup.quotations.forEach(q => { delete q.client.projectTitle; });
assert.deepEqual(s.importBackup(JSON.stringify(legacyClientBackup)), legacyClientBackup);
assert.equal(m.selectDocumentClient(selectedQuote, legacyClientBackup.clients[0]).project, '');
const invalidProject = m.copy(clientWorkspace); invalidProject.clients[0].projectTitle = 'X'.repeat(121);
assert.throws(() => s.validateWorkspace(invalidProject), /120 characters/);
invalidProject.clients[0].projectTitle = null; assert.throws(() => s.validateWorkspace(invalidProject), /expected text/);
console.log('Client project titles: all document types, quotation selection, independent snapshots and old/new backup compatibility passed.');

const proposalModule = loadProjectModule('lib/documents/proposal-template.ts');
const proposalBlank = d.createBusinessDocument('proposal', m.emptyWorkspace()); assert.ok(proposalModule.isTemplateProposal(proposalBlank));
const proposalBlankData = proposalModule.readProposal(proposalBlank); assert.equal(proposalBlankData.sections.length, 10); assert.equal(proposalBlankData.sections.filter(s=>s.enabled).length, 9); assert.equal(proposalBlankData.services[0].name,'');
const proposal = fillProposal(m.copy(proposalBlank),{beyond:true}); assert.deepEqual(d.documentErrors(proposal),[]);
let proposalData = proposalModule.readProposal(proposal); let proposalMoney=proposalModule.proposalCalculation(proposalData.services,proposalData.settings);
assert.equal(proposalMoney.subtotal,3000000);assert.equal(proposalMoney.discount,450000);assert.equal(proposalMoney.total,2550000);assert.equal(proposalMoney.payments.reduce((n,p)=>n+p.amount,0),2550000);
assert.equal(proposalMoney.lines.find(l=>l.service.kind==='optional').net,450000);
const proposalBundleData = proposalModule.readProposal(fillProposal(m.copy(proposalBlank),{bundle:true})); assert.equal(proposalModule.proposalCalculation(proposalBundleData.services,proposalBundleData.settings).total,2550000);
for(const payment of ['50/50','60/40','70/30']) assert.equal(proposalModule.proposalCalculation(proposalData.services,{...proposalData.settings,payment}).payments.reduce((n,p)=>n+p.amount,0),2550000);
assert.throws(()=>proposalModule.proposalCalculation(proposalData.services,{...proposalData.settings,discount:{kind:'percent',value:'101'}}),/between 0 and 100/);
assert.throws(()=>proposalModule.proposalCalculation(proposalData.services,{...proposalData.settings,discount:{kind:'fixed',value:'999999'}}),/exceeds/);
const badProposal=m.copy(proposal);badProposal.fields.find(f=>f.placeholder.startsWith('PROPOSAL_SECTION_')).value='{"kind":"bad"}';assert.ok(d.documentErrors(badProposal).length);
const legacyProposal=m.copy(proposal);legacyProposal.fields=[{id:m.uid(),label:'Legacy',placeholder:'PROJECT_OBJECTIVES',value:'Saved objectives'}];assert.equal(proposalModule.isTemplateProposal(legacyProposal),false);
const proposalWorkspace=m.emptyWorkspace();proposalWorkspace.documents.push(d.finaliseDocument(proposal));assert.deepEqual(s.importBackup(JSON.stringify(proposalWorkspace)),proposalWorkspace);
console.log('Proposal tests passed: blank template, synchronized pricing, bundle/included/complimentary/optional/alternative/recurring treatments, payment presets, invalid data and final snapshot backups.');

// A tailored package can charge independently of zero-cost included line items.
const specialServices=proposalData.services.filter(s=>['priced','complimentary'].includes(s.kind)).map(s=>({...s,kind:s.kind==='complimentary'?'complimentary':'included',fee:'0'}));
const specialSettings={...proposalData.settings,pricingMode:'custom',packageValue:'30000'};
const specialTotal=proposalModule.proposalCalculation(specialServices,specialSettings);
assert.equal(specialTotal.subtotal,3000000);assert.equal(specialTotal.discount,450000);assert.equal(specialTotal.total,2550000);
assert.equal(specialTotal.payments.reduce((n,p)=>n+p.amount,0),2550000);
assert.equal(proposalModule.proposalCalculation([...specialServices,...proposalData.services.filter(s=>['optional','recurring','alternative'].includes(s.kind))],specialSettings).total,2550000);
assert.equal(proposalModule.proposalCalculation(proposalData.services,specialSettings).subtotal,3000000); // override, not an additional charge
assert.equal(proposalModule.proposalCalculation(specialServices,{...specialSettings,packageValue:'0',discount:{kind:'none',value:''}}).total,0);
assert.throws(()=>proposalModule.proposalCalculation(specialServices,{...specialSettings,packageValue:'-1'}));
assert.throws(()=>proposalModule.proposalCalculation(specialServices,{...specialSettings,packageValue:'1000000001'}));
console.log('Custom proposal pricing: package override, discount, payment amounts, exclusions, zero and invalid values passed.');
