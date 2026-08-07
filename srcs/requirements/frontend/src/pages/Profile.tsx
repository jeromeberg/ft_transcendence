import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, PageLayout, PageWithSidebar, Sidebar } from '@/components';
import { tError } from '@/features/i18n';
import { useAuth, useIsOwnProfile } from '@/features/auth';
import { getUserProfile, type UserProfile } from '@/api/users.api';
import { FriendsList } from '@/features/friends';
import { Bio, Stats, NextLvl, History, Achievements, ProfileHeader } from '@/features/profile';
import { useStatus } from '@/hooks/useStatus';

export default function Profile() {
  const { t } = useTranslation('pages');
  const { username } = useParams<{ username?: string }>();
  const { user: me } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendsRefreshKey, setFriendsRefreshKey] = useState(0);
  const getStatus = useStatus();

  const targetUsername = username ?? me?.username;
  const isOwnProfile = useIsOwnProfile(targetUsername);

  useEffect(() => {
    if (!targetUsername) return;

    setLoading(true);
    setError(null);

    getUserProfile(targetUsername)
      .then((prof) => {
        setProfile(prof);
      })
      .catch((err) => setError(tError(err.message, t)))
      .finally(() => setLoading(false));
  }, [targetUsername, me]);

  if (!targetUsername) return null;

  if (loading) {
    return (
      <PageLayout>
        <Alert>{t('profile.loading')}</Alert>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout>
        <Alert variant="error">{error ?? t('profile.not_found')}</Alert>
      </PageLayout>
    );
  }

  const createdAt = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('fr-CA')
    : null;

  const displayedStatus = getStatus(profile.status, profile.id, profile.username);

  return (
    <PageWithSidebar
      centerContent
      sidebar={
        <Sidebar variant={'terminal'}>
          <FriendsList
            username={targetUsername}
            className="h-full"
            refreshKey={friendsRefreshKey}
            showRequestsBtn
          />
        </Sidebar>
      }
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-6">
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onAvatarChange={(url) =>
            setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : prev))
          }
          displayedStatus={displayedStatus}
          createdAt={createdAt}
          onFriendRemoved={() => setFriendsRefreshKey((prev) => prev + 1)}
        />

        <Bio
          bio={profile.bio ?? null}
          isOwnProfile={isOwnProfile}
          onBioChange={(bio) => setProfile((prev) => (prev ? { ...prev, bio } : prev))}
          containerVariant={'panel'}
        />

        <Stats stats={profile.stats} containerVariant={'terminal'} />

        <NextLvl stats={profile.stats} containerVariant={'terminal'} />

        <Achievements achievements={profile.achievements} containerVariant={'terminal'} />

        <History username={targetUsername} containerVariant={'terminal'} />
      </div>
    </PageWithSidebar>
  );
}
