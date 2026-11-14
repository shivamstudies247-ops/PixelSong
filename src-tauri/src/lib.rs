pub mod audio;
pub mod commands;
pub mod database;
pub mod library;
pub mod metadata;
pub mod models;

use audio::engine::AudioEngine;
use commands::*;
use database::repository::Repository;
use database::Database;
use library::scanner::Scanner;
use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = match Database::new() {
        Ok(d) => d,
        Err(e) => {
            eprintln!("CRITICAL: Failed to initialize SQLite database: {}", e);
            return;
        }
    };

    let repository = Arc::new(Repository::new(db.conn.clone()));
    let scanner = Arc::new(Scanner::new(repository.clone(), db.thumbnails_dir.clone()));
    let engine = match AudioEngine::new() {
        Ok(eng) => Arc::new(eng),
        Err(e) => {
            eprintln!("CRITICAL: Failed to initialize AudioEngine: {}", e);
            return;
        }
    };

    let app_state = AppState {
        repository,
        scanner,
        engine,
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_all_tracks,
            get_albums,
            get_artists,
            get_folders,
            add_folder,
            remove_folder,
            scan_folder,
            scan_all_folders,
            get_scan_progress,
            toggle_favorite,
            set_rating,
            update_track_metadata,
            get_potential_duplicates,
            get_playlists,
            create_playlist,
            delete_playlist,
            add_tracks_to_playlist,
            remove_track_from_playlist,
            reorder_playlist_tracks,
            get_playlist_tracks,
            record_play_event,
            get_play_history,
            clear_history,
            get_library_stats,
            get_lyrics,
            save_lyrics,
            play_track,
            pause_playback,
            resume_playback,
            stop_playback,
            seek_playback,
            set_volume,
            set_muted,
            get_audio_status,
            update_equalizer,
            get_visualizer_analysis,
            get_all_settings,
            set_setting,
            export_backup,
            show_widget,
            hide_widget,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
