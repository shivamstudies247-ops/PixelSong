import React from 'react';
import { Play, Heart, Clock, Sparkles, FolderPlus, Disc3 } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useQueueStore } from '../../stores/queueStore';

interface HomeViewProps {
  onNavigate: (view: any) => void;
  onOpenFolderPicker: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenFolderPicker }) => {
  const { tracks, albums } = useLibraryStore();
  const { currentTrack, playTrack, isPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();

  const favoriteTracks = tracks.filter((t) => t.favorite);
  const recentTracks = tracks.slice(0, 6);

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mb-5 shadow-lg">
          <Disc3 className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Welcome to PixelSong</h2>
        <p className="text-text-muted max-w-md mb-6 text-sm">
          A premium offline music player for your Windows PC. Add your local music folders to start listening.
        </p>
        <button
          onClick={onOpenFolderPicker}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-text font-semibold text-sm transition-transform active:scale-95 shadow-md"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add Music Folder</span>
        </button>
      </div>
    );
  }

  const resumeTrack = currentTrack || tracks[0];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 select-none">
      {/* Quick Resume Hero Card */}
      {resumeTrack && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface to-background-secondary border border-border p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-5 z-10">
            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary">
              <Disc3 className="w-16 h-16 opacity-60" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-primary mb-1 block">
                Quick Resume
              </span>
              <h2 className="text-xl font-bold text-text truncate max-w-md">{resumeTrack.title}</h2>
              <p className="text-sm text-text-muted">{resumeTrack.artist} • {resumeTrack.album}</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (currentTrack?.id === resumeTrack.id) {
                usePlayerStore.getState().togglePlay();
              } else {
                setQueue(tracks, tracks.findIndex((t) => t.id === resumeTrack.id));
              }
            }}
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-primary-text flex items-center justify-center shadow-lg transition-transform active:scale-95 z-10"
            title="Resume playback"
          >
            {isPlaying && currentTrack?.id === resumeTrack.id ? (
              <span className="font-bold text-xl">❚❚</span>
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Featured Albums Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text">Albums in Library</h3>
          <button
            onClick={() => onNavigate('albums')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {albums.slice(0, 6).map((album) => (
            <div
              key={album.id}
              onClick={() => onNavigate('albums')}
              className="group p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border/50 transition-all cursor-pointer"
            >
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                  <Disc3 className="w-12 h-12 opacity-60" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const albumTracks = tracks.filter((t) => t.album === album.title);
                    if (albumTracks.length > 0) setQueue(albumTracks, 0);
                  }}
                  className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-primary text-primary-text shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
              <h4 className="font-semibold text-sm text-text truncate">{album.title}</h4>
              <p className="text-xs text-text-muted truncate">{album.album_artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Favorites & Recently Added */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorites */}
        <div className="p-5 rounded-2xl bg-surface border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h3 className="font-bold text-sm text-text">Favorites</h3>
            </div>
            <button
              onClick={() => onNavigate('favorites')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              See all ({favoriteTracks.length})
            </button>
          </div>

          <div className="space-y-2">
            {favoriteTracks.slice(0, 4).map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                  <Disc3 className="w-5 h-5 opacity-60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text truncate">{track.title}</p>
                  <p className="text-[11px] text-text-muted truncate">{track.artist}</p>
                </div>
                <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
              </div>
            ))}
            {favoriteTracks.length === 0 && (
              <p className="text-xs text-text-subtle py-4 text-center">No favorites yet. Click the heart icon on any song.</p>
            )}
          </div>
        </div>

        {/* Recently Added */}
        <div className="p-5 rounded-2xl bg-surface border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-text">Recently Added</h3>
            </div>
            <button
              onClick={() => onNavigate('songs')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View library
            </button>
          </div>

          <div className="space-y-2">
            {recentTracks.slice(0, 4).map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                  <Disc3 className="w-5 h-5 opacity-60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text truncate">{track.title}</p>
                  <p className="text-[11px] text-text-muted truncate">{track.artist}</p>
                </div>
                <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
