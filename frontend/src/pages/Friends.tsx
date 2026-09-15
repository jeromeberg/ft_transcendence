import { FriendsList } from '@/features/friends';
import { useAuth } from '@/features/auth';
import { PageLayout } from '@/components';

export default function Friends() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return null;

  return (
    <PageLayout maxWidth="max-w-lg">
      <FriendsList username={user.username} showMsgBtn showRequestsBtn showSearchBar />
    </PageLayout>
  );
}
