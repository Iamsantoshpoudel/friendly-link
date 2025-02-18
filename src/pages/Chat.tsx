
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';

const Chat = () => {
  const { currentUser, updateOnlineUsers } = useChatStore();

  useEffect(() => {
    if (currentUser) {
      // Update user status when component mounts
      updateUserStatus({
        ...currentUser,
        isOnline: true,
        lastSeen: new Date().toISOString()
      });

      // Update user status when component unmounts
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-white"
    >
      <UserList />
      <ChatWindow />
      <UserProfile user={currentUser} />
    </motion.div>
  );
};

export default Chat;
