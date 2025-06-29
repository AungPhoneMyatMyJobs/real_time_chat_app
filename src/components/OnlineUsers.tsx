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

interface OnlineUsersProps {
  users: User[];
  currentUserEmail: string;
  onSelectUser: (email: string) => void;
  selectedUser: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'away': return 'bg-yellow-500';
    case 'busy': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const OnlineUsers: React.FC<OnlineUsersProps> = ({ users, currentUserEmail, onSelectUser, selectedUser }) => {
  return (
    <div className="p-4 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        Online Users
      </h4>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {users
          .filter(user => user.email !== currentUserEmail)
          .map((user) => (
            <button
              key={user.email}
              onClick={() => onSelectUser(user.email)}
              className={`flex-shrink-0 flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                selectedUser === user.email
                  ? 'bg-indigo-100'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="relative">
                <Avatar 
                  src={user.photoURL}
                  alt={user.name}
                  name={user.name}
                  size="md"
                />
                <div className={`absolute -bottom-0 -right-0 h-3 w-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
              </div>
              <p className="text-xs text-gray-800 w-20 text-center truncate">{user.name}</p>
            </button>
          ))}
      </div>
    </div>
  );
};

export default OnlineUsers;