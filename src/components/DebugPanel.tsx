'use client';

import { useSocket } from '@/contexts/SocketContext';

export default function DebugPanel() {
  const { socket, connectedUsers, isConnected } = useSocket();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div>Socket Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Socket ID: {socket?.id || 'None'}</div>
      <div>Connected Users: {connectedUsers.length}</div>
      <div className="mt-2">
        <div className="font-semibold">Users:</div>
        {connectedUsers.map((user, index) => (
          <div key={index} className="ml-2">
            • {user.name} ({user.status})
          </div>
        ))}
      </div>
      <button 
        onClick={() => {
          const userData = localStorage.getItem('user');
          if (userData && socket) {
            const user = JSON.parse(userData);
            console.log('Manual user-join emit:', user);
            socket.emit('user-join', user);
          }
        }}
        className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
      >
        Force Join
      </button>
    </div>
  );
}