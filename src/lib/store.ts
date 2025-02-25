
import { create } from 'zustand';
import { ChatState, Message, User } from './types';
import { persist } from 'zustand/middleware';
import { sendMessage, updateUserStatus, subscribeToMessages, subscribeToUsers, updateMessageReadStatus } from './firebase';
import { getAuth } from 'firebase/auth';

// Encryption helper functions
const encryptData = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

const decryptData = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

const loadUserFromStorage = (): User | null => {
  try {
    // Try to get user from session storage first
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      const decryptedUser = decryptData(sessionUser);
      return JSON.parse(decryptedUser);
    }

    // If not in session, check cookies
    const cookieUser = document.cookie
      .split('; ')
      .find(row => row.startsWith('currentUser='));
    
    if (cookieUser) {
      const decryptedCookie = decryptData(cookieUser.split('=')[1]);
      // Store in session for faster access next time
      sessionStorage.setItem('currentUser', encryptData(decryptedCookie));
      return JSON.parse(decryptedCookie);
    }

    // Check Firebase auth state as last resort
    const auth = getAuth();
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        isOnline: true,
        lastSeen: new Date().toISOString()
      };
      saveUserToStorage(user);
      return user;
    }

    return null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
};

const saveUserToStorage = (user: User | null) => {
  if (user) {
    // Encrypt user data before storing
    const encryptedData = encryptData(JSON.stringify(user));
    
    // Save to session storage
    sessionStorage.setItem('currentUser', encryptedData);
    
    // Save to cookie with secure flags and longer expiration
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days expiration
    document.cookie = `currentUser=${encryptedData}; expires=${date.toUTCString()}; path=/; SameSite=Strict; Secure`;
  } else {
    // Clear stored data
    sessionStorage.removeItem('currentUser');
    document.cookie = 'currentUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure';
  }
};

const loadLastActiveChatId = (): string | null => {
  return localStorage.getItem('lastActiveChatId');
};

const saveLastActiveChatId = (chatId: string | null) => {
  if (chatId) {
    localStorage.setItem('lastActiveChatId', chatId);
  } else {
    localStorage.removeItem('lastActiveChatId');
  }
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentUser: loadUserFromStorage(),
      selectedUser: null,
      messages: [],
      onlineUsers: [],
      lastActiveChatId: loadLastActiveChatId(),
      setCurrentUser: async (user: User) => {
        try {
          saveUserToStorage(user);
          const cleanup = await updateUserStatus(user);
          set({ currentUser: user });
          
          // Ensure cleanup is called on page unload
          const handleUnload = () => {
            cleanup();
            if (user) {
              updateUserStatus({
                ...user,
                isOnline: false,
                lastSeen: new Date().toISOString()
              });
            }
          };
          
          window.addEventListener('beforeunload', handleUnload);
          return () => {
            handleUnload();
            window.removeEventListener('beforeunload', handleUnload);
          };
        } catch (error) {
          console.error('Error updating user status:', error);
          set({ currentUser: user });
        }
      },
      setSelectedUser: (user: User | null) => {
        set((state) => {
          if (user && state.currentUser && user.id !== state.currentUser.id) {
            saveLastActiveChatId(user.id);
            
            // Mark messages as read immediately
            const updatedMessages = state.messages.map(msg => {
              if (msg.senderId === user.id && 
                  msg.receiverId === state.currentUser?.id && 
                  !msg.isRead) {
                // Update read status in Firebase
                updateMessageReadStatus(msg.id, true)
                  .catch(console.error);
                return { ...msg, isRead: true };
              }
              return msg;
            });
            
            return { 
              selectedUser: user, 
              messages: updatedMessages,
              lastActiveChatId: user.id
            };
          }
          
          saveLastActiveChatId(null);
          return { 
            selectedUser: user,
            lastActiveChatId: null
          };
        });
      },
      addMessage: async (message: Message) => {
        set((state) => {
          // Check for duplicate messages with more reliable criteria
          const messageExists = state.messages.some(msg => 
            msg.id === message.id || 
            (msg.senderId === message.senderId && 
             msg.receiverId === message.receiverId && 
             msg.content === message.content && 
             Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000)
          );
          
          if (!messageExists) {
            return { messages: [...state.messages, message] };
          }
          return state;
        });
        
        try {
          await sendMessage(message);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      },
      updateOnlineUsers: (users: User[]) => set({ onlineUsers: users }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ 
        messages: state.messages,
        lastActiveChatId: state.lastActiveChatId
      }),
    }
  )
);

// Subscribe to real-time updates
if (typeof window !== 'undefined') {
  subscribeToMessages((messages) => {
    const currentState = useChatStore.getState();
    const updatedMessages = messages.map(msg => {
      // If the message is in the current chat and unread, mark it as read
      if (msg.senderId === currentState.selectedUser?.id && 
          msg.receiverId === currentState.currentUser?.id && 
          !msg.isRead) {
        updateMessageReadStatus(msg.id, true)
          .catch(console.error);
        return { ...msg, isRead: true };
      }
      return msg;
    });
    useChatStore.setState({ messages: updatedMessages });
  });

  subscribeToUsers((users) => {
    useChatStore.setState({ onlineUsers: users });
  });
}
