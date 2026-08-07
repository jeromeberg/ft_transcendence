import { useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth, getToken } from '@/features/auth';
import { StatusCtx, type LiveStatusMap, type LiveUserStatus } from './statusContext';

export function StatusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [liveStatuses, setLiveStatuses] = useState<LiveStatusMap>({});

  useEffect(() => {
    const token = getToken();
    if (!user || !token) {
      setLiveStatuses({});
      return;
    }

    const socket: Socket = io('/status', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('status:update', (payload: { userId: number; status: LiveUserStatus }) => {
      setLiveStatuses((prev) => ({ ...prev, [payload.userId]: payload.status }));
    });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !socket.connected) {
        socket.auth = { token: getToken() };
        socket.connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      socket.off('status:update');
      document.removeEventListener('visibilitychange', handleVisibility);
      socket.disconnect();
    };
  }, [user]);

  return <StatusCtx.Provider value={{ liveStatuses }}>{children}</StatusCtx.Provider>;
}
