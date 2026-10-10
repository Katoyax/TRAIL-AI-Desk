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
export const addSource = (input: SourceInput) => adminRequest<{ source: KnowledgeSource }>('/api/admin/sources', 'POST', input, 120_000);
export const editSource = (id: string, input: Partial<SourceInput>) => adminRequest<{ source: KnowledgeSource }>(`/api/admin/sources/${encodeURIComponent(id)}`, 'PATCH', input);
export const sourceAction = (id: string, action: 'verify' | 'unverify' | 'archive' | 'refresh', expectedVersion?: number, expectedRevision?: number) => adminRequest<{ source: KnowledgeSource; message?: string; status?: 'unchanged' | 'updated' | 'failed'; error?: string }>(`/api/admin/sources/${encodeURIComponent(id)}/${action}`, 'POST', action === 'verify' ? { expectedVersion, expectedRevision } : {}, action === 'refresh' ? 120_000 : undefined);
export type SourceVersion = { id: string; version: number; isActive: boolean; contentHash?: string; createdAt?: string; verificationStatus: string };
export async function sourceVersions(id: string) {
  const result = await adminRequest<{ items: SourceVersion[] }>(`/api/admin/sources/${encodeURIComponent(id)}/versions`);
  return result.items ?? [];
}
