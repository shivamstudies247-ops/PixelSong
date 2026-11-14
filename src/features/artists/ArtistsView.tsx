import React, { useState } from 'react';
import { Users, Play, ArrowLeft, Disc3 } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useQueueStore } from '../../stores/queueStore';
import { usePlayerStore } from '../../stores/playerStore';
import { Artist } from '../../types';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const ArtistsView: React.FC = () => {
  const { artists, tracks, albums } = useLibraryStore();
  const { setQueue } = useQueueStore();
  const { currentTrack } = usePlayerStore();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  if (selectedArtist) {
    const artistTracks = tracks.filter((t) => t.artist === selectedArtist.name);
    const artistAlbums = albums.filter((a) => a.album_artist === selectedArtist.name);

    return (
      <div className="flex-1 overflow-y-auto p-8 space-y-6 select-none">
        <button
          onClick={() => setSelectedArtist(null)}
          className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Artists</span>
        </button>

        {/* Artist Header */}
        <div className="flex items-center gap-6 pb-6 border-b border-border/60">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/30 flex items-center justify-center text-primary text-3xl font-bold shadow-lg">
            {selectedArtist.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">Artist Universe</span>
            <h2 className="text-3xl font-extrabold text-text">{selectedArtist.name}</h2>
            <p className="text-sm text-text-muted">
              {artistAlbums.length} albums • {artistTracks.length} tracks in local library
            </p>
            <button
              onClick={() => setQueue(artistTracks, 0)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-primary-text font-semibold text-xs shadow transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play All Tracks</span>
            </button>
          </div>
        </div>

        {/* Albums by this artist */}
        {artistAlbums.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-text mb-3">Albums</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artistAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => {
                    const albTracks = tracks.filter((t) => t.album === alb.title);
                    setQueue(albTracks, 0);
                  }}
                  className="p-3 bg-surface hover:bg-surface-hover border border-border/50 rounded-xl cursor-pointer group"
                >
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-2">
                    <Disc3 className="w-12 h-12 opacity-60" />
                  </div>
                  <p className="text-xs font-semibold text-text truncate">{alb.title}</p>
                  <p className="text-[11px] text-text-subtle">{alb.year || ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracks List */}
        <div>
          <h3 className="text-base font-bold text-text mb-3">All Tracks</h3>
          <div className="space-y-1">
            {artistTracks.map((track, idx) => {
              const isPlayingThis = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setQueue(artistTracks, idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-colors ${
                    isPlayingThis ? 'bg-primary/10 text-primary' : 'hover:bg-surface-hover text-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                      <Disc3 className="w-5 h-5 opacity-60" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isPlayingThis ? 'text-primary' : 'text-text'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-text-muted">{track.album}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-text-subtle">{formatDuration(track.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 select-none">
      <div>
        <h2 className="text-2xl font-bold text-text">Artists</h2>
        <p className="text-xs text-text-muted mt-0.5">{artists.length} artists in your library</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {artists.map((artist) => (
          <div
            key={artist.id}
            onClick={() => setSelectedArtist(artist)}
            className="group p-5 rounded-2xl bg-surface hover:bg-surface-hover border border-border/50 transition-all cursor-pointer flex flex-col items-center text-center shadow-sm hover:shadow-md"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/25 flex items-center justify-center text-primary text-2xl font-bold mb-4 group-hover:scale-105 transition-transform">
              {artist.name.charAt(0).toUpperCase()}
            </div>
            <h4 className="font-bold text-sm text-text truncate max-w-[150px] mb-1">{artist.name}</h4>
            <p className="text-xs text-text-muted">
              {artist.album_count} {artist.album_count === 1 ? 'album' : 'albums'} • {artist.track_count} tracks
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
