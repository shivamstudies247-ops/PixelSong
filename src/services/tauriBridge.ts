import { Track, Album, Artist, Folder, Playlist, PlayEvent, AppSettings, LyricsData } from '../types';
import { SAMPLE_TRACKS } from './mockData';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

async function invokeTauri<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }
  throw new Error('Not running inside Tauri desktop shell');
}

// Fallback in-memory state for testing & preview
let memoryTracks = [...SAMPLE_TRACKS];
let memoryPlaylists: Playlist[] = [
  {
    id: 'fav-playlist',
    name: 'Top Favorites',
    description: 'My most played tracks',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    playlist_type: 'manual',
    track_count: 3,
  },
];
let memoryFolders: Folder[] = [
  {
    id: 'f-1',
    path: 'C:\\Music',
    recursive_scan: true,
    enabled: true,
    last_scanned_at: new Date().toISOString(),
    track_count: memoryTracks.length,
  },
];
let memoryLyrics: Record<string, string> = {
  'track-1': `[00:00.00]One more time, we're gonna celebrate
[00:04.50]Oh yeah, all right, don't stop the dancing
[00:09.00]One more time, we're gonna celebrate
[00:13.50]Oh yeah, all right, don't stop the dancing
[00:18.00]One more time!
[00:22.00]Music's got me feeling so free
[00:26.50]Celebrate and dance so free
[00:31.00]One more time!`,
};

