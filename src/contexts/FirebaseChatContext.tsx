'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebaseChat } from '@/hooks/useFirebaseChat';

interface User {
  email: string;
  name: string;
  photoURL?: string;
  role: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: number;
}

interface Message {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  isRead?: boolean;
}

interface FirebaseChatContextType {
  connectedUsers: User[];
  messages: { [key: string]: Message[] };
  unreadCounts: { [key: string]: number };
  sendPrivateMessage: (recipientId: string, message: string) => void;
  startTyping: (recipientId: string) => void;
  stopTyping: (recipientId: string) => void;
  changeStatus: (status: 'online' | 'away' | 'busy') => void;
  markMessagesAsRead: (userId: string) => void;
  isConnected: boolean;
  typingUsers: { [key: string]: string };
  listenToChat: (otherUserEmail: string) => void;
  activeChats: Set<string>;
}

const FirebaseChatContext = createContext<FirebaseChatContextType | undefined>(undefined);

export const useFirebaseChatContext = () => {
  const context = useContext(FirebaseChatContext);
  if (context === undefined) {
    throw new Error('useFirebaseChatContext must be used within a FirebaseChatProvider');
  }
  return context;
};

interface FirebaseChatProviderProps {
  children: React.ReactNode;
}

export const FirebaseChatProvider: React.FC<FirebaseChatProviderProps> = ({ children }) => {
  const [activeChats, setActiveChats] = useState<Set<string>>(new Set());
  const [chatListeners, setChatListeners] = useState<{ [key: string]: () => void }>({});
  
  const {
    connectedUsers,
    messages,
    unreadCounts,
    typingUsers,
    isConnected,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    changeStatus,
    markMessagesAsRead,
    listenToChat: hookListenToChat,
    listenToTyping
  } = useFirebaseChat();

  // Enhanced listenToChat that manages active listeners
  const listenToChat = (otherUserEmail: string) => {
    if (activeChats.has(otherUserEmail)) {
      return; // Already listening
    }

    // Start listening to chat messages
    const unsubscribeMessages = hookListenToChat(otherUserEmail);
    // Start listening to typing indicators
    const unsubscribeTyping = listenToTyping(otherUserEmail);

    // Store unsubscribe functions
    setChatListeners(prev => ({
      ...prev,
      [otherUserEmail]: () => {
        if (unsubscribeMessages) unsubscribeMessages();
        if (unsubscribeTyping) unsubscribeTyping();
      }
    }));

    // Add to active chats
    setActiveChats(prev => new Set([...prev, otherUserEmail]));
  };

  // Cleanup listeners when component unmounts
  useEffect(() => {
    return () => {
      Object.values(chatListeners).forEach(unsubscribe => unsubscribe());
    };
  }, [chatListeners]);

  const value: FirebaseChatContextType = {
    connectedUsers,
    messages,
    unreadCounts,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    changeStatus,
    markMessagesAsRead,
    isConnected,
    typingUsers,
    listenToChat,
    activeChats
  };

  return (
    <FirebaseChatContext.Provider value={value}>
      {children}
    </FirebaseChatContext.Provider>
  );
};