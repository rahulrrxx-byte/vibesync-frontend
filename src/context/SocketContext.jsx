import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [queue, setQueue] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);

useEffect(() => {
    if (token) {
      // ✅ Define the socket FIRST
      const newSocket = io(import.meta.env.VITE_API_URL, {
  auth: { token },
  transports: ['websocket'] // ✅ Forces a faster connection
});

      setSocket(newSocket);

      // ✅ Now set up the listeners
      newSocket.on('update-queue', (data) => {
        if (data.queue) setQueue(data.queue);
        if (data.nowPlaying) setNowPlaying(data.nowPlaying);
        
        // Automation: If nothing is playing, set it
        if (!nowPlaying && data.nowPlaying) {
          setNowPlaying(data.nowPlaying);
        }
      });

      return () => {
        newSocket.off('update-queue');
        newSocket.close();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      queue, 
      setQueue, 
      nowPlaying, 
      setNowPlaying 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);