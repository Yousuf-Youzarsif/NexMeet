const Message = require('../models/Message');
const Room = require('../models/Room');

// Map: roomId -> Set of socket IDs
const roomSockets = new Map();
// Map: socketId -> { userId, username, avatarColor, roomId }
const socketUsers = new Map();

/**
 * Free TURN servers from Open Relay (metered.ca)
 * For production, use your own TURN server credentials
 */
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:openrelay.metered.ca:80' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Send ICE server config to client
    socket.emit('ice-servers', ICE_SERVERS);

    // ─── Join Room ────────────────────────────────────────────────
    socket.on('join-room', async ({ roomId, userId, username, avatarColor }) => {
      try {
        socket.join(roomId);

        // Track user
        socketUsers.set(socket.id, { userId, username, avatarColor, roomId });
        if (!roomSockets.has(roomId)) roomSockets.set(roomId, new Set());
        roomSockets.get(roomId).add(socket.id);

        // Get all OTHER users currently in room
        const existingUsers = [];
        const sockets = roomSockets.get(roomId);
        for (const sid of sockets) {
          if (sid !== socket.id && socketUsers.has(sid)) {
            existingUsers.push({ socketId: sid, ...socketUsers.get(sid) });
          }
        }

        // Tell the new user who is already here
        socket.emit('existing-users', existingUsers);

        // Tell everyone else about the new user
        socket.to(roomId).emit('user-joined', {
          socketId: socket.id,
          userId,
          username,
          avatarColor,
        });

        // Save system message
        await Message.create({
          roomId,
          sender: userId,
          senderName: username,
          senderColor: avatarColor,
          text: `${username} joined the room`,
          type: 'system',
        });

        // Broadcast updated participant list
        const participantList = [];
        for (const sid of sockets) {
          if (socketUsers.has(sid)) {
            participantList.push({ socketId: sid, ...socketUsers.get(sid) });
          }
        }
        io.to(roomId).emit('participants-update', participantList);

      } catch (err) {
        console.error('join-room error:', err);
      }
    });

    // ─── WebRTC Signaling ────────────────────────────────────────
    socket.on('offer', ({ offer, to }) => {
      socket.to(to).emit('offer', { offer, from: socket.id });
    });

    socket.on('answer', ({ answer, to }) => {
      socket.to(to).emit('answer', { answer, from: socket.id });
    });

    socket.on('ice-candidate', ({ candidate, to }) => {
      socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });

    // ─── Media State ─────────────────────────────────────────────
    socket.on('toggle-audio', ({ roomId, enabled }) => {
      socket.to(roomId).emit('user-toggle-audio', { socketId: socket.id, enabled });
    });

    socket.on('toggle-video', ({ roomId, enabled }) => {
      socket.to(roomId).emit('user-toggle-video', { socketId: socket.id, enabled });
    });

    socket.on('screen-share-started', ({ roomId }) => {
      socket.to(roomId).emit('user-screen-share', { socketId: socket.id, sharing: true });
    });

    socket.on('screen-share-stopped', ({ roomId }) => {
      socket.to(roomId).emit('user-screen-share', { socketId: socket.id, sharing: false });
    });

    // ─── Chat Messages ───────────────────────────────────────────
    socket.on('send-message', async ({ roomId, text, userId, username, avatarColor }) => {
      try {
        const msg = await Message.create({
          roomId,
          sender: userId,
          senderName: username,
          senderColor: avatarColor,
          text,
          type: 'text',
        });

        io.to(roomId).emit('receive-message', {
          _id: msg._id,
          roomId,
          senderName: username,
          senderColor: avatarColor,
          text,
          type: 'text',
          createdAt: msg.createdAt,
        });
      } catch (err) {
        console.error('send-message error:', err);
      }
    });

    // ─── Disconnect / Leave ──────────────────────────────────────
    const handleLeave = async (roomId) => {
      if (!roomId) return;
      const userData = socketUsers.get(socket.id);

      socket.leave(roomId);
      socketUsers.delete(socket.id);

      const sockets = roomSockets.get(roomId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) roomSockets.delete(roomId);
      }

      if (userData) {
        socket.to(roomId).emit('user-left', { socketId: socket.id, username: userData.username });

        // Save system message
        try {
          await Message.create({
            roomId,
            sender: userData.userId,
            senderName: userData.username,
            senderColor: userData.avatarColor,
            text: `${userData.username} left the room`,
            type: 'system',
          });
        } catch (_) {}

        // Broadcast updated participant list
        const remaining = roomSockets.get(roomId);
        const participantList = [];
        if (remaining) {
          for (const sid of remaining) {
            if (socketUsers.has(sid)) {
              participantList.push({ socketId: sid, ...socketUsers.get(sid) });
            }
          }
        }
        io.to(roomId).emit('participants-update', participantList);
      }
    };

    socket.on('leave-room', ({ roomId }) => handleLeave(roomId));

    socket.on('disconnect', async () => {
      const userData = socketUsers.get(socket.id);
      if (userData) await handleLeave(userData.roomId);
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
