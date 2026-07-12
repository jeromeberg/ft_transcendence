import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components';
import type { ChatMessage } from '@/api/chat.api';
import { Message } from '.';

interface MessagesProps {
  messages: ChatMessage[];
  currentUserId?: number;
}

function formatDayLabel(
  dateStr: string,
  tToday: string,
  tYesterday: string,
  locale: string,
): string {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);

  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return tToday;
  if (date.toDateString() === yesterday.toDateString()) return tYesterday;
  return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function Messages({ messages, currentUserId }: MessagesProps) {
  const { t, i18n } = useTranslation('pages');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  let lastDay = '';

  return (
    <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Text variant="dim">{t('chat.no_messages')}</Text>
        </div>
      ) : (
        <>
          {messages.map((msg, idx) => {
            const day = new Date(msg.sentAt).toDateString();
            const showSeparator = day !== lastDay;
            lastDay = day;
            return (
              <div key={msg.id ?? idx}>
                {showSeparator && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 border-t border-dim" />
                    <Text size="xs" variant="muted">
                      {formatDayLabel(
                        msg.sentAt,
                        t('chat.today'),
                        t('chat.yesterday'),
                        i18n.language,
                      )}
                    </Text>
                    <div className="flex-1 border-t border-dim" />
                  </div>
                )}
                <Message
                  message={msg}
                  isOwn={currentUserId !== undefined && msg.senderId === currentUserId}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
