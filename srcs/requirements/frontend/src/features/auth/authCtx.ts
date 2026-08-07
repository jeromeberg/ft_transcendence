import { createContext } from 'react';
import type { SafeUser } from '@backend/common/types';

export const TOKEN_KEY = 'transcendence';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export interface AuthContextValue {
  user: SafeUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
