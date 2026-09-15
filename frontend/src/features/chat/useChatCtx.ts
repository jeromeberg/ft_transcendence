import { useContext } from 'react';
import { ChatCtx } from './chatContext';

export function useChatCtx() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error('useChatCtx must be used in ChatProvider');
  return ctx;
}
