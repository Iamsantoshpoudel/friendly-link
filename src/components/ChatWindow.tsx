import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, Phone, Video, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface ChatWindowProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

const ChatWindow = ({ showBackButton, onBack }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { messages, currentUser, selectedUser, addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = 60;
    }
  }, [selectedUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser && selectedUser) {
      const message: Message = {
        id: uuidv4(),
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false
      };
      addMessage(message);
      setNewMessage('');
    }
  };

  if (!selectedUser || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  const filteredMessages = messages.filter(msg => 
    (msg.senderId === currentUser.id && msg.receiverId === selectedUser.id) ||
    (msg.senderId === selectedUser.id && msg.receiverId === currentUser.id)
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="fixed top-0 left-0 right-0 md:relative z-10 bg-white border-b border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="md:hidden -ml-2"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedUser.name[0].toUpperCase()}
                </div>
                {selectedUser.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedUser.isOnline ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto py-4 px-4 mt-[72px] mb-[76px] md:my-0"
      >
        <AnimatePresence initial={false}>
          {filteredMessages.map((message, index) => {
            const isSender = message.senderId === currentUser.id;
            const showAvatar = index === filteredMessages.length - 1 || 
                             filteredMessages[index + 1].senderId !== message.senderId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`flex items-end space-x-2 ${isSender ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {showAvatar && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {isSender ? currentUser.name[0].toUpperCase() : selectedUser.name[0].toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isSender
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 md:relative bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="transition-all duration-200 hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
