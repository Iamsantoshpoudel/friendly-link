import { useChatStore } from '@/lib/store';
import { Message, User } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import Logo from "../assets/img/Logo.svg";

interface UserListProps {
  onChatSelect?: (user: User) => void;
}

const UserList = ({ onChatSelect }: UserListProps) => {
  const { onlineUsers, currentUser, selectedUser, setSelectedUser, messages } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const chatId = window.location.pathname.split('/').pop();
    if (chatId && chatId !== 'chat') {
      const lastActiveUser = onlineUsers.find(user => user.id === chatId);
      if (lastActiveUser) {
        setSelectedUser(lastActiveUser);
      }
    }
  }, [onlineUsers, setSelectedUser]);

  const getLastMessage = (userId: string): Message | undefined => {
    return messages
      .filter(m => (m.senderId === userId && m.receiverId === currentUser?.id) || 
                   (m.senderId === currentUser?.id && m.receiverId === userId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const getUnreadCount = (userId: string): number => {
    return messages.filter(m => 
      m.senderId === userId && 
      m.receiverId === currentUser?.id && 
      !m.isRead
    ).length;
  };

  const handleUserClick = (user: User) => {
    if (onChatSelect) {
      onChatSelect(user);
    } else {
      setSelectedUser(user);
    }
  };

  const filteredAndSortedUsers = onlineUsers
    .filter(user => 
      user.id !== currentUser?.id && 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aLastMessage = messages
        .filter(m => (m.senderId === a.id && m.receiverId === currentUser?.id) || 
                     (m.senderId === currentUser?.id && m.receiverId === a.id))
        .sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
      
      const bLastMessage = messages
        .filter(m => (m.senderId === b.id && m.receiverId === currentUser?.id) || 
                     (m.senderId === currentUser?.id && m.receiverId === b.id))
        .sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];

      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;
      
      return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime();
    });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full md:w-80 border-r border-gray-200 h-screen bg-white overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Messages</h2>
          <motion.img 
            src={Logo} 
            alt="Logo" 
            className="h-8 w-8 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelectedUser(currentUser)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full bg-gray-50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredAndSortedUsers.map((user) => {
            const lastMessage = getLastMessage(user.id);
            const unreadCount = getUnreadCount(user.id);
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleUserClick(user)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedUser?.id === user.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {user.name[0].toUpperCase()}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className={`font-medium truncate ${unreadCount > 0 ? 'text-black' : 'text-gray-900'}`}>
                        {user.name}
                      </p>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className={`text-sm truncate ${
                        unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                      }`}>
                        {lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                      {unreadCount}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UserList;
