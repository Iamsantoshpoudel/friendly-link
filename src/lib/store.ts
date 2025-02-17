
import { create } from 'zustand';
import { ChatState, Message, User } from './types';

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  messages: [],
  onlineUsers: [],
  setCurrentUser: (user: User) => set({ currentUser: user }),
  addMessage: (message: Message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  updateOnlineUsers: (users: User[]) => set({ onlineUsers: users }),
}));
