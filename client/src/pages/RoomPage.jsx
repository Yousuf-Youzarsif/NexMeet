import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import useWebRTC from '../hooks/useWebRTC';
import VideoGrid from '../components/VideoGrid';
import Controls from '../components/Controls';
import ChatSidebar from '../components/ChatSidebar';
import api from '../services/api';

const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const [roomInfo, setRoomInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [localSocketId, setLocalSocketId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Establish socket connection
  useEffect(() => {
    const s = io('/', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      setLocalSocketId(s.id);
    });

    s.on('disconnect', () => setIsConnected(false));

    return () => {
      s.disconnect();
    };
  }, []);

  // Fetch room info and message history
  useEffect(() => {
    const load = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([
          api.get(`/rooms/${roomId}`),
          api.get(`/messages/${roomId}`),
        ]);
        setRoomInfo(roomRes.data);
        setMessages(msgRes.data);
      } catch {
        toast.error('Room not found or access denied');
        navigate('/dashboard');
      }
    };
    if (user) load();
  }, [roomId, user, navigate]);

  // WebRTC hook
  const {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    screenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC({
    socket,
    roomId,
    userId: user?._id,
    username: user?.username,
    avatarColor: user?.avatarColor,
  });

  // Socket events for chat and participants
  useEffect(() => {
    if (!socket) return;

    socket.on('participants-update', (list) => setParticipants(list));

    socket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user-joined', ({ username }) => {
      toast(`${username} joined the room`, { icon: '👋', duration: 3000 });
    });

    socket.on('user-left', ({ username }) => {
      toast(`${username} left`, { icon: '👋', duration: 2000 });
    });

    return () => {
      socket.off('participants-update');
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket]);

  const handleEndCall = useCallback(() => {
    socket?.emit('leave-room', { roomId });
    navigate('/dashboard');
    toast('You left the room', { icon: '👋' });
  }, [socket, roomId, navigate]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => toast.success('Room ID copied!'));
  };

  if (!roomInfo || !socket) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Connecting to room...</p>
      </div>
    );
  }

  return (
    <div className="room-page">
      {/* Room header */}
      <header className="room-header">
        <div className="room-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--gradient-primary)',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 8-6 4 6 4V8z"/>
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
              </svg>
            </div>
            <span className="room-title">{roomInfo.name || location.state?.roomName || 'Room'}</span>
          </div>
          <span className="room-id-badge" onClick={copyRoomId} title="Click to copy Room ID">
            {roomId.slice(0, 12)}...
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div className={`connection-status ${isConnected ? 'connected' : 'connecting'}`}>
            <div className="connection-dot" />
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {1 + peers.length} participant{peers.length !== 0 ? 's' : ''}
          </div>
          <div className="user-avatar" style={{ background: user?.avatarColor }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Room body */}
      <div className="room-body">
        <main className="room-main">
          <VideoGrid
            localStream={localStream}
            peers={peers}
            localUser={user}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            screenSharing={screenSharing}
          />

          <Controls
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            screenSharing={screenSharing}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreen={toggleScreenShare}
            onToggleSidebar={() => setSidebarOpen(p => !p)}
            sidebarOpen={sidebarOpen}
            onEndCall={handleEndCall}
          />
        </main>

        {sidebarOpen && (
          <ChatSidebar
            socket={socket}
            roomId={roomId}
            userId={user?._id}
            username={user?.username}
            avatarColor={user?.avatarColor}
            messages={messages}
            participants={participants}
            localSocketId={localSocketId}
            localAudio={audioEnabled}
            localVideo={videoEnabled}
          />
        )}
      </div>
    </div>
  );
};

export default RoomPage;
