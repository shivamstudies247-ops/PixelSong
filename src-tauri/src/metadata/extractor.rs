use crate::models::TrackRecord;
use lofty::file::{AudioFile, TaggedFileExt};
use lofty::probe::Probe;
use lofty::tag::Accessor;
use std::fs;
use std::path::Path;
use sha2::{Digest, Sha256};

pub fn extract_metadata(file_path: &Path, _thumbnails_dir: &Path) -> Result<TrackRecord, Box<dyn std::error::Error + Send + Sync>> {
    let path_str = file_path.to_string_lossy().to_string();
    let file_meta = fs::metadata(file_path)?;
    let file_size = file_meta.len();
    let modified_time: chrono::DateTime<chrono::Utc> = file_meta.modified()?.into();

    let ext = file_path
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown")
        .to_lowercase();

    let mut hasher = Sha256::new();
    hasher.update(path_str.as_bytes());
    let id = format!("{:x}", hasher.finalize())[..16].to_string();

    let default_title = file_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown Title")
        .to_string();

    let mut title = default_title;
    let mut artist = "Unknown Artist".to_string();
    let mut album = "Unknown Album".to_string();
    let album_artist: Option<String> = None;
    let mut genre: Option<String> = None;
    let mut year: Option<i32> = None;
    let mut track_number: Option<u32> = None;
    let mut disc_number: Option<u32> = None;
    let mut duration = 0.0f64;
    let mut bitrate: Option<u32> = None;
    let mut sample_rate: Option<u32> = None;

    if let Ok(tagged_file) = Probe::open(file_path)?.read() {
        let properties = tagged_file.properties();
        duration = properties.duration().as_secs_f64();
        bitrate = properties.audio_bitrate();
        sample_rate = properties.sample_rate();

        if let Some(tag) = tagged_file.primary_tag().or_else(|| tagged_file.first_tag()) {
            if let Some(t) = tag.title() {
                let t_clean = t.trim();
                if !t_clean.is_empty() {
                    title = t_clean.to_string();
                }
            }
            if let Some(a) = tag.artist() {
                let a_clean = a.trim();
                if !a_clean.is_empty() {
                    artist = a_clean.to_string();
                }
            }
            if let Some(al) = tag.album() {
                let al_clean = al.trim();
                if !al_clean.is_empty() {
                    album = al_clean.to_string();
                }
            }
            if let Some(g) = tag.genre() {
                let g_clean = g.trim();
                if !g_clean.is_empty() {
                    genre = Some(g_clean.to_string());
                }
            }
            year = tag.year().map(|y| y as i32);
            track_number = tag.track();
            disc_number = tag.disk();
        }
    }

    Ok(TrackRecord {
        id,
        file_path: path_str,
        title,
        artist,
        album,
        album_artist,
        duration,
        format: ext,
        bitrate,
        sample_rate,
        track_number,
        disc_number,
        year,
        genre,
        file_size,
        modified_at: modified_time.to_rfc3339(),
        date_added: chrono::Utc::now().to_rfc3339(),
        favorite: false,
        rating: None,
    })
}
