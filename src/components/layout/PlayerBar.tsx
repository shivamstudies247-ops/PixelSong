import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Maximize2,
  Sliders,
  Sparkles,
  Heart,
  Monitor,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useQueueStore } from '../../stores/queueStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { useWidgetStore } from '../../stores/widgetStore';
import { Disc3 } from 'lucide-react';
import { Slider } from '../ui/Slider';

interface PlayerBarProps {
  onOpenNowPlaying: () => void;
  onOpenVisualizer: () => void;
  onOpenEqualizer: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  onOpenNowPlaying,
  onOpenVisualizer,
  onOpenEqualizer,
}) => {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    isMuted,
    repeatMode,
    shuffle,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
  } = usePlayerStore();

  const { nextTrack, prevTrack } = useQueueStore();
  const { toggleFavorite } = useLibraryStore();

  return (
    <footer className="h-20 bg-background-secondary border-t border-border px-6 flex items-center justify-between gap-6 flex-shrink-0 select-none z-30">
      {/* Track Info & Artwork */}
      <div className="flex items-center gap-3 w-72 min-w-0">
        <button
          onClick={onOpenNowPlaying}
          className="group relative flex-shrink-0 cursor-pointer outline-none"
          title="Open Now Playing"
        >
          <div className="w-14 h-14 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Disc3 className="w-7 h-7 opacity-60" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center text-white">
            <Maximize2 className="w-4 h-4" />
          </div>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={onOpenNowPlaying}
              className="text-sm font-semibold text-text truncate cursor-pointer hover:underline"
              title={currentTrack?.title || 'No track selected'}
            >
              {currentTrack?.title || 'No track selected'}
            </h4>
            {currentTrack?.format && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface border border-border/80 text-primary">
                {currentTrack.format}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted truncate">
            {currentTrack?.artist || 'Select a track from the library'}
          </p>
        </div>

        {currentTrack && (
          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`p-1.5 rounded-full transition-colors ${
              currentTrack.favorite ? 'text-rose-500 fill-rose-500' : 'text-text-subtle hover:text-text'
            }`}
            title={currentTrack.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${currentTrack.favorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Main Playback Controls & Timeline */}
      <div className="flex-1 max-w-2xl flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              shuffle ? 'text-primary font-bold' : 'text-text-subtle hover:text-text'
            }`}
            title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            title="Previous (or restart)"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover text-primary-text flex items-center justify-center transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded-full text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-primary font-bold' : 'text-text-subtle hover:text-text'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Timeline Slider & Durations */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-text-subtle w-10 text-right">
            {formatTime(position)}
          </span>
          <Slider
            value={position}
            min={0}
            max={duration || 100}
            onChange={(val) => seek(val)}
            className="flex-1"
          />
          <span className="text-[11px] font-mono text-text-subtle w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Controls: Visualizer, Equalizer, Volume Slider */}
      <div className="flex items-center gap-3 w-72 justify-end">
        <button
          onClick={onOpenVisualizer}
          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
          title="Open Visualizer Studio"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenEqualizer}
          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
          title="Open 10-Band Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            const { isOpen } = useWidgetStore.getState();
            if (isOpen) {
              useWidgetStore.getState().close();
            } else {
              useWidgetStore.getState().open();
            }
          }}
          className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
          title="Show floating widget"
        >
          <Monitor className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 w-32">
          <button
            onClick={toggleMute}
            className="text-text-muted hover:text-text transition-colors p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Slider
            value={isMuted ? 0 : volume * 100}
            min={0}
            max={100}
            onChange={(val) => setVolume(val / 100)}
            className="w-24"
          />
        </div>
      </div>
    </footer>
  );
};
