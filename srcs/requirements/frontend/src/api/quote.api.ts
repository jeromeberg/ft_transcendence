import { API_QUOTES, authHeaders, handleResponse } from '@/api/config.api';
import type { Quote } from '@/types/api';

export type RandomQuote = Pick<Quote, 'id' | 'text' | 'type'>;

export async function getRandomQuote(params?: {
  minLength?: number;
  maxLength?: number;
  type?: string;
}): Promise<RandomQuote> {
  const search = new URLSearchParams();
  if (params?.minLength !== undefined) {
    search.set('minLength', String(params.minLength));
  }
  if (params?.maxLength !== undefined) {
    search.set('maxLength', String(params.maxLength));
  }
  if (params?.type) {
    search.set('type', params.type);
  }

  const qs = search.toString();
  const res = await fetch(`${API_QUOTES}/random${qs ? `?${qs}` : ''}`);
  return handleResponse<RandomQuote>(res);
}

export async function getAllQuotes(): Promise<Quote[]> {
  const res = await fetch(`${API_QUOTES}`, {
    headers: authHeaders(),
  });
  return handleResponse<Quote[]>(res);
}

export async function createQuote(text: string, type?: string): Promise<Quote> {
  const res = await fetch(`${API_QUOTES}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, type: type || null }),
  });
  return handleResponse<Quote>(res);
}

export async function deleteQuote(id: number): Promise<Quote> {
  const res = await fetch(`${API_QUOTES}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<Quote>(res);
}

export async function editQuote(
  id: number,
  updates: { text?: string; type?: string; active?: boolean }
): Promise<Quote> {
  const res = await fetch(`${API_QUOTES}/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return handleResponse<Quote>(res);
}
