
import { create } from 'zustand';
import { ChatState, Message, User } from './types';
import { persist } from 'zustand/middleware';
import { sendMessage, updateUserStatus, subscribeToMessages, subscribeToUsers } from './firebase';

const loadUserFromStorage = (): User | null => {
  // Try to load from sessionStorage first
  const sessionUser = sessionStorage.getItem('currentUser');
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }

  // Then try cookies
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
    // Save to sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // Save to cookie (expires in 7 days)
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `currentUser=${encodeURIComponent(JSON.stringify(user))}; expires=${date.toUTCString()}; path=/`;
  } else {
    // Clear storage
    sessionStorage.removeItem('currentUser');
    document.cookie = 'currentUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      currentUser: loadUserFromStorage(),
      selectedUser: null,
      messages: [],
      onlineUsers: [],
      lastActiveChatId: null,
      setCurrentUser: async (user: User) => {
        try {
          saveUserToStorage(user);
          await updateUserStatus(user);
          set({ currentUser: user });
        } catch (error) {
          console.error('Error updating user status:', error);
          set({ currentUser: user });
        }
      },
      setSelectedUser: (user: User | null) => {
        set((state) => {
          // Mark all messages from this user as read when selecting them
          if (user) {
            const updatedMessages = state.messages.map(msg => 
              msg.senderId === user.id && msg.receiverId === state.currentUser?.id
                ? { ...msg, isRead: true }
                : msg
            );
            // Store the last active chat ID
            return { 
              selectedUser: user, 
              messages: updatedMessages, 
              lastActiveChatId: user.id === state.currentUser?.id ? null : user.id 
            };
          }
          return { selectedUser: user };
        });
      },
      addMessage: async (message: Message) => {
        try {
          await sendMessage(message);
          set((state) => {
            // Ensure we don't add duplicate messages by checking ID
            const messageExists = state.messages.some(msg => msg.id === message.id);
            if (!messageExists) {
              return { messages: [...state.messages, message] };
            }
            return state;
          });
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

// Set up real-time subscriptions
if (typeof window !== 'undefined') {
  subscribeToMessages((messages) => {
    useChatStore.setState({ messages });
  });

  subscribeToUsers((users) => {
    useChatStore.setState({ onlineUsers: users });
  });
}
