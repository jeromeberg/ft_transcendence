import { useAuth } from './useAuth';

export function useIsOwnProfile(username?: string | null): boolean {
  const { user } = useAuth();
  if (!user || !username) return false;
  return user.username === username;
}
