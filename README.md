# 💬 Real-Time Chat App

A modern, serverless real-time chat application built with **Next.js**, **Firebase**, and **TypeScript**. Experience instant messaging with Google authentication, live user presence, and typing indicators - all without managing any backend servers!

![Chat App Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## ✨ Features

### 🔥 **Real-Time Messaging**
- **Instant delivery** - Messages appear immediately across all devices
- **Live typing indicators** - See when someone is typing
- **User presence** - Know who's online, away, or busy
- **Message history** - Persistent chat history
- **Unread counters** - Never miss a message

### 🔐 **Authentication & Security**
- **Google OAuth** - Secure login with your Google account
- **Firebase Security Rules** - Protected data access
- **Automatic token management** - Seamless authentication
- **User sessions** - Persistent login across browser sessions

### 📱 **Modern UI/UX**
- **Clean interface** - WhatsApp-inspired design
- **Status indicators** - Visual online/offline status
- **Avatar system** - Google profile pictures with fallbacks

### 🚀 **Serverless Architecture**
- **No backend server** - Powered entirely by Firebase
- **Auto-scaling** - Handles any number of users
- **Global deployment** - Fast loading worldwide
- **Offline support** - Works even with poor internet

## 🎯 Live Demo

**🌐 [Try the Live App](https://real-time-chat-app-danero.vercel.app)**

### Quick Test:
1. Open the app in two different browsers
2. Login with different Google accounts
3. Start chatting in real-time!

## 🛠️ Tech Stack

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[React Hooks](https://reactjs.org/docs/hooks-intro.html)** - Modern state management

### **Backend (Serverless)**
- **[Firebase Realtime Database](https://firebase.google.com/products/realtime-database)** - Real-time data sync
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - Google OAuth
- **[Firebase Security Rules](https://firebase.google.com/docs/rules)** - Data protection

### **Deployment**
- **[Vercel](https://vercel.com/)** - Frontend hosting with global CDN
- **[Firebase](https://firebase.google.com/)** - Backend services

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google account for testing
- Firebase project (free tier)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/real-time-chat-app.git
cd real-time-chat-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing: `real-time-chat-app-danero`
3. Enable **Authentication** → **Google Sign-in**
4. Create **Realtime Database** → Start in test mode
5. Copy your Firebase config

### 4. Environment Variables
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Firebase Security Rules
In Firebase Console → Realtime Database → Rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── chat/              # Chat page
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Avatar.tsx         # User avatar component
│   ├── OnlineUsers.tsx    # Online users list
│   └── ChatHistoryList.tsx # Recent chats
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── FirebaseChatContext.tsx # Chat functionality
├── hooks/                 # Custom React hooks
│   └── useFirebaseChat.ts # Firebase chat logic
├── lib/                   # Utilities
│   └── firebase.ts        # Firebase configuration
└── types/                 # TypeScript types
    └── chat.ts           # Centralized type definitions
```

## 🔥 Firebase Architecture

### Database Structure
```json
{
  "users": {
    "user_email_com": {
      "email": "user@email.com",
      "name": "User Name",
      "photoURL": "https://...",
      "status": "online",
      "lastSeen": 1703123456789
    }
  },
  "chats": {
    "user1_email_com_user2_email_com": {
      "messages": {
        "messageId": {
          "senderId": "user1@email.com",
          "senderName": "User 1",
          "message": "Hello!",
          "timestamp": 1703123456789,
          "isRead": false
        }
      }
    }
  },
  "typing": {
    "user1_email_com_user2_email_com": {
      "user1_email_com": "User 1"
    }
  }
}
```

### Real-Time Features
- **User Presence**: Automatic online/offline detection
- **Message Sync**: Instant message delivery across devices
- **Typing Indicators**: Real-time typing status
- **Offline Support**: Messages sync when back online

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically!

### Firebase Configuration
1. Add your Vercel domain to Firebase authorized domains
2. Update security rules for production
3. Monitor usage in Firebase Console

## 🎨 Customization

### Adding Features
- **File Sharing**: Integrate Firebase Storage
- **Group Chats**: Extend database structure
- **Push Notifications**: Add Firebase Messaging
- **Voice/Video**: Integrate WebRTC
- **Message Reactions**: Extend message schema

### Styling
- **Themes**: Customize Tailwind colors
- **Layout**: Modify component styles
- **Animations**: Add smooth transitions
- **Mobile**: Enhance mobile experience

## 🔒 Security

### Current Security
- ✅ Google OAuth authentication
- ✅ Firebase security rules
- ✅ Automatic token management
- ✅ Input sanitization

### Production Recommendations
- 🔧 Implement stricter security rules
- 🔧 Add rate limiting
- 🔧 Enable Firebase App Check
- 🔧 Monitor usage and abuse

## 📊 Performance

### Optimizations
- ✅ Real-time listeners only for active chats
- ✅ Automatic cleanup of Firebase listeners
- ✅ Efficient state management
- ✅ Lazy loading of chat history

### Monitoring
- Firebase Analytics for user behavior
- Vercel Analytics for performance
- Firebase Performance Monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🙏 Acknowledgments

- **Firebase** for providing amazing backend services
- **Vercel** for seamless deployment
- **Next.js** team for the incredible framework
- **Tailwind CSS** for beautiful styling
- **Google** for OAuth authentication

## 📞 Support

- 📧 **Email**: your.email@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/AungPhoneMyatMyJobs/real-time-chat-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AungPhoneMyatMyJobs/real-time-chat-app/discussions)

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ using Firebase and Next.js

[Live Demo](https://real-time-chat-app-danero.vercel.app) • [Report Bug](https://github.com/AungPhoneMyatMyJobs/real-time-chat-app/issues)

</div>