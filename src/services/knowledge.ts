import { apiRequest, ApiError } from './api';
import { getSession, signOut } from './auth';
import type { ChatSource } from './chat';

export type SourceType = 'official_webpage' | 'official_pdf' | 'uploaded_document' | 'office_verified_information';
export type KnowledgeSource = ChatSource & { id: string; content?: string; sourceType?: SourceType; contentHash?: string; lastCheckError?: string; lastAttemptedAt?: string; refreshStatus?: string };
export type SourceInput = {
  sourceType: SourceType; title: string; documentTitle?: string; documentNumber?: string; issuingOffice?: string;
  dateIssued?: string; datePublished?: string; category?: string; sourceUrl?: string; content?: string;
  effectiveFrom?: string; effectiveTo?: string;
  upload?: { filename: string; mimeType: string; data: string };
};
export type ManagerKnowledgeSource = {
  id: string;
  sourceId: string;
  title: string;
  documentTitle: string;
  documentNumber: string;
  issuingOffice: string;
  category: string;
  sourceType: 'office_verified_information';
  supportingReferenceUrl: string;
  content?: string;
  verificationStatus: string;
  draftStatus: '' | 'draft' | 'pending_review';
  isActive: boolean;
  version: number;
  draftVersionNumber: number;
  revision: number;
  createdAt: string;
  createdBy: string;
  lastUpdated: string;
  submittedAt: string;
};
export type ManagerSourceInput = {
  sourceType: 'office_verified_information';
  title: string;
  documentNumber?: string;
  issuingOffice: string;
  category?: string;
  content: string;
  supportingReferenceUrl: string;
};
export type ManagerSourceVersion = {
  id: string;
  version: number;
  isActive: boolean;
  isDraft: boolean;
  contentHash?: string;
  createdAt?: string;
  verificationStatus: string;
  createdBy?: string;
};

export async function listKnowledge(category?: string, signal?: AbortSignal) {
  const result = await apiRequest<{ items: KnowledgeSource[] }>(`/api/knowledge${category ? `?category=${encodeURIComponent(category)}` : ''}`, { signal });
  return result.items ?? [];
}

async function adminRequest<T>(path: string, method: 'GET' | 'POST' | 'PATCH' = 'GET', body?: unknown, timeoutMs?: number): Promise<T> {
  const session = getSession();
  if (!session?.token || session.demo || session.user.role !== 'admin') throw new Error('Administrator access is required.');
  try { return await apiRequest<T>(path, { method, body, token: session.token, timeoutMs }); }
  catch (error) { if (error instanceof ApiError && error.status === 401) signOut(); throw error; }
}

export async function listAdminSources(search = '') {
  const result = await adminRequest<{ items: KnowledgeSource[] }>(`/api/admin/sources${search ? `?query=${encodeURIComponent(search)}` : ''}`);
  return result.items ?? [];
}

// Lists source status for a real Knowledge-Base Manager without granting mutation access.
export async function listKnowledgeManagerSources(signal?: AbortSignal) {
  const session = getSession();
  if (!session?.token || session.demo || session.user.role !== 'knowledge_manager') {
    throw new Error('Knowledge-Base Manager access is required.');
  }
  try {
    const result = await apiRequest<{ items: ManagerKnowledgeSource[] }>('/api/knowledge-manager/sources', {
      token: session.token,
      signal,
    });
    return Array.isArray(result.items) ? result.items : [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) signOut();
    throw error;
  }
}

// Sends a protected request through the existing Knowledge-Base Manager session.
async function managerRequest<T>(path: string, method: 'GET' | 'POST' | 'PATCH' = 'GET', body?: unknown): Promise<T> {
  const session = getSession();
  if (!session?.token || session.demo || session.user.role !== 'knowledge_manager') {
    throw new Error('Knowledge-Base Manager access is required.');
  }
  try { return await apiRequest<T>(path, { method, body, token: session.token }); }
  catch (error) { if (error instanceof ApiError && error.status === 401) signOut(); throw error; }
}

// Loads one protected source with editable draft content.
export async function getKnowledgeManagerSource(id: string) {
  const result = await managerRequest<{ source: ManagerKnowledgeSource }>(
    `/api/knowledge-manager/sources/${encodeURIComponent(id)}`,
  );
  return result.source;
}

// Creates a non-public manual institutional source draft.
export async function createKnowledgeManagerSource(input: ManagerSourceInput) {
  const result = await managerRequest<{ source: ManagerKnowledgeSource }>(
    '/api/knowledge-manager/sources', 'POST', input,
  );
  return result.source;
}

// Saves an owned draft as a new immutable version.
export async function updateKnowledgeManagerSource(id: string, input: ManagerSourceInput, expectedRevision: number) {
  const result = await managerRequest<{ source: ManagerKnowledgeSource }>(
    `/api/knowledge-manager/sources/${encodeURIComponent(id)}`, 'PATCH', { ...input, expectedRevision },
  );
  return result.source;
}

// Loads safe version-history metadata for a manager source.
export async function listKnowledgeManagerSourceVersions(id: string) {
  const result = await managerRequest<{ items: ManagerSourceVersion[] }>(
    `/api/knowledge-manager/sources/${encodeURIComponent(id)}/versions`,
  );
  return result.items ?? [];
}

// Submits a draft for independent review without approving or publishing it.
export async function submitKnowledgeManagerSource(id: string, expectedRevision: number) {
  const result = await managerRequest<{ source: ManagerKnowledgeSource }>(
    `/api/knowledge-manager/sources/${encodeURIComponent(id)}/submit`, 'POST', { expectedRevision },
  );
  return result.source;
}
export const addSource = (input: SourceInput) => adminRequest<{ source: KnowledgeSource }>('/api/admin/sources', 'POST', input, 120_000);
export const editSource = (id: string, input: Partial<SourceInput>) => adminRequest<{ source: KnowledgeSource }>(`/api/admin/sources/${encodeURIComponent(id)}`, 'PATCH', input);
export const sourceAction = (id: string, action: 'verify' | 'unverify' | 'archive' | 'refresh', expectedVersion?: number, expectedRevision?: number) => adminRequest<{ source: KnowledgeSource; message?: string; status?: 'unchanged' | 'updated' | 'failed'; error?: string }>(`/api/admin/sources/${encodeURIComponent(id)}/${action}`, 'POST', action === 'verify' ? { expectedVersion, expectedRevision } : {}, action === 'refresh' ? 120_000 : undefined);
export type SourceVersion = { id: string; version: number; isActive: boolean; contentHash?: string; createdAt?: string; verificationStatus: string };
export async function sourceVersions(id: string) {
  const result = await adminRequest<{ items: SourceVersion[] }>(`/api/admin/sources/${encodeURIComponent(id)}/versions`);
  return result.items ?? [];
}
