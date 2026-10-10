export const apiUrl = process.env.EXPO_PUBLIC_TRAIL_API_URL?.trim().replace(/\/+$/, '');

type RequestOptions = { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown; token?: string; signal?: AbortSignal; timeoutMs?: number };
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!apiUrl) throw new Error('The university service is not configured. Demo accounts do not support this action.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, options.timeoutMs ?? 30_000);
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method: options.method ?? 'GET', signal: controller.signal,
      headers: { 'content-type': 'application/json', ...(options.token ? { authorization: `Bearer ${options.token}` } : {}) },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(body.error || 'The service could not complete your request. Please try again.', response.status);
    return body as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('The request took too long. Check your connection and try again.');
    if (error instanceof TypeError) throw new Error('Could not reach the university service. Check your connection and try again.');
    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}
