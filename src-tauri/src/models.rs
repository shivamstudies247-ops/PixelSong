use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackRecord {
    pub id: String,
    pub file_path: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub album_artist: Option<String>,
    pub duration: f64,
    pub format: String,
    pub bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub track_number: Option<u32>,
    pub disc_number: Option<u32>,
    pub year: Option<i32>,
    pub genre: Option<String>,
    pub file_size: u64,
    pub modified_at: String,
    pub date_added: String,
    pub favorite: bool,
    pub rating: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlbumRecord {
    pub id: String,
    pub title: String,
    pub album_artist: String,
    pub year: Option<i32>,
    pub track_count: u32,
    pub total_duration: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtistRecord {
    pub id: String,
    pub name: String,
    pub track_count: u32,
    pub album_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FolderRecord {
    pub id: String,
    pub path: String,
    pub recursive_scan: bool,
    pub enabled: bool,
    pub last_scanned_at: Option<String>,
    pub track_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistRecord {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub playlist_type: String,
    pub track_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistItemRecord {
    pub playlist_id: String,
    pub track_id: String,
    pub position: u32,
    pub track: Option<TrackRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayEventRecord {
    pub id: String,
    pub track_id: String,
    pub started_at: String,
    pub listened_seconds: f64,
    pub completed: bool,
    pub track_title: Option<String>,
    pub artist_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub is_scanning: bool,
    pub current_folder: String,
    pub files_discovered: u32,
    pub files_processed: u32,
    pub skipped_files: u32,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EqualizerConfig {
    pub enabled: bool,
    pub preset: String,
    pub bands: Vec<f32>, // 10 bands
    pub preamp: f32,
}

impl Default for EqualizerConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            preset: "Flat".to_string(),
            bands: vec![0.0; 10],
            preamp: 0.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualizerAnalysis {
    pub frequencies: Vec<f32>, // 64 or 128 normalized FFT bins (0.0 to 1.0)
    pub waveform: Vec<f32>,    // time domain samples (-1.0 to 1.0)
    pub bass_energy: f32,
    pub mid_energy: f32,
    pub treble_energy: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioStatus {
    pub is_playing: bool,
    pub position: f64,
    pub duration: f64,
    pub volume: f32,
    pub is_muted: bool,
    pub current_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LyricLineRecord {
    pub time: f64,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LyricRecord {
    pub track_id: String,
    pub is_synced: bool,
    pub lines: Vec<LyricLineRecord>,
    pub plain_text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LibraryStats {
    pub total_tracks: u32,
    pub total_albums: u32,
    pub total_artists: u32,
    pub total_duration_seconds: f64,
    pub total_play_time_seconds: f64,
    pub total_plays: u32,
}
