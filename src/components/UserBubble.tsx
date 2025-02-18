
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UserBubbleProps {
  user: User;
  isSelected?: boolean;
  onClick?: () => void;
}

const UserBubble = ({ user, isSelected, onClick }: UserBubbleProps) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center p-4 space-x-3 rounded-lg transition-all duration-200 cursor-pointer",
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
        <p className="font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-sm text-gray-500">
          {user.isOnline ? 'Active now' : 'Offline'}
        </p>
      </div>
    </motion.div>
  );
};

export default UserBubble;
