import { useAuth } from './useAuth';

export function useIsMod() {
  const { user } = useAuth();
  return user?.role === 'MOD';
}
