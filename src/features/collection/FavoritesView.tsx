import React from 'react';
import { Heart, Play, Shuffle, Music2 } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useQueueStore } from '../../stores/queueStore';
import { usePlayerStore } from '../../stores/playerStore';
import { Disc3 } from 'lucide-react';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const FavoritesView: React.FC = () => {
  const { tracks, toggleFavorite } = useLibraryStore();
  const { setQueue } = useQueueStore();
  const { currentTrack } = usePlayerStore();

  const favoriteTracks = tracks.filter((t) => t.favorite);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex items-end justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-500/20 to-primary/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-lg">
            <Heart className="w-12 h-12 fill-current" />
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-rose-500">Collection</span>
            <h2 className="text-3xl font-extrabold text-text">Favorites</h2>
            <p className="text-xs text-text-muted">{favoriteTracks.length} starred songs</p>

            {favoriteTracks.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setQueue(favoriteTracks, 0)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-primary-text font-semibold text-xs shadow transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Favorites</span>
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...favoriteTracks].sort(() => Math.random() - 0.5);
                    setQueue(shuffled, 0);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover border border-border text-text font-semibold text-xs transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-1">
        {favoriteTracks.length === 0 ? (
          <div className="p-12 text-center text-text-subtle bg-surface border border-border rounded-2xl">
            <Heart className="w-10 h-10 mx-auto mb-3 opacity-30 text-rose-500" />
            <h3 className="text-sm font-semibold text-text">No Favorite Songs Yet</h3>
            <p className="text-xs mt-1 max-w-xs mx-auto">
              Click the heart icon next to any song in your library to add it here.
            </p>
          </div>
        ) : (
          favoriteTracks.map((track, idx) => {
            const isPlayingThis = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => setQueue(favoriteTracks, idx)}
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
                      {track.title}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {track.artist} • {track.album}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-text-subtle">{formatDuration(track.duration)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="p-1 text-rose-500 fill-rose-500 hover:scale-110 transition-transform"
                    title="Remove from favorites"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
