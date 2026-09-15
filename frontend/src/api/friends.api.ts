import { API_FRIENDS, authHeaders, handleResponse } from '@/api/config.api';
import type { FriendUserDto, FriendRequestDto, RelationshipResponseDto } from '@/types/api';

export type { FriendUserDto, FriendRequestDto, RelationshipResponseDto };

export async function getFriends(username: string): Promise<FriendUserDto[]> {
  const res = await fetch(`${API_FRIENDS}/${encodeURIComponent(username)}`, {
    headers: authHeaders(),
  });
  return handleResponse<FriendUserDto[]>(res);
}

export async function sendFriendRequest(username: string): Promise<void> {
  const res = await fetch(`${API_FRIENDS}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ username }),
  });
  return handleResponse<void>(res);
}

export async function acceptFriendRequest(username: string): Promise<void> {
  const res = await fetch(`${API_FRIENDS}/request/${encodeURIComponent(username)}/accept`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

export async function declineFriendRequest(username: string): Promise<void> {
  const res = await fetch(`${API_FRIENDS}/request/${encodeURIComponent(username)}/decline`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

export async function deleteFriend(username: string): Promise<void> {
  const res = await fetch(`${API_FRIENDS}/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

export async function getFriendRelationship(username: string): Promise<RelationshipResponseDto> {
  const res = await fetch(`${API_FRIENDS}/${encodeURIComponent(username)}/relationship`, {
    headers: authHeaders(),
  });
  return handleResponse<RelationshipResponseDto>(res);
}

export async function getIncomingRequests(): Promise<FriendRequestDto[]> {
  const res = await fetch(`${API_FRIENDS}/requests`, {
    headers: authHeaders(),
  });
  return handleResponse<FriendRequestDto[]>(res);
}

export async function getSentRequests(): Promise<FriendRequestDto[]> {
  const res = await fetch(`${API_FRIENDS}/requests/sent`, {
    headers: authHeaders(),
  });
  return handleResponse<FriendRequestDto[]>(res);
}
