import { API_LEADERBOARD, authHeaders, handleResponse } from '@/api/config.api';
import type { LeaderboardEntryDto } from '@/types/api';

export type LeaderboardEntry = LeaderboardEntryDto;

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getLeaderboard(
  page = 1,
  limit = 20,
  q?: string,
  sortOrder?: 'asc' | 'desc',
  minLevel?: number,
): Promise<LeaderboardResponse> {
  const params: Record<string, string> = { page: String(page), limit: String(limit) };
  if (q?.trim()) params.q = q.trim();
  if (sortOrder) params.sortOrder = sortOrder;
  if (minLevel && minLevel > 1) params.minLevel = String(minLevel);

  const res = await fetch(`${API_LEADERBOARD}?${new URLSearchParams(params)}`, {
    headers: authHeaders(),
  });

  return handleResponse<LeaderboardResponse>(res);
}
