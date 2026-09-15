import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Btn } from '@/components';
import { CHAT_RATE_LIMIT_MS } from '@backend/common/chat.constant';

interface ChatFormProps {
  onSendMessage: (content: string) => void;
}

export function ChatForm({ onSendMessage }: ChatFormProps) {
  const { t } = useTranslation('pages');
  const [message, setMessage] = useState('');
  const [throttled, setThrottled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || throttled) return;

    setThrottled(true);
    onSendMessage(message);
    setMessage('');
    setTimeout(() => setThrottled(false), CHAT_RATE_LIMIT_MS);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <Input
        type="text"
        placeholder={t('chat.message_placeholder')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        variant="ghost"
        className="flex-1"
      />
      <Btn type="submit" variant="primary" disabled={throttled}>
        {throttled ? '⏳' : t('chat.send')}
      </Btn>
    </form>
  );
}
