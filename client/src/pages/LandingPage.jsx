import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🎥', title: 'HD Video Calls', desc: 'Crystal-clear WebRTC peer-to-peer video for 1-on-1 and group calls up to 20 people.' },
  { icon: '🔒', title: 'Private Rooms', desc: 'Every room is password-protected. Only people with the invite link and password can join.' },
  { icon: '🖥️', title: 'Screen Sharing', desc: 'Share your entire screen, a window, or a browser tab with a single click.' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Built-in chat with persisted message history. Stay connected even when muted.' },
  { icon: '🌐', title: 'TURN/STUN Support', desc: 'Works behind firewalls and NAT using TURN relay servers for maximum connectivity.' },
  { icon: '👥', title: 'Group Calls', desc: 'Flexible adaptive video grid that automatically reorganizes based on the number of participants.' },
];

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <Navbar />

      <section className="hero-section">
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            WebRTC · MERN Stack · Private Rooms
          </div>

          <h1 className="hero-title">
            Video calls that feel
            <br />
            <span className="text-gradient">premium & private</span>
          </h1>

          <p className="hero-subtitle">
            NexMeet delivers crystal-clear HD video conferencing with password-protected
            private rooms, screen sharing, and real-time chat — built for teams that care about quality.
          </p>

          <div className="hero-cta-group">
            {user ? (
              <Link id="cta-go-dashboard" to="/dashboard" className="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link id="cta-get-started" to="/auth" className="btn btn-primary btn-lg">
                  Get Started Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
                <Link to="/auth" className="btn btn-secondary btn-lg">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Preview card */}
        <div style={{
          marginTop: '60px',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          maxWidth: '800px',
          width: '100%',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', aspectRatio: '16/7' }}>
            {['#6c63ff', '#00d2d3', '#ff6584', '#43d9ad'].map((color, i) => (
              <div key={i} style={{
                background: `${color}22`,
                border: `1px solid ${color}44`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 800, color: 'white',
                  border: '3px solid rgba(255,255,255,0.2)',
                }}>
                  {['A', 'B', 'C', 'D'][i]}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {['Alex', 'Blake', 'Casey', 'Drew'][i]}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
          }}>
            {['🎤', '📷', '🖥️', '📞'].map((icon, i) => (
              <div key={i} style={{
                width: 44, height: 44,
                borderRadius: '50%',
                background: i === 3 ? 'linear-gradient(135deg,#ff4757,#c0392b)' : 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>
                {icon}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Everything you need for <span className="text-gradient-cyan">great calls</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '16px' }}>
            Built with modern WebRTC technology for the best possible experience
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="glass-card feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '13px',
      }}>
        Built with ❤️ using <strong style={{ color: 'var(--text-secondary)' }}>MERN + WebRTC</strong>
      </footer>
    </div>
  );
};

export default LandingPage;
