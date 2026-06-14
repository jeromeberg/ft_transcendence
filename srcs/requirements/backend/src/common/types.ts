export type UserStatus = 'ONLINE' | 'IN_GAME' | 'OFFLINE';
export type UserRole = 'USER' | 'MOD';

export type SafeUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  language: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  hasPassword: boolean;
  isOAuthOnly: boolean;
};
