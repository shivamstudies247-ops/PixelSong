import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Maximize2 } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useQueueStore } from '../../stores/queueStore';
import { useWidgetStore } from '../../stores/widgetStore';
import { api } from '../../services/tauriBridge';
import { Track } from '../../types';
import { Disc3 } from 'lucide-react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const MiniPlayerWidget: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    togglePlay,
    setFullPlayerOpen,
    updatePosition,
  } = usePlayerStore();
  const { prevTrack, nextTrack } = useQueueStore();
  const { close } = useWidgetStore();

  // Restore current track from backend status when widget mounts,
  // so the widget shows what's already playing even if opened independently.
  useEffect(() => {
    let mounted = true;
    let ticker: NodeJS.Timeout | null = null;

    const refresh = async () => {
      if (!mounted) return;
      const status = await api.getAudioStatus();
      const path = status.current_path ?? null;

      // Only update track if path changed
      if (path && currentTrack?.file_path !== path) {
        const tracks = await api.getAllTracks();
        const found = tracks.find((t) => t.file_path === path);
        if (found) {
          usePlayerStore.getState().playTrack(found);
          // playTrack starts its own ticker; skip ours below
        } else if (!usePlayerStore.getState().currentTrack) {
          // No matching track in library, but something is playing
          usePlayerStore.getState().updatePosition(status.position);
        }
      } else if (!path && !currentTrack) {
        // Nothing playing
      }

      // Keep position in sync (lightweight polling, same as playerStore)
      if (!usePlayerStore.getState().currentTrack) {
        usePlayerStore.getState().updatePosition(status.position);
      }
    };

    refresh();

    // Poll position every 500ms when no local track is driving the ticker
    if (!currentTrack) {
      ticker = setInterval(refresh, 500);
    }

    return () => {
      mounted = false;
      if (ticker) clearInterval(ticker);
    };
  }, [currentTrack, updatePosition]);

  if (!currentTrack) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[10000] w-80 h-36 bg-background/90 backdrop-blur-2xl border border-border rounded-2xl p-3 flex flex-col shadow-2xl select-none"
      role="widget"
      aria-label="PixelSong mini player"
    >
      {/* Header: brand + close */}
      <div className="flex justify-between items-start mb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
            PixelSong
          </span>
        </div>
        <button
          onClick={close}
          className="p-1 rounded hover:text-rose-400 hover:bg-surface-hover transition-colors"
          title="Hide widget"
          aria-label="Hide widget"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: artwork + track info + controls */}
      <div className="flex-1 flex items-center gap-3 min-h-0">
        {/* Artwork */}
        <button
          onClick={() => setFullPlayerOpen(true)}
          className="relative flex-shrink-0 cursor-pointer group"
          title="Open Now Playing"
        >
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Disc3 className="w-5 h-5 opacity-60" />
          </div>
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-semibold text-text truncate"
            title={currentTrack.title}
          >
            {currentTrack.title}
          </h4>
          <p className="text-[11px] text-text-muted truncate" title={currentTrack.artist}>
            {currentTrack.artist}
          </p>

          {/* Mini progress bar */}
          <div className="mt-1.5 flex items-center gap-1">
            <span
              className="text-[10px] font-mono text-text-subtle w-10 text-right"
            >
              {formatTime(position)}
            </span>
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: duration > 0 ? (position / duration) * 100 : 0 }}
              />
            </div>
            <span
              className="text-[10px] font-mono text-text-subtle w-10"
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={prevTrack}
            className="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            title="Previous"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-primary text-primary-text flex items-center justify-center shadow-md transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            title="Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
