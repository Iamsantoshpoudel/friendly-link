import { User } from '@/lib/types';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';
import { Input } from './ui/input';
import { useState } from 'react';
import { useChatStore } from '@/lib/store';
import { updateUserStatus, updateUserEmail, updateUserPassword } from '@/lib/firebase';
import { toast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface UserProfileProps {
  user: User;
  showBackButton?: boolean;
  onBack?: () => void;
}

const UserProfile = ({ user, showBackButton, onBack }: UserProfileProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { setCurrentUser, currentUser } = useChatStore();
  const isOwnProfile = currentUser?.id === user.id;

  const handleSave = async () => {
    if (!isOwnProfile) return;
    setIsLoading(true);

    try {
      const updatedUser = {
        ...user,
        name: name.trim(),
        email: email.trim()
      };

      // Update user profile information
      await updateUserStatus(updatedUser);
      setCurrentUser(updatedUser);

      // Update email if changed
      if (email !== user.email && currentPassword) {
        await updateUserEmail(email, currentPassword);
      }

      // Update password if provided
      if (newPassword && currentPassword) {
        await updateUserPassword(currentPassword, newPassword);
      }

      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="text-center space-y-1">
            {isOwnProfile && isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center"
                placeholder="Enter your name"
                disabled={isLoading}
              />
            ) : (
              <h2 className="text-xl font-semibold">{user.name}</h2>
            )}
            <p className="text-gray-500">
              {user.isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>

        {isOwnProfile && (
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                      setEmail(user.email || '');
                      setCurrentPassword('');
                      setNewPassword('');
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading || Boolean(!currentPassword && (email !== user.email || newPassword))}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
