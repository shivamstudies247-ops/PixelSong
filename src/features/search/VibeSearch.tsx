import React, { useState, useMemo } from 'react';
import { Sparkles, Play, Search, X, Check, ArrowRight } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useQueueStore } from '../../stores/queueStore';
import { usePlayerStore } from '../../stores/playerStore';
import { Track } from '../../types';
import { Disc3 } from 'lucide-react';

interface VibeSearchProps {
  onClose: () => void;
}

export const VibeSearch: React.FC<VibeSearchProps> = ({ onClose }) => {
  const { tracks } = useLibraryStore();
  const { setQueue } = useQueueStore();
  const { currentTrack } = usePlayerStore();
  const [query, setQuery] = useState('');

  const sampleQueries = [
    'Short songs under 3 minutes',
    'Long epics over 6 minutes',
    'My favorite tracks',
    'Electronic vibes',
    'Songs from the 70s and 80s',
    'Top 5-star rated',
  ];

  const filteredTracks = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    let result = [...tracks];

    // Deterministic Natural Language Mappings (PRD Section 11.3)
    if (q.includes('short') || q.includes('under 3') || q.includes('quick')) {
      result = result.filter((t) => t.duration > 0 && t.duration <= 210);
    } else if (q.includes('long') || q.includes('epic') || q.includes('over 6') || q.includes('extended')) {
      result = result.filter((t) => t.duration >= 360);
    }

    if (q.includes('fav') || q.includes('starred') || q.includes('loved')) {
      result = result.filter((t) => t.favorite);
    }

    if (q.includes('5-star') || q.includes('top rated') || q.includes('best')) {
      result = result.filter((t) => (t.rating || 0) >= 4);
    }

    if (q.includes('electronic') || q.includes('synth') || q.includes('dance')) {
      result = result.filter((t) => (t.genre || '').toLowerCase().includes('electronic'));
    }

    if (q.includes('rock')) {
      result = result.filter((t) => (t.genre || '').toLowerCase().includes('rock'));
    }

    if (q.includes('jazz')) {
      result = result.filter((t) => (t.genre || '').toLowerCase().includes('jazz'));
    }

    if (q.includes('70s')) {
      result = result.filter((t) => t.year && t.year >= 1970 && t.year < 1980);
    } else if (q.includes('80s')) {
      result = result.filter((t) => t.year && t.year >= 1980 && t.year < 1990);
    } else if (q.includes('90s')) {
      result = result.filter((t) => t.year && t.year >= 1990 && t.year < 2000);
    } else if (q.includes('2000s')) {
      result = result.filter((t) => t.year && t.year >= 2000 && t.year < 2010);
    }

    // Artist name mentions
    for (const t of tracks) {
      if (q.includes(t.artist.toLowerCase())) {
        result = result.filter((item) => item.artist.toLowerCase() === t.artist.toLowerCase());
        break;
      }
    }

    return result;
  }, [query, tracks]);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4 select-none">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            type="text"
            placeholder="Type a vibe, e.g. 'short songs', 'favorite rock', '70s vibes'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text outline-none placeholder-text-subtle"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:text-text text-text-subtle">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-hover text-text-muted hover:text-text text-xs"
          >
            Esc
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2.5 bg-background/40 border-b border-border/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-text-subtle mr-1">Suggestions:</span>
          {sampleQueries.map((sq) => (
            <button
              key={sq}
              onClick={() => setQuery(sq)}
              className="px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] text-text-muted hover:text-primary hover:border-primary transition-colors whitespace-nowrap"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-text-subtle">
              <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-text">Deterministic Vibe Search</p>
              <p className="text-xs max-w-xs mx-auto mt-1">
                Searches your local collection based on duration, decade, genre, or favorite patterns without cloud AI.
              </p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="py-12 text-center text-text-subtle">
              <p className="text-sm font-semibold text-text">No matching songs found</p>
              <p className="text-xs mt-1">Try another description like &quot;favorites&quot; or &quot;rock&quot;.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold text-text-muted">
                  Found {filteredTracks.length} matching songs
                </span>
                <button
                  onClick={() => {
                    setQueue(filteredTracks, 0);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-text rounded-full text-xs font-semibold shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All Matches</span>
                </button>
              </div>

              <div className="space-y-1">
                {filteredTracks.map((track, idx) => {
                  const isPlayingThis = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setQueue(filteredTracks, idx);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isPlayingThis ? 'bg-primary/15 text-primary' : 'hover:bg-surface-hover text-text'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                          <Disc3 className="w-5 h-5 opacity-60" />
                        </div>
                        <div className="truncate">
                          <p className={`text-xs font-semibold truncate ${isPlayingThis ? 'text-primary' : ''}`}>
                            {track.title}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {track.artist} • {track.album}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {track.genre && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface text-text-subtle">
                            {track.genre}
                          </span>
                        )}
                        <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
