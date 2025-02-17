
import { useChatStore } from '@/lib/store';
import UserBubble from './UserBubble';
import { motion } from 'framer-motion';
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
      className="w-80 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <div className="p-4 border-b border-gray-200 space-y-4">
        <h2 className="text-lg font-semibold">Online Users</h2>
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
      </div>
      
      <div className="divide-y divide-gray-100">
        {filteredUsers.map(user => (
          <UserBubble key={user.id} user={user} />
        ))}
        {filteredUsers.length === 0 && searchQuery && (
          <div className="p-4 text-center text-gray-500">
            No users found matching "{searchQuery}"
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserList;
