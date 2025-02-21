
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';

const Chat = () => {
  const { currentUser, selectedUser, setSelectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (isMobile && selectedUser) {
        setSelectedUser(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, selectedUser, setSelectedUser]);

  // Handle chat selection and history
  const handleChatSelect = (user: User) => {
    if (isMobile) {
      window.history.pushState(null, '', window.location.pathname);
    }
    setSelectedUser(user);
  };

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      <div className="flex h-full">
        <div className={`${
          isMobile && selectedUser ? 'hidden' : 'w-full md:w-80'
        } md:block border-r border-gray-200`}>
          <UserList onSelectChat={handleChatSelect} />
        </div>

        <div className={`${
          isMobile && !selectedUser ? 'hidden' : 'flex-1'
        } md:block relative`}>
          <ChatWindow 
            showBackButton={isMobile} 
            onBack={() => {
              window.history.back();
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
