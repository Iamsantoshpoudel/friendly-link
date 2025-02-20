
import { User } from '@/lib/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useChatStore } from '@/lib/store';
import { Edit2, Save } from 'lucide-react';

interface UserProfileProps {
  user: User | null;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const currentUser = useChatStore((state) => state.currentUser);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  if (!user) return null;

  const isOwnProfile = currentUser?.id === user.id;

  const handleSave = () => {
    if (isOwnProfile && currentUser) {
      setCurrentUser({
        ...currentUser,
        name: newName
      });
    }
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="w-80 border-l border-gray-200 h-screen bg-white flex flex-col"
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600">
              {user.name[0].toUpperCase()}
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-48"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-xl font-medium">{user.name}</span>
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {user.isOnline ? 'Active now' : `Last seen ${new Date(user.lastSeen).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
