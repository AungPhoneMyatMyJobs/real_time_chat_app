'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface User {
  email: string;
  name: string;
  role: string;
  socketId: string;
  status: 'online' | 'away' | 'busy';
}

interface Message {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  connectedUsers: User[];
  messages: { [key: string]: Message[] };
  chatHistory: { [key: string]: Message[] };
  unreadCounts: { [key: string]: number };
  sendPrivateMessage: (recipientId: string, message: string) => void;
  startTyping: (recipientId: string) => void;
  stopTyping: (recipientId: string) => void;
  changeStatus: (status: 'online' | 'away' | 'busy') => void;
  markMessagesAsRead: (userId: string) => void;
  isConnected: boolean;
  typingUsers: { [key: string]: string };
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [chatHistory, setChatHistory] = useState<{ [key: string]: Message[] }>({});
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setConnectedUsers([]);
        setMessages({});
        setUnreadCounts({});
        setTypingUsers({});
      }
      return;
    }

    // Use environment variable for backend URL, fallback to localhost for development
    const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to server with ID:', socketInstance.id);
      setIsConnected(true);
      
      // Join with Firebase user data
      if (user) {
        console.log('Emitting user-join with Firebase user data:', user);
        socketInstance.emit('user-join', user);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('users-update', (users: User[]) => {
      console.log('Received users-update:', users);
      setConnectedUsers(users);
    });

    socketInstance.on('private-message-received', (data: Message) => {
      const messageWithReadStatus = { ...data, isRead: false };
      
      setMessages(prev => ({
        ...prev,
        [data.senderId]: [...(prev[data.senderId] || []), messageWithReadStatus]
      }));

      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [data.senderId]: (prev[data.senderId] || 0) + 1
      }));
    });

    socketInstance.on('message-sent', (data: { recipientId: string; message: string; timestamp: string }) => {
      if (user) {
        const messageData: Message = {
          senderId: user.email,
          senderName: user.name,
          message: data.message,
          timestamp: data.timestamp,
          isRead: true // Messages sent by current user are considered read
        };
        
        setMessages(prev => ({
          ...prev,
          [data.recipientId]: [...(prev[data.recipientId] || []), messageData]
        }));
      }
    });

    socketInstance.on('user-typing', (data: { senderName: string }) => {
      setTypingUsers(prev => ({ ...prev, typing: data.senderName }));
    });

    socketInstance.on('user-stopped-typing', () => {
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping.typing;
        return newTyping;
      });
    });

    socketInstance.on('chat-history', (data: { roomKey: string; messages: Message[] }) => {
      const { roomKey, messages } = data;
      const otherUser = roomKey.split('-').find(email => email !== user?.email);
      if (otherUser) {
        setMessages(prev => ({
          ...prev,
          [otherUser]: messages
        }));
      }
    });

    socketInstance.on('chat-history-list', (data: { [key: string]: Message[] }) => {
      setChatHistory(data);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const sendPrivateMessage = (recipientId: string, message: string) => {
    if (socket && user) {
      socket.emit('private-message', {
        recipientId,
        message,
        senderId: user.email,
        senderName: user.name
      });
    }
  };

  const startTyping = (recipientId: string) => {
    if (socket && user) {
      socket.emit('typing-start', {
        recipientId,
        senderName: user.name
      });
    }
  };

  const stopTyping = (recipientId: string) => {
    if (socket) {
      socket.emit('typing-stop', { recipientId });
    }
  };

  const changeStatus = (status: 'online' | 'away' | 'busy') => {
    if (socket) {
      socket.emit('status-change', status);
    }
  };

  const markMessagesAsRead = (userId: string) => {
    // Mark all messages from this user as read
    setMessages(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).map(msg => ({ ...msg, isRead: true }))
    }));

    // Reset unread count for this user
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }));
  };

  const value: SocketContextType = {
    socket,
    connectedUsers,
    messages,
    chatHistory,
    unreadCounts,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    changeStatus,
    markMessagesAsRead,
    isConnected,
    typingUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};