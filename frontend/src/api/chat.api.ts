import { authHeaders, handleResponse } from '@/api/config.api';
import type { ConversationDto, MessageDto } from '@/types/api';

export type ChatMessage = MessageDto;
export type ChatConversation = ConversationDto;

export interface IncomingChatMessageEvent {
  from: number;
  fromUsername: string;
  content: string;
  sentAt: string;
}

export const chatApi = {
  getHistory: async (username: string, before?: number): Promise<ChatMessage[]> => {
    const params = new URLSearchParams();
    if (before) params.append('before', before.toString());
    const queryString = params.toString() ? '?' + params.toString() : '';
    const res = await fetch(`/api/chat/${encodeURIComponent(username)}${queryString}`, {
      headers: authHeaders(),
    });
    return handleResponse<ChatMessage[]>(res);
  },
  getConversations: async (): Promise<ChatConversation[]> => {
    const res = await fetch('/api/chat', {
      headers: authHeaders(),
    });
    return handleResponse<ChatConversation[]>(res);
  },
};
