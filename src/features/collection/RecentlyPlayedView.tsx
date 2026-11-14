import React, { useState, useEffect } from 'react';
import { Clock, Play, Disc3 } from 'lucide-react';
import { api } from '../../services/tauriBridge';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useQueueStore } from '../../stores/queueStore';
import { PlayEvent, Track } from '../../types';

export const RecentlyPlayedView: React.FC = () => {
  const { tracks } = useLibraryStore();
  const { playTrack, currentTrack } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const [history, setHistory] = useState<PlayEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    api.getPlayHistory(50).then((hist) => {
      if (isMounted) setHistory(hist);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Map history to full track models where possible
  const recentTracks = history
    .map((h) => tracks.find((t) => t.id === h.track_id))
    .filter((t): t is Track => t !== undefined);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 select-none">
      <div className="flex items-center gap-4 pb-6 border-b border-border/60">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Recently Played</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Chronological log of songs played in this session and recent days
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {history.length === 0 ? (
          <div className="p-12 text-center text-text-subtle bg-surface border border-border rounded-2xl text-xs">
            No recently played music recorded yet. Start playing a track to see your history here.
          </div>
        ) : (
          history.map((item, idx) => {
            const track = tracks.find((t) => t.id === item.track_id);
            const isPlayingThis = currentTrack?.id === item.track_id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (track) playTrack(track);
                }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  isPlayingThis ? 'bg-primary/10 text-primary' : 'hover:bg-surface-hover text-text'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-5 text-center text-xs text-text-subtle font-mono">{idx + 1}</span>
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                    <Disc3 className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="truncate">
                    <p className={`text-sm font-semibold truncate ${isPlayingThis ? 'text-primary' : ''}`}>
                      {item.track_title || track?.title || 'Unknown Track'}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {item.artist_name || track?.artist || 'Unknown Artist'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-subtle font-mono">
                    {new Date(item.started_at).toLocaleDateString()}{' '}
                    {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
