import { API_USERS, authHeaders, handleResponse } from '@/api/config.api';
import type { UserAchievementDto } from '@/types/api';
import type { UserProfileDto, UserStatsDto } from '@/types/api';

export type UserStats = UserStatsDto;
export type UserAchievement = UserAchievementDto;
export type UserProfile = UserProfileDto;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
};

export type UserSearchResult = {
  id: number;
  username: string;
  avatarUrl: string | null;
  status: string;
};

export type MatchPlayer = {
  position: number | null;
  wpm: number | null;
  kind: 'user' | 'guest' | 'bot';
  displayName: string | null;
  avatarUrl: string | null;
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
  } | null;
};

export type HistoryEntry = {
  wpm: number | null;
  position: number | null;
  nbPlayers: number;
  nbBots: number;
  accuracy: number;
  finishedAt: string | null;
  match: {
    id: number;
    startedAt: string;
    textSnippet: string;
    matchResult: MatchPlayer[];
  };
};

export async function getUserProfile(username: string): Promise<UserProfile> {
  const res = await fetch(`${API_USERS}/${encodeURIComponent(username)}`, {
    headers: authHeaders(),
  });
  return handleResponse<UserProfile>(res);
}

export async function getUserHistory(
  username: string,
  page = 1,
  limit = 10,
): Promise<{ data: HistoryEntry[]; total: number; totalPages: number }> {
  const res = await fetch(
    `${API_USERS}/${encodeURIComponent(username)}/history?page=${page}&limit=${limit}`,
    {
      headers: authHeaders(),
    },
  );
  return handleResponse<{ data: HistoryEntry[]; total: number; totalPages: number }>(res);
}

export async function updateMyBio(bio: string): Promise<{ bio: string | null }> {
  const res = await fetch(`${API_USERS}/me`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bio }),
  });

  return handleResponse<{ bio: string | null }>(res);
}

export type UpdateSettingsPayload = {
  email?: string;
  currentPassword?: string;
  password?: string;
  language?: string;
};

export async function updateSettings(
  payload: UpdateSettingsPayload,
): Promise<{ email?: string; language?: string }> {
  const res = await fetch(`${API_USERS}/me/settings`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ email?: string; language?: string }>(res);
}

export async function searchUsers(
  q: string,
  page: number,
  limit = 10,
): Promise<PaginatedResponse<UserSearchResult>> {
  const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  const res = await fetch(`${API_USERS}/search?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse<PaginatedResponse<UserSearchResult>>(res);
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API_USERS}/me/avatar`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse<{ avatarUrl: string }>(res);
}
