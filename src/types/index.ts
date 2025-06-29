// User types
export interface User {
  id?: string;
  email: string;
  name: string;
  username?: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  socketId?: string;
}

// Message types
export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  roomId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  isRead?: boolean;
  isEdited?: boolean;
  replyTo?: string;
}

// Chat types
export interface ChatRoom {
  id: string;
  name?: string;
  type: 'private' | 'group' | 'public';
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Socket types
export interface SocketEvents {
  // Connection events
  'user-join': (userData: User) => void;
  'user-leave': (userId: string) => void;
  'users-update': (users: User[]) => void;
  
  // Message events
  'private-message': (data: {
    recipientId: string;
    message: string;
    senderId: string;
    senderName: string;
  }) => void;
  'private-message-received': (message: Message) => void;
  'message-sent': (data: {
    recipientId: string;
    message: string;
    timestamp: string;
  }) => void;
  
  // Typing events
  'typing-start': (data: { recipientId: string; senderName: string }) => void;
  'typing-stop': (data: { recipientId: string }) => void;
  'user-typing': (data: { senderName: string }) => void;
  'user-stopped-typing': () => void;
  
  // Status events
  'status-change': (status: User['status']) => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  username?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends User {
  permissions?: string[];
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  language: string;
}