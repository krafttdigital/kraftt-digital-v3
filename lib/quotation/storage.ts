import { copy, validateQuotation, type Workspace, type Quotation } from './model';
import { documentErrors, documentKinds } from '../documents/model';

export const STORAGE_KEY = 'kraftt_document_workspace_v1';
export const SESSION_KEY = 'kraftt_document_workspace_session_v1';
export const BACKUP_LIMIT = 10 * 1024 * 1024;
type Schema = { kind: 'string' | 'boolean' | 'number'; optional?: boolean } | { kind: 'enum'; values: readonly (string | number)[] } | { kind: 'array'; item: Schema } | { kind: 'object'; fields: Record<string, Schema> };
const str: Schema = { kind: 'string' }, bool: Schema = { kind: 'boolean' }, num: Schema = { kind: 'number' };
const choice = (...values: (string | number)[]): Schema => ({ kind: 'enum', values });
const array = (item: Schema): Schema => ({ kind: 'array', item });
const object = (fields: Record<string, Schema>): Schema => ({ kind: 'object', fields });
const textFields = (...keys: string[]) => Object.fromEntries(keys.map(key => [key, str]));
const discount = object({ kind: choice('none', 'fixed', 'percent'), value: str });
const lineFields = { ...textFields('id', 'name', 'description', 'fee', 'quantity', 'unitRate', 'referenceValue', 'delivery', 'exclusions', 'handover'), pricing: choice('fixed', 'quantity', 'bundle'), deliverables: array(str), included: array(str), discount, complimentary: bool };
const line = object(lineFields);
const pkg = object({ ...textFields('id', 'name', 'description', 'why', 'delivery'), recommended: bool, lines: array(line) });
const client = object({ ...textFields('id', 'business', 'contact', 'role', 'address', 'email', 'phone', 'gstin'), projectTitle: { kind: 'string', optional: true } });
const brand = object(textFields('company', 'wordmark', 'email', 'phone', 'address', 'signatory', 'logo', 'cream', 'ink', 'gold'));
const terms = object(textFields('revisionRounds', 'brandingRevisionRounds', 'reviewDays', 'paymentDays', 'supportPeriod', 'cancellationNotice'));
const milestone = object({ ...textFields('id', 'name', 'value', 'trigger', 'dueDate', 'note'), mode: choice('percent', 'fixed', 'balance') });
const quote = object({
  ...textFields('id', 'number', 'createdAt', 'modifiedAt', 'finalisedAt', 'revisionOf', 'project', 'issueDate', 'validUntil', 'headline', 'introduction', 'delivery', 'scopeReference', 'preparedBy', 'selectedPackageId', 'discountLabel', 'adjustment', 'adjustmentLabel'),
  status: choice('draft', 'finalised'), revision: num, mode: choice('selected', 'comparison'), client, packages: array(pkg),
  addOns: array(object({ ...lineFields, selected: bool, appliesTo: array(str) })),
  recurring: array(object({ ...textFields('id', 'name', 'coverage', 'fee', 'period', 'alternativeGroup', 'start', 'notice', 'notes'), selected: bool })),
  scenarios: array(object({ ...textFields('id', 'name', 'packageId'), addOnIds: array(str), display: bool })),
  orderDiscount: discount, tax: object({ enabled: bool, label: str, rate: str, treatment: choice('exclusive', 'inclusive') }),
  milestones: array(milestone), termSettings: terms,
  clauses: array(object({ ...textFields('id', 'templateKey', 'title', 'body', 'service'), manual: bool })), termsReview: bool,
  acceptance: object(textFields('note', 'clientName', 'krafttName')), brand,
});
const businessDocument = object({ ...textFields('id', 'number', 'title', 'project', 'date', 'createdAt', 'modifiedAt', 'finalisedAt', 'revisionOf', 'terms'), kind: choice(...documentKinds), client, brand, status: choice('draft', 'finalised'), fields: array(object(textFields('id', 'label', 'placeholder', 'value'))) });
const workspaceSchema = object({ schemaVersion: choice(2), documents: array(businessDocument), documentTrash: array(businessDocument), quotations: array(quote), trash: array(quote), clients: array(client), presets: array(pkg), settings: object({ brand, terms, milestones: array(milestone) }) });
function check(value: unknown, schema: Schema, path: string): void {
  if (value === undefined && 'optional' in schema && schema.optional) return;
  if (schema.kind === 'string') {
    const imageValue = /\.fields\[\d+\]\.value$/.test(path) && typeof value === 'string' && value.startsWith('data:image/');
    const max = path.endsWith('.projectTitle') ? 120 : path.endsWith('.logo') ? 1_500_000 : imageValue ? 400_000 : 20_000;
    if (typeof value !== 'string' || value.length > max) throw new Error(`${path}: expected text within ${max} characters.`);
    if (path.endsWith('.logo') && value && !/^data:image\/(png|jpeg);base64,[a-zA-Z0-9+/=]+$/.test(value)) throw new Error('Logos must be local PNG/JPEG image data, not URLs, SVG or HTML.');
    if (/\.(cream|ink|gold)$/.test(path) && !/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Brand colours must be six-digit hex colours.');
  } else if (schema.kind === 'boolean' && typeof value !== 'boolean') throw new Error(`${path}: expected true or false.`);
  else if (schema.kind === 'number' && (!Number.isSafeInteger(value) || (value as number) < 0)) throw new Error(`${path}: expected a non-negative integer.`);
  else if (schema.kind === 'enum' && !schema.values.includes(value as string)) throw new Error(`${path}: unsupported value or schema version.`);
  else if (schema.kind === 'array') {
    if (!Array.isArray(value) || value.length > 400) throw new Error(`${path}: expected an array of at most 400 items.`);
    value.forEach((item, index) => check(item, schema.item, `${path}[${index}]`));
  } else if (schema.kind === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path}: expected a structured object.`);
    const input = value as Record<string, unknown>;
    if (Object.keys(input).some(key => !Object.hasOwn(schema.fields, key))) throw new Error(`${path}: unexpected fields; backup not imported.`);
    for (const [key, field] of Object.entries(schema.fields)) check(input[key], field, `${path}.${key}`);
  }
}
function uniqueIds(items: { id: string }[], label: string) {
  if (items.some(item => !/^[a-zA-Z0-9_-]{1,100}$/.test(item.id)) || new Set(items.map(item => item.id)).size !== items.length) throw new Error(`${label}: duplicate or invalid IDs.`);
}
export function validateWorkspace(value: unknown): Workspace {
  // Lossless migration of the original quotation-only workspace and its backups.
  if (value && typeof value === 'object' && !Array.isArray(value) && (value as Record<string, unknown>).schemaVersion === 1) {
    if ('documents' in value || 'documentTrash' in value) throw new Error('Unexpected document fields in a version 1 backup.');
    value = { ...value, schemaVersion: 2, documents: [], documentTrash: [] };
  }
  check(value, workspaceSchema, 'workspace');
  const state = value as Workspace;
  uniqueIds([...state.quotations, ...state.trash], 'Quotations'); uniqueIds(state.clients, 'Clients'); uniqueIds(state.presets, 'Packages');
  uniqueIds([...state.documents, ...state.documentTrash], 'Documents');
  if (new Set(state.documents.map(d => d.number.trim().toLowerCase())).size !== state.documents.length) throw new Error('Duplicate document numbers.');
  for (const doc of [...state.documents, ...state.documentTrash]) {
    uniqueIds(doc.fields, 'Document sections');
    if (doc.status === 'finalised' && (!doc.finalisedAt || documentErrors(doc).length)) throw new Error('Finalised document is incomplete.');
  }
  const numbers = state.quotations.map(q => q.number.trim().toLowerCase());
  if (numbers.filter(Boolean).length !== new Set(numbers.filter(Boolean)).size) throw new Error('Duplicate quotation numbers in backup.');
  for (const q of [...state.quotations, ...state.trash]) {
    uniqueIds(q.packages, 'Document packages'); uniqueIds(q.addOns, 'Add-ons'); uniqueIds(q.scenarios, 'Scenarios'); uniqueIds(q.milestones, 'Milestones'); uniqueIds(q.clauses, 'Clauses'); uniqueIds(q.recurring, 'Recurring services');
    for (const pkg of q.packages) uniqueIds(pkg.lines, 'Service rows');
    for (const addon of q.addOns) if (addon.appliesTo.some(id => !q.packages.some(p => p.id === id))) throw new Error('Add-on refers to a missing package.');
    for (const scenario of q.scenarios) if (!q.packages.some(p => p.id === scenario.packageId) || scenario.addOnIds.some(id => !q.addOns.some(a => a.id === id))) throw new Error('Scenario refers to a missing package/add-on.');
    if (q.status === 'finalised' && (!q.finalisedAt || validateQuotation(q).length)) throw new Error(`Finalised quotation ${q.number} is incomplete or invalid.`);
  }
  return copy(state);
}
export function importBackup(text: string): Workspace {
  if (new TextEncoder().encode(text).length > BACKUP_LIMIT) throw new Error('Backup is too large (maximum 10 MB).');
  let parsed: unknown; try { parsed = JSON.parse(text); } catch { throw new Error('Backup is not valid JSON.'); }
  return validateWorkspace(parsed);
}
export function loadWorkspace(storage: Pick<Storage, 'getItem'>): Workspace | null {
  const text = storage.getItem(STORAGE_KEY); return text ? importBackup(text) : null;
}
export function saveWorkspace(storage: Pick<Storage, 'setItem'>, workspace: Workspace) {
  const text = JSON.stringify(validateWorkspace(workspace));
  if (new TextEncoder().encode(text).length > BACKUP_LIMIT) throw new Error('Workspace is too large; export a backup before reducing it.');
  storage.setItem(STORAGE_KEY, text); // Quota/security errors propagate; the UI must never report Saved.
}
export function upsertQuotation(workspace: Workspace, quotation: Quotation): Workspace {
  const existing = workspace.quotations.find(q => q.id === quotation.id);
  if (existing?.status === 'finalised' && JSON.stringify(existing) !== JSON.stringify(quotation)) throw new Error('Finalised snapshots are read-only. Create a revision.');
  if (workspace.quotations.some(q => q.id !== quotation.id && q.number.trim().toLowerCase() === quotation.number.trim().toLowerCase())) throw new Error('This quotation number already exists in this browser. Choose another number.');
  const result = copy(workspace);
  const index = result.quotations.findIndex(q => q.id === quotation.id);
  if (index < 0) result.quotations.unshift(copy(quotation)); else result.quotations[index] = copy(quotation);
  return result;
}
