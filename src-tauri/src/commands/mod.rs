use crate::audio::engine::AudioEngine;
use crate::database::repository::Repository;
use crate::library::scanner::Scanner;
use crate::models::*;
use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;
use tauri::Manager;
use tauri::State;
use tauri::WebviewUrl;

pub struct AppState {
    pub repository: Arc<Repository>,
    pub scanner: Arc<Scanner>,
    pub engine: Arc<AudioEngine>,
}

// --- TRACK & LIBRARY COMMANDS ---
#[tauri::command]
pub fn get_all_tracks(state: State<'_, AppState>) -> Result<Vec<TrackRecord>, String> {
    state.repository.get_all_tracks().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_albums(state: State<'_, AppState>) -> Result<Vec<AlbumRecord>, String> {
    state.repository.get_albums().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_artists(state: State<'_, AppState>) -> Result<Vec<ArtistRecord>, String> {
    state.repository.get_artists().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_folders(state: State<'_, AppState>) -> Result<Vec<FolderRecord>, String> {
    state.repository.get_folders().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_folder(state: State<'_, AppState>, path: String, recursive: bool) -> Result<FolderRecord, String> {
    state.repository.add_folder(&path, recursive).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_folder(state: State<'_, AppState>, id: String) -> Result<(), String> {
    state.repository.remove_folder(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn scan_folder(state: State<'_, AppState>, path: String, recursive: bool) -> Result<u32, String> {
    let p = Path::new(&path);
    state.scanner.scan_folder(p, recursive).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn scan_all_folders(state: State<'_, AppState>) -> Result<u32, String> {
    state.scanner.scan_all_folders().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_scan_progress(state: State<'_, AppState>) -> ScanProgress {
    state.scanner.get_progress()
}

#[tauri::command]
pub fn toggle_favorite(state: State<'_, AppState>, track_id: String) -> Result<bool, String> {
    state.repository.toggle_favorite(&track_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_rating(state: State<'_, AppState>, track_id: String, rating: Option<u8>) -> Result<(), String> {
    state.repository.set_rating(&track_id, rating).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_track_metadata(
    state: State<'_, AppState>,
    id: String,
    title: String,
    artist: String,
    album: String,
    genre: Option<String>,
    year: Option<i32>,
) -> Result<(), String> {
    state
        .repository
        .update_track_metadata(&id, &title, &artist, &album, genre.as_deref(), year)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_potential_duplicates(state: State<'_, AppState>) -> Result<Vec<Vec<TrackRecord>>, String> {
    state.repository.get_potential_duplicates().map_err(|e| e.to_string())
}

// --- PLAYLIST COMMANDS ---
#[tauri::command]
pub fn get_playlists(state: State<'_, AppState>) -> Result<Vec<PlaylistRecord>, String> {
    state.repository.get_playlists().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_playlist(state: State<'_, AppState>, name: String, description: Option<String>) -> Result<PlaylistRecord, String> {
    state.repository.create_playlist(&name, description.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_playlist(state: State<'_, AppState>, playlist_id: String) -> Result<(), String> {
    state.repository.delete_playlist(&playlist_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_tracks_to_playlist(state: State<'_, AppState>, playlist_id: String, track_ids: Vec<String>) -> Result<(), String> {
    state.repository.add_tracks_to_playlist(&playlist_id, &track_ids).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_track_from_playlist(state: State<'_, AppState>, playlist_id: String, track_id: String) -> Result<(), String> {
    state.repository.remove_track_from_playlist(&playlist_id, &track_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reorder_playlist_tracks(state: State<'_, AppState>, playlist_id: String, track_ids: Vec<String>) -> Result<(), String> {
    state.repository.reorder_playlist_tracks(&playlist_id, &track_ids).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_playlist_tracks(state: State<'_, AppState>, playlist_id: String) -> Result<Vec<TrackRecord>, String> {
    state.repository.get_playlist_tracks(&playlist_id).map_err(|e| e.to_string())
}

// --- HISTORY & STATS COMMANDS ---
#[tauri::command]
pub fn record_play_event(state: State<'_, AppState>, track_id: String, listened_seconds: f64, completed: bool) -> Result<(), String> {
    state.repository.record_play_event(&track_id, listened_seconds, completed).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_play_history(state: State<'_, AppState>, limit: u32) -> Result<Vec<PlayEventRecord>, String> {
    state.repository.get_play_history(limit).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_history(state: State<'_, AppState>) -> Result<(), String> {
    state.repository.clear_history().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_library_stats(state: State<'_, AppState>) -> Result<LibraryStats, String> {
    state.repository.get_library_stats().map_err(|e| e.to_string())
}

// --- LYRICS COMMANDS ---
#[tauri::command]
pub fn get_lyrics(state: State<'_, AppState>, track_id: String) -> Result<Option<LyricRecord>, String> {
    state.repository.get_lyrics(&track_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_lyrics(state: State<'_, AppState>, track_id: String, content: String) -> Result<(), String> {
    state.repository.save_lyrics(&track_id, &content).map_err(|e| e.to_string())
}

// --- AUDIO PLAYBACK COMMANDS ---
#[tauri::command]
pub fn play_track(state: State<'_, AppState>, file_path: String) -> Result<(), String> {
    let p = Path::new(&file_path);
    state.engine.play_file(p).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn pause_playback(state: State<'_, AppState>) {
    state.engine.pause();
}

#[tauri::command]
pub fn resume_playback(state: State<'_, AppState>) {
    state.engine.resume();
}

#[tauri::command]
pub fn stop_playback(state: State<'_, AppState>) {
    state.engine.stop();
}

#[tauri::command]
pub fn seek_playback(state: State<'_, AppState>, position: f64) -> Result<(), String> {
    state.engine.seek(position).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_volume(state: State<'_, AppState>, volume: f32) {
    state.engine.set_volume(volume);
}

#[tauri::command]
pub fn set_muted(state: State<'_, AppState>, muted: bool) {
    state.engine.set_muted(muted);
}

#[tauri::command]
pub fn get_audio_status(state: State<'_, AppState>) -> AudioStatus {
    state.engine.get_status()
}

#[tauri::command]
pub fn update_equalizer(state: State<'_, AppState>, enabled: bool, bands: Vec<f32>, preamp: f32) {
    state.engine.update_equalizer(enabled, &bands, preamp);
}

#[tauri::command]
pub fn get_visualizer_analysis(state: State<'_, AppState>) -> VisualizerAnalysis {
    state.engine.get_analysis()
}

// --- SETTINGS & BACKUP COMMANDS ---
#[tauri::command]
pub fn get_all_settings(state: State<'_, AppState>) -> Result<HashMap<String, String>, String> {
    state.repository.get_all_settings().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_setting(state: State<'_, AppState>, key: String, value: String) -> Result<(), String> {
    state.repository.set_setting(&key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn export_backup(state: State<'_, AppState>) -> Result<String, String> {
    state.repository.export_backup_json().map_err(|e| e.to_string())
}

// --- FLOATING WIDGET WINDOW COMMANDS ---
#[tauri::command]
pub fn show_widget(app_handle: tauri::AppHandle) -> Result<(), String> {
    // If widget window already exists, just focus it
    if app_handle.get_webview_window("widget").is_some() {
        return Ok(());
    }

    let window = tauri::WebviewWindowBuilder::new(&app_handle, "widget", WebviewUrl::App("/?widget=1".into()))
    .title("PixelSong Widget")
    .inner_size(320.0, 140.0)
    .always_on_top(true)
    .skip_taskbar(true)
    .decorations(false)
    .transparent(true)
    .resizable(false)
    .focused(false)
    .build()
    .map_err(|e| e.to_string())?;

    let _ = window;
    Ok(())
}

#[tauri::command]
pub fn hide_widget(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("widget") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}
