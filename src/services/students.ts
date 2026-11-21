import { ApiError, apiRequest } from './api';
import { getSession, signOut } from './auth';

export type StudentAccount = {
  id: string;
  name: string;
  email: string;
  studentIdNumber: string | null;
  role: 'student';
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string | null;
};

type StudentCreationResult = {
  user: StudentAccount;
  initialPassword: string;
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
): Promise<T> {
  try {
    return await apiRequest<T>(path, { ...options, token: adminToken() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) signOut();
    throw error;
  }
}

export async function listStudents(signal?: AbortSignal) {
  const result = await adminRequest<{ items: StudentAccount[] }>(
    '/api/admin/students',
    { signal },
  );
  return Array.isArray(result.items) ? result.items : [];
}

export function createStudent(name: string, studentIdNumber: string, email: string) {
  return adminRequest<StudentCreationResult>('/api/admin/students', {
    method: 'POST',
    body: { name, studentIdNumber, email },
  });
}

export function requestStudentPasswordReset(studentId: string) {
  return adminRequest<{ message: string }>(
    `/api/admin/students/${encodeURIComponent(studentId)}/reset-password`,
    { method: 'POST' },
  );
}

// Changes only the active state of the selected Student account.
export function updateStudentStatus(studentId: string, active: boolean) {
  return adminRequest<{ user: StudentAccount }>(
    `/api/admin/students/${encodeURIComponent(studentId)}/status`,
    { method: 'PATCH', body: { active } },
  );
}
