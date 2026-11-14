import React, { useState } from 'react';
import { Play, Shuffle, ArrowLeft, Disc3 } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useQueueStore } from '../../stores/queueStore';
import { usePlayerStore } from '../../stores/playerStore';
import { Album, Track } from '../../types';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const AlbumsView: React.FC = () => {
  const { albums, tracks } = useLibraryStore();
  const { setQueue } = useQueueStore();
  const { playTrack, currentTrack } = usePlayerStore();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  if (selectedAlbum) {
    const albumTracks = tracks.filter((t) => t.album === selectedAlbum.title);

    return (
      <div className="flex-1 overflow-y-auto p-8 space-y-6 select-none">
        <button
          onClick={() => setSelectedAlbum(null)}
          className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Albums</span>
        </button>

        {/* Album Header */}
        <div className="flex items-end gap-6 pb-6 border-b border-border/60">
          <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shadow-xl z-10">
            <Disc3 className="w-24 h-24 opacity-60" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">Album</span>
            <h2 className="text-3xl font-extrabold text-text">{selectedAlbum.title}</h2>
            <p className="text-sm text-text-muted">
              By <span className="font-semibold text-text">{selectedAlbum.album_artist}</span>
              {selectedAlbum.year ? ` • ${selectedAlbum.year}` : ''} • {albumTracks.length} tracks
            </p>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setQueue(albumTracks, 0)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-primary-text font-semibold text-xs shadow-md transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Album</span>
              </button>
              <button
                onClick={() => {
                  const shuffled = [...albumTracks].sort(() => Math.random() - 0.5);
                  setQueue(shuffled, 0);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover border border-border text-text font-semibold text-xs transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tracklist */}
        <div className="space-y-1">
          {albumTracks.map((track, idx) => {
            const isPlayingThis = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => setQueue(albumTracks, idx)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-colors ${
                  isPlayingThis ? 'bg-primary/10 text-primary' : 'hover:bg-surface-hover text-text'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center text-xs text-text-subtle group-hover:hidden">
                    {track.track_number || idx + 1}
                  </span>
                  <Play className="w-4 h-4 text-primary fill-current hidden group-hover:block" />
                  <div>
                    <p className={`text-sm font-semibold ${isPlayingThis ? 'text-primary' : 'text-text'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-text-muted">{track.artist}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-text-subtle">{formatDuration(track.duration)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 select-none">
      <div>
        <h2 className="text-2xl font-bold text-text">Albums</h2>
        <p className="text-xs text-text-muted mt-0.5">{albums.length} albums in your collection</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => setSelectedAlbum(album)}
            className="group p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="relative mb-3 aspect-square rounded-xl overflow-hidden">
              <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                <Disc3 className="w-1/2 h-1/2 opacity-60" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const albumTracks = tracks.filter((t) => t.album === album.title);
                  if (albumTracks.length > 0) setQueue(albumTracks, 0);
                }}
                className="absolute right-2.5 bottom-2.5 w-11 h-11 rounded-full bg-primary text-primary-text shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center active:scale-95"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            </div>
            <h4 className="font-bold text-sm text-text truncate mb-0.5">{album.title}</h4>
            <p className="text-xs text-text-muted truncate">{album.album_artist}</p>
            {album.year && <p className="text-[11px] text-text-subtle mt-0.5">{album.year}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
