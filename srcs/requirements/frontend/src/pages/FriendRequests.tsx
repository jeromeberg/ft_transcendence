import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, PageLayout, FindUser, Container } from '@/components';
import { IncomingRequests, PendingRequests } from '@/features/friends';
import { sendFriendRequest } from '@/api/friends.api';

export default function FriendRequests() {
  const { t } = useTranslation('pages');
  const [pendingRefreshKey, setPendingRefreshKey] = useState(0);

  // set variant for containers on req page:
  const containerVariant = 'terminal';

  const handleSendFriendRequest = async (username: string) => {
    await sendFriendRequest(username);
    setPendingRefreshKey((k) => k + 1);
  };

  return (
    <PageLayout maxWidth="max-w-lg">
      <div className="flex flex-col gap-6">
        <Heading level={3}>{t('friends.requests_title')}</Heading>
        <FindUser onAction={handleSendFriendRequest} />
        <Container variant={containerVariant ?? 'default'}>
          <IncomingRequests />
        </Container>
        <Container variant={containerVariant ?? 'default'}>
          <PendingRequests refreshKey={pendingRefreshKey} />
        </Container>
      </div>
    </PageLayout>
  );
}
