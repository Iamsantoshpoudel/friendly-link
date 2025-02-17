
import { useChatStore } from '@/lib/store';
import UserBubble from './UserBubble';
import { motion } from 'framer-motion';

const UserList = () => {
  const { onlineUsers, currentUser } = useChatStore();
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Online Users</h2>
        <p className="text-sm text-gray-500">
          {onlineUsers.length} active now
        </p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {onlineUsers
          .filter(user => user.id !== currentUser?.id)
          .map(user => (
            <UserBubble key={user.id} user={user} />
          ))
        }
      </div>
    </motion.div>
  );
};

export default UserList;
