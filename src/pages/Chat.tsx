
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-white relative overflow-hidden"
    >
      <AnimatePresence>
        {(showUserList || !isMobile) && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="flex-shrink-0 w-80 border-r border-gray-200 relative"
          >
            <UserList />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-4 z-50 md:hidden"
            onClick={() => setShowUserList(!showUserList)}
          >
            <ChevronLeft className={`w-6 h-6 transition-transform ${showUserList ? 'rotate-180' : ''}`} />
          </Button>
        )}
        <ChatWindow />
      </div>

      {selectedUser && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          className="flex-shrink-0 relative"
        >
          <UserProfile user={currentUser} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Chat;
