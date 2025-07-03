// Centralized type definitions for the chat application

export interface User {
  uid?: string;
  email: string;
  name: string;
  photoURL?: string;
  role: string;
  socketId?: string;
  status: 'online' | 'away' | 'busy';
  lastSeen?: number;
}

export interface Message {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number | string;
  isRead?: boolean;
}

export interface ChatData {
  messages: { [key: string]: Message };
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
}

export interface TypingIndicator {
  [key: string]: string;
}

export interface UnreadCounts {
  [key: string]: number;
}

export interface ChatContextType {
  connectedUsers: User[];
  messages: { [key: string]: Message[] };
  unreadCounts: UnreadCounts;
  sendPrivateMessage: (recipientId: string, message: string) => void;
  startTyping: (recipientId: string) => void;
  stopTyping: (recipientId: string) => void;
  changeStatus: (status: 'online' | 'away' | 'busy') => void;
  markMessagesAsRead: (userId: string) => void;
  isConnected: boolean;
  typingUsers: TypingIndicator;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}