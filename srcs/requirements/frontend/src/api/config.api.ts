import { getToken } from '@/features/auth';

export const API_AUTH_LOGIN = '/api/auth/login';
export const API_AUTH_REGISTER = '/api/auth/register';
export const API_AUTH_ME = '/api/auth/me';
export const API_USERS = '/api/users';
export const API_FRIENDS = '/api/friends';
export const API_LEADERBOARD = '/api/leaderboard';
export const API_QUOTES = '/api/quotes';


export function authHeaders(token? : string | null): HeadersInit {
    let ftoken = token;
    if (!ftoken)
      ftoken = getToken();
  return ftoken ? { Authorization: `Bearer ${ftoken}` } : {};
}

export async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  let data: unknown;
  let parseError: Error | null = null;
  if (!trimmed) {
    data = {};
  } else {
    try {
      data = JSON.parse(trimmed);
    } catch (err) {
      parseError = err instanceof Error ? err : new Error('response not JSON');
    }
  }
  if (!res.ok) {
    if (parseError || data == null || typeof data !== 'object') {
      throw new Error(`HTTP ${res.status}`);
    }
    const message = (data as { message?: unknown }).message;
    const msg = Array.isArray(message) ? message[0] : message;
    throw new Error(typeof msg === 'string' && msg ? msg : `HTTP ${res.status}`);
  }
  if (parseError) {
    throw new Error(`HTTP ${res.status} — response not JSON`);
  }
  return data as T;
}