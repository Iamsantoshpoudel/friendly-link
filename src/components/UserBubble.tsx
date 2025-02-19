
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useChatStore } from '@/lib/store';

interface UserBubbleProps {
  user: User;
  isSelected?: boolean;
  onClick?: () => void;
}

const UserBubble = ({ user, isSelected, onClick }: UserBubbleProps) => {
  const { messages, currentUser } = useChatStore();

  // Get unread messages from this user
  const unreadMessages = messages.filter(msg => 
    msg.senderId === user.id && 
    msg.receiverId === currentUser?.id && 
    !msg.isRead
  );

  // Get the last message from this user
  const lastMessage = messages
    .filter(msg => 
      (msg.senderId === user.id && msg.receiverId === currentUser?.id) ||
      (msg.senderId === currentUser?.id && msg.receiverId === user.id)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  // Calculate time difference
  const getTimeAgo = (timestamp: string) => {
    const diff = new Date().getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center p-4 space-x-3 transition-all duration-200 cursor-pointer",
        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
      )}
    >
      <div className="relative">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center"
        >
          <span className="text-lg font-medium">
            {user.name[0].toUpperCase()}
          </span>
        </motion.div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
            user.isOnline ? "bg-green-500" : "bg-gray-400"
          )} 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-medium text-gray-900 truncate">{user.name}</p>
          {lastMessage && (
            <span className="text-xs text-gray-500">
              {getTimeAgo(lastMessage.timestamp)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-sm text-gray-500 truncate">
            {lastMessage.senderId === currentUser?.id ? 'You: ' : ''}{lastMessage.content}
          </p>
        )}
      </div>

      {!isSelected && unreadMessages.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-medium flex-shrink-0"
        >
          {unreadMessages.length}
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserBubble;
