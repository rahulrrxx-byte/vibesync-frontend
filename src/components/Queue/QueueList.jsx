import React from 'react';
import { ThumbsUp, Music } from 'lucide-react';

const QueueList = ({ queue, onVote }) => {
  if (!queue || queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
        <Music className="text-zinc-700 mb-4" size={48} />
        <p className="text-zinc-500">The queue is empty. Add a song!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((song, index) => (
        <div 
          key={song._id || index} // ✅ Changed to ._id
          className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group"
        >
          <div className="relative">
            <img src={song.thumbnail} className="w-14 h-14 rounded-xl object-cover shadow-lg" alt="" />
            <span className="absolute -top-2 -left-2 bg-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white/10">
              {index + 1}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold truncate text-sm">{song.title}</p>
            <p className="text-zinc-500 text-xs mt-1 capitalize">{song.addedBy || 'Guest'}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => onVote(song._id)} // ✅ Fixed typo and property name
              className="p-2 hover:bg-purple-500/20 rounded-full text-purple-400 transition-colors"
            >
              <ThumbsUp size={24} />
            </button>
            <span className="text-xs font-mono font-bold">
              {song.totalWeight || 0} {/* ✅ Changed to .totalWeight */}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QueueList;