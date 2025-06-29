'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Avatar from '@/components/Avatar';
import ChatHistoryList from '@/components/ChatHistoryList';
import OnlineUsers from '@/components/OnlineUsers';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'busy'>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const { user, loading, signOut } = useAuth();
  const {
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
  } = useSocket();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedUser) {
      sendPrivateMessage(selectedUser, messageInput.trim());
      setMessageInput('');
      stopTyping(selectedUser);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (selectedUser) {
      startTyping(selectedUser);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedUser);
      }, 1000);
    }
  };

  const handleStatusChange = (status: 'online' | 'away' | 'busy') => {
    setUserStatus(status);
    changeStatus(status);
  };

  const handleUserSelect = (userEmail: string) => {
    setSelectedUser(userEmail);
    // Mark messages as read when user selects a chat
    markMessagesAsRead(userEmail);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const selectedUserData = connectedUsers.find(u => u.email === selectedUser);
  const currentMessages = selectedUser ? messages[selectedUser] || [] : [];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar 
                  src={user.photoURL} 
                  alt={user.name}
                  name={user.name}
                  size="md"
                />
                <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(userStatus)} rounded-full border-2 border-white`}></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={userStatus}
                    onChange={(e) => handleStatusChange(e.target.value as 'online' | 'away' | 'busy')}
                    className="text-xs text-gray-500 bg-transparent border-none focus:outline-none"
                  >
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Logout"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Online Users */}
        <OnlineUsers
          users={connectedUsers}
          currentUserEmail={user.email}
          onSelectUser={handleUserSelect}
          selectedUser={selectedUser}
        />

        {/* Chat History List */}
        <ChatHistoryList
          messages={messages}
          users={connectedUsers}
          selectedUser={selectedUser}
          onSelectUser={handleUserSelect}
          unreadCounts={unreadCounts}
          currentUserEmail={user.email}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar 
                    src={undefined} // Selected user doesn't have photoURL in this context
                    alt={selectedUserData?.name || 'User'}
                    name={selectedUserData?.name || 'User'}
                    size="md"
                    className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(selectedUserData?.status || 'offline')} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedUserData?.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedUserData?.status}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message, index) => {
                const sender = connectedUsers.find(u => u.email === message.senderId);
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${message.senderId === user.email ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.senderId !== user.email && (
                      <Avatar
                        src={sender?.photoURL}
                        alt={sender?.name || 'User'}
                        name={sender?.name || 'User'}
                        size="sm"
                      />
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user.email
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{message.senderName}</p>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user.email ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {typingUsers.typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
                    <p className="text-sm italic">{typingUsers.typing} is typing...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder={`Message ${selectedUserData?.name}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Chat!</h3>
              <p className="text-gray-500">Select a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}