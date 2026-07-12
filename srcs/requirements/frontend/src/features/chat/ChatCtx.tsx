import { createContext, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth';
import { getToken } from '@/features/auth/AuthContext';

interface ChatCtxValue {
  chatSocket: Socket | null;
}

export const ChatCtx = createContext<ChatCtxValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!user || !token) return;

    const socket: Socket = io('/chat', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !socket.connected) {
        socket.auth = { token: getToken() };
        socket.connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    setChatSocket(socket);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      socket.disconnect();
      setChatSocket(null);
    };
  }, [user]);

  return <ChatCtx.Provider value={{ chatSocket }}>{children}</ChatCtx.Provider>;
}
