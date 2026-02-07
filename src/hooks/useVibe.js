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
        const res = await axios.get(`http://localhost:5000/api/rooms/${roomCode}`);
        setQueue(res.data.queue || []);
        setNowPlaying(res.data.nowPlaying || null);
      } catch (err) { console.error("Refresh Load Error:", err); }
    };

    if (roomCode) fetchInitialData();

    if (socket && roomCode && user) {
      // ✅ Pass user name when joining for tracking
      socket.emit('join-room', { roomCode, userName: user.name });

      socket.on('update-queue', (data) => {
      setQueue(data.queue || []);
      setNowPlaying(data.nowPlaying || null); // This forces the player to reload with the new videoId
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

  const removeSong = (songId) => {
    if (socket && roomCode) {
      socket.emit('remove-song', { roomCode, songId });
    }
  };

  const handleSongEnd = () => {
    socket.emit('next-song', { roomCode });
  };

const castVote = (songId) => {
  if (socket && roomCode && user) {
    console.log("Casting vote for song:", songId);
    socket.emit('vote-song', { 
      roomCode, 
      songId, 
      userId: user.id || user._id // ✅ Backend needs this to prevent double voting
    });
  } else {
    console.error("Missing socket, roomCode, or user for voting");
  }
};

  return { 
    queue, 
    castVote,
    nowPlaying, 
    vibers, 
    showVibers, 
    setShowVibers, 
    lastJoined, 
    handleSongEnd,
    addSongToQueue,
    removeSong,
    socket,
    viberCount: vibers.length,
    isPremier: user?.membershipStatus === 'premier' 
  };
};