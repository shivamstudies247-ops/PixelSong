import React, { useState } from 'react';
import { ListMusic, Plus, Play, Shuffle, Trash2, ArrowUp, ArrowDown, X, Music2 } from 'lucide-react';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useQueueStore } from '../../stores/queueStore';
import { usePlayerStore } from '../../stores/playerStore';
import { Disc3 } from 'lucide-react';

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PlaylistsView: React.FC = () => {
  const {
    playlists,
    activePlaylist,
    activePlaylistTracks,
    createPlaylist,
    deletePlaylist,
    selectPlaylist,
    removeTrackFromPlaylist,
    reorderTracks,
  } = usePlaylistStore();

  const { setQueue } = useQueueStore();
  const { currentTrack } = usePlayerStore();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    const pl = await createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim() || undefined);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
    selectPlaylist(pl);
  };

  const moveTrack = async (fromIdx: number, toIdx: number) => {
    if (!activePlaylist) return;
    const list = [...activePlaylistTracks];
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    await reorderTracks(
      activePlaylist.id,
      list.map((t) => t.id)
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden select-none">
      {/* Playlists Left Sidebar */}
      <div className="w-64 border-r border-border bg-background-secondary/50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-text">Playlists</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            title="Create new playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {playlists.map((pl) => {
            const isSelected = activePlaylist?.id === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => selectPlaylist(pl)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/15 text-primary font-semibold' : 'text-text hover:bg-surface-hover'
                }`}
              >
                <div className="truncate">
                  <p className="truncate">{pl.name}</p>
                  <p className="text-[10px] text-text-subtle font-normal">{pl.track_count} tracks</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(pl.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400"
                  title="Delete playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Playlist Content View */}
      <div className="flex-1 overflow-y-auto p-8 select-none">
        {activePlaylist ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between pb-6 border-b border-border/60">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-primary">Playlist</span>
                <h2 className="text-3xl font-extrabold text-text">{activePlaylist.name}</h2>
                {activePlaylist.description && (
                  <p className="text-sm text-text-muted">{activePlaylist.description}</p>
                )}
                <p className="text-xs text-text-subtle">
                  {activePlaylistTracks.length} tracks • Updated{' '}
                  {new Date(activePlaylist.updated_at).toLocaleDateString()}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setQueue(activePlaylistTracks, 0)}
                    disabled={activePlaylistTracks.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-primary-text font-semibold text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play</span>
                  </button>
                  <button
                    onClick={() => {
                      const shuffled = [...activePlaylistTracks].sort(() => Math.random() - 0.5);
                      setQueue(shuffled, 0);
                    }}
                    disabled={activePlaylistTracks.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover border border-border text-text font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tracks */}
            <div className="space-y-1">
              {activePlaylistTracks.length === 0 ? (
                <div className="p-8 text-center text-text-subtle text-xs bg-surface border border-border rounded-xl">
                  This playlist is empty. Add tracks from the Songs view using &quot;Add to Playlist&quot;.
                </div>
              ) : (
                activePlaylistTracks.map((track, idx) => {
                  const isPlayingThis = currentTrack?.id === track.id;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isPlayingThis ? 'bg-primary/10 text-primary' : 'hover:bg-surface-hover text-text'
                      }`}
                    >
                      <div
                        onClick={() => setQueue(activePlaylistTracks, idx)}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <span className="w-5 text-center text-xs text-text-subtle font-mono">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                          <Disc3 className="w-5 h-5 opacity-60" />
                        </div>
                        <div className="truncate">
                          <p className={`text-sm font-semibold truncate ${isPlayingThis ? 'text-primary' : ''}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-text-muted truncate">{track.artist} • {track.album}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-text-subtle">{formatDuration(track.duration)}</span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              onClick={() => moveTrack(idx, idx - 1)}
                              className="p-1 hover:text-primary"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {idx < activePlaylistTracks.length - 1 && (
                            <button
                              onClick={() => moveTrack(idx, idx + 1)}
                              className="p-1 hover:text-primary"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => removeTrackFromPlaylist(activePlaylist.id, track.id)}
                            className="p-1 hover:text-rose-400"
                            title="Remove from playlist"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-subtle">
            <Music2 className="w-12 h-12 mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-text">Select or Create a Playlist</h3>
            <p className="text-xs max-w-xs mt-1">Organize your favorite local songs into custom listening orders.</p>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-text">New Playlist</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-text-subtle mb-1">Playlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chill Synthwave"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-text outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-text-subtle mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Late night coding vibes"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-text outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 bg-primary text-primary-text text-xs font-semibold rounded-lg shadow"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
