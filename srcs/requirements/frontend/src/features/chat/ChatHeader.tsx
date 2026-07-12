import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Heading, Status, Btn, Alert } from '@/components';
import { getUserProfile, type UserProfile } from '@/api/users.api';
import { useStatus } from '@/hooks/useStatus';
import { tError } from '@/features/i18n';

interface ChatHeaderProps {
  username: string;
}

export function ChatHeader({ username }: ChatHeaderProps) {
  const { t } = useTranslation(['pages', 'common']);
  const getStatus = useStatus();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(null);
    setError(null);
    getUserProfile(username)
      .then(setProfile)
      .catch((err) => setError(tError(err.message, t)));
  }, [username]);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!profile) return null;

  const displayedStatus = getStatus(profile.status, profile.id, profile.username);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Avatar username={profile.username} src={profile.avatarUrl ?? undefined} size="sm" />
      <div className="flex flex-col flex-1 min-w-0">
        <Heading level={4} className="truncate sm:hidden">
          <Status status={displayedStatus} hoverText={displayedStatus} /> {profile.username}
        </Heading>
        <Heading level={2} className="truncate hidden sm:block">
          <Status status={displayedStatus} hoverText={displayedStatus} /> {profile.username}
        </Heading>
      </div>
      <Btn
        as={Link}
        to={`/profile/${profile.username}`}
        variant="primary"
        size="sm"
        className="shrink-0 text-xs sm:text-xs"
      >
        {t('chat.view_profile')}
      </Btn>
    </div>
  );
}
