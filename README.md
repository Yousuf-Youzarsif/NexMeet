# NexMeet — MERN Stack Video Chat

A production-grade private video conferencing platform built with MongoDB, Express, React, and Node.js.

## 🚀 Features
- 🎥 **HD WebRTC Video** — Peer-to-peer, group (up to 20) + 1-on-1
- 🔒 **Private Rooms** — Password-protected, invite-only
- 🖥️ **Screen Sharing** — Share screen/window/tab
- 💬 **Real-time Chat** — Socket.io, persisted to MongoDB
- 🌐 **TURN/STUN** — Works behind firewalls & NAT
- 👤 **JWT Auth** — Secure register/login
- ✨ **Dark Glassmorphism UI** — Stunning premium design

## ⚙️ Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB (local: `mongodb://localhost:27017` or MongoDB Atlas URI)

### 2. Server
```bash
cd server
# Edit .env with your MONGO_URI if using Atlas
npm install
npm run dev
```

### 3. Client (new terminal)
```bash
cd client
npm install
npm run dev
```

### 4. Open
- Client: http://localhost:5173
- Server: http://localhost:5000

## 🔑 Environment Variables (server/.env)
```
MONGO_URI=mongodb://localhost:27017/videochat
JWT_SECRET=your_super_secret_key_change_this
CLIENT_URL=http://localhost:5173
PORT=5000
```

## 📁 Structure
```
videochat/
├── server/           # Express + Socket.io backend
│   ├── config/       # DB connection
│   ├── controllers/  # Route logic
│   ├── middleware/   # JWT auth
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── socket/       # WebRTC signaling + chat
│   └── index.js
└── client/           # React + Vite frontend
    └── src/
        ├── components/   # VideoGrid, Controls, ChatSidebar...
        ├── context/      # Auth + Socket contexts
        ├── hooks/        # useWebRTC
        ├── pages/        # Landing, Auth, Dashboard, Room
        └── services/     # API client
```

## 🌐 TURN Server
Using free Open Relay TURN servers by default.
For production, get credentials from https://www.metered.ca/tools/openrelay/
and update `server/socket/socketHandler.js`.
