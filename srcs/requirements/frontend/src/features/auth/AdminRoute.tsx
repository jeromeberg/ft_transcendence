import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, PageLayout } from '@/components';
import { useAuth } from './useAuth';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'MOD') return <PageLayout><Alert variant="error">Not allowed for users</Alert></PageLayout>;

  return <>{children}</>;
}
