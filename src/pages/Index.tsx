
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../lib/store';
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { motion } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle,
} from '../lib/firebase';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Mail, Lock, User as UserIcon, LogIn } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser, lastActiveChatId, setSelectedUser, onlineUsers } = useChatStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let user;
      if (isRegistering) {
        user = await registerWithEmail(email, password, name);
      } else {
        user = await loginWithEmail(email, password);
      }
      setCurrentUser(user);
      toast({
        title: "Success",
        description: isRegistering ? "Account created successfully!" : "Logged in successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
      toast({
        title: "Success",
        description: "Logged in with Google successfully!"
      });
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="animate-pulse">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white shadow-lg"
      >
        <h1 className="text-3xl font-semibold text-center mb-2">Welcome to Chat</h1>
        <p className="text-gray-600 text-center mb-8">Sign in to start chatting with your friends</p>
        
        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <InputWithIcon
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    icon={<UserIcon className="w-4 h-4" />}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <InputWithIcon
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>
              <div className="space-y-2">
                <InputWithIcon
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
              >
                {isRegistering ? 'Create Account' : 'Sign In'}
              </Button>
              <p className="text-center text-sm text-gray-600 mt-4">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-black font-semibold hover:underline"
                >
                  {isRegistering ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="google">
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600 mb-4">
                Continue with your Google account for a seamless experience
              </p>
              <Button 
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Index;
