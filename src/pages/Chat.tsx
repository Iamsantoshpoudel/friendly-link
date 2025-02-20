
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Chat = () => {
  const { currentUser } = useChatStore();
  const [showUserList, setShowUserList] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
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

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-4 z-50"
        onClick={() => setShowProfile(!showProfile)}
      >
        <ChevronRight className={`w-6 h-6 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full"
          >
            <UserProfile user={currentUser} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Chat;
