
import { useEffect, useState } from 'react';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { updateUserStatus } from '@/lib/firebase';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, MessageCircle } from 'lucide-react';

const Chat = () => {
  const { currentUser, selectedUser, setSelectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'profile'>('chats');
  const navigate = useNavigate();
  const location = useLocation();

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle user status updates
  useEffect(() => {
    if (currentUser) {
      updateUserStatus({
        ...currentUser,
        isOnline: true,
        lastSeen: new Date().toISOString()
      });

      const handleBeforeUnload = () => {
        updateUserStatus({
          ...currentUser,
          isOnline: false,
          lastSeen: new Date().toISOString()
        });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        handleBeforeUnload();
      };
    }
  }, [currentUser]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const handleTabChange = (tab: 'chats' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'profile') {
      navigate('/chat/profile');
    } else {
      navigate('/chat');
    }
  };

  if (isMobile) {
    if (selectedUser) {
      return (
        <div className="h-screen bg-white">
          <ChatWindow 
            showBackButton={true} 
            onBack={() => {
              setSelectedUser(null);
              navigate('/chat');
            }} 
          />
        </div>
      );
    }

    if (location.pathname === '/chat/profile') {
      return (
        <div className="h-screen bg-white">
          <UserProfile 
            user={currentUser!} 
            showBackButton={true}
            onBack={() => navigate('/chat')}
          />
        </div>
      );
    }

    return (
      <div className="h-screen bg-white flex flex-col">
        <div className="flex-1 overflow-hidden">
          <UserList onChatSelect={(user) => {
            setSelectedUser(user);
            navigate(`/chat/${user.id}`);
          }} />
        </div>
        {/* Bottom Navigation */}
        <div className="flex items-center justify-around border-t border-gray-200 py-2 px-4 bg-white">
          <button
            onClick={() => handleTabChange('chats')}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'chats' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Chats</span>
          </button>
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      <div className="flex h-full">
        <div className="w-80 border-r border-gray-200">
          <UserList onChatSelect={setSelectedUser} />
        </div>
        <div className="flex-1 relative">
          <ChatWindow />
        </div>
        {selectedUser && (
          <div className="w-80 border-l border-gray-200">
            <UserProfile user={selectedUser} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
