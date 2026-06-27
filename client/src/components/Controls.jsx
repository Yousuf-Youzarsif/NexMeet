const Controls = ({ audioEnabled, videoEnabled, screenSharing, onToggleAudio, onToggleVideo, onToggleScreen, onToggleSidebar, sidebarOpen, onEndCall }) => {
  return (
    <div className="controls-bar">
      <div className="controls-center">
        {/* Microphone */}
        <button
          id="btn-toggle-audio"
          className={`control-btn ${!audioEnabled ? 'off' : ''}`}
          onClick={onToggleAudio}
          data-tooltip={audioEnabled ? 'Mute mic' : 'Unmute mic'}
          aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {audioEnabled ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" x2="22" y1="2" y2="22"/>
              <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
              <path d="M5 10v2a7 7 0 0 0 12 5"/>
              <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          )}
        </button>

        {/* Camera */}
        <button
          id="btn-toggle-video"
          className={`control-btn ${!videoEnabled ? 'off' : ''}`}
          onClick={onToggleVideo}
          data-tooltip={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {videoEnabled ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 8-6 4 6 4V8z"/>
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 8-6 4 6 4V8z"/>
              <path d="M2 8h14v11H2z"/>
              <line x1="2" x2="22" y1="2" y2="22"/>
            </svg>
          )}
        </button>

        {/* Screen share */}
        <button
          id="btn-screen-share"
          className={`control-btn ${screenSharing ? 'active' : ''}`}
          onClick={onToggleScreen}
          data-tooltip={screenSharing ? 'Stop sharing' : 'Share screen'}
          aria-label={screenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="15" x="2" y="3" rx="2"/>
            <polyline points="8 21 12 17 16 21"/>
            <line x1="12" x2="12" y1="17" y2="21"/>
          </svg>
        </button>

        {/* Chat Toggle */}
        <button
          id="btn-toggle-sidebar"
          className={`control-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          data-tooltip={sidebarOpen ? 'Hide panel' : 'Show panel'}
          aria-label="Toggle chat sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        {/* End call */}
        <button
          id="btn-end-call"
          className="control-btn end-call"
          onClick={onEndCall}
          data-tooltip="Leave call"
          aria-label="Leave call"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.36 8.78 19.79 19.79 0 0 1 1.29 .2"/>
            <line x1="23" x2="1" y1="1" y2="23"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Controls;
