import React from "react";
import ReactPlayer from "react-player";
import { useVibe } from "../../hooks/useVibe"; // Change this

const InvisiblePlayer = ({ roomCode }) => {
  // Use useVibe so you get the synced 'nowPlaying' state
  const { nowPlaying, handleSongEnd, socket } = useVibe(); 

  const handleEnded = () => {
    console.log("Song ended, moving to next...");
    socket.emit("next-song", { roomCode });
  };

  if (!nowPlaying) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-zinc-900/90 backdrop-blur-md border-t border-white/10 flex items-center px-6 z-50">
      <div className="flex items-center gap-4 w-full max-w-4xl mx-auto">
        <img 
          src={nowPlaying.thumbnail} 
          className="w-10 h-10 rounded shadow-lg" 
          alt="" 
        />
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">Now Playing</p>
          <p className="text-sm truncate font-medium">{nowPlaying.title}</p>
        </div>        

        <div className="fixed bottom-20 right-6 z-[100] bg-black border-2 border-purple-500 rounded-lg overflow-hidden shadow-2xl">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${nowPlaying.videoId}`}
            playing={true}     
            muted={false}      
            volume={1} 
            controls={true} 
            width="320px"       
            height="180px"
            onEnded={handleSongEnd}
            config={{ 
            youtube: { 
            playerVars: { 
            autoplay: 1, 
            mute: 0,
            origin: window.location.origin
        } 
      } 
    }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvisiblePlayer;