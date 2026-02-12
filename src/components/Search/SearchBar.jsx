import React, { useState } from 'react';
import { searchSongs } from '../../services/api';
import { Search, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useVibe } from '../../hooks/useVibe';

const SearchBar = ({ roomCode }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null); 

  // Pulling the add function from your custom hook
  const { addSongToQueue } = useVibe(); 

  const handleSearch = async (e, isAiSearch = false) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Calls your api.js service which points to the Render backend
      const { data } = await searchSongs(query, isAiSearch);
      setResults(data);
    } catch (err) {
      console.error("Search failed. Ensure your backend YouTube API key is set.");
      // Fallback/Mock data for testing UI if backend fails
      setResults([
        { videoId: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = (song) => {
    // This triggers the socket.emit('add-song') in useVibe.js
    addSongToQueue(song);
    setAddedId(song.videoId);
    
    // UI feedback: Reset after a short delay
    setTimeout(() => {
      setAddedId(null);
      setResults([]);
      setQuery('');
    }, 1500);
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={(e) => handleSearch(e)} className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search for a song..."
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {/* Results Dropdown/List */}
      <div className="space-y-3 mt-6">
        {loading && <p className="text-center text-zinc-500 animate-pulse text-sm">Searching YouTube...</p>}
        
        {results.map((song) => (
          <div key={song.videoId} className="flex items-center gap-4 bg-zinc-900/60 p-3 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
            <img src={song.thumbnail} className="w-14 h-14 rounded-xl object-cover shadow-lg" alt="" />
            
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate text-sm text-white">{song.title}</p>
              <p className="text-xs text-zinc-500 italic">YouTube Result</p>
            </div>

            <button 
              onClick={() => handleAddAction(song)}
              disabled={addedId === song.videoId}
              className={`p-3 rounded-xl transition-all active:scale-90 ${
                addedId === song.videoId 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
              }`}
            >
              {addedId === song.videoId ? <CheckCircle2 size={20} /> : <PlusCircle size={20} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;