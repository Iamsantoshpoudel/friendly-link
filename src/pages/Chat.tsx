
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';
import { User } from '@/lib/types';

const Chat = () => {
  const { currentUser, selectedUser, setSelectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);

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
    const handlePopState = (event: PopStateEvent) => {
      if (isMobile && selectedUser) {
        event.preventDefault();
        setSelectedUser(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, selectedUser, setSelectedUser]);

  // Handle chat selection and history
  const handleChatSelect = (user: User) => {
    if (isMobile) {
      // Push new state when opening chat
      window.history.pushState({ chat: user.id }, '', `/chat/${user.id}`);
    }
    setSelectedUser(user);
  };

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      <AnimatePresence mode="wait">
        <div className="flex h-full">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${
              isMobile && selectedUser ? 'hidden' : 'w-full md:w-80'
            } md:block border-r border-gray-200`}
          >
            <UserList onChatSelect={handleChatSelect} />
          </motion.div>

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${
              isMobile && !selectedUser ? 'hidden' : 'flex-1'
            } md:block relative`}
          >
            <ChatWindow 
              showBackButton={isMobile} 
              onBack={() => {
                if (isMobile) {
                  window.history.back();
                }
              }} 
            />
          </motion.div>

          {selectedUser && !isMobile && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden md:block w-80 border-l border-gray-200"
            >
              <UserProfile user={selectedUser} />
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Chat;
