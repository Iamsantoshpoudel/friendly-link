import { create } from 'zustand';
import { ChatState, Message, User } from './types';
import { persist } from 'zustand/middleware';
import { updateUserStatus, subscribeToUsers } from './firebase';
import { webRTCService } from './webrtc';

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
    (set, get) => ({
      currentUser: loadUserFromStorage(),
      selectedUser: null,
      messages: [],
      onlineUsers: [],
      setCurrentUser: async (user: User) => {
        try {
          saveUserToStorage(user);
          await updateUserStatus(user);
          await webRTCService.initializePeer(user.id);
          set({ currentUser: user });
        } catch (error) {
          console.error('Error updating user status:', error);
          set({ currentUser: user });
        }
      },
      setSelectedUser: async (user: User | null) => {
        const currentState = get();
        if (user && currentState.currentUser) {
          // Initialize WebRTC connection when selecting a user
          await webRTCService.initiateConnection(user.id);
        }
        
        set((state) => {
          if (user) {
            const updatedMessages = state.messages.map(msg => 
              msg.senderId === user.id && msg.receiverId === state.currentUser?.id
                ? { ...msg, isRead: true }
                : msg
            );
            return { selectedUser: user, messages: updatedMessages };
          }
          return { selectedUser: user };
        });
      },
      addMessage: async (message: Message) => {
        const state = get();
        if (state.selectedUser) {
          try {
            // Send message through WebRTC instead of Firebase
            await webRTCService.sendMessage(state.selectedUser.id, message);
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
        }
      },
      updateOnlineUsers: (users: User[]) => set({ onlineUsers: users }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);

// Set up WebRTC message handler
webRTCService.setMessageCallback((message: Message) => {
  useChatStore.setState((state) => ({
    messages: [...state.messages, message]
  }));
});

// Only subscribe to user status updates from Firebase
if (typeof window !== 'undefined') {
  subscribeToUsers((users) => {
    useChatStore.setState({ onlineUsers: users });
  });
}
