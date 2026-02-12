import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVibe } from '../hooks/useVibe';
import SearchBar from '../components/Search/SearchBar';
import { useSocket } from '../context/SocketContext'; 
import QueueList from '../components/Queue/QueueList';
import InvisiblePlayer from '../components/Player/InvisiblePlayer';

const RoomPage = () => {
  const navigate = useNavigate();
  const { code } = useParams(); 
  const roomCode = code?.toUpperCase(); // Ensure uppercase for consistency
  const { socket } = useSocket();

  // ✅ Initialize from sessionStorage to prevent overlay on refresh
  const [hasInteracted, setHasInteracted] = useState(() => {
    return sessionStorage.getItem(`vibe_interacted_${roomCode}`) === 'true';
  });

  const { 
    castVote,
    queue, 
    removeSong, 
    viberCount,
    vibers,
    showVibers,
    setShowVibers,
    lastJoined,
    handleSongEnd,
    nowPlaying,
    isPremier
  } = useVibe();

  const handleLeaveRoom = () => {
    if (window.confirm("Are you sure you want to leave the vibe?")) {
      if (socket) {
        socket.emit('leave-room', { roomCode });
      }
      // Clean up session storage on manual leave if desired
      sessionStorage.removeItem(`vibe_interacted_${roomCode}`);
      navigate('/'); 
    }
  };

  const startPlayback = () => {
    setHasInteracted(true);
    // ✅ Save interaction state to specific room
    sessionStorage.setItem(`vibe_interacted_${roomCode}`, 'true'); 
    
    if (queue.length > 0 && !nowPlaying) {
      socket.emit('next-song', { roomCode });
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-black text-white overflow-hidden relative">
      
      {/* ✅ Interaction Overlay: Only shows if no interaction AND music is ready */}
      {!hasInteracted && queue.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter italic">THE VIBE IS READY</h2>
              <p className="text-zinc-400 text-lg">Your synchronized session is live. Tap below to enable real-time audio.</p>
            </div>
            
            <button 
              onClick={startPlayback}
              className="group relative w-full overflow-hidden rounded-2xl bg-purple-600 px-8 py-6 transition-all hover:bg-purple-500 active:scale-95 shadow-[0_0_40px_rgba(147,51,234,0.3)]"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 font-black text-2xl uppercase tracking-widest">
                <span>🚀 JOIN & SYNC</span>
              </div>
            </button>
            
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold">Autoplay Permissions Required</p>
          </div>
        </div>
      )}

      <div className="flex-1 transition-all duration-500 ease-in-out relative flex flex-col w-full">
        
        {lastJoined && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-400 px-6 py-3 rounded-2xl shadow-2xl z-50 animate-bounce border border-white/20">
            <span className="font-bold">✨ {lastJoined}</span> joined!
          </div>
        )}

        <header className="p-6 border-b border-white/5 flex justify-between items-center backdrop-blur-md sticky top-0 z-10 bg-black/50">
          <div className="flex items-center gap-4">
            <button onClick={handleLeaveRoom} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em]">Live Vibe</h2>
              <h1 className="text-xl font-bold uppercase">{roomCode}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowVibers(!showVibers)}
              className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-sm font-medium transition-colors border border-white/10 relative"
            >
              👥 <span className="text-purple-400 font-bold ml-1">{viberCount}</span>
            </button>
            
            {isPremier && (
              <div className="hidden md:block bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-xl text-[10px] font-black tracking-tighter shadow-lg shadow-purple-500/20">
                PREMIER
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12">
          <section className="space-y-8">
            <h3 className="text-2xl font-bold tracking-tight">Add to Vibe</h3>
            <SearchBar roomCode={roomCode} />
          </section>

          <section className="space-y-8 pb-32">
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-bold tracking-tight">Up Next</h3>
              <span className="text-zinc-500 text-xs">{queue?.length || 0} tracks</span>
            </div>
            <QueueList 
              queue={queue || []} 
              onRemove={(id) => removeSong(id)} 
              onVote={(id) => castVote(id)}
            />
          </section>
        </main>

        <InvisiblePlayer roomCode={roomCode} onEnd={handleSongEnd} />
      </div>

      <aside className={`
        fixed lg:relative top-0 right-0 h-full bg-zinc-950 border-l border-white/5 
        flex flex-col z-[150] transition-transform duration-500 ease-in-out
        ${showVibers ? 'translate-x-0 w-80 lg:w-1/5' : 'translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'}
      `}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h3 className="text-xl font-bold">Vibers</h3>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Real-time</p>
          </div>
          <button onClick={() => setShowVibers(false)} className="lg:hidden p-2 text-zinc-500 hover:text-white">✕</button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {vibers.map((v) => (
            <div key={v.id} className="flex items-center gap-3 group">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
              <span className="text-zinc-300 font-medium group-hover:text-white transition-colors uppercase text-xs tracking-wider">
                {v.name}
              </span>
            </div>
          ))}
        </div>
      </aside>
      

      {showVibers && (
        <div className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-sm" onClick={() => setShowVibers(false)} />
      )}
    </div>
  );
};

export default RoomPage;