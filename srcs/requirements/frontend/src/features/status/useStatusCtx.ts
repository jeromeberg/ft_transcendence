import { useContext } from 'react';
import { StatusCtx } from './statusContext';

export function useStatusCtx() {
  const ctx = useContext(StatusCtx);
  if (!ctx) throw new Error('useStatusCtx must be used in StatusProvider');
  return ctx;
}
