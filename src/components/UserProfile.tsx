
import { User } from '@/lib/types';
import { motion } from 'framer-motion';
import { ChevronRight, MessageSquare, Palette, Image, File } from 'lucide-react';
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
      className="w-80 border-l border-gray-200 h-screen bg-white flex flex-col"
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Chat Information</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Chat Info Section */}
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between hover:bg-gray-50 py-6"
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Chat Info</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>

          {/* Customise Chat Section */}
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between hover:bg-gray-50 py-6"
          >
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Customise chat</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>

          {/* Media and Files Section */}
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between hover:bg-gray-50 py-6"
          >
            <div className="flex items-center space-x-3">
              <Image className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Media and files</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
