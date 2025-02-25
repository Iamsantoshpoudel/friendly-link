
import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/lib/store';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useChatStore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not authenticated, redirect to login
        navigate('/', { replace: true });
      } else if (!currentUser) {
        // Update store with current auth state if needed
        setCurrentUser({
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
          isOnline: true,
          lastSeen: new Date().toISOString()
        });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, currentUser, setCurrentUser]);

  return <>{children}</>;
};

export default ProtectedRoute;
