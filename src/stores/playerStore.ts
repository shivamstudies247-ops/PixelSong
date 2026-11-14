import { create } from 'zustand';
import { Track, RepeatMode } from '../types';
import { api } from '../services/tauriBridge';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  isFullPlayerOpen: boolean;

  // Actions
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setFullPlayerOpen: (open: boolean) => void;
  updatePosition: (pos: number) => void;
}

let ticker: NodeJS.Timeout | null = null;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  repeatMode: 'off',
  shuffle: false,
  isFullPlayerOpen: false,

  playTrack: async (track: Track) => {
    try {
      await api.playTrack(track.file_path);
      set({
        currentTrack: track,
        isPlaying: true,
        position: 0,
        duration: track.duration,
      });

      // Clear existing ticker
      if (ticker) clearInterval(ticker);

      // Start position polling ticker
      ticker = setInterval(async () => {
        const { isPlaying, duration, currentTrack } = get();
        if (!isPlaying || !currentTrack) return;

        const status = await api.getAudioStatus();
        if (status.position > 0) {
          set({ position: status.position });
        } else {
          // Fallback timer increment
          set((s) => ({
            position: Math.min(duration, s.position + 0.5),
          }));
        }

        // If reached end
        if (get().position >= duration && duration > 0) {
          // Trigger next track from queue
          const { cycleRepeatMode, repeatMode } = get();
          if (repeatMode === 'one') {
            get().seek(0);
            get().resume();
          } else {
            // Queue handles next
            window.dispatchEvent(new CustomEvent('pixelsong:track-ended'));
          }
        }
      }, 500);

      // Record play event after threshold
      setTimeout(() => {
        if (get().currentTrack?.id === track.id) {
          api.recordPlayEvent(track.id, 15, false);
        }
      }, 15000);
    } catch (e) {
      console.error('Failed to play track:', e);
    }
  },

  togglePlay: async () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;

    if (isPlaying) {
      await api.pausePlayback();
      set({ isPlaying: false });
    } else {
      await api.resumePlayback();
      set({ isPlaying: true });
    }
  },

  pause: async () => {
    await api.pausePlayback();
    set({ isPlaying: false });
  },

  resume: async () => {
    await api.resumePlayback();
    set({ isPlaying: true });
  },

  seek: async (position: number) => {
    set({ position });
    await api.seekPlayback(position);
  },

  setVolume: async (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: false });
    await api.setVolume(clamped);
  },

  toggleMute: async () => {
    const nextMuted = !get().isMuted;
    set({ isMuted: nextMuted });
    await api.setMuted(nextMuted);
  },

  toggleShuffle: () => {
    set((s) => ({ shuffle: !s.shuffle }));
  },

  cycleRepeatMode: () => {
    set((s) => {
      if (s.repeatMode === 'off') return { repeatMode: 'all' };
      if (s.repeatMode === 'all') return { repeatMode: 'one' };
      return { repeatMode: 'off' };
    });
  },

  setFullPlayerOpen: (open: boolean) => {
    set({ isFullPlayerOpen: open });
  },

  updatePosition: (pos: number) => {
    set({ position: pos });
  },
}));
