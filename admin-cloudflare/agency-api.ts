import type { D1Database } from '@cloudflare/workers-types';
import { invoiceApplied, validateAgency, type AgencyRecord, type Invoice, type Payment } from '../lib/admin-system/model';
import { correctIssuedInvoice } from '../lib/admin-system/invoice-corrections';

const LIMIT = 1_500_000;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export async function agencyRequest(request: Request, db: D1Database): Promise<Response> {
  let row: { revision: number; snapshot: string } | null;
  try { row = await db.prepare('SELECT revision, snapshot FROM admin_agency WHERE id = 1').first<{ revision: number; snapshot: string }>(); }
  catch { return json({ error: 'Agency migration 0003 is not applied.' }, 503); }
  if (!row) return json({ error: 'Agency migration 0003 is not applied.' }, 503);
  if (request.method === 'GET') {
    try { return json({ revision: row.revision, records: validateAgency(JSON.parse(row.snapshot)) }); }
    catch { return json({ error: 'Agency records could not be read.' }, 503); }
  }
  if (request.method !== 'PUT') return json({ error: 'Method not allowed.' }, 405);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Cross-origin save rejected.' }, 403);
  if (Number(request.headers.get('Content-Length') || 0) > LIMIT) return json({ error: 'Agency data is too large.' }, 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > LIMIT) return json({ error: 'Agency data is too large.' }, 413);
  let input: { revision?: number; records?: AgencyRecord[] };
  try { input = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400); }
  if (!Number.isSafeInteger(input.revision) || input.revision !== row.revision) return json({ error: 'Agency data changed on another device. Reload before saving.' }, 409);
  let records: AgencyRecord[];
  try { records = validateAgency(input); } catch (error) { return json({ error: (error as Error).message }, 400); }
  // Record each financial correction while preserving the original invoice identity.
  const previous = validateAgency(JSON.parse(row.snapshot));
  for (const old of previous) {
    const next = records.find(item => item.id === old.id);
    if (!next) return json({ error: 'Records must be moved to Trash before removal.' }, 400);
    if (next.kind !== old.kind) return json({ error: 'Record types cannot be changed.' }, 400);
    if (old.kind === 'invoice' && old.status === 'issued') {
      const invoice = next as Invoice;
      if (invoice.deletedAt) return json({ error: 'Void an issued invoice instead of deleting it.' }, 400);
      if (invoice.status === 'void' && invoiceApplied(old, previous.filter((item): item is Payment => item.kind === 'payment' && !item.deletedAt)) > 0) return json({ error: 'A paid invoice cannot be voided while payments are allocated to it.' }, 400);
      try { records[records.indexOf(next)] = correctIssuedInvoice(old, invoice, new Date().toISOString()); }
      catch (error) { return json({ error: (error as Error).message }, 400); }
    }
  }
  try { validateAgency({ records }); } catch (error) { return json({ error: (error as Error).message }, 400); }
  const result = await db.prepare('UPDATE admin_agency SET snapshot = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1 AND revision = ?')
    .bind(JSON.stringify({ records }), row.revision).run();
  if (result.meta.changes !== 1) return json({ error: 'Agency data changed on another device. Reload before saving.' }, 409);
  return json({ revision: row.revision + 1, records });
}
