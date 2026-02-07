import React from 'react';
import { ChevronUp } from 'lucide-react';

const QueueItem = ({ song, onVote, rank }) => {
  return (
    <div className="group flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all hover:bg-zinc-800/50">
      {/* Rank Indicator */}
      <span className="text-zinc-600 font-black italic text-lg w-6">
        {rank}
      </span>

      {/* Thumbnail */}
      <img 
        src={song.thumbnail} 
        alt="" 
        className="w-14 h-14 rounded-xl object-cover shadow-lg"
      />

      {/* Song Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm truncate pr-2">{song.title}</h4>
        <p className="text-xs text-zinc-500 mt-1">
          {song.totalWeight || 0} points
        </p>
      </div>

      {/* Vote Button */}
      <button 
        onClick={() => onVote(song._id || song.videoId)}
        className="flex flex-col items-center justify-center bg-zinc-800 hover:bg-purple-600 p-3 rounded-xl transition-all group-hover:scale-105 active:scale-95"
      >
        <ChevronUp size={20} className="text-zinc-400 group-hover:text-white" />
        <span className="text-[10px] font-bold mt-1">VOTE</span>
      </button>
    </div>
  );
};

export default QueueItem;