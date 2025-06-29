const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./real-time-chat-app-danero-firebase-adminsdk-fbsvc-68d76cd0c8.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store connected users
const connectedUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  console.log('Socket.IO server initialized');

  io.on('connection', (socket) => {
    console.log('🔌 User connected with socket ID:', socket.id);

    // Handle user joining
    socket.on('user-join', async (userData) => {
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

      // Send chat history list to the user
      try {
        const chatRoomsRef = db.collection('chats');
        const querySnapshot = await chatRoomsRef.where('users', 'array-contains', userWithSocket.email).get();

        if (querySnapshot.empty) {
          socket.emit('chat-history-list', {});
          return;
        }

        const chatHistoryPromises = querySnapshot.docs.map(async (doc) => {
          const roomKey = doc.id;
          const otherUserEmail = roomKey.split('-').find(email => email !== userWithSocket.email);

          if (!otherUserEmail) return null;

          const messagesRef = db.collection('chats').doc(roomKey).collection('messages').orderBy('timestamp', 'desc').limit(1);
          const messagesSnapshot = await messagesRef.get();

          if (messagesSnapshot.empty) return null;

          const lastMessage = messagesSnapshot.docs[0].data();
          return {
            email: otherUserEmail,
            lastMessage: lastMessage
          };
        });

        const chatHistories = await Promise.all(chatHistoryPromises);

        const chatHistoryList = chatHistories
          .filter(item => item && item.lastMessage)
          .reduce((acc, curr) => {
            acc[curr.email] = [curr.lastMessage];
            return acc;
          }, {});

        socket.emit('chat-history-list', chatHistoryList);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit('chat-history-list', {});
      }
      
      // Send full chat history for each room
      const chatRoomsQuery = db.collection('chats').where('users', 'array-contains', userWithSocket.email);
      chatRoomsQuery.get().then(snapshot => {
        snapshot.forEach(doc => {
          const roomKey = doc.id;
          const messagesRef = db.collection('chats').doc(roomKey).collection('messages').orderBy('timestamp');
          messagesRef.get().then(messagesSnapshot => {
            const messages = messagesSnapshot.docs.map(doc => doc.data());
            socket.emit('chat-history', { roomKey, messages });
          });
        });
      });
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
        const messageData = {
          senderId,
          senderName,
          message,
          timestamp: new Date().toISOString()
        };

        // Store message in Firestore
        const roomKey = [senderId, recipientId].sort().join('-');
        const chatRef = db.collection('chats').doc(roomKey);
        chatRef.get().then(doc => {
          if (!doc.exists) {
            chatRef.set({ users: [senderId, recipientId] });
          }
        });
        chatRef.collection('messages').add(messageData);

        // Send message to recipient
        io.to(recipientSocketId).emit('private-message-received', messageData);

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

  httpServer
    .once('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log('🔌 Socket.IO server is running');
    });
});