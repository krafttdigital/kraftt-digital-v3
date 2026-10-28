import { validateWorkspace } from '../lib/quotation/storage';
import type { Workspace } from '../lib/quotation/model';

export async function loadCloudWorkspace(): Promise<{ workspace: Workspace | null; revision: number }> {
  const response = await fetch('/api/workspace', { credentials: 'same-origin', cache: 'no-store' });
  const body = await response.json() as { workspace?: unknown; revision?: number; error?: string };
  if (!response.ok) throw new Error(body.error || 'Could not load the cloud workspace.');
  if (!Number.isSafeInteger(body.revision)) throw new Error('Cloud workspace returned an invalid revision.');
  return { workspace: body.workspace === null ? null : validateWorkspace(body.workspace), revision: body.revision! };
}

export async function saveCloudWorkspace(workspace: Workspace, baseRevision: number): Promise<number> {
  const response = await fetch('/api/workspace', {
    method: 'PUT', credentials: 'same-origin', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace: validateWorkspace(workspace), baseRevision }),
  });
  const body = await response.json() as { revision?: number; error?: string };
  if (!response.ok) {
    const error = new Error(body.error || 'Could not save to the cloud.') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (!Number.isSafeInteger(body.revision)) throw new Error('Cloud save did not return a revision.');
  return body.revision!;
}
