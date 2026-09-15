import { PageWithSidebar } from '@/components';
import { ChatBox, ChatsList } from '@/features/chat';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ChatPage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const [selectedChat, setSelectedChat] = useState<string | null>(username ?? null);
  const [chatsRefreshKey, setChatsRefreshKey] = useState(0);

  useEffect(() => {
    setSelectedChat(username ?? null);
  }, [username]);

  const handleSelectChat = (chatUsername: string) => {
    setSelectedChat(chatUsername);
    navigate(`/chat/${chatUsername}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageWithSidebar
      sidebar={
        <ChatsList
          selectedUsername={selectedChat}
          onSelectChat={handleSelectChat}
          refreshKey={chatsRefreshKey}
        />
      }
      maxWidth="max-w-xl"
      fillHeight
      centerContent
      sidebarFull={!selectedChat}
    >
      <ChatBox
        targetUsername={selectedChat}
        onMessageSent={() => setChatsRefreshKey((k) => k + 1)}
      />
    </PageWithSidebar>
  );
}
