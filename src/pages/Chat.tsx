
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Chat = () => {
  const { currentUser, selectedUser } = useChatStore();
  const [showUserList, setShowUserList] = useState(true);
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

  useEffect(() => {
    if (isMobile && selectedUser) {
      setShowUserList(false);
    }
  }, [selectedUser, isMobile]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-white relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {(showUserList || !isMobile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${
              isMobile ? 'w-full' : 'w-80'
            } border-r border-gray-200 md:relative fixed inset-0 bg-white z-30`}
          >
            <UserList />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {(!isMobile || (isMobile && !showUserList)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`${
                isMobile ? 'fixed inset-0 z-40 bg-white' : 'absolute inset-0'
              }`}
            >
              <ChatWindow showBackButton={isMobile} onBack={() => setShowUserList(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedUser && !isMobile && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          className="flex-shrink-0 relative"
        >
          <UserProfile user={selectedUser} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Chat;
