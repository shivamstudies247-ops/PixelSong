import { create } from 'zustand';
import { Track } from '../types';
import { usePlayerStore } from './playerStore';
import { api } from '../services/tauriBridge';

interface QueueState {
  queue: Track[];
  currentIndex: number;
  isQueueOpen: boolean;

  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track | Track[]) => void;
  playNext: (track: Track | Track[]) => void;
  removeFromQueue: (index: number) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleQueueOpen: () => void;
  setQueueOpen: (open: boolean) => void;
  saveQueueAsPlaylist: (name: string) => Promise<void>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isQueueOpen: false,

  setQueue: (tracks: Track[], startIndex: number = 0) => {
    set({ queue: tracks, currentIndex: startIndex });
    if (tracks[startIndex]) {
      usePlayerStore.getState().playTrack(tracks[startIndex]);
    }
  },

  addToQueue: (tracks: Track | Track[]) => {
    const list = Array.isArray(tracks) ? tracks : [tracks];
    set((s) => ({ queue: [...s.queue, ...list] }));
  },

  playNext: (tracks: Track | Track[]) => {
    const list = Array.isArray(tracks) ? tracks : [tracks];
    set((s) => {
      const copy = [...s.queue];
      const insertAt = s.currentIndex + 1;
      copy.splice(insertAt, 0, ...list);
      return { queue: copy };
    });
  },

  removeFromQueue: (index: number) => {
    set((s) => {
      const copy = [...s.queue];
      copy.splice(index, 1);
      let newIdx = s.currentIndex;
      if (index < s.currentIndex) {
        newIdx -= 1;
      }
      return { queue: copy, currentIndex: newIdx };
    });
  },

  moveItem: (fromIndex: number, toIndex: number) => {
    set((s) => {
      const copy = [...s.queue];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);

      let newIdx = s.currentIndex;
      if (s.currentIndex === fromIndex) {
        newIdx = toIndex;
      } else if (s.currentIndex > fromIndex && s.currentIndex <= toIndex) {
        newIdx -= 1;
      } else if (s.currentIndex < fromIndex && s.currentIndex >= toIndex) {
        newIdx += 1;
      }

      return { queue: copy, currentIndex: newIdx };
    });
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: -1 });
  },

  nextTrack: () => {
    const { queue, currentIndex } = get();
    const { shuffle, repeatMode } = usePlayerStore.getState();

    if (queue.length === 0) return;

    let nextIdx = currentIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        return; // Stopped at end
      }
    }

    set({ currentIndex: nextIdx });
    if (queue[nextIdx]) {
      usePlayerStore.getState().playTrack(queue[nextIdx]);
    }
  },

  prevTrack: () => {
    const { queue, currentIndex } = get();
    const { position, seek } = usePlayerStore.getState();

    // If more than 3 seconds in, restart track
    if (position > 3) {
      seek(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = 0;
    }

    set({ currentIndex: prevIdx });
    if (queue[prevIdx]) {
      usePlayerStore.getState().playTrack(queue[prevIdx]);
    }
  },

  toggleQueueOpen: () => {
    set((s) => ({ isQueueOpen: !s.isQueueOpen }));
  },

  setQueueOpen: (open: boolean) => {
    set({ isQueueOpen: open });
  },

  saveQueueAsPlaylist: async (name: string) => {
    const { queue } = get();
    if (queue.length === 0) return;
    const pl = await api.createPlaylist(name);
    await api.addTracksToPlaylist(
      pl.id,
      queue.map((t) => t.id)
    );
  },
}));

// Listen for track-ended events from playerStore
if (typeof window !== 'undefined') {
  window.addEventListener('pixelsong:track-ended', () => {
    useQueueStore.getState().nextTrack();
  });
}
