
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../lib/store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { toast } from "@/components/ui/use-toast";
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle,
  loginWithPhone,
  initRecaptcha
} from '../lib/firebase';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Mail, Phone, Lock, User as UserIcon } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser, lastActiveChatId, setSelectedUser, onlineUsers } = useChatStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Phone Auth States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifying) {
      try {
        const recaptchaVerifier = initRecaptcha('phone-sign-in-button');
        const confirmationResult = await loginWithPhone(phoneNumber, recaptchaVerifier);
        setVerificationId(confirmationResult.verificationId);
        setIsVerifying(true);
        toast({
          title: "Code sent",
          description: "Verification code has been sent to your phone."
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      // Verify code logic here
      // For now, just show a message
      toast({
        title: "Info",
        description: "Phone verification will be implemented in the next phase."
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
        <h1 className="text-3xl font-semibold text-center mb-2">Welcome</h1>
        <p className="text-gray-600 text-center mb-8">Sign in to start chatting</p>
        
        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    icon={<UserIcon className="w-4 h-4" />}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
              >
                {isRegistering ? 'Register' : 'Login'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-black font-semibold hover:underline"
                >
                  {isRegistering ? 'Login' : 'Register'}
                </button>
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="phone">
            <form onSubmit={handlePhoneAuth} className="space-y-4">
              {!isVerifying ? (
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full"
                    icon={<Phone className="w-4 h-4" />}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full"
                id="phone-sign-in-button"
              >
                {isVerifying ? 'Verify Code' : 'Send Code'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="google">
            <Button 
              onClick={handleGoogleAuth}
              className="w-full"
              variant="outline"
            >
              Continue with Google
            </Button>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Index;
