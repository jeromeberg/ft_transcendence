import { type SafeUser } from '@backend/common/types';
import {
  handleResponse,
  authHeaders,
  API_AUTH_ME,
  API_AUTH_LOGIN,
  API_AUTH_REGISTER,
} from '@/api/config.api';

export async function loginApi(
  identifier: string,
  password: string,
): Promise<{ access_token: string }> {
  const res = await fetch(API_AUTH_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return handleResponse(res);
}

export async function registerApi(
  username: string,
  email: string,
  password: string,
): Promise<SafeUser> {
  const res = await fetch(API_AUTH_REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

export async function getMeApi(token: string): Promise<SafeUser> {
  const res = await fetch(API_AUTH_ME, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
