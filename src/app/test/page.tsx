'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function TestPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      addLog('✅ Connected to server');
      setIsConnected(true);
      
      // Try to join with test user
      const testUser = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };
      
      addLog('📤 Sending user-join event');
      socketInstance.emit('user-join', testUser);
    });

    socketInstance.on('disconnect', () => {
      addLog('❌ Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('users-update', (usersList: any[]) => {
      addLog(`👥 Received users-update: ${usersList.length} users`);
      setUsers(usersList);
    });

    socketInstance.on('connect_error', (error) => {
      addLog(`🚨 Connection error: ${error.message}`);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const manualJoin = () => {
    if (socket) {
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        name: `Test User ${Date.now()}`,
        role: 'user'
      };
      
      addLog('🔄 Manual user-join attempt');
      socket.emit('user-join', testUser);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Socket.IO Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div>Socket ID: {socket?.id || 'None'}</div>
              <div>Connected Users: {users.length}</div>
              <button 
                onClick={manualJoin}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Manual Join Test
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Connected Users</h2>
            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="text-gray-500">No users connected</p>
              ) : (
                users.map((user, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500">Status: {user.status}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-8 bg-black text-green-400 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Connection Logs</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}