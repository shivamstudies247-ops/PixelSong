export interface Track {
  id: string;
  file_path: string;
  title: string;
  artist: string;
  album: string;
  album_artist?: string;
  duration: number; // in seconds
  format: string; // "mp3", "flac", "wav", "ogg"
  bitrate?: number; // kbps
  sample_rate?: number; // Hz
  track_number?: number;
  disc_number?: number;
  year?: number;
  genre?: string;
  file_size: number;
  modified_at: string;
  date_added: string;
  favorite: boolean;
  rating?: number; // 1-5
}

export interface Album {
  id: string;
  title: string;
  album_artist: string;
  year?: number;
  track_count: number;
  total_duration: number;
}

export interface Artist {
  id: string;
  name: string;
  track_count: number;
  album_count: number;
}

export interface Folder {
  id: string;
  path: string;
  recursive_scan: boolean;
  enabled: boolean;
  last_scanned_at?: string;
  track_count: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  playlist_type: 'manual' | 'smart';
  track_count: number;
}

export interface PlaylistItem {
  playlist_id: string;
  track_id: string;
  position: number;
  track?: Track;
}

export interface PlayEvent {
  id: string;
  track_id: string;
  started_at: string;
  listened_seconds: number;
  completed: boolean;
  track_title?: string;
  artist_name?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number; // seconds
  duration: number; // seconds
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
}

export interface EqualizerBand {
  frequency: number; // e.g. 32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000
  gain: number; // -12 to +12 dB
}

export interface EqualizerPreset {
  id: string;
  name: string;
  bands: number[]; // 10 gain values
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  bands: number[]; // 10 values for 31Hz, 63Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
  preamp: number; // dB (-6 to +6)
}

export type VisualizerMode =
  | 'spectrum'
  | 'circular'
  | 'waveform'
  | 'oscilloscope'
  | 'radial-waveform'
  | 'frequency-rings'
  | 'particle-field'
  | 'ambient-waves'
  | 'mirror-spectrum'
  | 'album-reactive';

export interface VisualizerConfig {
  mode: VisualizerMode;
  barCount: number;
  sensitivity: number;
  smoothing: number;
  colorScheme: 'theme' | 'rainbow' | 'neon' | 'sunset' | 'monochrome' | 'fire';
  animationSpeed: number;
  isFullscreen: boolean;
  showFPS: boolean;
}

export interface ScanProgress {
  isScanning: boolean;
  currentFolder: string;
  filesDiscovered: number;
  filesProcessed: number;
  skippedFiles: number;
  errors: string[];
}

export interface AppSettings {
  theme: 'obsidian' | 'slate-light' | 'cyber-neon' | 'deep-velvet' | 'nordic-midnight';
  accentColor: string;
  density: 'compact' | 'comfortable' | 'spacious';
  minimizeToTray: boolean;
  scanOnLaunch: boolean;
  minPlayThresholdSeconds: number;
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsData {
  trackId: string;
  isSynced: boolean;
  lines: LyricLine[];
  plainText: string;
}


export interface LibraryStats {
  total_tracks: number;
  total_albums: number;
  total_artists: number;
  total_duration_seconds: number;
  total_play_time_seconds: number;
  total_plays: number;
}

// ===== GRADIENT TYPES =====

export type GradientType = 'linear' | 'radial';

export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0-100
}

export interface CustomGradient {
  id: string;
  name: string;
  type: GradientType;
  angle: number; // degrees for linear, unused for radial
  stops: GradientStop[];
  isDefault: boolean;
}

export type GradientSource = 'custom' | 'preset' | 'random';

export type RandomGradientStyle =
  | 'dark-moody'
  | 'vibrant-colorful'
  | 'pastel-soft'
  | 'neon-cyberpunk'
  | 'minimal-elegant'
  | 'completely-random';

export interface GradientConfig {
  enabled: boolean;
  source: GradientSource;
  customGradientId: string | null;
  presetId: string | null;
  randomStyle: RandomGradientStyle | null;
  animationEnabled: boolean;
  animationSpeed: number; // 1-5
}

export interface GradientPreset {
  id: string;
  name: string;
  type: GradientType;
  angle: number;
  stops: GradientStop[];
  category: string;
}

// ===== FONT TYPES =====

export type FontCategory =
  | 'modern-premium'
  | 'geometric-futuristic'
  | 'minimal-professional'
  | 'elegant-editorial'
  | 'monospace';

export interface FontOption {
  id: string;
  name: string;
  category: FontCategory;
  fontFamily: string; // CSS font-family value
  fileName: string; // local font file name
  weights: number[]; // supported font weights
  fallback: string; // CSS generic fallback
}

export interface TypographyConfig {
  fontFamily: string;
  fontWeight: number;
  globalSizeScale: number; // 0.8 - 1.5
  headingSizeScale: number; // 0.8 - 1.5
  uiTextSizeScale: number; // 0.8 - 1.5
  letterSpacing: number; // -0.05 to 0.1 em
}


