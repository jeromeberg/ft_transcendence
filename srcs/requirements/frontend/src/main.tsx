import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import '@/features/i18n/index.ts';
import App from './App.tsx';
import { AuthProvider } from '@/features/auth';
import { StatusProvider } from '@/features/status';
import { ChatProvider } from '@/features/chat';
import { NotificationsProvider } from '@/features/notifications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StatusProvider>
          <ChatProvider>
            <NotificationsProvider>
              <App />
            </NotificationsProvider>
          </ChatProvider>
        </StatusProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
