
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
          await updateUserStatus(user);
          set({ currentUser: user });
        } catch (error) {
          console.error('Error updating user status:', error);
          set({ currentUser: user });
        }
      },
      setSelectedUser: (user: User | null) => {
        set((state) => {
          if (user && user.id !== state.currentUser?.id) {
            saveLastActiveChatId(user.id);
            
            // First update the UI immediately
            const updatedMessages = state.messages.map(msg => 
              msg.senderId === user.id && msg.receiverId === state.currentUser?.id && !msg.isRead
                ? { ...msg, isRead: true }
                : msg
            );
            
            // Then update Firebase in the background
            state.messages.forEach(msg => {
              if (msg.senderId === user.id && msg.receiverId === state.currentUser?.id && !msg.isRead) {
                updateMessageReadStatus(msg.id, true).catch(error => {
                  console.error('Error updating message read status:', error);
                });
              }
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
        try {
          await sendMessage(message);
          set((state) => {
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
        messages: state.messages
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  subscribeToMessages((messages) => {
    useChatStore.setState({ messages });
  });

  subscribeToUsers((users) => {
    useChatStore.setState({ onlineUsers: users });
  });
}
