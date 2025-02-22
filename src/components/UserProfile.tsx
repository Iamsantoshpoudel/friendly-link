
import { User } from '@/lib/types';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';

interface UserProfileProps {
  user: User;
  showBackButton?: boolean;
  onBack?: () => void;
}

const UserProfile = ({ user, showBackButton, onBack }: UserProfileProps) => {
  return (
    <div className="h-full bg-white">
      {showBackButton && (
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden -ml-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
      )}
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-3xl">
            {user.name[0].toUpperCase()}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500">
              {user.isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
