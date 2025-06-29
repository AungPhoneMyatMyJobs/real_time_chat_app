// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  USER_JOIN: 'user-join',
  USER_LEAVE: 'user-leave',
  USERS_UPDATE: 'users-update',
  
  // Messages
  PRIVATE_MESSAGE: 'private-message',
  PRIVATE_MESSAGE_RECEIVED: 'private-message-received',
  MESSAGE_SENT: 'message-sent',
  
  // Typing
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  USER_TYPING: 'user-typing',
  USER_STOPPED_TYPING: 'user-stopped-typing',
  
  // Status
  STATUS_CHANGE: 'status-change',
} as const;

// User Status
export const USER_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  BUSY: 'busy',
  OFFLINE: 'offline',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
} as const;

// Chat Room Types
export const ROOM_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group',
  PUBLIC: 'public',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  THEME: 'theme',
  PREFERENCES: 'preferences',
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  MESSAGE: {
    MAX_LENGTH: 1000,
  },
  ROOM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
} as const;

// UI Constants
export const UI = {
  SIDEBAR_WIDTH: 320,
  HEADER_HEIGHT: 64,
  MESSAGE_BUBBLE_MAX_WIDTH: 400,
  TYPING_TIMEOUT: 1000,
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword'],
  },
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: 30,
  LOGIN_ATTEMPTS: 5,
  API_REQUESTS_PER_MINUTE: 100,
} as const;