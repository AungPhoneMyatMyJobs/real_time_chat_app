'use client';

import React from 'react';
import Avatar from '@/components/Avatar';

interface User {
  email: string;
  name: string;
  photoURL?: string;
  role: string;
  socketId: string;
  status: 'online' | 'away' | 'busy';
}

interface Message {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

interface ChatHistoryListProps {
  messages: { [key: string]: Message[] };
  users: User[];
  selectedUser: string | null;
  onSelectUser: (email: string) => void;
  unreadCounts: { [key: string]: number };
  currentUserEmail: string;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ messages, users, selectedUser, onSelectUser, unreadCounts, currentUserEmail }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getChatList = () => {
    return Object.keys(messages)
      .filter(email => messages[email] && messages[email].length > 0)
      .map(email => {
        const user = users.find(u => u.email === email) || { 
          email, 
          name: email.split('@')[0],
          photoURL: undefined,
          role: 'user',
          socketId: '',
          status: 'offline' as const
        };
        const lastMessage = messages[email][messages[email].length - 1];
        return { user, lastMessage, email };
      })
      .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Recent Chats
        </h4>
        <div className="space-y-2">
          {getChatList().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No recent chats</p>
              <p className="text-gray-400 text-xs mt-1">Start a conversation with someone online</p>
            </div>
          ) : (
            getChatList().map(({ user, lastMessage, email }) => (
              <button
                key={email}
                onClick={() => onSelectUser(email)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  selectedUser === email
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <Avatar
                    src={user?.photoURL}
                    alt={user?.name || 'User'}
                    name={user?.name || 'User'}
                    size="md"
                  />
                  {unreadCounts[email] > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCounts[email]}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name || email.split('@')[0]}</p>
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(lastMessage.timestamp)}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage.senderId === currentUserEmail ? 'You: ' : ''}
                      {lastMessage.message}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryList;