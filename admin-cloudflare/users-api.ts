export type AdminUserView = { email: string; name: string; role: 'owner' | 'member'; createdAt: string; updatedAt: string };
type UsersResponse = { users: AdminUserView[]; accessConfigured?: boolean; error?: string };

async function json<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error || 'Could not complete the user request.');
  return body;
}

export async function currentAdmin(): Promise<{ email: string; name: string; canManageUsers: boolean }> {
  return json<{ email: string; name: string; canManageUsers: boolean }>(await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' }));
}
export async function loadAdminUsers(): Promise<{ users: AdminUserView[]; accessConfigured: boolean }> {
  const body = await json<UsersResponse>(await fetch('/api/users', { credentials: 'same-origin', cache: 'no-store' }));
  return { users: body.users, accessConfigured: !!body.accessConfigured };
}
export async function changeAdminUser(method: 'POST' | 'PATCH' | 'DELETE', payload: Record<string, string>): Promise<AdminUserView[]> {
  const body = await json<UsersResponse>(await fetch('/api/users', {
    method, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }));
  return body.users;
}
