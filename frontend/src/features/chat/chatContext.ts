import { createContext } from 'react';
import type { Socket } from 'socket.io-client';

export interface ChatCtxValue {
  chatSocket: Socket | null;
}

export const ChatCtx = createContext<ChatCtxValue | null>(null);
