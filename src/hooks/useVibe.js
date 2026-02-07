import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const useVibe = () => {
  const { socket, queue, setQueue, nowPlaying, setNowPlaying } = useSocket();
  const { user } = useAuth();
  const { id: roomCode } = useParams();
  
  const [vibers, setVibers] = useState([]);
  const [showVibers, setShowVibers] = useState(false);
  const [lastJoined, setLastJoined] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // ✅ UPDATED: Removed localhost. 
        // This now uses the baseURL set in AuthContext
        const res = await axios.get(`/api/rooms/${roomCode}`);
        setQueue(res.data.queue || []);
        setNowPlaying(res.data.nowPlaying || null);
      } catch (err) { 
        console.error("Refresh Load Error:", err); 
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
        setVibers(data.users);
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
  }, [socket, roomCode, user, setQueue, setNowPlaying]);

  // ... (rest of your functions like addSongToQueue, castVote, etc.)

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
    addSongToQueue: (song) => {
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
    },
    socket,
    viberCount: vibers.length,
    isPremier: user?.membershipStatus === 'premier' 
  };
};