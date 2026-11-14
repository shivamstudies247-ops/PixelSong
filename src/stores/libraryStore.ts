import { create } from 'zustand';
import { Track, Album, Artist, Folder, ScanProgress } from '../types';
import { api } from '../services/tauriBridge';

interface LibraryState {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  folders: Folder[];
  scanProgress: ScanProgress;
  isLoading: boolean;
  filterText: string;
  selectedGenre: string | null;
  sortBy: 'title' | 'artist' | 'album' | 'duration' | 'date_added' | 'year';
  sortDirection: 'asc' | 'desc';

  loadLibrary: () => Promise<void>;
  toggleFavorite: (trackId: string) => Promise<void>;
  setRating: (trackId: string, rating: number | null) => Promise<void>;
  addFolder: (path: string, recursive: boolean) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  scanFolder: (path: string, recursive: boolean) => Promise<void>;
  rescanAll: () => Promise<void>;
  updateMetadata: (id: string, title: string, artist: string, album: string, genre?: string, year?: number) => Promise<void>;
  setFilterText: (text: string) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSort: (sortBy: 'title' | 'artist' | 'album' | 'duration' | 'date_added' | 'year') => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  albums: [],
  artists: [],
  folders: [],
  scanProgress: {
    isScanning: false,
    currentFolder: '',
    filesDiscovered: 0,
    filesProcessed: 0,
    skippedFiles: 0,
    errors: [],
  },
  isLoading: false,
  filterText: '',
  selectedGenre: null,
  sortBy: 'title',
  sortDirection: 'asc',

  loadLibrary: async () => {
    set({ isLoading: true });
    try {
      const [tracks, albums, artists, folders] = await Promise.all([
        api.getAllTracks(),
        api.getAlbums(),
        api.getArtists(),
        api.getFolders(),
      ]);
      set({ tracks, albums, artists, folders, isLoading: false });
    } catch (e) {
      console.error('Failed to load library:', e);
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (trackId: string) => {
    const isFav = await api.toggleFavorite(trackId);
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, favorite: isFav } : t)),
    }));
  },

  setRating: async (trackId: string, rating: number | null) => {
    await api.setRating(trackId, rating);
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, rating: rating ?? undefined } : t)),
    }));
  },

  addFolder: async (path: string, recursive: boolean) => {
    const newFolder = await api.addFolder(path, recursive);
    set((s) => ({ folders: [...s.folders, newFolder] }));
    await get().scanFolder(path, recursive);
  },

  removeFolder: async (id: string) => {
    await api.removeFolder(id);
    set((s) => ({ folders: s.folders.filter((f) => f.id !== id) }));
  },

  scanFolder: async (path: string, recursive: boolean) => {
    set((s) => ({
      scanProgress: {
        ...s.scanProgress,
        isScanning: true,
        currentFolder: path,
      },
    }));

    try {
      await api.scanFolder(path, recursive);
      await get().loadLibrary();
    } finally {
      set((s) => ({
        scanProgress: {
          ...s.scanProgress,
          isScanning: false,
        },
      }));
    }
  },

  rescanAll: async () => {
    const { folders, scanFolder } = get();
    for (const f of folders) {
      if (f.enabled) {
        await scanFolder(f.path, f.recursive_scan);
      }
    }
  },

  updateMetadata: async (id, title, artist, album, genre, year) => {
    await api.updateTrackMetadata(id, title, artist, album, genre, year);
    await get().loadLibrary();
  },

  setFilterText: (text: string) => set({ filterText: text }),
  setSelectedGenre: (genre: string | null) => set({ selectedGenre: genre }),

  setSort: (sortBy) => {
    set((s) => {
      if (s.sortBy === sortBy) {
        return { sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc' };
      }
      return { sortBy, sortDirection: 'asc' };
    });
  },
}));
