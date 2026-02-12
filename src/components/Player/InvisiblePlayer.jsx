import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { useVibe } from "../../hooks/useVibe";
import { Maximize2, Minimize2 } from 'lucide-react'; // Optional: for visual toggle

const InvisiblePlayer = ({ roomCode }) => {
  const { nowPlaying, handleSongEnd } = useVibe(); 
  const [isExpanded, setIsExpanded] = useState(false); // Controls size on mobile

  if (!nowPlaying) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-zinc-900/90 backdrop-blur-md border-t border-white/10 flex items-center px-6 z-50">
      <div className="flex items-center gap-4 w-full max-w-4xl mx-auto">
        <img 
          src={nowPlaying.thumbnail} 
          className="w-10 h-10 rounded shadow-lg object-cover" 
          alt="" 
        />
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Now Playing</p>
          <p className="text-sm truncate font-medium">{nowPlaying.title}</p>
        </div>        

        {/* Video Container: Small and rounded by default on mobile */}
        <div className={`
          fixed transition-all duration-300 ease-in-out z-[100] bg-black border-2 border-purple-500 rounded-xl overflow-hidden shadow-2xl
          ${isExpanded 
            ? 'bottom-20 right-4 w-[320px] h-[180px]' 
            : 'bottom-20 right-4 w-16 h-16 md:w-[320px] md:h-[180px]'}
        `}>
          {/* Mobile Toggle Button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden absolute top-1 right-1 z-[110] bg-black/50 p-1 rounded-md text-white"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${nowPlaying.videoId}`}
            playing={true}     
            muted={false}      
            volume={1} 
            controls={isExpanded} // Only show controls when expanded on mobile
            width="100%"       
            height="100%"
            onEnded={handleSongEnd}
            config={{ 
              youtube: { 
                playerVars: { 
                  autoplay: 1, 
                  mute: 0,
                  origin: window.location.origin,
                  modestbranding: 1
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