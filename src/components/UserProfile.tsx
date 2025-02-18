
import { User } from '@/lib/types';
import { motion } from 'framer-motion';
import { BellRing, Search, UserCircle } from 'lucide-react';
import { Button } from './ui/button';

interface UserProfileProps {
  user: User | null;
}

const UserProfile = ({ user }: UserProfileProps) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-80 border-l border-gray-200 h-screen bg-white p-6 space-y-6 shadow-lg"
    >
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="w-24 h-24 rounded-full bg-black text-white text-3xl font-medium flex items-center justify-center mx-auto cursor-pointer"
        >
          {user.name[0].toUpperCase()}
        </motion.div>
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-500">Active {user.isOnline ? 'now' : 'recently'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <motion.div whileHover={{ x: 5 }} className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <UserCircle className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </motion.div>
        <motion.div whileHover={{ x: 5 }} className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <BellRing className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </motion.div>
        <motion.div whileHover={{ x: 5 }} className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Search in Chat
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
