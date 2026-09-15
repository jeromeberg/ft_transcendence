import { createContext } from 'react';

export type LiveUserStatus = 'ONLINE' | 'IN_GAME' | 'OFFLINE';
export type LiveStatusMap = Record<number, LiveUserStatus>;

export interface StatusCtxValue {
  liveStatuses: LiveStatusMap;
}

export const StatusCtx = createContext<StatusCtxValue | null>(null);
