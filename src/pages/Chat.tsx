
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Chat = () => {
  const { currentUser, updateOnlineUsers } = useChatStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      className="flex h-screen bg-white relative"
    >
      <UserList />
      <ChatWindow />
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-4 z-50"
        onClick={() => setIsProfileOpen(!isProfileOpen)}
      >
        <ChevronRight className={`w-6 h-6 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                setIsProfileOpen(false);
              }
            }}
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
