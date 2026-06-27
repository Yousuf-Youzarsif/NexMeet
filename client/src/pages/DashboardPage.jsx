import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreated = (room) => {
    setRooms(prev => [room, ...prev]);
    // Navigate immediately since we're the host
    navigate(`/room/${room.roomId}`, { state: { roomName: room.name } });
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Close room "${room.name}"?`)) return;
    try {
      await api.delete(`/rooms/${room.roomId}`);
      setRooms(prev => prev.filter(r => r.roomId !== room.roomId));
      toast.success('Room closed');
    } catch {
      toast.error('Failed to close room');
    }
  };

  const handleDirectJoin = async (e) => {
    e.preventDefault();
    const id = roomIdInput.trim();
    if (!id) return;
    try {
      const res = await api.get(`/rooms/${id}`);
      setJoiningRoom(res.data);
      setRoomIdInput('');
    } catch {
      toast.error('Room not found');
    }
  };

  const copyRoomLink = (roomId) => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link).then(() => toast.success('Link copied!'));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            Hello, <span className="text-gradient">{user?.username}</span> 👋
          </h1>
          <p className="dashboard-subtitle">Create or join a private video room</p>
        </div>
        <div className="dashboard-actions">
          <button id="btn-create-room" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5v14"/>
            </svg>
            New Room
          </button>
        </div>
      </div>

      {/* Quick join by room ID */}
      <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
          🔗 Join by Room ID
        </h3>
        <form onSubmit={handleDirectJoin} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <input
            id="room-id-input"
            className="form-input"
            type="text"
            placeholder="Paste room ID here..."
            value={roomIdInput}
            onChange={e => setRoomIdInput(e.target.value)}
          />
          <button id="btn-direct-join" type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
            Join
          </button>
        </form>
      </div>

      {/* Rooms list */}
      <div className="rooms-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 8-6 4 6 4V8z"/>
          <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
        </svg>
        Active Rooms
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>
          ({rooms.length})
        </span>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <div className="spinner" />
          <p className="text-muted mt-md">Loading rooms...</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏠</div>
              <div className="empty-state-title">No rooms yet</div>
              <p style={{ fontSize: 14 }}>Create your first private room and invite your team!</p>
              <button className="btn btn-primary mt-md" onClick={() => setShowCreate(true)}>
                Create Room
              </button>
            </div>
          ) : (
            rooms.map(room => {
              const isHost = room.host?._id === user?._id || room.host === user?._id;
              return (
                <div key={room.roomId} className="glass-card room-card" id={`room-card-${room.roomId}`}>
                  <div className="room-card-header">
                    <div>
                      <div className="room-card-name">{room.name}</div>
                      <div className="room-card-host">by {room.host?.username}</div>
                    </div>
                    <div className="room-badge room-badge-private">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect width="18" height="11" x="3" y="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Private
                    </div>
                  </div>

                  <div className="room-card-stats">
                    <div className="room-card-stat">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Max {room.maxParticipants}
                    </div>
                    <div className="room-card-stat">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                        <line x1="16" x2="16" y1="2" y2="6"/>
                        <line x1="8" x2="8" y1="2" y2="6"/>
                        <line x1="3" x2="21" y1="10" y2="10"/>
                      </svg>
                      {formatDate(room.createdAt)}
                    </div>
                  </div>

                  <div className="room-card-actions">
                    <button
                      id={`btn-join-room-${room.roomId}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setJoiningRoom(room)}
                    >
                      Join Room
                    </button>
                    <button
                      id={`btn-copy-link-${room.roomId}`}
                      className="btn btn-secondary btn-sm btn-icon"
                      onClick={() => copyRoomLink(room.roomId)}
                      title="Copy invite link"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                    </button>
                    {isHost && (
                      <button
                        id={`btn-delete-room-${room.roomId}`}
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleDelete(room)}
                        title="Close room"
                        style={{ color: 'var(--danger)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {joiningRoom && (
        <JoinRoomModal
          room={joiningRoom}
          onClose={() => setJoiningRoom(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
