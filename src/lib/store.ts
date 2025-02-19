
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
        set({ selectedUser: user });
      },
      addMessage: async (message: Message) => {
        const state = get();
        if (state.selectedUser) {
          try {
            // Only add message to state if we're the sender
            // Messages from the receiver will come through WebRTC
            if (message.senderId === state.currentUser?.id) {
              set((state) => {
                const messageExists = state.messages.some(msg => msg.id === message.id);
                if (!messageExists) {
                  webRTCService.sendMessage(state.selectedUser!.id, message);
                  return { messages: [...state.messages, message] };
                }
                return state;
              });
            }
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
  // Only add received messages to state
  useChatStore.setState((state) => {
    const messageExists = state.messages.some(msg => msg.id === message.id);
    if (!messageExists) {
      return { messages: [...state.messages, message] };
    }
    return state;
  });
});

// Subscribe to user status updates
if (typeof window !== 'undefined') {
  subscribeToUsers((users) => {
    useChatStore.setState({ onlineUsers: users });
  });
}
