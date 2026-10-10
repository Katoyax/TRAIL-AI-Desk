import { useSyncExternalStore } from 'react';
import { apiRequest, apiUrl } from './api';

export type SessionUser = { id: string; name: string; email: string; role: 'student' | 'admin' };
export type Session = { user: SessionUser; token?: string; expiresAt?: string; demo: boolean };
let session: Session | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => session;
const serverSnapshot = () => null;

function setSession(value: Session | null) {
  session = value;
  listeners.forEach((listener) => listener());
}

// Tokens stay in memory. Reloading or closing the app requires a fresh sign-in.
export function useSession() { return useSyncExternalStore(subscribe, snapshot, serverSnapshot); }
export function getSession() { return session; }
export function signOut() {
  const token = session?.token;
  setSession(null);
  if (token) void apiRequest('/api/auth/logout', { method: 'POST', token }).catch(() => {});
}
export const hasConfiguredApi = Boolean(apiUrl);
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export async function signIn(email: string, password: string) {
  const result = await apiRequest<{ token: string; expiresAt?: string; user: SessionUser }>('/api/auth/login', {
    method: 'POST', body: { email: email.trim().toLowerCase(), password },
  });
  if (!result.token || !result.user?.id || !['student', 'admin'].includes(result.user.role)) throw new Error('Invalid sign-in response.');
  setSession({ ...result, demo: false });
}

export async function authenticateDemo(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== 'student@ustp.edu.ph' || password !== 'student123') return false;
  setSession({ user: { id: 'demo-student', name: 'Demo Student', email: normalizedEmail, role: 'student' }, demo: true });
  return true;
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: { email: email.trim().toLowerCase() } });
}

export async function resetPassword(token: string, password: string, confirmPassword: string) {
  const result = await apiRequest<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: { token, password, confirmPassword } });
  signOut();
  return result;
}

export async function validateAdminSession() {
  if (!session?.token || session.demo) throw new Error('Sign in with an authorized administrator account.');
  const result = await apiRequest<{ user: SessionUser }>('/api/auth/me', { token: session.token });
  if (result.user?.role !== 'admin') throw new Error('Administrator access is required.');
  return result.user;
}
