
import { create } from 'zustand';
import { ChatState, Message, User } from './types';
import { persist } from 'zustand/middleware';

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
      messages: [],
      onlineUsers: [],
      setCurrentUser: (user: User) => {
        saveUserToStorage(user);
        set({ currentUser: user });
      },
      addMessage: (message: Message) => 
        set((state) => ({ messages: [...state.messages, message] })),
      updateOnlineUsers: (users: User[]) => set({ onlineUsers: users }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
