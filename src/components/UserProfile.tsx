
import { User } from '@/lib/types';
import { motion } from 'framer-motion';
import { Bell, Camera, Edit2, Lock, Moon, Search, Settings, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Input } from './ui/input';

interface UserProfileProps {
  user: User | null;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  if (!user) return null;

  const handleNameSubmit = () => {
    // To be implemented: update user name
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-80 border-l border-gray-200 h-screen bg-white flex flex-col"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full bg-gray-200 text-3xl font-medium flex items-center justify-center mx-auto"
            >
              {user.name[0].toUpperCase()}
            </motion.div>
            <button className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 text-white hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-center"
                autoFocus
              />
              <Button onClick={handleNameSubmit} size="sm">Save</Button>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-700">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500">Active {user.isOnline ? 'now' : 'recently'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <UserIcon className="mr-2 h-4 w-4" />
            View Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Lock className="mr-2 h-4 w-4" />
            Privacy
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Search in Chat
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
