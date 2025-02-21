
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../lib/store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const Index = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { setCurrentUser, currentUser, lastActiveChatId, setSelectedUser, onlineUsers } = useChatStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleRedirect = async () => {
      if (currentUser && lastActiveChatId && !isRedirecting) {
        setIsRedirecting(true);
        const lastActiveUser = onlineUsers.find(user => user.id === lastActiveChatId);
        if (lastActiveUser) {
          await setSelectedUser(lastActiveUser);
        }
        navigate('/chat', { replace: true });
      } else if (currentUser && !isRedirecting) {
        setIsRedirecting(true);
        navigate('/chat', { replace: true });
      }
    };

    handleRedirect();
  }, [currentUser, lastActiveChatId, navigate, onlineUsers, setSelectedUser, isRedirecting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const user = {
        id: uuidv4(),
        name: name.trim(),
        isOnline: true,
        lastSeen: new Date().toISOString()
      };
      setCurrentUser(user);
    }
  };

  if (isLoading || isRedirecting) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-2">Welcome</h1>
        <p className="text-gray-600 text-center mb-8">Enter your name to start chatting</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-3 rounded-lg bg-black hover:bg-gray-800 text-white transition-colors"
            disabled={!name.trim()}
          >
            Join Chat
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Index;
