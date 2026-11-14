import React, { useState, useMemo } from 'react';
import {
  Play,
  Heart,
  Star,
  ListPlus,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  MoreHorizontal,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useQueueStore } from '../../stores/queueStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { Track } from '../../types';
import { Disc3 } from 'lucide-react';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const SongsView: React.FC = () => {
  const { tracks, filterText, selectedGenre, sortBy, sortDirection, setSort, toggleFavorite, setRating, updateMetadata } =
    useLibraryStore();
  const { currentTrack, playTrack, isPlaying } = usePlayerStore();
  const { setQueue, addToQueue, playNext } = useQueueStore();
  const { playlists, addTracksToPlaylist } = usePlaylistStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editYear, setEditYear] = useState<number | undefined>(undefined);

  // Filtered & Sorted Tracks
  const displayTracks = useMemo(() => {
    let result = [...tracks];

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          (t.genre && t.genre.toLowerCase().includes(q))
      );
    }

    if (selectedGenre) {
      result = result.filter((t) => t.genre === selectedGenre);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'artist':
          cmp = a.artist.localeCompare(b.artist);
          break;
        case 'album':
          cmp = a.album.localeCompare(b.album);
          break;
        case 'duration':
          cmp = a.duration - b.duration;
          break;
        case 'date_added':
          cmp = a.date_added.localeCompare(b.date_added);
          break;
        case 'year':
          cmp = (a.year || 0) - (b.year || 0);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [tracks, filterText, selectedGenre, sortBy, sortDirection]);

  const toggleSelectAll = () => {
    if (selectedIds.length === displayTracks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayTracks.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openEditor = (track: Track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditAlbum(track.album);
    setEditGenre(track.genre || '');
    setEditYear(track.year);
  };

  const handleSaveMetadata = async () => {
    if (!editingTrack) return;
    await updateMetadata(
      editingTrack.id,
      editTitle.trim(),
      editArtist.trim(),
      editAlbum.trim(),
      editGenre.trim() || undefined,
      editYear
    );
    setEditingTrack(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none">
      {/* Header Bar */}
      <div className="p-6 pb-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-text">Songs</h2>
          <p className="text-xs text-text-muted mt-0.5">{displayTracks.length} tracks available</p>
        </div>

        {/* Multi-Select Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-surface border border-primary/40 px-3 py-1.5 rounded-xl shadow-md">
            <span className="text-xs font-semibold text-primary">{selectedIds.length} selected</span>
            <button
              onClick={() => {
                const selectedTracks = tracks.filter((t) => selectedIds.includes(t.id));
                addToQueue(selectedTracks);
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 bg-surface-hover hover:bg-primary/20 rounded text-xs font-medium text-text hover:text-primary transition-colors flex items-center gap-1"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Queue</span>
            </button>

            {/* Playlist Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                className="px-2.5 py-1 bg-surface-hover hover:bg-primary/20 rounded text-xs font-medium text-text hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Add to Playlist</span>
              </button>
              {showPlaylistMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl p-1 z-30">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={async () => {
                        await addTracksToPlaylist(pl.id, selectedIds);
                        setShowPlaylistMenu(false);
                        setSelectedIds([]);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-text hover:bg-primary/20 hover:text-primary rounded truncate"
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-text-subtle hover:text-text px-2"
            >
              Deselect
            </button>
          </div>
        )}
      </div>

      {/* Track Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border text-text-subtle sticky top-0 bg-background z-10">
              <th className="py-2.5 px-3 w-8">
                <button onClick={toggleSelectAll} className="hover:text-text">
                  {selectedIds.length === displayTracks.length && displayTracks.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3 w-10">#</th>
              <th
                onClick={() => setSort('title')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-text"
              >
                <div className="flex items-center gap-1">
                  <span>Title</span>
                  {sortBy === 'title' && <ArrowUpDown className="w-3 h-3 text-primary" />}
                </div>
              </th>
              <th
                onClick={() => setSort('artist')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-text"
              >
                <div className="flex items-center gap-1">
                  <span>Artist</span>
                  {sortBy === 'artist' && <ArrowUpDown className="w-3 h-3 text-primary" />}
                </div>
              </th>
              <th
                onClick={() => setSort('album')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-text hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Album</span>
                  {sortBy === 'album' && <ArrowUpDown className="w-3 h-3 text-primary" />}
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold hidden lg:table-cell">Format</th>
              <th
                onClick={() => setSort('duration')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-text w-16 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Time</span>
                  {sortBy === 'duration' && <ArrowUpDown className="w-3 h-3 text-primary" />}
                </div>
              </th>
              <th className="py-2.5 px-3 w-16 text-center">Fav</th>
              <th className="py-2.5 px-3 w-28 text-center hidden xl:table-cell">Rating</th>
              <th className="py-2.5 px-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {displayTracks.map((track, idx) => {
              const isSelected = selectedIds.includes(track.id);
              const isPlayingThis = currentTrack?.id === track.id;

              return (
                <tr
                  key={track.id}
                  className={`group transition-colors ${
                    isPlayingThis
                      ? 'bg-primary/10 text-primary font-medium'
                      : isSelected
                      ? 'bg-primary/5'
                      : 'hover:bg-surface-hover text-text'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-2 px-3">
                    <button
                      onClick={() => toggleSelectOne(track.id)}
                      className="text-text-subtle hover:text-text"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                      )}
                    </button>
                  </td>

                  {/* Index / Play Button */}
                  <td className="py-2 px-3 text-text-subtle w-10">
                    <button
                      onClick={() => {
                        setQueue(displayTracks, idx);
                      }}
                      className="w-5 h-5 flex items-center justify-center cursor-pointer"
                    >
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block text-primary" />
                    </button>
                  </td>

                  {/* Title & Artwork */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                        <Disc3 className="w-5 h-5 opacity-60" />
                      </div>
                      <div className="truncate">
                        <span className={`font-semibold truncate block ${isPlayingThis ? 'text-primary' : ''}`}>
                          {track.title}
                        </span>
                        {track.genre && (
                          <span className="text-[10px] text-text-subtle">{track.genre}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Artist */}
                  <td className="py-2 px-3 text-text-muted truncate">{track.artist}</td>

                  {/* Album */}
                  <td className="py-2 px-3 text-text-muted truncate hidden md:table-cell">{track.album}</td>

                  {/* Format */}
                  <td className="py-2 px-3 hidden lg:table-cell">
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border/60 text-text-subtle">
                      {track.format} {track.bitrate ? `${track.bitrate}k` : ''}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-2 px-3 text-right font-mono text-text-muted">
                    {formatDuration(track.duration)}
                  </td>

                  {/* Favorite Heart */}
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => toggleFavorite(track.id)}
                      className={`p-1 transition-transform active:scale-125 ${
                        track.favorite ? 'text-rose-500 fill-rose-500' : 'text-text-subtle opacity-0 group-hover:opacity-100 hover:text-text'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${track.favorite ? 'fill-current' : ''}`} />
                    </button>
                  </td>

                  {/* 1-5 Star Rating */}
                  <td className="py-2 px-3 text-center hidden xl:table-cell">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(track.id, track.rating === star ? null : star)}
                          className={`p-0.5 ${
                            (track.rating || 0) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-border opacity-0 group-hover:opacity-60 hover:text-amber-300'
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Actions Menu */}
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditor(track)}
                        className="p-1 hover:text-primary"
                        title="Edit metadata"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => playNext(track)}
                        className="p-1 hover:text-primary"
                        title="Play next"
                      >
                        <ListPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Metadata Editor Modal */}
      {editingTrack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-text">Edit Track Metadata</h3>
            <p className="text-xs text-text-subtle">
              Updates PixelSong's local database record safely without altering audio file bytes.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-text-subtle mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-subtle mb-1">Artist</label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-subtle mb-1">Album</label>
                <input
                  type="text"
                  value={editAlbum}
                  onChange={(e) => setEditAlbum(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-subtle mb-1">Genre</label>
                  <input
                    type="text"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-subtle mb-1">Year</label>
                  <input
                    type="number"
                    value={editYear || ''}
                    onChange={(e) => setEditYear(parseInt(e.target.value) || undefined)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-text outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setEditingTrack(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMetadata}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-text text-xs font-semibold shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
