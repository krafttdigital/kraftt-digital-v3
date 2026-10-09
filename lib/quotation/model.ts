import type { BusinessDocument } from '../documents/model';
export type Discount = { kind: 'none' | 'fixed' | 'percent'; value: string };
export type LineItem = {
  id: string; name: string; description: string; deliverables: string[];
  pricing: 'fixed' | 'quantity' | 'bundle'; fee: string; quantity: string; unitRate: string;
  referenceValue: string; discount: Discount; complimentary: boolean;
  included: string[]; delivery: string; exclusions: string; handover: string;
};
export type Package = { id: string; name: string; description: string; recommended: boolean; why: string; delivery: string; lines: LineItem[] };
export type AddOn = LineItem & { selected: boolean; appliesTo: string[]; note?: string };
export type Recurring = { id: string; name: string; coverage: string; fee: string; period: string; alternativeGroup: string; selected: boolean; start: string; notice: string; notes: string };
export type Milestone = { id: string; name: string; mode: 'percent' | 'fixed' | 'balance'; value: string; trigger: string; dueDate: string; note: string };
export type Scenario = { id: string; name: string; packageId: string; addOnIds: string[]; display: boolean };
export type Clause = { id: string; templateKey: string; title: string; body: string; service: string; manual: boolean };
export type TermSettings = { revisionRounds: string; brandingRevisionRounds: string; reviewDays: string; paymentDays: string; supportPeriod: string; cancellationNotice: string };
export type Client = { projectTitle?: string; id: string; business: string; contact: string; role: string; address: string; email: string; phone: string; gstin: string };
export type Brand = { company: string; wordmark: string; email: string; phone: string; address: string; signatory: string; logo: string; cream: string; ink: string; gold: string };
export type Quotation = {
  id: string; number: string; status: 'draft' | 'finalised'; createdAt: string; modifiedAt: string; finalisedAt: string;
  revisionOf: string; revision: number; mode: 'selected' | 'comparison'; client: Client; project: string;
  issueDate: string; validUntil: string; headline: string; introduction: string; delivery: string; scopeReference: string; preparedBy: string;
  includedServicesHeading?: string;
  packages: Package[]; selectedPackageId: string; addOns: AddOn[]; recurring: Recurring[]; scenarios: Scenario[];
  orderDiscount: Discount; discountLabel: string; adjustment: string; adjustmentLabel: string;
  tax: { enabled: boolean; label: string; rate: string; treatment: 'exclusive' | 'inclusive' };
  milestones: Milestone[]; termSettings: TermSettings; clauses: Clause[]; termsReview: boolean;
  acceptance: { note: string; clientName: string; krafttName: string }; brand: Brand;
};
export type Workspace = { schemaVersion: 2; documents: BusinessDocument[]; documentTrash: BusinessDocument[]; quotations: Quotation[]; trash: Quotation[]; clients: Client[]; presets: Package[]; settings: { brand: Brand; terms: TermSettings; milestones: Milestone[] } };
export type LineCalculation = { line: LineItem; gross: number; itemDiscount: number; net: number; reference: number; complimentaryValue: number };
export type Calculation = { scenario: Scenario; package: Package | null; lines: LineCalculation[]; subtotal: number; itemDiscount: number; orderDiscount: number; adjustment: number; quotedNet: number; taxBase: number; taxAmount: number; total: number; reference: number; savings: number; complimentaryValue: number; payments: { milestone: Milestone; amount: number }[]; errors: string[] };

