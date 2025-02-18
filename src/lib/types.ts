
export interface User {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatState {
  currentUser: User | null;
  selectedUser: User | null;
  messages: Message[];
  onlineUsers: User[];
  setCurrentUser: (user: User) => void;
  setSelectedUser: (user: User | null) => void;
  addMessage: (message: Message) => void;
  updateOnlineUsers: (users: User[]) => void;
}
