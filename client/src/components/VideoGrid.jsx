import VideoTile from './VideoTile';

const VideoGrid = ({ localStream, peers, localUser, audioEnabled, videoEnabled, screenSharing }) => {
  const totalCount = 1 + peers.length;
  const clampedCount = Math.min(totalCount, 9);

  return (
    <div className="video-grid" data-count={clampedCount}>
      {/* Local video always first */}
      <VideoTile
        stream={localStream}
        username={localUser?.username}
        avatarColor={localUser?.avatarColor}
        isLocal={true}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        screenSharing={screenSharing}
      />

      {/* Remote peers */}
      {peers.map((peer) => (
        <VideoTile
          key={peer.socketId}
          stream={peer.stream}
          username={peer.username}
          avatarColor={peer.avatarColor}
          isLocal={false}
          audioEnabled={peer.audioEnabled}
          videoEnabled={peer.videoEnabled}
          screenSharing={peer.screenSharing}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
