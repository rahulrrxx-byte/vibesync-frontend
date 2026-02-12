import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const useVibe = () => {
  const { socket, queue, setQueue, nowPlaying, setNowPlaying } = useSocket();
  const { user } = useAuth();
  const { code } = useParams(); // URL usually has :code
  const roomCode = code?.toUpperCase();
  
  const [vibers, setVibers] = useState([]);
  const [showVibers, setShowVibers] = useState(false);
  const [lastJoined, setLastJoined] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/rooms/${roomCode}`);
        setQueue(res.data.queue || []);
        setNowPlaying(res.data.nowPlaying || null);
      } catch (err) { 
        console.error("Initial Load Error:", err); 
      }
    };

    if (roomCode) fetchInitialData();

    if (socket && roomCode && user) {
      socket.emit('join-room', { roomCode, userName: user.name });

      socket.on('update-queue', (data) => {
        setQueue(data.queue || []);
        setNowPlaying(data.nowPlaying || null); 
      });

      socket.on('update-vibers', (data) => {
        setVibers(data.users || []); // ✅ This updates the 0 vibers issue
        if (data.newUser && data.newUser !== user.name) {
          setLastJoined(data.newUser);
          setTimeout(() => setLastJoined(null), 3000); 
        }
      });

      socket.on('error-msg', (err) => alert(err.message));
    }

    return () => {
      socket?.off('update-queue');
      socket?.off('update-vibers');
      socket?.off('error-msg');
    };
  }, [socket, roomCode, user, setQueue, setNowPlaying, API_BASE_URL]);

  const castVote = useCallback((songId) => {
    if (socket && roomCode && user) {
      socket.emit('vote-song', { roomCode, songId, userId: user._id });
    }
  }, [socket, roomCode, user]);

  const addSongToQueue = (song) => {
    if (socket && roomCode) {
      socket.emit('add-song', { 
        roomCode, 
        songData: { 
          videoId: song.videoId, 
          title: song.title, 
          thumbnail: song.thumbnail,
          addedBy: user?.name || 'Guest',
          votes: [],
          totalWeight: 0
        } 
      });
    }
  };

  return { 
    castVote,
    queue, 
    removeSong: (songId) => socket?.emit('remove-song', { roomCode, songId }),
    nowPlaying, 
    setShowVibers, 
    vibers, 
    showVibers, 
    lastJoined, 
    handleSongEnd: () => socket?.emit('next-song', { roomCode }),
    addSongToQueue,
    socket,
    viberCount: vibers.length, // ✅ Dynamic count
    isPremier: user?.membershipStatus === 'premier' 
  };
};