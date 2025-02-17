
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserBubbleProps {
  user: User;
  isSelected?: boolean;
}

const UserBubble = ({ user, isSelected }: UserBubbleProps) => {
  return (
    <div 
      className={cn(
        "flex items-center p-4 space-x-3 rounded-lg transition-all duration-200",
        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
      )}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-lg font-medium text-gray-600">
            {user.name[0].toUpperCase()}
          </span>
        </div>
        <div className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
          user.isOnline ? "bg-green-500" : "bg-gray-400"
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-sm text-gray-500">
          {user.isOnline ? 'Active now' : 'Offline'}
        </p>
      </div>
    </div>
  );
};

export default UserBubble;
