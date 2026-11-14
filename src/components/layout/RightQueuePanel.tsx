import React, { useState } from 'react';
import { X, Trash2, BookmarkPlus, Play, ArrowUp, ArrowDown } from 'lucide-react';
import { useQueueStore } from '../../stores/queueStore';
import { usePlayerStore } from '../../stores/playerStore';
import { Disc3 } from 'lucide-react';

export const RightQueuePanel: React.FC = () => {
  const { queue, currentIndex, isQueueOpen, setQueueOpen, removeFromQueue, moveItem, clearQueue, saveQueueAsPlaylist } =
    useQueueStore();
  const { playTrack } = usePlayerStore();
  const [playlistName, setPlaylistName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  if (!isQueueOpen) return null;

  const handleSavePlaylist = async () => {
    if (!playlistName.trim()) return;
    await saveQueueAsPlaylist(playlistName.trim());
    setPlaylistName('');
    setShowSaveModal(false);
  };

  return (
    <aside className="w-80 bg-background-secondary border-l border-border flex flex-col flex-shrink-0 select-none z-20">
      {/* Queue Header */}
      <div className="h-14 px-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text">Up Next</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-subtle">
            {queue.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <>
              <button
                onClick={() => setShowSaveModal(true)}
                className="p-1.5 rounded text-text-muted hover:text-text hover:bg-surface-hover"
                title="Save queue as playlist"
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
              <button
                onClick={clearQueue}
                className="p-1.5 rounded text-text-muted hover:text-rose-400 hover:bg-surface-hover"
                title="Clear queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setQueueOpen(false)}
            className="p-1.5 rounded text-text-muted hover:text-text hover:bg-surface-hover"
            title="Close queue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Queue Modal */}
      {showSaveModal && (
        <div className="p-3 bg-surface border-b border-border space-y-2">
          <p className="text-xs font-medium text-text">Save Queue as Playlist</p>
          <input
            type="text"
            placeholder="Playlist name..."
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="w-full bg-background border border-border rounded px-2.5 py-1 text-xs text-text outline-none focus:border-primary"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowSaveModal(false)}
              className="px-2.5 py-1 text-xs text-text-muted hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePlaylist}
              className="px-3 py-1 bg-primary text-primary-text rounded text-xs font-medium"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Queue Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-subtle">
            <p className="text-sm">Queue is empty</p>
            <p className="text-xs mt-1">Add tracks from your library to keep the music playing</p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isPlayingThis = idx === currentIndex;
            return (
              <div
                key={`${track.id}-${idx}`}
                className={`group flex items-center gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                  isPlayingThis ? 'bg-primary/15 border border-primary/30 text-primary' : 'hover:bg-surface-hover'
                }`}
              >
                <button
                  onClick={() => playTrack(track)}
                  className="relative flex-shrink-0 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                    <Disc3 className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded text-white">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isPlayingThis ? 'text-primary' : 'text-text'}`}>
                    {track.title}
                  </p>
                  <p className="text-text-muted truncate text-[11px]">{track.artist}</p>
                </div>

                {/* Reorder and Delete Actions */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      onClick={() => moveItem(idx, idx - 1)}
                      className="p-1 hover:text-primary"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {idx < queue.length - 1 && (
                    <button
                      onClick={() => moveItem(idx, idx + 1)}
                      className="p-1 hover:text-primary"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 hover:text-rose-400"
                    title="Remove from queue"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