export const uid = () => globalThis.crypto.randomUUID();
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export const copy = <T>(value: T): T => structuredClone(value);
export const inr = (minor: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: minor % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(minor / 100);
export function decimal(value: string, precision: number, label: string, signed = false): number {
  if (!(signed ? /^-?\d+(?:\.\d+)?$/ : /^\d+(?:\.\d+)?$/).test(value.trim())) throw new Error(`${label}: enter a valid ${signed ? '' : 'non-negative '}number.`);
  const [whole, fraction = ''] = value.trim().replace('-', '').split('.');
  if (fraction.length > precision) throw new Error(`${label}: use at most ${precision} decimal places.`);
  const result = BigInt(whole) * BigInt(10) ** BigInt(precision) + BigInt(fraction.padEnd(precision, '0'));
  if (result > BigInt(100_000_000_000)) throw new Error(`${label}: amount is too large.`);
  return Number(result) * (value.trim().startsWith('-') ? -1 : 1);
}
function round(numerator: bigint, denominator: bigint) { return Number((numerator + denominator / BigInt(2)) / denominator); }
function percent(value: string, label: string) { const amount = decimal(value, 2, label); if (amount > 10000) throw new Error(`${label}: percentage must be between 0 and 100.`); return amount; }
function reduction(discount: Discount, base: number, label: string) {
  if (discount.kind === 'none') return 0;
  const amount = discount.kind === 'fixed' ? decimal(discount.value, 2, label) : round(BigInt(base) * BigInt(percent(discount.value, label)), BigInt(10000));
  if (amount > base) throw new Error(`${label}: discount exceeds its eligible one-time base.`);
  return amount;
}
export function calculateLine(line: LineItem): LineCalculation {
  let gross = decimal(line.fee, 2, line.name || 'Line fee');
  if (line.pricing === 'quantity') {
    const quantity = decimal(line.quantity, 3, 'Quantity');
    if (quantity <= 0) throw new Error('Quantity must be greater than zero.');
    gross = round(BigInt(quantity) * BigInt(decimal(line.unitRate, 2, 'Unit rate')), BigInt(1000));
    if (gross > 100_000_000_000) throw new Error('Quantity × rate is too large.');
  }
  const itemDiscount = line.complimentary ? 0 : reduction(line.discount, gross, `${line.name} discount`);
  const net = line.complimentary ? 0 : gross - itemDiscount;
  const reference = line.referenceValue ? decimal(line.referenceValue, 2, `${line.name} reference value`) : gross;
  if (reference < net) throw new Error(`${line.name}: reference value must not be below the charged amount.`);
  return { line, gross, itemDiscount, net, reference, complimentaryValue: line.complimentary ? reference : 0 };
}
export function paymentSchedule(total: number, milestones: Milestone[]): { milestone: Milestone; amount: number }[] {
  if (!milestones.length || milestones.length > 20) throw new Error('Use between 1 and 20 payment milestones.');
  if (milestones.filter(m => m.mode === 'balance').length > 1) throw new Error('Only one milestone can use remaining balance.');
  let rational = BigInt(0);
  const rows = milestones.map(milestone => {
    if (!milestone.name.trim()) throw new Error('Name every payment milestone.');
    if (milestone.mode === 'balance') return { milestone, amount: 0 };
    const amount = milestone.mode === 'fixed' ? decimal(milestone.value, 2, `${milestone.name} amount`) : round(BigInt(total) * BigInt(percent(milestone.value, milestone.name)), BigInt(10000));
    rational += milestone.mode === 'fixed' ? BigInt(amount) * BigInt(10000) : BigInt(total) * BigInt(percent(milestone.value, milestone.name));
    return { milestone, amount };
  });
  const sum = rows.reduce((amount, row) => amount + row.amount, 0);
  const balance = rows.find(row => row.milestone.mode === 'balance');
  if (balance) {
    if (sum > total) throw new Error('Payment milestones exceed the payable total.');
    balance.amount = total - sum;
  } else if (rational === BigInt(total) * BigInt(10000)) {
    // Half-up rounding residue goes to the last percentage milestone, in document order.
    const lastPercent = rows.filter(row => row.milestone.mode === 'percent').at(-1);
    if (lastPercent) lastPercent.amount += total - sum;
  } else throw new Error('Payment milestones must reconcile to the final one-time total; add a remaining-balance milestone or correct the values.');
  if (rows.some(row => row.amount < 0) || rows.reduce((n, row) => n + row.amount, 0) !== total) throw new Error('Invalid payment allocation.');
  return rows;
}
export function quotationScenarios(q: Quotation): Scenario[] {
  return q.mode === 'comparison' ? q.scenarios.filter(s => s.display) : [{ id: 'selected', name: q.packages.find(p => p.id === q.selectedPackageId)?.name || 'Selected scope', packageId: q.selectedPackageId, addOnIds: q.addOns.filter(a => a.selected && (!a.appliesTo.length || a.appliesTo.includes(q.selectedPackageId))).map(a => a.id), display: true }];
}
export const defaultIncludedServicesHeading = 'Included Services · One-Time Investment';
export function optionalServiceNote(q: Quotation, item: AddOn): string {
  return item.note ?? (quotationScenarios(q).some(scenario => scenario.addOnIds.includes(item.id)) ? 'Included only in the selected payment scenario(s).' : 'Optional one-time service; excluded until approved.');
}
export function calculateScenario(q: Quotation, scenario: Scenario): Calculation {
  const result: Calculation = { scenario, package: null, lines: [], subtotal: 0, itemDiscount: 0, orderDiscount: 0, adjustment: 0, quotedNet: 0, taxBase: 0, taxAmount: 0, total: 0, reference: 0, savings: 0, complimentaryValue: 0, payments: [], errors: [] };
  try {
    const pkg = q.packages.find(p => p.id === scenario.packageId);
    if (!pkg) throw new Error('Select an existing package for each scenario.');
    result.package = pkg;
    if (!pkg.lines.length) throw new Error(`${pkg.name}: add at least one service row.`);
    const addOns = scenario.addOnIds.map(id => {
      const item = q.addOns.find(a => a.id === id);
      if (!item || item.appliesTo.length && !item.appliesTo.includes(pkg.id)) throw new Error('A selected add-on is unavailable for this package.');
      return item;
    });
    if (new Set(scenario.addOnIds).size !== scenario.addOnIds.length) throw new Error('An add-on must not be charged twice in one scenario.');
    if (addOns.some(a => a.id.startsWith('optional-') && pkg.lines.some(l => l.id === a.id.replace('optional-', 'catalogue-')))) throw new Error('A service already included in this option cannot also be charged as an optional service.');
    if (addOns.some(a => a.id.startsWith('optional-') && pkg.lines.some(l => l.id === a.id.replace('optional-', 'catalogue-')))) throw new Error('A service already included in this option cannot also be charged as an optional service.');
    result.lines = [...pkg.lines, ...addOns].map(calculateLine);
    result.subtotal = result.lines.reduce((n, line) => n + line.net, 0);
    if (result.subtotal > 100_000_000_000) throw new Error('The one-time subtotal is too large.');
    result.reference = result.lines.reduce((n, line) => n + line.reference, 0);
    result.complimentaryValue = result.lines.reduce((n, line) => n + line.complimentaryValue, 0);
    result.itemDiscount = result.lines.reduce((n, line) => n + line.itemDiscount, 0);
    result.orderDiscount = reduction(q.orderDiscount, result.subtotal, q.discountLabel || 'Overall discount');
    result.adjustment = decimal(q.adjustment || '0', 2, 'Negotiated adjustment', true);
    result.quotedNet = result.subtotal - result.orderDiscount + result.adjustment;
    if (result.quotedNet < 0) throw new Error('Negotiated adjustment would make the payable amount negative.');
    const rate = q.tax.enabled ? percent(q.tax.rate, 'Tax rate') : 0;
    if (q.tax.enabled && !q.tax.label.trim()) throw new Error('Enter a tax label.');
    result.taxAmount = q.tax.treatment === 'inclusive' ? round(BigInt(result.quotedNet) * BigInt(rate), BigInt(10000) + BigInt(rate)) : round(BigInt(result.quotedNet) * BigInt(rate), BigInt(10000));
    result.taxBase = q.tax.treatment === 'inclusive' ? result.quotedNet - result.taxAmount : result.quotedNet;
    result.total = q.tax.treatment === 'inclusive' ? result.quotedNet : result.quotedNet + result.taxAmount;
    if (result.total > 100_000_000_000) throw new Error('Final total is too large.');
    result.savings = Math.max(0, result.reference - result.quotedNet);
    result.payments = paymentSchedule(result.total, q.milestones);
  } catch (error) { result.errors.push(error instanceof Error ? error.message : 'Calculation failed.'); }
  return result;
}
export function calculations(q: Quotation) { return quotationScenarios(q).map(s => calculateScenario(q, s)); }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value; }
export function validateQuotation(q: Quotation): string[] {
  const errors: string[] = [];
  if (!q.client.business.trim()) errors.push('Enter the client business name.');
  if (!q.project.trim() || !q.number.trim()) errors.push('Enter a project title and quotation number.');
  if (!validDate(q.issueDate) || !validDate(q.validUntil) || q.validUntil < q.issueDate) errors.push('Use valid issue/expiry dates; expiry must be on or after issue.');
  if (!q.packages.length || q.mode === 'comparison' && q.packages.length < 2) errors.push('Comparison mode needs at least two alternative packages.');
  if (q.packages.some(p => !p.name.trim() || p.lines.some(l => !l.name.trim()))) errors.push('Name each package and service row.');
  if (!quotationScenarios(q).length) errors.push('Display at least one payment scenario.');
  for (const result of calculations(q)) errors.push(...result.errors.map(e => `${result.scenario.name || result.package?.name || 'Scenario'}: ${e}`));
  for (const service of q.recurring) {
    try { decimal(service.fee, 2, `${service.name || 'Recurring service'} fee`); } catch (error) { errors.push((error as Error).message); }
    if (!service.name.trim() || !service.period.trim()) errors.push('Name each recurring service and billing period.');
  }
  const groups = q.recurring.filter(r => r.selected && r.alternativeGroup).map(r => r.alternativeGroup);
  if (groups.length !== new Set(groups).size) errors.push('Choose only one recurring option per alternative group (for example, monthly OR annual maintenance).');
  if (q.termsReview) errors.push('Review the clauses after changing term settings, then mark them reviewed.');
  if (q.clauses.some(c => !c.title.trim() || !c.body.trim())) errors.push('Complete or remove empty terms.');
  if (!q.clauses.length) errors.push('Add the agreed terms before finalising.');
  const offered = q.mode === 'comparison' ? q.packages : q.packages.filter(p => p.id === q.selectedPackageId);
  if (q.status !== 'finalised' && offered.some(p => p.lines.some(l => !l.description.trim() && !l.deliverables.some(Boolean) && !l.included.some(Boolean)))) errors.push('Enter the main deliverable points for each selected service.');
  if (q.status !== 'finalised' && q.recurring.some(r => !r.coverage.trim())) errors.push('Complete the coverage for offered ongoing services.');
  for (const item of [...q.packages.flatMap(p => p.lines), ...q.addOns]) {
    try { calculateLine(item); } catch (error) { errors.push((error as Error).message); }
    if (!item.name.trim()) errors.push('Name every service and optional add-on.');
  }
  const shortFields: [string, string, number][] = [
    ['Included services heading', q.includedServicesHeading || '', 180],
    ['Quotation number', q.number, 40], ['Business name', q.client.business, 140],
    ['Brand company', q.brand.company, 80], ['Wordmark', q.brand.wordmark, 40],
    ...q.packages.map(p => ['Package name', p.name, 100] as [string, string, number]),
    ...q.scenarios.map(s => ['Scenario name', s.name, 100] as [string, string, number]),
    ...q.milestones.map(m => ['Milestone name', m.name, 100] as [string, string, number]),
  ];
  shortFields.forEach(([label, value, limit]) => { if (value.length > limit) errors.push(`${label}: use at most ${limit} characters.`); });
  if (q.milestones.some(m => m.dueDate && !validDate(m.dueDate))) errors.push('Use valid milestone due dates.');
  return [...new Set(errors)];
}

export const defaultBrand: Brand = { company: 'Kraftt Digital', wordmark: 'Kraftt.', email: 'hello@krafttdigital.in', phone: '7986769102', address: 'Bathinda, Punjab', signatory: '', logo: '', cream: '#F6F3ED', ink: '#231F1A', gold: '#8B7355' };
export const defaultTerms: TermSettings = { revisionRounds: '2', brandingRevisionRounds: '2', reviewDays: '5', paymentDays: '7', supportPeriod: '14 days of corrections within the agreed scope', cancellationNotice: '30 days' };
export function paymentPreset(preset: '50/50' | '60/40' | '70/30' | '40/40/20'): Milestone[] {
  return (preset !== '40/40/20' ? [['Advance', preset.split('/')[0], 'On acceptance, before work begins'], ['Delivery balance', preset.split('/')[1], 'After final review, before launch / handover']] : [['Advance', '40', 'On acceptance, before work begins'], ['Review milestone', '40', 'On agreed design / development review'], ['Delivery balance', '20', 'After final approval, before handover']]).map(([name, value, trigger]) => ({ id: uid(), name, value, trigger, mode: 'percent', dueDate: '', note: '' }));
}
export function standardClauses(settings: TermSettings): Clause[] {
  const entries = [
    ['scope', 'Scope & changes', 'Only the services and deliverables listed in this quotation and its referenced scope are included. Additional work, new features or changes to approved work require written agreement on price and timing before execution.'],
    ['kickoff', 'Kickoff & timeline', 'Work starts after acceptance, advance payment and receipt of required content, assets and access. The quoted duration runs from that point; client or third-party delays move delivery dates accordingly.'],
    ['inputs', 'Client inputs & approvals', `The client provides accurate content, materials they are authorised to use and one point of contact. Consolidated feedback is due within ${settings.reviewDays} working days. Launch requires written approval.`],
    ['revisions', 'Revisions', `${settings.revisionRounds} consolidated review rounds are included within the agreed scope. A new direction or additional rounds are quoted separately. Corrections to work that does not meet the agreed scope do not use a revision round.`],
    ['external', 'External costs & results', 'Domains, hosting, paid tools, licences, platform charges and advertising spend are included only when expressly listed. Leads, sales, rankings, reach and platform approvals are not guaranteed.'],
    ['ownership', 'Handover & ownership', 'Agreed final deliverables and access are handed over after full payment. Third-party assets remain subject to their licences. Reusable Kraftt tools and working/source files are included only if expressly listed.'],
    ['support', 'Support & recurring work', `Included post-delivery support: ${settings.supportPeriod}. New work and ongoing maintenance are separately scoped. Recurring-service cancellation notice: ${settings.cancellationNotice}.`],
    ['cancellation', 'Pause, cancellation & settlement', 'Either party may request cancellation in writing. Completed work and approved, non-recoverable costs are reconciled against payments received; any unused balance is refunded. Overdue payments may pause work after written notice.'],
    ['confidentiality', 'Confidentiality & portfolio use', 'Non-public information and credentials are kept confidential and used only for delivery. Kraftt may display the completed work publicly only with the client’s written permission.'],
  ];
  return entries.map(([templateKey, title, body]) => ({ id: uid(), templateKey, title, body, service: '', manual: false }));
}
export function blankLine(name = 'Service', fee = '0'): LineItem { return { id: uid(), name, description: '', deliverables: [], pricing: 'fixed', fee, quantity: '1', unitRate: '0', referenceValue: '', discount: { kind: 'none', value: '0' }, complimentary: false, included: [], delivery: '', exclusions: '', handover: '' }; }
export function blankPackage(name = 'New package', fee = '0'): Package { return { id: uid(), name, description: '', recommended: false, why: '', delivery: '', lines: [blankLine(name, fee)] }; }
// Copy the directory record into a document; saved documents remain independent snapshots.
export function selectDocumentClient<T extends { client: Client; project: string }>(document: T, client: Client): T {
  return { ...document, client: copy(client), project: client.projectTitle || '' };
}
export function blankClient(): Client { return { id: uid(), business: '', projectTitle: '', contact: '', role: '', address: '', email: '', phone: '', gstin: '' }; }
export function nextNumber(existing: readonly Quotation[], date = new Date()): string {
  const prefix = `KD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-`;
  const taken = new Set(existing.map(q => q.number));
  let serial = 1; while (taken.has(prefix + String(serial).padStart(3, '0'))) serial++;
  return prefix + String(serial).padStart(3, '0');
}
function freshPackage(pkg: Package): Package { return { ...copy(pkg), id: uid(), lines: pkg.lines.map(line => ({ ...copy(line), id: uid() })) }; }
export function clonePackage(pkg: Package) { return freshPackage(pkg); }
export type QuotationStructure = 'itemised' | 'comparison' | 'bundle';
export function createQuotation(workspace: Workspace, structure: QuotationStructure = 'itemised'): Quotation {
  const date = new Date(), expiry = new Date(date); expiry.setDate(expiry.getDate() + 15);
  const packages = (structure === 'comparison' ? ['Option A', 'Option B'] : [structure === 'bundle' ? 'Project bundle' : 'Project scope']).map(name => {
    const pkg = blankPackage(name, ''); pkg.lines[0].name = '';
    if (structure === 'bundle') pkg.lines[0].pricing = 'bundle';
    return pkg;
  });
  return {
    id: uid(), number: nextNumber(workspace.quotations), status: 'draft', createdAt: date.toISOString(), modifiedAt: date.toISOString(), finalisedAt: '', revisionOf: '', revision: 0,
    mode: structure === 'comparison' ? 'comparison' : 'selected', client: blankClient(), project: '', issueDate: localDate(date), validUntil: localDate(expiry),
    headline: 'Quotation & Terms', introduction: 'Defined scope, transparent pricing and a clear way forward.',
    delivery: '', scopeReference: '', preparedBy: workspace.settings.brand.signatory, packages, selectedPackageId: structure === 'comparison' ? '' : packages[0].id,
    addOns: [], recurring: [], scenarios: packages.map(pkg => ({ id: uid(), name: pkg.name, packageId: pkg.id, addOnIds: [], display: true })),
    orderDiscount: { kind: 'none', value: '0' }, discountLabel: 'Project discount', adjustment: '0', adjustmentLabel: 'Negotiated price adjustment', tax: { enabled: false, label: 'Tax', rate: '', treatment: 'exclusive' },
    milestones: copy(workspace.settings.milestones).map(m => ({ ...m, id: uid() })), termSettings: copy(workspace.settings.terms), clauses: standardClauses(workspace.settings.terms), termsReview: false,
    acceptance: { note: 'I accept the scope, pricing, payment schedule and terms of this quotation. Acceptance may be recorded by signature below or written confirmation quoting the quotation reference.', clientName: '', krafttName: '' }, brand: copy(workspace.settings.brand),
  };
}
export function emptyWorkspace(): Workspace { return { schemaVersion: 2, documents: [], documentTrash: [], quotations: [], trash: [], clients: [], presets: [], settings: { brand: copy(defaultBrand), terms: copy(defaultTerms), milestones: paymentPreset('50/50') } }; }
export function duplicateQuotation(q: Quotation, workspace: Workspace, revision = false): Quotation {
  const result = copy(q), date = new Date();
  result.id = uid(); result.number = nextNumber(workspace.quotations); result.status = 'draft'; result.createdAt = result.modifiedAt = date.toISOString(); result.finalisedAt = '';
  result.revisionOf = revision ? q.id : ''; result.revision = revision ? q.revision + 1 : 0;
  return result;
}
export function finalise(q: Quotation): Quotation {
  const errors = validateQuotation(q); if (errors.length) throw new Error(errors.join('\n'));
  const result = copy(q); result.status = 'finalised'; result.finalisedAt = result.modifiedAt = new Date().toISOString(); return result;
}
