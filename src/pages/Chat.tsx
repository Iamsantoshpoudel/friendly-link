
import { useEffect, useState } from 'react';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';
import { User } from '@/lib/types';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { currentUser, selectedUser, setSelectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle user status updates
  useEffect(() => {
    if (currentUser) {
      updateUserStatus({
        ...currentUser,
        isOnline: true,
        lastSeen: new Date().toISOString()
      });

      const handleBeforeUnload = () => {
        updateUserStatus({
          ...currentUser,
          isOnline: false,
          lastSeen: new Date().toISOString()
        });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        handleBeforeUnload();
      };
    }
  }, [currentUser]);

  // Handle mobile back button and history
  useEffect(() => {
    const handlePopState = () => {
      if (isMobile) {
        if (window.location.pathname === '/chat') {
          setSelectedUser(null);
        } else {
          navigate('/chat');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, navigate, setSelectedUser]);

  // Handle chat selection
  const handleChatSelect = (user: User) => {
    setSelectedUser(user);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      <div className="flex h-full">
        <div className={`${
          isMobile && selectedUser ? 'hidden' : 'w-full md:w-80'
        } md:block border-r border-gray-200`}>
          <UserList onChatSelect={handleChatSelect} />
        </div>

        <div className={`${
          isMobile && !selectedUser ? 'hidden' : 'flex-1'
        } md:block relative`}>
          <ChatWindow 
            showBackButton={isMobile} 
            onBack={() => {
              if (isMobile) {
                navigate('/chat');
              }
            }} 
          />
        </div>

        {selectedUser && !isMobile && (
          <div className="hidden md:block w-80 border-l border-gray-200">
            <UserProfile user={selectedUser} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
