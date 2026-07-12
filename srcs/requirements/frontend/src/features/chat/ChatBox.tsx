import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { Text, Container } from '@/components';
import { Messages, ChatForm, ChatHeader, useChatCtx } from '.';
import { chatApi, type ChatMessage, type IncomingChatMessageEvent } from '@/api/chat.api';
import { useNotifCtx, notifPayloadString } from '@/features/notifications';

interface ChatBoxProps {
  targetUsername?: string | null;
  onMessageSent?: () => void;
}

export function ChatBox({ targetUsername, onMessageSent }: ChatBoxProps) {
  const { t } = useTranslation(['pages', 'common']);
  const { user } = useAuth();
  const { chatSocket } = useChatCtx();
  const { items, markRead } = useNotifCtx();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!targetUsername) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchHistory = async () => {
      try {
        const history = await chatApi.getHistory(targetUsername);
        setMessages([...history].reverse());
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [targetUsername]);

  // Mark CHAT_MESSAGE notifications from the current conversation as read
  useEffect(() => {
    if (!targetUsername) return;
    const unread = items
      .filter(
        (n) =>
          n.type === 'CHAT_MESSAGE' &&
          !n.readAt &&
          notifPayloadString(n, 'fromUsername') === targetUsername,
      )
      .map((n) => n.id);
    if (!unread.length) return;
    markRead(unread);
  }, [items, targetUsername, markRead]);

  useEffect(() => {
    if (!chatSocket || !targetUsername) return;

    const handleReceiveMessage = (data: IncomingChatMessageEvent) => {
      if (data.fromUsername !== targetUsername) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          senderId: data.from,
          receiverId: user?.id ?? 0,
          content: data.content,
          sentAt: data.sentAt,
          sender: {
            id: data.from,
            username: data.fromUsername,
            avatarUrl: null,
          },
          receiver: {
            id: user?.id ?? 0,
            username: user?.username ?? t('chat.you'),
            avatarUrl: null,
          },
        },
      ]);
      onMessageSent?.();
    };

    chatSocket.on('receive_message', handleReceiveMessage);

    return () => {
      chatSocket.off('receive_message', handleReceiveMessage);
    };
  }, [chatSocket, targetUsername, user]);

  const handleSendMessage = (content: string) => {
    if (chatSocket && targetUsername) {
      chatSocket.emit('send_message', {
        to: targetUsername,
        content,
      });

      onMessageSent?.();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          senderId: user?.id ?? 0,
          receiverId: 0,
          content,
          sentAt: new Date().toISOString(),
          sender: {
            id: user?.id ?? 0,
            username: user?.username ?? t('chat.you'),
            avatarUrl: null,
          },
          receiver: {
            id: 0,
            username: targetUsername,
            avatarUrl: null,
          },
        },
      ]);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      {!targetUsername ? (
        <Text variant="dim">{t('chat.no_chat_selected')}</Text>
      ) : (
        <>
          <ChatHeader username={targetUsername} />

          {isLoading ? (
            <div>
              <Text variant="dim">{t('common:loading')}</Text>
            </div>
          ) : (
            <Container
              variant="terminal"
              className="flex flex-col h-[62dvh] sm:h-[65dvh] !p-2 sm:!p-4"
            >
              <Messages messages={messages} currentUserId={user?.id} />
              <ChatForm onSendMessage={handleSendMessage} />
            </Container>
          )}
        </>
      )}
    </div>
  );
}
