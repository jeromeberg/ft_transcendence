import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Btn } from '.';
import { tError } from '@/features/i18n';
import { getUserProfile } from '@/api/users.api';

interface FindUserProps {
  onAction: (username: string) => void | Promise<void>;
  className?: string;
}

export function FindUser({ onAction, className = '' }: FindUserProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(['auth', 'common']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      await getUserProfile(trimmed);
    } catch {
      setError(t('common:errors.USER_NOT_FOUND'));
      setLoading(false);
      return;
    }

    try {
      await onAction(trimmed);
      setUsername('');
    } catch (err) {
      setError(tError(err instanceof Error ? err.message : 'ACTION_FAILED', t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      <div className="flex gap-2 items-start">
        <Input
          placeholder={t('username')}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(null);
          }}
          disabled={loading}
          error={error ?? undefined}
        />
        <Btn type="submit" variant="primary" disabled={loading || !username.trim()}>
          {t('common:find')}
        </Btn>
      </div>
    </form>
  );
}
