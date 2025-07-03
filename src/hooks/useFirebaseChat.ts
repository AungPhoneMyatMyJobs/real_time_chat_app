'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  ref, 
  push, 
  onValue, 
  off, 
  set, 
  remove,
  serverTimestamp
} from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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

export const useFirebaseChat = () => {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuth();

  // Helper function to create safe email key for Firebase
  const createEmailKey = useCallback((email: string) => {
    return email.replace(/[.#$[\]]/g, '_');
  }, []);

  // Generate chat room key for two users
  const getChatRoomKey = useCallback((user1: string, user2: string) => {
    const key1 = createEmailKey(user1);
    const key2 = createEmailKey(user2);
    return [key1, key2].sort().join('_');
  }, [createEmailKey]);

  // Set user online status
  const setUserOnline = useCallback(async () => {
    if (!user) return;
    
    try {
      const userKey = createEmailKey(user.email);
      const userRef = ref(database, `users/${userKey}`);
      await set(userRef, {
        email: user.email,
        name: user.name,
        photoURL: user.photoURL || '',
        role: user.role || 'user',
        status: 'online',
        lastSeen: Date.now()
      });
      console.log('✅ User set online:', user.email);
    } catch (error) {
      console.error('❌ Error setting user online:', error);
    }
  }, [user, createEmailKey]);

  // Set user offline status
  const setUserOffline = useCallback(async () => {
    if (!user) return;
    
    try {
      const userKey = createEmailKey(user.email);
      const userRef = ref(database, `users/${userKey}`);
      await set(userRef, {
        email: user.email,
        name: user.name,
        photoURL: user.photoURL || '',
        role: user.role || 'user',
        status: 'away',
        lastSeen: Date.now()
      });
      console.log('✅ User set offline:', user.email);
    } catch (error) {
      console.error('❌ Error setting user offline:', error);
    }
  }, [user, createEmailKey]);

  // Listen to connected users
  useEffect(() => {
    if (!user) {
      setConnectedUsers([]);
      setIsConnected(false);
      return;
    }

    console.log('🔌 Setting up Firebase connection for user:', user.email);
    setIsConnected(true);
    setUserOnline();

    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      console.log('📊 Users data received:', snapshot.exists());
      const usersData = snapshot.val();
      if (usersData) {
        const usersList = Object.values(usersData) as User[];
        console.log('👥 All users from Firebase:', usersList);
        // Filter out current user
        const otherUsers = usersList.filter(u => u.email !== user.email);
        console.log('👤 Other users (excluding current):', otherUsers);
        setConnectedUsers(otherUsers);
      } else {
        console.log('📭 No users data found');
        setConnectedUsers([]);
      }
    }, (error) => {
      console.error('❌ Error listening to users:', error);
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up user listener');
      off(usersRef);
      setUserOffline();
    };
  }, [user, setUserOnline, setUserOffline]);

  // Listen to messages for a specific chat
  const listenToChat = useCallback((otherUserEmail: string) => {
    if (!user) return () => {};

    console.log('👂 Starting to listen to chat with:', otherUserEmail);
    const chatRoomKey = getChatRoomKey(user.email, otherUserEmail);
    const messagesRef = ref(database, `chats/${chatRoomKey}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      console.log('💬 Messages data received for chat:', chatRoomKey, snapshot.exists());
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.values(messagesData) as Message[];
        const sortedMessages = messagesList.sort((a, b) => a.timestamp - b.timestamp);
        console.log('📝 Sorted messages:', sortedMessages);
        
        setMessages(prev => ({
          ...prev,
          [otherUserEmail]: sortedMessages
        }));

        // Count unread messages
        const unreadCount = sortedMessages.filter(
          msg => msg.senderId !== user.email && !msg.isRead
        ).length;
        
        setUnreadCounts(prev => ({
          ...prev,
          [otherUserEmail]: unreadCount
        }));
      } else {
        console.log('📭 No messages found for chat:', chatRoomKey);
        setMessages(prev => ({
          ...prev,
          [otherUserEmail]: []
        }));
      }
    }, (error) => {
      console.error('❌ Error listening to chat:', error);
    });

    return unsubscribe;
  }, [user, getChatRoomKey]);

  // Send private message
  const sendPrivateMessage = useCallback(async (recipientEmail: string, message: string) => {
    if (!user) return;

    try {
      console.log('📤 Sending message to:', recipientEmail);
      const chatRoomKey = getChatRoomKey(user.email, recipientEmail);
      const messagesRef = ref(database, `chats/${chatRoomKey}/messages`);
      
      const messageData: Message = {
        senderId: user.email,
        senderName: user.name,
        message,
        timestamp: Date.now(),
        isRead: false
      };

      await push(messagesRef, messageData);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }, [user, getChatRoomKey]);

  // Start typing indicator
  const startTyping = useCallback(async (recipientEmail: string) => {
    if (!user) return;

    try {
      const chatRoomKey = getChatRoomKey(user.email, recipientEmail);
      const userKey = createEmailKey(user.email);
      const typingRef = ref(database, `typing/${chatRoomKey}/${userKey}`);
      await set(typingRef, user.name);
    } catch (error) {
      console.error('❌ Error setting typing indicator:', error);
    }
  }, [user, getChatRoomKey, createEmailKey]);

  // Stop typing indicator
  const stopTyping = useCallback(async (recipientEmail: string) => {
    if (!user) return;

    try {
      const chatRoomKey = getChatRoomKey(user.email, recipientEmail);
      const userKey = createEmailKey(user.email);
      const typingRef = ref(database, `typing/${chatRoomKey}/${userKey}`);
      await remove(typingRef);
    } catch (error) {
      console.error('❌ Error removing typing indicator:', error);
    }
  }, [user, getChatRoomKey, createEmailKey]);

  // Listen to typing indicators
  const listenToTyping = useCallback((otherUserEmail: string) => {
    if (!user) return () => {};

    const chatRoomKey = getChatRoomKey(user.email, otherUserEmail);
    const typingRef = ref(database, `typing/${chatRoomKey}`);
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const typingData = snapshot.val();
      if (typingData) {
        const otherUserKey = createEmailKey(otherUserEmail);
        const isOtherUserTyping = typingData[otherUserKey];
        
        setTypingUsers(prev => ({
          ...prev,
          [otherUserEmail]: isOtherUserTyping || ''
        }));
      } else {
        setTypingUsers(prev => ({
          ...prev,
          [otherUserEmail]: ''
        }));
      }
    });

    return unsubscribe;
  }, [user, getChatRoomKey, createEmailKey]);

  // Change user status
  const changeStatus = useCallback(async (status: 'online' | 'away' | 'busy') => {
    if (!user) return;

    try {
      const userKey = createEmailKey(user.email);
      const userRef = ref(database, `users/${userKey}/status`);
      await set(userRef, status);
    } catch (error) {
      console.error('❌ Error changing status:', error);
    }
  }, [user, createEmailKey]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (otherUserEmail: string) => {
    if (!user) return;

    setUnreadCounts(prev => ({
      ...prev,
      [otherUserEmail]: 0
    }));
  }, [user]);

  return {
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
    listenToChat,
    listenToTyping
  };
};