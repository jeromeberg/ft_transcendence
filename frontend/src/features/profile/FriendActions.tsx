import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { Btn, Text } from '@/components';
import { deleteFriend, sendFriendRequest, getFriendRelationship } from '@/api/friends.api';

type FriendRelationship = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED';

interface FriendActionsProps {
  username: string;
  onFriendRemoved?: () => void;
}

export default function FriendActions({ username, onFriendRemoved }: FriendActionsProps) {
  const { t } = useTranslation('pages');
  const [relationship, setRelationship] = useState<FriendRelationship>('NONE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getFriendRelationship(username)
      .then((rel) => setRelationship(rel.relationship as FriendRelationship))
      .catch(() => setRelationship('NONE'))
      .finally(() => setLoading(false));
  }, [username]);

  function handleAddFriend() {
    if (loading) return;
    setError(null);
    setLoading(true);
    sendFriendRequest(username)
      .then(() => setRelationship('PENDING_SENT'))
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === 'REQUEST_ALREADY_SENT') {
          setRelationship('PENDING_SENT');
          return;
        }
        setError(err instanceof Error ? tError(err.message, t) : t('profile.error_add'));
      })
      .finally(() => setLoading(false));
  }

  function handleRemoveFriend() {
    if (loading) return;
    setError(null);
    setLoading(true);
    deleteFriend(username)
      .then(() => {
        setRelationship('NONE');
        onFriendRemoved?.();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? tError(err.message, t) : t('profile.error_remove'));
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {relationship === 'ACCEPTED' ? (
          <Btn size="sm" variant="danger" onClick={handleRemoveFriend} disabled={loading}>
            {t('profile.remove_friend')}
          </Btn>
        ) : relationship === 'PENDING_SENT' || relationship === 'PENDING_RECEIVED' ? (
          <Btn size="sm" variant="ghost" disabled>
            {t('profile.pending')}
          </Btn>
        ) : (
          <Btn size="sm" variant="primary" onClick={handleAddFriend} disabled={loading}>
            {t('profile.add_friend')}
          </Btn>
        )}
        <Link to={`/chat/${username}`}>
          <Btn size="sm" variant="secondary" disabled={loading}>
            {t('profile.message')}
          </Btn>
        </Link>
      </div>
      {error && (
        <Text variant="error" size="xs">
          {error}
        </Text>
      )}
    </div>
  );
}
