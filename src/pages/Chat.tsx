
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import { useChatStore } from '@/lib/store';
import { User } from '@/lib/types';

const Chat = () => {
  const { currentUser, updateOnlineUsers } = useChatStore();

  useEffect(() => {
    // Simulated online users for now - will be replaced with Supabase
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Alice',
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Bob',
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Charlie',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    if (currentUser) {
      updateOnlineUsers([...mockUsers, currentUser]);
    }
  }, [currentUser, updateOnlineUsers]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-white"
    >
      <UserList />
      <ChatWindow />
    </motion.div>
  );
};

export default Chat;
