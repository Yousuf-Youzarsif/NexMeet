import { useState, useRef, useEffect } from 'react';

const ChatSidebar = ({ socket, roomId, userId, username, avatarColor, messages, participants, localSocketId, localAudio, localVideo }) => {
  const [tab, setTab] = useState('chat');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socket) return;
    socket.emit('send-message', { roomId, text, userId, username, avatarColor });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="chat-sidebar">
      {/* Header tabs */}
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-tabs">
          <button
            id="tab-chat"
            className={`chat-sidebar-tab ${tab === 'chat' ? 'active' : ''}`}
            onClick={() => setTab('chat')}
          >
            Chat
          </button>
          <button
            id="tab-people"
            className={`chat-sidebar-tab ${tab === 'people' ? 'active' : ''}`}
            onClick={() => setTab('people')}
          >
            People ({participants.length})
          </button>
        </div>
      </div>

      {tab === 'chat' ? (
        <>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <div style={{ fontSize: '13px' }}>No messages yet. Say hi!</div>
              </div>
            )}
            {messages.map((msg, i) => (
              msg.type === 'system' ? (
                <div key={i} className="chat-message system">
                  <div className="msg-content">{msg.text}</div>
                </div>
              ) : (
                <div key={i} className="chat-message">
                  <div
                    className="msg-avatar"
                    style={{ background: msg.senderColor || '#6c63ff' }}
                  >
                    {msg.senderName?.[0]?.toUpperCase()}
                  </div>
                  <div className="msg-body">
                    <div className="msg-meta">
                      <span className="msg-sender" style={{ color: msg.senderColor || '#6c63ff' }}>
                        {msg.senderName}
                      </span>
                      <span className="msg-time">{formatTime(msg.createdAt)}</span>
                    </div>
                    <div className="msg-text">{msg.text}</div>
                  </div>
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <textarea
                id="chat-input"
                className="chat-input"
                placeholder="Send a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                id="btn-send-message"
                className="chat-send-btn"
                onClick={sendMessage}
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" x2="11" y1="2" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="participants-list">
          {participants.map((p) => {
            const isMe = p.socketId === localSocketId;
            return (
              <div key={p.socketId} className="participant-item">
                <div
                  className="user-avatar"
                  style={{ background: p.avatarColor || '#6c63ff', width: 32, height: 32, fontSize: 13 }}
                >
                  {p.username?.[0]?.toUpperCase()}
                </div>
                <span className="participant-name">{p.username}</span>
                {isMe && <span className="participant-you-badge">You</span>}
                <div className="participant-media-icons">
                  {isMe ? (
                    <>
                      {!localAudio && (
                        <svg className="icon-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="2" x2="22" y1="2" y2="22"/>
                          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                          <path d="M5 10v2a7 7 0 0 0 12 5"/>
                          <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
                          <line x1="12" x2="12" y1="19" y2="22"/>
                        </svg>
                      )}
                      {!localVideo && (
                        <svg className="icon-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m22 8-6 4 6 4V8z"/>
                          <path d="M2 8h14v11H2z"/>
                          <line x1="2" x2="22" y1="2" y2="22"/>
                        </svg>
                      )}
                    </>
                  ) : (
                    <>
                      {!p.audioEnabled && (
                        <svg className="icon-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="2" x2="22" y1="2" y2="22"/>
                          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                          <path d="M5 10v2a7 7 0 0 0 12 5"/>
                          <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
                          <line x1="12" x2="12" y1="19" y2="22"/>
                        </svg>
                      )}
                      {!p.videoEnabled && (
                        <svg className="icon-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m22 8-6 4 6 4V8z"/>
                          <path d="M2 8h14v11H2z"/>
                          <line x1="2" x2="22" y1="2" y2="22"/>
                        </svg>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default ChatSidebar;
