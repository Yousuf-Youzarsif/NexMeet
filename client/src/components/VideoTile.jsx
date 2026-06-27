import { useEffect, useRef } from 'react';

const VideoTile = ({ stream, username, avatarColor, isLocal, audioEnabled = true, videoEnabled = true, screenSharing = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoEnabled, screenSharing]);

  const initials = username?.[0]?.toUpperCase() || '?';

  return (
    <div className={`video-tile ${isLocal ? 'local' : ''}`}>
      {/* Video element */}
      {stream && (videoEnabled || screenSharing) ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{ transform: isLocal && !screenSharing ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="video-tile-overlay">
          <div className="video-tile-avatar" style={{ background: avatarColor || '#6c63ff' }}>
            {initials}
          </div>
        </div>
      )}

      {/* Name + badges overlay */}
      <div className="video-tile-info">
        <span className="video-tile-name">
          {username}{isLocal ? ' (You)' : ''}
        </span>
        <div className="video-tile-badges">
          {!audioEnabled && (
            <div className="media-badge off" title="Muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" x2="22" y1="2" y2="22"/>
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                <path d="M5 10v2a7 7 0 0 0 12 5"/>
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
          )}
          {!videoEnabled && (
            <div className="media-badge off" title="Camera off">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 8-6 4 6 4V8z"/>
                <path d="M2 8h14v11H2z"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
            </div>
          )}
          {screenSharing && (
            <div className="media-badge" title="Screen sharing" style={{ background: 'rgba(108,99,255,0.7)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="15" x="2" y="3" rx="2"/>
                <polyline points="8 21 12 17 16 21"/>
                <line x1="12" x2="12" y1="17" y2="21"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
