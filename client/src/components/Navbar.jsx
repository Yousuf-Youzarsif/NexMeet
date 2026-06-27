import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 8-6 4 6 4V8z"/>
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
          </svg>
        </div>
        <span className="text-gradient">NexMeet</span>
      </Link>

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="text-muted text-sm" style={{ fontWeight: 600 }}>
              {user.username}
            </span>
            <div
              className="user-avatar"
              style={{ background: user.avatarColor }}
              title={user.username}
            >
              {user.username?.[0]?.toUpperCase()}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
