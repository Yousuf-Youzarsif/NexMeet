import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const JoinRoomModal = ({ room, onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter the room password');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/rooms/${room.roomId}/verify`, { password });
      navigate(`/room/${room.roomId}`, { state: { roomName: room.name } });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wrong password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card modal-card">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Join Room</h2>
            <p className="text-muted text-sm mt-sm">{room.name}</p>
          </div>
          <button className="modal-close" onClick={onClose} id="btn-close-join-modal">✕</button>
        </div>

        <form className="modal-form" onSubmit={handleJoin}>
          <div className="form-group">
            <label className="form-label" htmlFor="join-password-input">Room Password</label>
            <div className="form-input-icon-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="join-password-input"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter room password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)' }}>
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button id="btn-join-room-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Joining...' : '🚀 Join Now'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div className="flex gap-md" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>🏠 Host: <strong style={{ color: 'var(--text-primary)' }}>{room.host?.username}</strong></span>
            <span>👥 Max: <strong style={{ color: 'var(--text-primary)' }}>{room.maxParticipants}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
