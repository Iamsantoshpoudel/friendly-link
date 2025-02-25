
'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import UserProfile from '@/components/UserProfile';
import { useChatStore } from '@/lib/store';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useParams, useRouter } from 'next/navigation';

export default function ChatPage() {
  const { currentUser, selectedUser, setSelectedUser, onlineUsers } = useChatStore();
  const [showProfile, setShowProfile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Protect the route
  useEffect(() => {
    if (isMounted && !currentUser) {
      router.replace('/');
    }
  }, [currentUser, isMounted, router]);

  if (!isMounted) {
    return <LoadingSkeleton />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex bg-background"
    >
      {/* User List */}
      <div className="w-full md:w-80 border-r border-border">
        <UserList onChatSelect={(user) => {
          setSelectedUser(user);
          setShowProfile(false);
        }} />
      </div>

      {/* Chat Window or Profile */}
      <div className="hidden md:flex flex-1">
        {showProfile ? (
          <UserProfile
            user={selectedUser || currentUser}
            showBackButton
            onBack={() => setShowProfile(false)}
          />
        ) : (
          <ChatWindow
            showBackButton
            onBack={() => setSelectedUser(null)}
          />
        )}
      </div>

      {/* Mobile View */}
      <div className="fixed inset-0 md:hidden bg-background">
        {selectedUser ? (
          showProfile ? (
            <UserProfile
              user={selectedUser}
              showBackButton
              onBack={() => setShowProfile(false)}
            />
          ) : (
            <ChatWindow
              showBackButton
              onBack={() => setSelectedUser(null)}
            />
          )
        ) : (
          <UserList onChatSelect={(user) => {
            setSelectedUser(user);
            setShowProfile(false);
          }} />
        )}
      </div>
    </motion.div>
  );
}
