import { useTranslation } from 'react-i18next';
import { Avatar, Heading, Text, Status } from '@/components';
import type { UserProfile } from '@/api/users.api';
import AvatarUpload from './AvatarUpload';
import FriendActions from './FriendActions';

interface ProfileHeaderProps {
  profile: Pick<UserProfile, 'username' | 'avatarUrl'>;
  isOwnProfile: boolean;
  onAvatarChange: (url: string) => void;
  displayedStatus: string;
  createdAt: string | null;
  onFriendRemoved: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  onAvatarChange,
  displayedStatus,
  createdAt,
  onFriendRemoved,
}: ProfileHeaderProps) {
  const { t } = useTranslation('pages');

  return (
    <div className="flex flex-col sm:flex-row items-start gap-5">
      {isOwnProfile ? (
        <AvatarUpload
          username={profile.username}
          src={profile.avatarUrl}
          onAvatarChange={onAvatarChange}
        />
      ) : (
        <Avatar username={profile.username} src={profile.avatarUrl ?? undefined} size="xl" />
      )}

      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div>
          <Heading level={1} className="truncate !text-lg sm:!text-3xl">
            <Status status={displayedStatus} hoverText={displayedStatus} /> {profile.username}
          </Heading>
          {createdAt && (
            <Text variant="dim" size="xs">
              {t('profile.created_on', { date: createdAt })}
            </Text>
          )}
        </div>
        {!isOwnProfile && (
          <FriendActions username={profile.username} onFriendRemoved={onFriendRemoved} />
        )}
      </div>
    </div>
  );
}
