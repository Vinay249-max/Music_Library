import React, { useEffect, useState } from 'react';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiRepeat, FiShuffle, FiX, FiVolume2
} from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext';
import { getFileUrl, formatDuration } from '../../utils/helpers';

const AudioPlayer = () => {
  const {
    currentSong, isPlaying, isRepeat, isShuffle,
    togglePlay, toggleRepeat, toggleShuffle,
    playNext, playPrev, stopPlayer, setIsPlaying,
    audioRef // Use shared ref from context
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]     = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  // Sync play/pause with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying, audioRef]);

  // Load new song when currentSong changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    
    const url = getFileUrl(currentSong.filePath);
    if (!url) return;
    
    // Stop current, reset progress
    audio.pause();
    setProgress(0);
    
    audio.src = url;
    audio.load();
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?._id, audioRef]);

  const handleTimeUpdate = () => {
    if (isSeeking) return; // Don't update while user is dragging
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
    setDuration(audio.duration);
  };

  const handleSeekChange = (e) => {
    const pct = Number(e.target.value);
    setProgress(pct);
  };

  const handleSeekEnd = (e) => {
    setIsSeeking(false);
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const pct = Number(e.target.value);
    audio.currentTime = (pct / 100) * audio.duration;
  };

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  if (!currentSong) return null;

  const artistNames = (Array.isArray(currentSong.artistId) && currentSong.artistId.length > 0)
    ? currentSong.artistId.map((a) => a?.artistName).filter(Boolean).join(', ') || '—'
    : '—';

  const coverPhoto = currentSong.albumId?.coverImage
    ? getFileUrl(currentSong.albumId.coverImage)
    : (Array.isArray(currentSong.artistId) && currentSong.artistId.length > 0 && currentSong.artistId[0]?.artistPhoto)
      ? getFileUrl(currentSong.artistId[0].artistPhoto)
      : null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={playNext}
      />

      <div className="player-bar">
        {/* Song info */}
        <div className="player-info">
          <div className="player-cover">
            {coverPhoto ? (
              <img 
                src={coverPhoto} 
                alt={currentSong.songName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
              />
            ) : (
              currentSong.songName?.[0]?.toUpperCase() || '♪'
            )}
          </div>
          <div className="player-meta">
            <div className="player-song-name">{currentSong.songName}</div>
            <div className="player-artist">{artistNames}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="player-center">
          <div className="player-controls">
            <button
              className={`ctrl-btn ${isShuffle ? 'ctrl-active' : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <FiShuffle size={16} pointerEvents="none" />
            </button>
            <button className="ctrl-btn" onClick={playPrev} title="Previous">
              <FiSkipBack size={18} pointerEvents="none" />
            </button>
            <button className="ctrl-btn ctrl-play" onClick={togglePlay}>
              {isPlaying ? <FiPause size={20} pointerEvents="none" /> : <FiPlay size={20} style={{ marginLeft: 2 }} pointerEvents="none" />}
            </button>
            <button className="ctrl-btn" onClick={playNext} title="Next">
              <FiSkipForward size={18} pointerEvents="none" />
            </button>
            <button
              className={`ctrl-btn ${isRepeat ? 'ctrl-active' : ''}`}
              onClick={toggleRepeat}
              title="Repeat"
            >
              <FiRepeat size={16} pointerEvents="none" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="player-progress">
            <span className="player-time">
              {formatDuration(audioRef.current?.currentTime || 0)}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={handleSeekEnd}
              onTouchStart={() => setIsSeeking(true)}
              onTouchEnd={handleSeekEnd}
              onChange={handleSeekChange}
              style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
            />
            <span className="player-time">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume + close */}
        <div className="player-right">
          <FiVolume2 size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: 80, accentColor: 'var(--accent-primary)' }}
          />
          <button className="btn btn-ghost btn-icon btn-sm" onClick={stopPlayer}>
            <FiX size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .player-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 80px;
          background: rgba(17,17,24,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-visible);
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 16px;
          z-index: 300;
        }
        .player-info {
          display: flex; align-items: center; gap: 12px;
          min-width: 200px; width: 200px;
          overflow: hidden;
        }
        .player-cover {
          width: 44px; height: 44px; border-radius: 8px;
          background: linear-gradient(135deg, var(--bg-elevated), var(--bg-overlay));
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .player-meta { overflow: hidden; }
        .player-song-name {
          font-size: 13px; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .player-artist {
          font-size: 11px; color: var(--text-secondary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .player-center {
          flex: 1;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          min-width: 0;
        }
        .player-controls {
          display: flex; align-items: center; gap: 8px;
        }
        .ctrl-btn {
          background: none; border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 50%;
          transition: all var(--transition-fast);
        }
        .ctrl-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }
        .ctrl-active { color: var(--accent-primary) !important; }
        .ctrl-play {
          background: var(--accent-primary);
          color: var(--text-inverse);
          width: 40px; height: 40px;
        }
        .ctrl-play:hover { background: #d4e83d; }
        .player-progress {
          display: flex; align-items: center; gap: 8px;
          width: 100%; max-width: 600px;
        }
        .player-time {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          width: 32px; text-align: center;
          flex-shrink: 0;
        }
        .player-right {
          display: flex; align-items: center; gap: 8px;
          min-width: 140px; justify-content: flex-end;
        }
        @media (max-width: 768px) {
          .player-info { min-width: 0; width: auto; }
          .player-right { display: none; }
        }
      `}</style>
    </>
  );
};

export default AudioPlayer;
