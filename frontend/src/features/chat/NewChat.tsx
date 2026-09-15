import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Btn, Modal, SearchList, Status } from '@/components';
import { FriendsList } from '@/features/friends';
import { useAuth } from '@/features/auth';
import { useStatus } from '@/hooks/useStatus';
import { searchUsers, type UserSearchResult } from '@/api/users.api';

interface NewChatProps {
  onSelectChat?: (username: string) => void;
}

export function NewChat({ onSelectChat }: NewChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  const { t } = useTranslation('pages');
  const getStatus = useStatus();

  const handleAction = useCallback(
    (item: UserSearchResult) => {
      onSelectChat?.(item.username);
      navigate(`/chat/${item.username}`);
      setIsOpen(false);
    },
    [onSelectChat, navigate],
  );

  const renderItem = useCallback(
    (item: UserSearchResult) => (
      <button
        onClick={() => handleAction(item)}
        className="w-full flex items-center justify-between gap-4 text-left hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-default"
      >
        <div className="flex items-center gap-4 min-w-0">
          <Avatar username={item.username} src={item.avatarUrl} size="sm" />
          <span className="font-mono text-sm text-default truncate">
            <Status status={getStatus(item.status, item.id as number, item.username)} />{' '}
            {item.username}
          </span>
        </div>
        <span className="font-mono uppercase tracking-widest text-xs px-3 py-1 border border-dim text-default shrink-0">
          {t('common:new')}
        </span>
      </button>
    ),
    [getStatus, handleAction, t],
  );

  return (
    <>
      <Btn variant="primary" size="sm" className="font-bold" onClick={() => setIsOpen(true)}>
        {t('chat.new_chat_btn')}
      </Btn>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('chat.new_chat')}>
        <SearchList
          fetchFn={searchUsers}
          renderItem={renderItem}
          excludeUsername={user?.username}
        />
        <FriendsList
          username={user?.username ?? ''}
          showMsgBtn
          onMsgClick={() => setIsOpen(false)}
          className="mt-3"
        />
      </Modal>
    </>
  );
}
