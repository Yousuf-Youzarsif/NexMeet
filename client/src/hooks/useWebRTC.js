import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';

/**
 * useWebRTC — Full mesh WebRTC hook
 * Supports group (N-way) and 1-on-1 calls
 * Uses ICE servers (STUN + TURN) for NAT traversal
 */
const useWebRTC = ({ socket, roomId, userId, username, avatarColor }) => {
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // socketId -> SimplePeer instance
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState([]); // [{ socketId, stream, username, avatarColor, audioEnabled, videoEnabled, screenSharing }]
  const [iceServers, setIceServers] = useState([
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);

  // ── Update peer state helper ───────────────────────────────────
  const updatePeer = useCallback((socketId, update) => {
    setPeers(prev => prev.map(p => p.socketId === socketId ? { ...p, ...update } : p));
  }, []);

  const removePeer = useCallback((socketId) => {
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].destroy();
      delete peersRef.current[socketId];
    }
    setPeers(prev => prev.filter(p => p.socketId !== socketId));
  }, []);

  // ── Create peer helper ─────────────────────────────────────────
  const createPeer = useCallback((socketId, initiator, remoteUsername, remoteAvatarColor) => {
    if (!localStreamRef.current) return null;

    const peer = new SimplePeer({
      initiator,
      stream: localStreamRef.current,
      trickle: true,
      config: { iceServers },
    });

    peer.on('signal', (signal) => {
      if (signal.type === 'offer') {
        socket.emit('offer', { offer: signal, to: socketId });
      } else if (signal.type === 'answer') {
        socket.emit('answer', { answer: signal, to: socketId });
      } else {
        socket.emit('ice-candidate', { candidate: signal, to: socketId });
      }
    });

    peer.on('stream', (remoteStream) => {
      setPeers(prev => {
        const existing = prev.find(p => p.socketId === socketId);
        if (existing) {
          return prev.map(p => p.socketId === socketId ? { ...p, stream: remoteStream } : p);
        }
        return [...prev, {
          socketId,
          stream: remoteStream,
          username: remoteUsername,
          avatarColor: remoteAvatarColor,
          audioEnabled: true,
          videoEnabled: true,
          screenSharing: false,
        }];
      });
    });

    peer.on('error', (err) => {
      console.warn(`Peer error [${socketId}]:`, err.message);
    });

    peer.on('close', () => {
      removePeer(socketId);
    });

    peersRef.current[socketId] = peer;
    return peer;
  }, [socket, iceServers, removePeer]);

  // ── Initialize local media ─────────────────────────────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        // Now join the room
        socket.emit('join-room', { roomId, userId, username, avatarColor });
      } catch (err) {
        console.error('Media error:', err);
        // Still join without media
        socket.emit('join-room', { roomId, userId, username, avatarColor });
      }
    };

    // Get ICE servers from server
    socket.on('ice-servers', (servers) => {
      setIceServers(servers);
    });

    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(peersRef.current).forEach(p => p.destroy());
      peersRef.current = {};
      setPeers([]);
      socket.emit('leave-room', { roomId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  // ── Socket events ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // People already in room when we join
    socket.on('existing-users', (users) => {
      users.forEach(({ socketId, username: un, avatarColor: ac }) => {
        if (!peersRef.current[socketId]) {
          // We are the new joiner; initiate offer
          const peer = createPeer(socketId, true, un, ac);
          if (peer) {
            setPeers(prev => {
              if (prev.find(p => p.socketId === socketId)) return prev;
              return [...prev, { socketId, stream: null, username: un, avatarColor: ac, audioEnabled: true, videoEnabled: true, screenSharing: false }];
            });
          }
        }
      });
    });

    // New user joined; they'll initiate offer
    socket.on('user-joined', ({ socketId, username: un, avatarColor: ac }) => {
      setPeers(prev => {
        if (prev.find(p => p.socketId === socketId)) return prev;
        return [...prev, { socketId, stream: null, username: un, avatarColor: ac, audioEnabled: true, videoEnabled: true, screenSharing: false }];
      });
    });

    // Receive offer — create answering peer
    socket.on('offer', ({ offer, from, username: un, avatarColor: ac }) => {
      let peer = peersRef.current[from];
      if (!peer) {
        peer = createPeer(from, false, un, ac);
        setPeers(prev => {
          if (prev.find(p => p.socketId === from)) return prev;
          return [...prev, { socketId: from, stream: null, username: un || 'Unknown', avatarColor: ac || '#6c63ff', audioEnabled: true, videoEnabled: true, screenSharing: false }];
        });
      }
      if (peer) peer.signal(offer);
    });

    socket.on('answer', ({ answer, from }) => {
      const peer = peersRef.current[from];
      if (peer) peer.signal(answer);
    });

    socket.on('ice-candidate', ({ candidate, from }) => {
      const peer = peersRef.current[from];
      if (peer) {
        try { peer.signal(candidate); } catch (_) {}
      }
    });

    socket.on('user-left', ({ socketId }) => {
      removePeer(socketId);
    });

    socket.on('user-toggle-audio', ({ socketId, enabled }) => {
      updatePeer(socketId, { audioEnabled: enabled });
    });

    socket.on('user-toggle-video', ({ socketId, enabled }) => {
      updatePeer(socketId, { videoEnabled: enabled });
    });

    socket.on('user-screen-share', ({ socketId, sharing }) => {
      updatePeer(socketId, { screenSharing: sharing });
    });

    return () => {
      socket.off('existing-users');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-left');
      socket.off('user-toggle-audio');
      socket.off('user-toggle-video');
      socket.off('user-screen-share');
    };
  }, [socket, createPeer, removePeer, updatePeer]);

  // ── Toggle audio ───────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
      socket?.emit('toggle-audio', { roomId, enabled: audioTrack.enabled });
    }
  }, [socket, roomId]);

  // ── Toggle video ───────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
      socket?.emit('toggle-video', { roomId, enabled: videoTrack.enabled });
    }
  }, [socket, roomId]);

  // ── Screen sharing ─────────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    if (screenSharing) {
      // Stop screen share, revert to camera
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = cameraStream;
        setLocalStream(cameraStream);

        // Replace track in all peers
        const videoTrack = cameraStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer._pc?.getSenders?.().find(s => s.track?.kind === 'video');
          if (sender && videoTrack) sender.replaceTrack(videoTrack);
        });

        setScreenSharing(false);
        socket?.emit('screen-share-stopped', { roomId });
      } catch (_) {}
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        localStreamRef.current?.getVideoTracks().forEach(t => t.stop());

        // Replace track in all peers
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer._pc?.getSenders?.().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        // Update local stream video track
        const newStream = new MediaStream([
          ...(localStreamRef.current?.getAudioTracks() || []),
          screenTrack,
        ]);
        localStreamRef.current = newStream;
        setLocalStream(newStream);

        // Auto-stop when user stops from browser UI
        screenTrack.onended = () => {
          setScreenSharing(false);
          socket?.emit('screen-share-stopped', { roomId });
        };

        setScreenSharing(true);
        socket?.emit('screen-share-started', { roomId });
      } catch (err) {
        console.warn('Screen share error:', err);
      }
    }
  }, [screenSharing, socket, roomId]);

  return {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    screenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};

export default useWebRTC;
