
import { create } from 'zustand';
import { ChatState, Message, User } from './types';
import { persist } from 'zustand/middleware';
import { sendMessage, updateUserStatus, subscribeToMessages, subscribeToUsers, updateMessageReadStatus } from './firebase';

const loadUserFromStorage = (): User | null => {
  const sessionUser = sessionStorage.getItem('currentUser');
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }

  const cookieUser = document.cookie
    .split('; ')
    .find(row => row.startsWith('currentUser='));
  
  if (cookieUser) {
    return JSON.parse(decodeURIComponent(cookieUser.split('=')[1]));
  }

  return null;
};

const saveUserToStorage = (user: User | null) => {
  if (user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `currentUser=${encodeURIComponent(JSON.stringify(user))}; expires=${date.toUTCString()}; path=/`;
  } else {
    sessionStorage.removeItem('currentUser');
    document.cookie = 'currentUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
    (set) => ({
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
          
          // Handle cleanup when component unmounts
          window.addEventListener('beforeunload', cleanup);
          return () => {
            cleanup();
            window.removeEventListener('beforeunload', cleanup);
          };
        } catch (error) {
          console.error('Error updating user status:', error);
          set({ currentUser: user });
        }
      },
      setSelectedUser: (user: User | null) => {
        set((state) => {
          if (user && user.id !== state.currentUser?.id) {
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
          // Check for duplicate messages
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
        messages: state.messages
      }),
    }
  )
);

// Subscribe to real-time updates
if (typeof window !== 'undefined') {
  subscribeToMessages((messages) => {
    useChatStore.setState({ messages });
  });

  subscribeToUsers((users) => {
    useChatStore.setState({ onlineUsers: users });
  });
}
