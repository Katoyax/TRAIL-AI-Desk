import { ApiError, apiRequest } from './api';
import { getSession, signOut } from './auth';

export type PasswordResetRequestStatus = 'pending' | 'handled' | 'dismissed';

export type PasswordResetRequest = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  requestedAt: string;
  status: PasswordResetRequestStatus;
  resolutionAt: string | null;
};

export type PasswordResetRequestList = {
  items: PasswordResetRequest[];
  pendingCount: number;
};

export type ApprovedPasswordReset = {
  request: PasswordResetRequest;
  credential: {
    studentName: string;
    studentIdNumber: string | null;
    registeredEmail: string;
    temporaryPassword: string;
  };
};

function adminToken() {
  const session = getSession();
  if (!session?.token || session.demo || session.user.role !== 'admin') {
    throw new Error('Administrator access is required.');
  }
  return session.token;
}

async function adminRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown; signal?: AbortSignal } = {},
) {
  try {
    return await apiRequest<T>(path, { ...options, token: adminToken() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) signOut();
    throw error;
  }
}

export function listPasswordResetRequests(signal?: AbortSignal) {
  return adminRequest<PasswordResetRequestList>('/api/admin/password-requests', { signal });
}

export function updatePasswordResetRequest(
  id: string,
  status: 'dismissed',
) {
  return adminRequest<{ request: PasswordResetRequest }>(
    `/api/admin/password-requests/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: { status } },
  );
}

// Approves a verified request and returns the one-time temporary credential.
export function approvePasswordResetRequest(id: string) {
  return adminRequest<ApprovedPasswordReset>(
    `/api/admin/password-requests/${encodeURIComponent(id)}/approve-reset`,
    { method: 'POST', body: { identityVerified: true } },
  );
}
