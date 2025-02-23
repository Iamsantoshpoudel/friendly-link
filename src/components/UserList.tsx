
import { useChatStore } from '@/lib/store';
import { Message, User } from '@/lib/types';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';

interface UserListProps {
  onChatSelect?: (user: User) => void;
}

const UserList = ({ onChatSelect }: UserListProps) => {
  const { onlineUsers, currentUser, selectedUser, messages } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const getLastMessage = (userId: string): Message | undefined => {
    return messages
      .filter(m => (m.senderId === userId && m.receiverId === currentUser?.id) || 
                   (m.senderId === currentUser?.id && m.receiverId === userId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const getUnreadCount = (userId: string): number => {
    return messages.filter(m => 
      m.senderId === userId && 
      m.receiverId === currentUser?.id && 
      !m.isRead
    ).length;
  };

  const handleUserClick = (user: User) => {
    if (user.id === currentUser?.id) return;
    if (onChatSelect) {
      onChatSelect(user);
    }
  };

  const onlineUsersFiltered = onlineUsers.filter(user => 
    user.id !== currentUser?.id && 
    user.isOnline
  );

  const filteredAndSortedUsers = onlineUsers
    .filter(user => 
      user.id !== currentUser?.id && 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aLastMessage = getLastMessage(a.id);
      const bLastMessage = getLastMessage(b.id);
      
      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;
      
      return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime();
    });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <img 
            src="/src/assets/img/Logo.svg" 
            alt="Logo" 
            className="w-8 h-8 mr-2"
          />
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full bg-muted/50"
          />
        </div>
      </div>

      {/* Online Users Horizontal Scroll */}
      <div className="p-4 overflow-x-auto whitespace-nowrap border-b border-gray-200">
        <div className="flex space-x-4">
          {onlineUsersFiltered.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <span className="text-xs mt-1 max-w-[60px] truncate">{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedUsers.map((user) => {
          const lastMessage = getLastMessage(user.id);
          const unreadCount = getUnreadCount(user.id);
          
          return (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedUser?.id === user.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {user.name[0].toUpperCase()}
                  </div>
                  {user.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`font-medium truncate ${unreadCount > 0 ? 'text-black' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className={`text-sm truncate ${
                      unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                    }`}>
                      {lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                      {lastMessage.content}
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserList;
