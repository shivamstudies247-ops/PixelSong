import React, { useEffect, useRef, useState } from 'react';
import {
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  FileText,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useQueueStore } from '../../stores/queueStore';
import { Disc3 } from 'lucide-react';
import { Slider } from '../../components/ui/Slider';
import { api } from '../../services/tauriBridge';
import { LyricsData } from '../../types';
import { useGradientStore } from '../../stores/gradientStore';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const NowPlayingView: React.FC = () => {
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
    setFullPlayerOpen,
  } = usePlayerStore();

  const { nextTrack, prevTrack } = useQueueStore();
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [activeTab, setActiveTab] = useState<'art' | 'lyrics'>('art');
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const { enabled, getGradientForSong, animationEnabled, animationSpeed } =
    useGradientStore();

  // Fetch lyrics whenever currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;
    let isMounted = true;
    api.getLyrics(currentTrack.id).then((data) => {
      if (isMounted) setLyricsData(data);
    });
    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id]);

  // Generate gradient when track changes
  useEffect(() => {
    if (!currentTrack || !enabled) return;
    const { css } = getGradientForSong(currentTrack.id);
    if (css) {
      document.documentElement.style.setProperty('--gradient-bg', css);
    }
  }, [currentTrack?.id, enabled, getGradientForSong]);

  // Synchronized auto-scroll for lyrics
  useEffect(() => {
    if (activeTab !== 'lyrics' || !lyricsData?.isSynced) return;
    const activeEl = lyricsContainerRef.current?.querySelector('.active-lyric-line');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [position, activeTab, lyricsData]);

  if (!currentTrack) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-8 select-none">
        <button
          onClick={() => setFullPlayerOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-surface hover:bg-surface-hover text-text"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
        <p className="text-sm text-text-subtle">No track currently playing</p>
      </div>
    );
  }

  // Active lyric index calculation
  let activeLyricIndex = -1;
  if (lyricsData?.isSynced && lyricsData.lines.length > 0) {
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (position >= lyricsData.lines[i].time) {
        activeLyricIndex = i;
      } else {
        break;
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col p-8 select-none overflow-hidden"
      data-gradient-bg={enabled ? 'true' : 'false'}
      style={{
        background: enabled
          ? `var(--gradient-bg, var(--color-bg))`
          : 'var(--color-bg)',
        backdropFilter: enabled ? 'blur(20px)' : 'blur(20px)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-primary">Living Player</span>
          <div className="flex items-center bg-surface border border-border rounded-full p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('art')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                activeTab === 'art' ? 'bg-primary text-primary-text' : 'text-text-muted hover:text-text'
              }`}
            >
              Artwork
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                activeTab === 'lyrics' ? 'bg-primary text-primary-text' : 'text-text-muted hover:text-text'
              }`}
            >
              Lyrics
            </button>
          </div>
        </div>

        <button
          onClick={() => setFullPlayerOpen(false)}
          className="p-2.5 rounded-full bg-surface hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
          title="Minimize Now Playing"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Center Stage: Living Art or Synced Lyrics */}
      <div className="flex-1 flex items-center justify-center min-h-0 py-4">
        {activeTab === 'art' ? (
          <div className="relative flex flex-col items-center w-full max-w-[600px]">
            {/* Ambient Reactive Glow Backlight */}
            <div
              className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-transform duration-700 pointer-events-none ${
                isPlaying ? 'scale-125 bg-primary' : 'scale-95 bg-accent'
              }`}
            />

            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shadow-2xl z-10 relative">
              <Disc3 className="w-32 h-32 sm:w-40 sm:h-40 opacity-60" />
            </div>
          </div>
        ) : (
          <div
            ref={lyricsContainerRef}
            className="w-full max-w-2xl h-full overflow-y-auto px-4 py-8 space-y-5 text-center scroll-smooth"
          >
            {lyricsData && lyricsData.lines.length > 0 ? (
              lyricsData.lines.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                return (
                  <p
                    key={idx}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'active-lyric-line text-2xl sm:text-3xl font-extrabold text-primary scale-105'
                        : 'text-base sm:text-lg font-medium text-text-muted hover:text-text'
                    }`}
                    onClick={() => {
                      if (line.time >= 0) seek(line.time);
                    }}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-subtle">
                <FileText className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm font-semibold text-text">No lyrics available for this track</p>
                <p className="text-xs mt-1">Import a local .lrc file in Lyrics Studio</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="max-w-2xl w-full mx-auto space-y-4 pt-4 flex-shrink-0">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-text truncate">{currentTrack.title}</h2>
          <p className="text-sm text-text-muted truncate mt-0.5">
            {currentTrack.artist} • {currentTrack.album}
          </p>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-text-subtle w-10 text-right">{formatTime(position)}</span>
          <Slider value={position} min={0} max={duration || 100} onChange={seek} className="flex-1" />
          <span className="text-xs font-mono text-text-subtle w-10">{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              shuffle ? 'text-primary' : 'text-text-subtle hover:text-text'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={prevTrack}
              className="p-2 rounded-full text-text-muted hover:text-text transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-primary-text flex items-center justify-center shadow-xl transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 rounded-full text-text-muted hover:text-text transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={cycleRepeatMode}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-primary' : 'text-text-subtle hover:text-text'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