export const api = {
  // Tracks
  async getAllTracks(): Promise<Track[]> {
    try {
      return await invokeTauri<Track[]>('get_all_tracks');
    } catch {
      return memoryTracks;
    }
  },

  async getAlbums(): Promise<Album[]> {
    try {
      return await invokeTauri<Album[]>('get_albums');
    } catch {
      const albumsMap = new Map<string, Album>();
      memoryTracks.forEach((t) => {
        const key = `${t.artist}:${t.album}`;
        if (!albumsMap.has(key)) {
          albumsMap.set(key, {
            id: key,
            title: t.album,
            album_artist: t.artist,
            year: t.year,
            track_count: 1,
            total_duration: t.duration,
          });
        } else {
          const a = albumsMap.get(key)!;
          a.track_count += 1;
          a.total_duration += t.duration;
        }
      });
      return Array.from(albumsMap.values());
    }
  },

  async getArtists(): Promise<Artist[]> {
    try {
      return await invokeTauri<Artist[]>('get_artists');
    } catch {
      const artistsMap = new Map<string, Artist>();
      memoryTracks.forEach((t) => {
        if (!artistsMap.has(t.artist)) {
          artistsMap.set(t.artist, {
            id: t.artist,
            name: t.artist,
            track_count: 1,
            album_count: 1,
          });
        } else {
          artistsMap.get(t.artist)!.track_count += 1;
        }
      });
      return Array.from(artistsMap.values());
    }
  },

  async toggleFavorite(trackId: string): Promise<boolean> {
    try {
      return await invokeTauri<boolean>('toggle_favorite', { trackId });
    } catch {
      const tr = memoryTracks.find((t) => t.id === trackId);
      if (tr) {
        tr.favorite = !tr.favorite;
        return tr.favorite;
      }
      return false;
    }
  },

  async setRating(trackId: string, rating: number | null): Promise<void> {
    try {
      await invokeTauri('set_rating', { trackId, rating });
    } catch {
      const tr = memoryTracks.find((t) => t.id === trackId);
      if (tr) tr.rating = rating ?? undefined;
    }
  },

  async updateTrackMetadata(id: string, title: string, artist: string, album: string, genre?: string, year?: number): Promise<void> {
    try {
      await invokeTauri('update_track_metadata', { id, title, artist, album, genre, year });
    } catch {
      const tr = memoryTracks.find((t) => t.id === id);
      if (tr) {
        tr.title = title;
        tr.artist = artist;
        tr.album = album;
        tr.genre = genre;
        tr.year = year;
      }
    }
  },

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    try {
      return await invokeTauri<Playlist[]>('get_playlists');
    } catch {
      return memoryPlaylists;
    }
  },

  async createPlaylist(name: string, description?: string): Promise<Playlist> {
    try {
      return await invokeTauri<Playlist>('create_playlist', { name, description });
    } catch {
      const p: Playlist = {
        id: `pl-${Date.now()}`,
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        playlist_type: 'manual',
        track_count: 0,
      };
      memoryPlaylists.push(p);
      return p;
    }
  },

  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      await invokeTauri('delete_playlist', { playlistId });
    } catch {
      memoryPlaylists = memoryPlaylists.filter((p) => p.id !== playlistId);
    }
  },

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    try {
      return await invokeTauri<Track[]>('get_playlist_tracks', { playlistId });
    } catch {
      return memoryTracks.slice(0, 3);
    }
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    try {
      await invokeTauri('add_tracks_to_playlist', { playlistId, trackIds });
    } catch {
      const p = memoryPlaylists.find((pl) => pl.id === playlistId);
      if (p) p.track_count += trackIds.length;
    }
  },

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    try {
      await invokeTauri('remove_track_from_playlist', { playlistId, trackId });
    } catch {
      const p = memoryPlaylists.find((pl) => pl.id === playlistId);
      if (p && p.track_count > 0) p.track_count -= 1;
    }
  },

  async reorderPlaylistTracks(playlistId: string, trackIds: string[]): Promise<void> {
    try {
      await invokeTauri('reorder_playlist_tracks', { playlistId, trackIds });
    } catch {
      // Mock reorder
    }
  },

  // Folders & Scanning
  async getFolders(): Promise<Folder[]> {
    try {
      return await invokeTauri<Folder[]>('get_folders');
    } catch {
      return memoryFolders;
    }
  },

  async addFolder(path: string, recursive: boolean): Promise<Folder> {
    try {
      return await invokeTauri<Folder>('add_folder', { path, recursive });
    } catch {
      const f: Folder = {
        id: `f-${Date.now()}`,
        path,
        recursive_scan: recursive,
        enabled: true,
        last_scanned_at: new Date().toISOString(),
        track_count: 0,
      };
      memoryFolders.push(f);
      return f;
    }
  },

  async removeFolder(id: string): Promise<void> {
    try {
      await invokeTauri('remove_folder', { id });
    } catch {
      memoryFolders = memoryFolders.filter((f) => f.id !== id);
    }
  },

  async scanFolder(path: string, recursive: boolean): Promise<number> {
    try {
      return await invokeTauri<number>('scan_folder', { path, recursive });
    } catch {
      return memoryTracks.length;
    }
  },

  // Audio Playback
  async playTrack(filePath: string): Promise<void> {
    try {
      await invokeTauri('play_track', { filePath });
    } catch {
      // Audio engine fallback
    }
  },

  async pausePlayback(): Promise<void> {
    try {
      await invokeTauri('pause_playback');
    } catch {}
  },

  async resumePlayback(): Promise<void> {
    try {
      await invokeTauri('resume_playback');
    } catch {}
  },

  async stopPlayback(): Promise<void> {
    try {
      await invokeTauri('stop_playback');
    } catch {}
  },

  async seekPlayback(position: number): Promise<void> {
    try {
      await invokeTauri('seek_playback', { position });
    } catch {}
  },

  async setVolume(volume: number): Promise<void> {
    try {
      await invokeTauri('set_volume', { volume });
    } catch {}
  },

  async setMuted(muted: boolean): Promise<void> {
    try {
      await invokeTauri('set_muted', { muted });
    } catch {}
  },

  async getAudioStatus(): Promise<{ is_playing: boolean; position: number; duration: number; volume: number; is_muted: boolean; current_path?: string | null }> {
    try {
      return await invokeTauri('get_audio_status');
    } catch {
      return { is_playing: false, position: 0, duration: 0, volume: 0.8, is_muted: false, current_path: null };
    }
  },

  async updateEqualizer(enabled: boolean, bands: number[], preamp: number): Promise<void> {
    try {
      await invokeTauri('update_equalizer', { enabled, bands, preamp });
    } catch {}
  },

  async getVisualizerAnalysis(): Promise<{ frequencies: number[]; waveform: number[]; bass_energy: number; mid_energy: number; treble_energy: number }> {
    try {
      return await invokeTauri('get_visualizer_analysis');
    } catch {
      // Mock synthesis for visualizer preview
      const t = Date.now() * 0.003;
      const frequencies = Array.from({ length: 64 }, (_, i) => {
        const val = Math.sin(t * 2 + i * 0.2) * 0.3 + Math.cos(t * 1.5 + i * 0.1) * 0.3 + 0.4;
        return Math.max(0.05, Math.min(1.0, val * (1 - i / 80)));
      });
      const waveform = Array.from({ length: 128 }, (_, i) => {
        return Math.sin(t * 4 + (i / 128) * Math.PI * 4) * 0.5;
      });
      return {
        frequencies,
        waveform,
        bass_energy: (frequencies[0] + frequencies[1] + frequencies[2]) / 3,
        mid_energy: (frequencies[10] + frequencies[11] + frequencies[12]) / 3,
        treble_energy: (frequencies[30] + frequencies[31] + frequencies[32]) / 3,
      };
    }
  },

  // Lyrics
  async getLyrics(trackId: string): Promise<LyricsData | null> {
    try {
      const data = await invokeTauri<any>('get_lyrics', { trackId });
      if (!data) return null;
      return {
        trackId: data.track_id,
        isSynced: data.is_synced,
        lines: data.lines,
        plainText: data.plain_text,
      };
    } catch {
      const content = memoryLyrics[trackId];
      if (!content) return null;
      const lines: { time: number; text: string }[] = [];
      let isSynced = false;
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.includes(']')) {
          const end = trimmed.indexOf(']');
          const ts = trimmed.substring(1, end);
          const parts = ts.split(':');
          if (parts.length === 2) {
            isSynced = true;
            lines.push({
              time: parseFloat(parts[0]) * 60 + parseFloat(parts[1]),
              text: trimmed.substring(end + 1).trim(),
            });
            return;
          }
        }
        if (trimmed) lines.push({ time: -1, text: trimmed });
      });
      return { trackId, isSynced, lines, plainText: content };
    }
  },

  async saveLyrics(trackId: string, content: string): Promise<void> {
    try {
      await invokeTauri('save_lyrics', { trackId, content });
    } catch {
      memoryLyrics[trackId] = content;
    }
  },

  // History & Stats
  async getPlayHistory(limit: number = 50): Promise<PlayEvent[]> {
    try {
      return await invokeTauri<PlayEvent[]>('get_play_history', { limit });
    } catch {
      return [
        {
          id: 'pe-1',
          track_id: 'track-1',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          listened_seconds: 320,
          completed: true,
          track_title: 'One More Time',
          artist_name: 'Daft Punk',
        },
        {
          id: 'pe-2',
          track_id: 'track-3',
          started_at: new Date(Date.now() - 7200000).toISOString(),
          listened_seconds: 425,
          completed: true,
          track_title: 'Time',
          artist_name: 'Pink Floyd',
        },
      ];
    }
  },

  async recordPlayEvent(trackId: string, listenedSeconds: number, completed: boolean): Promise<void> {
    try {
      await invokeTauri('record_play_event', { trackId, listenedSeconds, completed });
    } catch {}
  },

  async clearHistory(): Promise<void> {
    try {
      await invokeTauri('clear_history');
    } catch {}
  },

  async getLibraryStats(): Promise<{ total_tracks: number; total_albums: number; total_artists: number; total_duration_seconds: number; total_play_time_seconds: number; total_plays: number }> {
    try {
      return await invokeTauri('get_library_stats');
    } catch {
      return {
        total_tracks: memoryTracks.length,
        total_albums: 3,
        total_artists: 3,
        total_duration_seconds: 1776,
        total_play_time_seconds: 745,
        total_plays: 5,
      };
    }
  },

  async exportBackup(): Promise<string> {
    try {
      return await invokeTauri<string>('export_backup');
    } catch {
      return JSON.stringify({ version: '1.0', tracks: memoryTracks, playlists: memoryPlaylists }, null, 2);
    }
  },

  // Thumbnail / cover art
  async getThumbnailDataUrl(path: string): Promise<string> {
    try {
      return await invokeTauri<string>('get_thumbnail_data_url', { path });
    } catch {
      return '';
    }
  },

  // Floating widget window
  async showWidget(): Promise<void> {
    try {
      await invokeTauri('show_widget');
    } catch {}
  },

  async hideWidget(): Promise<void> {
    try {
      await invokeTauri('hide_widget');
    } catch {}
  },
};
