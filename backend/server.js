const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:3000", "https://your-app.vercel.app"],
  credentials: true
}));

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || ["http://localhost:3000", "https://your-app.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

console.log('Socket.IO server initialized');

io.on('connection', (socket) => {
  console.log('🔌 User connected with socket ID:', socket.id);

  // Handle user joining
  socket.on('user-join', (userData) => {
    console.log('👤 User joining:', userData);
    console.log('📍 Socket ID:', socket.id);
    
    // Store user data
    const userWithSocket = {
      ...userData,
      socketId: socket.id,
      status: userData.status || 'online'
    };
    
    connectedUsers.set(socket.id, userWithSocket);

    console.log('📊 Total connected users:', connectedUsers.size);
    console.log('👥 All connected users:', Array.from(connectedUsers.values()).map(u => ({ name: u.name, email: u.email, status: u.status })));

    // Broadcast updated user list to all clients
    const usersList = Array.from(connectedUsers.values());
    console.log('📤 Broadcasting users-update to all clients:', usersList.length, 'users');
    io.emit('users-update', usersList);
  });

  // Handle private message
  socket.on('private-message', (data) => {
    console.log('💬 Private message received:', data);
    const { recipientId, message, senderId, senderName } = data;
    
    // Find recipient's socket
    const recipientSocket = Array.from(connectedUsers.entries())
      .find(([socketId, user]) => user.email === recipientId);

    if (recipientSocket) {
      const [recipientSocketId] = recipientSocket;
      console.log('📨 Sending message to recipient socket:', recipientSocketId);
      
      // Send message to recipient
      io.to(recipientSocketId).emit('private-message-received', {
        senderId,
        senderName,
        message,
        timestamp: new Date().toISOString()
      });

      // Send confirmation back to sender
      socket.emit('message-sent', {
        recipientId,
        message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Recipient not found for email:', recipientId);
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { recipientId, senderName } = data;
    const recipientSocket = Array.from(connectedUsers.entries())
      .find(([socketId, user]) => user.email === recipientId);

    if (recipientSocket) {
      const [recipientSocketId] = recipientSocket;
      io.to(recipientSocketId).emit('user-typing', { senderName });
    }
  });

  socket.on('typing-stop', (data) => {
    const { recipientId } = data;
    const recipientSocket = Array.from(connectedUsers.entries())
      .find(([socketId, user]) => user.email === recipientId);

    if (recipientSocket) {
      const [recipientSocketId] = recipientSocket;
      io.to(recipientSocketId).emit('user-stopped-typing');
    }
  });

  // Handle user status change
  socket.on('status-change', (status) => {
    console.log('🔄 Status change for socket:', socket.id, 'to:', status);
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.status = status;
      connectedUsers.set(socket.id, user);
      console.log('📤 Broadcasting status update');
      io.emit('users-update', Array.from(connectedUsers.values()));
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log('👋 User', user.name, 'disconnected');
    }
    connectedUsers.delete(socket.id);
    console.log('📊 Remaining connected users:', connectedUsers.size);
    io.emit('users-update', Array.from(connectedUsers.values()));
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log('🔌 Ready to accept connections');
});