import { create } from 'zustand';
import { Playlist, Track } from '../types';
import { api } from '../services/tauriBridge';

interface PlaylistState {
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  activePlaylistTracks: Track[];
  isLoading: boolean;

  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  selectPlaylist: (playlist: Playlist) => Promise<void>;
  addTracksToPlaylist: (playlistId: string, trackIds: string[]) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  reorderTracks: (playlistId: string, trackIds: string[]) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  activePlaylist: null,
  activePlaylistTracks: [],
  isLoading: false,

  loadPlaylists: async () => {
    set({ isLoading: true });
    try {
      const playlists = await api.getPlaylists();
      set({ playlists, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createPlaylist: async (name: string, description?: string) => {
    const pl = await api.createPlaylist(name, description);
    set((s) => ({ playlists: [...s.playlists, pl] }));
    return pl;
  },

  deletePlaylist: async (id: string) => {
    await api.deletePlaylist(id);
    set((s) => ({
      playlists: s.playlists.filter((p) => p.id !== id),
      activePlaylist: s.activePlaylist?.id === id ? null : s.activePlaylist,
      activePlaylistTracks: s.activePlaylist?.id === id ? [] : s.activePlaylistTracks,
    }));
  },

  selectPlaylist: async (playlist: Playlist) => {
    set({ activePlaylist: playlist, isLoading: true });
    try {
      const tracks = await api.getPlaylistTracks(playlist.id);
      set({ activePlaylistTracks: tracks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addTracksToPlaylist: async (playlistId: string, trackIds: string[]) => {
    await api.addTracksToPlaylist(playlistId, trackIds);
    await get().loadPlaylists();
    if (get().activePlaylist?.id === playlistId) {
      const tracks = await api.getPlaylistTracks(playlistId);
      set({ activePlaylistTracks: tracks });
    }
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    await api.removeTrackFromPlaylist(playlistId, trackId);
    await get().loadPlaylists();
    if (get().activePlaylist?.id === playlistId) {
      const tracks = await api.getPlaylistTracks(playlistId);
      set({ activePlaylistTracks: tracks });
    }
  },

  reorderTracks: async (playlistId: string, trackIds: string[]) => {
    await api.reorderPlaylistTracks(playlistId, trackIds);
    if (get().activePlaylist?.id === playlistId) {
      const tracks = await api.getPlaylistTracks(playlistId);
      set({ activePlaylistTracks: tracks });
    }
  },
}));
