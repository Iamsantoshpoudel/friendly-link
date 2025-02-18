
import { useChatStore } from '@/lib/store';
import UserBubble from './UserBubble';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

const UserList = () => {
  const { onlineUsers, currentUser } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredUsers = onlineUsers.filter(user => 
    user.id !== currentUser?.id && 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 border-r border-gray-200 h-screen bg-white overflow-y-auto"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b border-gray-200 space-y-4"
      >
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <p className="text-sm text-gray-500">
          {filteredUsers.length} active now
        </p>
      </motion.div>
      
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <UserBubble key={user.id} user={user} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredUsers.length === 0 && searchQuery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 text-center text-gray-500"
          >
            No users found matching "{searchQuery}"
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UserList;
