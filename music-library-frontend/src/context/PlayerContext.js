import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [queue,       setQueue]       = useState([]);   // songs array
  const [currentIdx,  setCurrentIdx]  = useState(-1);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isRepeat,    setIsRepeat]    = useState(false);
  const [isShuffle,   setIsShuffle]   = useState(false);
  const audioRef = useRef(null);

  const currentSong = queue[currentIdx] || null;

  const playQueue = useCallback((songs, startIdx = 0) => {
    setQueue(songs);
    setCurrentIdx(startIdx);
    setIsPlaying(true);
    // Force reset time if needed via audioRef
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, []);

  const playNext = useCallback(() => {
    if (!queue.length) return;
    
    let nextIdx = currentIdx;
    if (isShuffle && queue.length > 1) {
      while (nextIdx === currentIdx) {
        nextIdx = Math.floor(Math.random() * queue.length);
      }
      setCurrentIdx(nextIdx);
    } else if (currentIdx < queue.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else if (isRepeat) {
      setCurrentIdx(0);
      // If same song, restart it manually
      if (currentIdx === 0 && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      setIsPlaying(false);
    }
  }, [queue, currentIdx, isShuffle, isRepeat]);

  const playPrev = useCallback(() => {
    if (!queue.length) return;
    
    // If more than 3 seconds in, just restart the song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else if (isRepeat) {
      setCurrentIdx(queue.length - 1);
    }
  }, [queue, currentIdx, isRepeat]);

  const togglePlay = useCallback(() => setIsPlaying((v) => !v), []);
  const toggleRepeat = useCallback(() => setIsRepeat((v) => !v), []);
  const toggleShuffle = useCallback(() => setIsShuffle((v) => !v), []);

  const stopPlayer = useCallback(() => {
    setIsPlaying(false);
    setCurrentIdx(-1);
    setQueue([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, []);

  return (
    <PlayerContext.Provider value={{
      queue, currentIdx, currentSong, isPlaying, isRepeat, isShuffle, audioRef,
      playQueue, playNext, playPrev, togglePlay, toggleRepeat, toggleShuffle, stopPlayer,
      setIsPlaying,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
