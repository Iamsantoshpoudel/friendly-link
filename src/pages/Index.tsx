
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../lib/store';
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/hooks/use-toast";
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle,
  resetPassword,
} from '../lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import Logo from '../assets/img/Logo.svg';

const demoMessages = [
  { id: 1, text: "Hey! Have you checked out the new PoudelX chat app?", sender: "user1" },
  { id: 2, text: "Yeah! Just signed up with my email. It was super quick.", sender: "user2" },
  { id: 3, text: "I know, right? You can start chatting with friends instantly.", sender: "user1" },
  { id: 4, text: "And the UI is so clean! Developed by Santosh Poudel, right?", sender: "user2" },
  { id: 5, text: "Yup! The app even works offline, which is awesome.", sender: "user1" },
  { id: 6, text: "I love the end-to-end encryption. Feels super secure.", sender: "user2" },
  { id: 7, text: "Have you customized your profile yet? You can change your email and password easily.", sender: "user1" },
  { id: 8, text: "Yeah, I did! It only allows changes to your own profile—great for security.", sender: "user2" },
  { id: 9, text: "I heard they're adding voice and video call features soon!", sender: "user1" },
  { id: 10, text: "Can't wait for that! PoudelX is really shaping up nicely.", sender: "user2" },
  { id: 11, text: "Big shoutout to Santosh Poudel! He did an amazing job.", sender: "user1" },
  { id: 12, text: "Totally! I'm telling all my friends about this app.", sender: "user2" },
];

const Index = () => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser, lastActiveChatId, setSelectedUser, onlineUsers } = useChatStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  
  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Animate messages with slower timing
    const interval = setInterval(() => {
      setVisibleMessages(prev => 
        prev < demoMessages.length ? prev + 1 : prev
      );
    }, 3500); // Increased to 3.5 seconds per message

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      setIsRedirecting(true);
      if (lastActiveChatId) {
        const lastActiveUser = onlineUsers.find(user => user.id === lastActiveChatId);
        if (lastActiveUser) {
          setSelectedUser(lastActiveUser);
        }
      }
      navigate('/chat', { replace: true });
    }
  }, [currentUser, lastActiveChatId, navigate, onlineUsers, setSelectedUser]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
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
        description: isRegistering ? "Account created successfully!" : "Logged in successfully!",
        className: "bg-green-50 border-green-200"
      });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
      toast({
        title: "Success",
        description: "Logged in with Google successfully!",
        className: "bg-green-50 border-green-200"
      });
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setIsResetDialogOpen(false);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password",
        className: "bg-green-50 border-green-200"
      });
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo and Chat Demo Section */}
      <div className="flex-1 flex flex-col items-center p-4 pt-10 overflow-hidden">
        <img 
          src={Logo} 
          alt="PoudelX Logo" 
          className="w-24 h-24 mb-8"
        />
        
        <div className="w-full max-w-[300px] sm:max-w-md space-y-3 mb-8">
          <AnimatePresence>
            {demoMessages.slice(0, visibleMessages).map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: message.sender === 'user1' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.sender === 'user1' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-2 text-xs sm:text-sm rounded-2xl ${
                    message.sender === 'user1' 
                      ? 'bg-gray-100 text-gray-800 rounded-bl-none' 
                      : 'bg-green-500 text-white rounded-br-none'
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Auth Buttons */}
        <div className="w-full max-w-[300px] sm:max-w-md space-y-4">
          <Button 
            onClick={() => setIsRegistering(true)}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            Create account
          </Button>
          <Button 
            onClick={() => setIsRegistering(false)}
            variant="outline"
            className="w-full h-12 border-green-500 text-green-500 hover:bg-green-500/10 rounded-full"
          >
            I have an account
          </Button>
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className="text-center text-sm text-gray-500 p-4">
        By using this service, you agree to our{' '}
        <button className="text-green-500 hover:underline">Terms of Service</button>
        {' '}and{' '}
        <button className="text-green-500 hover:underline">Privacy Policy</button>
      </div>

      {/* Auth Dialog */}
      <Dialog open={isRegistering || isResetDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsRegistering(false);
          setIsResetDialogOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isRegistering ? 'Create Account' : 'Sign In'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <InputWithIcon
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon className="w-4 h-4" />}
                required
                disabled={isLoading}
              />
            )}
            <InputWithIcon
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              disabled={isLoading}
            />
            <InputWithIcon
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
              disabled={isLoading}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRegistering ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
