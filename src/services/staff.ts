import { ApiError, apiRequest } from './api';
import { getSession, signOut } from './auth';

export type KnowledgeManagerAccount = {
  id: string;
  name: string;
  email: string;
  role: 'knowledge_manager';
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string | null;
};

type KnowledgeManagerCreationResult = {
  user: KnowledgeManagerAccount;
  initialPassword: string;
};

// Returns the real Admin bearer token for staff-management operations.
function adminToken() {
  const session = getSession();
  if (!session?.token || session.demo || session.user.role !== 'admin') {
    throw new Error('Administrator access is required.');
  }
  return session.token;
}

// Calls an Admin-only account endpoint and clears expired frontend sessions.
async function adminRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  try {
    return await apiRequest<T>(path, { ...options, token: adminToken() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) signOut();
    throw error;
  }
}

// Lists bounded Knowledge-Base Manager account summaries.
export async function listKnowledgeManagers(signal?: AbortSignal) {
  const result = await adminRequest<{ items: KnowledgeManagerAccount[] }>('/api/admin/kb-managers', { signal });
  return Array.isArray(result.items) ? result.items : [];
}

// Creates one Knowledge-Base Manager with a one-time initial password response.
export function createKnowledgeManager(name: string, email: string) {
  return adminRequest<KnowledgeManagerCreationResult>('/api/admin/kb-managers', {
    method: 'POST',
    body: { name, email },
  });
}

// Changes only the active state of the selected Knowledge-Base Manager.
export function updateKnowledgeManagerStatus(managerId: string, active: boolean) {
  return adminRequest<{ user: KnowledgeManagerAccount }>(
    `/api/admin/kb-managers/${encodeURIComponent(managerId)}/status`,
    { method: 'PATCH', body: { active } },
  );
}
