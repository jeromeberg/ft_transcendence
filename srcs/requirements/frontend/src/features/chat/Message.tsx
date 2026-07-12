import { useTranslation } from 'react-i18next';
import { Text } from '@/components';
//import { Avatar, Text } from '@/components';
import type { ChatMessage } from '@/api/chat.api';

interface MessageProps {
  message: ChatMessage;
  isOwn?: boolean;
}

export function Message({ message, isOwn = false }: MessageProps) {
  const { t } = useTranslation('pages');
  const displayName = isOwn ? t('chat.you') : message.sender.username;
  const time = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mb-2 flex items-start justify-between gap-3">
      <Text size="sm">
        <span className={`font-bold ${isOwn ? 'text-default' : 'text-accent'}`}>{displayName}</span>
        : {message.content}
      </Text>
      <Text size="xs" variant="muted" className="shrink-0 mt-0.5">
        {time}
      </Text>
    </div>
  );
}
