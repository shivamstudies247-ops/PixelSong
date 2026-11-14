use crate::models::*;
use rusqlite::{params, Connection, OptionalExtension};
use std::sync::Arc;
use parking_lot::Mutex;

pub struct Repository {
    conn: Arc<Mutex<Connection>>,
}

impl Repository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn }
    }

    // --- TRACKS ---
    pub fn insert_or_update_track(&self, track: &TrackRecord) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute(
            "INSERT INTO tracks (
                id, file_path, title, artist, album, album_artist, duration,
                format, bitrate, sample_rate, track_number, disc_number,
                year, genre, file_size, modified_at, date_added
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)
            ON CONFLICT(file_path) DO UPDATE SET
                title = excluded.title,
                artist = excluded.artist,
                album = excluded.album,
                album_artist = excluded.album_artist,
                duration = excluded.duration,
                format = excluded.format,
                bitrate = excluded.bitrate,
                sample_rate = excluded.sample_rate,
                track_number = excluded.track_number,
                disc_number = excluded.disc_number,
                year = excluded.year,
                genre = excluded.genre,
                file_size = excluded.file_size,
                modified_at = excluded.modified_at,
                date_added = excluded.date_added;",
            params![
                track.id,
                track.file_path,
                track.title,
                track.artist,
                track.album,
                track.album_artist,
                track.duration,
                track.format,
                track.bitrate,
                track.sample_rate,
                track.track_number,
                track.disc_number,
                track.year,
                track.genre,
                track.file_size,
                track.modified_at,
                track.date_added,
            ],
        )?;

        // Ensure artist and album index entries
        conn.execute(
            "INSERT OR IGNORE INTO artists (id, normalized_name, display_name)
             VALUES (?1, LOWER(?2), ?2)",
            params![uuid::Uuid::new_v4().to_string(), track.artist],
        )?;

        conn.execute(
            "INSERT OR IGNORE INTO albums (id, title, album_artist, year)
             VALUES (?1, ?2, ?3, ?4)",
            params![
                uuid::Uuid::new_v4().to_string(),
                track.album,
                track.album_artist.as_deref().unwrap_or(&track.artist),
                track.year,
            ],
        )?;

        Ok(())
    }

    pub fn get_all_tracks(&self) -> Result<Vec<TrackRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.file_path, t.title, t.artist, t.album, t.album_artist,
                    t.duration, t.format, t.bitrate, t.sample_rate, t.track_number,
                    t.disc_number, t.year, t.genre, t.file_size, t.modified_at,
                    t.date_added,
                    (f.track_id IS NOT NULL) as favorite,
                    r.rating
             FROM tracks t
             LEFT JOIN favorites f ON f.track_id = t.id
             LEFT JOIN ratings r ON r.track_id = t.id
             ORDER BY t.title COLLATE NOCASE ASC",
        )?;

        let track_iter = stmt.query_map([], |row| {
            Ok(TrackRecord {
                id: row.get(0)?,
                file_path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                duration: row.get(6)?,
                format: row.get(7)?,
                bitrate: row.get(8)?,
                sample_rate: row.get(9)?,
                track_number: row.get(10)?,
                disc_number: row.get(11)?,
                year: row.get(12)?,
                genre: row.get(13)?,
                file_size: row.get(14)?,
                modified_at: row.get(15)?,
                date_added: row.get(16)?,
                favorite: row.get(17)?,
                rating: row.get(18)?,
            })
        })?;

        let mut tracks = Vec::new();
        for t in track_iter {
            tracks.push(t?);
        }
        Ok(tracks)
    }

    pub fn get_track_by_id(&self, id: &str) -> Result<Option<TrackRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.file_path, t.title, t.artist, t.album, t.album_artist,
                    t.duration, t.format, t.bitrate, t.sample_rate, t.track_number,
                    t.disc_number, t.year, t.genre, t.file_size, t.modified_at,
                    t.date_added,
                    (f.track_id IS NOT NULL) as favorite,
                    r.rating
             FROM tracks t
             LEFT JOIN favorites f ON f.track_id = t.id
             LEFT JOIN ratings r ON r.track_id = t.id
             WHERE t.id = ?1",
        )?;

        let track = stmt.query_row(params![id], |row| {
            Ok(TrackRecord {
                id: row.get(0)?,
                file_path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                duration: row.get(6)?,
                format: row.get(7)?,
                bitrate: row.get(8)?,
                sample_rate: row.get(9)?,
                track_number: row.get(10)?,
                disc_number: row.get(11)?,
                year: row.get(12)?,
                genre: row.get(13)?,
                file_size: row.get(14)?,
                modified_at: row.get(15)?,
                date_added: row.get(16)?,
                favorite: row.get(17)?,
                rating: row.get(18)?,
            })
        }).optional()?;

        Ok(track)
    }

    pub fn update_track_metadata(
        &self,
        id: &str,
        title: &str,
        artist: &str,
        album: &str,
        genre: Option<&str>,
        year: Option<i32>,
    ) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute(
            "UPDATE tracks SET title = ?1, artist = ?2, album = ?3, genre = ?4, year = ?5 WHERE id = ?6",
            params![title, artist, album, genre, year, id],
        )?;
        Ok(())
    }

    pub fn delete_missing_tracks(&self, existing_paths: &[String]) -> Result<usize, rusqlite::Error> {
        let mut conn = self.conn.lock();
        let tx = conn.transaction()?;
        let mut deleted = 0;
        {
            let mut stmt = tx.prepare("SELECT id, file_path FROM tracks")?;
            let rows = stmt.query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?;
            let mut ids_to_delete = Vec::new();
            for r in rows {
                let (id, path) = r?;
                if !existing_paths.contains(&path) && !std::path::Path::new(&path).exists() {
                    ids_to_delete.push(id);
                }
            }
            drop(stmt);
            for id in ids_to_delete {
                tx.execute("DELETE FROM tracks WHERE id = ?1", params![id])?;
                deleted += 1;
            }
        }
        tx.commit()?;
        Ok(deleted)
    }

    // --- ALBUMS & ARTISTS ---
    pub fn get_albums(&self) -> Result<Vec<AlbumRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT album, 
                    COALESCE(album_artist, artist) as primary_artist,
                    MAX(year) as year,
                    COUNT(id) as track_count,
                    SUM(duration) as total_duration
             FROM tracks
             GROUP BY album, primary_artist
             ORDER BY album COLLATE NOCASE ASC",
        )?;

        let iter = stmt.query_map([], |row| {
            let title: String = row.get(0)?;
            let album_artist: String = row.get(1)?;
            Ok(AlbumRecord {
                id: format!("{}:{}", album_artist, title),
                title,
                album_artist,
                year: row.get(2)?,
                track_count: row.get(3)?,
                total_duration: row.get(4)?,
            })
        })?;

        let mut albums = Vec::new();
        for a in iter {
            albums.push(a?);
        }
        Ok(albums)
    }

    pub fn get_artists(&self) -> Result<Vec<ArtistRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT artist,
                    COUNT(id) as track_count,
                    COUNT(DISTINCT album) as album_count
             FROM tracks
             GROUP BY artist
             ORDER BY artist COLLATE NOCASE ASC",
        )?;

        let iter = stmt.query_map([], |row| {
            let name: String = row.get(0)?;
            Ok(ArtistRecord {
                id: name.clone(),
                name,
                track_count: row.get(1)?,
                album_count: row.get(2)?,
            })
        })?;

        let mut artists = Vec::new();
        for a in iter {
            artists.push(a?);
        }
        Ok(artists)
    }

    // --- FOLDERS ---
    pub fn get_folders(&self) -> Result<Vec<FolderRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT f.id, f.path, f.recursive_scan, f.enabled, f.last_scanned_at,
                    (SELECT COUNT(*) FROM tracks t WHERE t.file_path LIKE f.path || '%') as track_count
             FROM folders f
             ORDER BY f.path ASC",
        )?;

        let iter = stmt.query_map([], |row| {
            Ok(FolderRecord {
                id: row.get(0)?,
                path: row.get(1)?,
                recursive_scan: row.get::<_, i32>(2)? != 0,
                enabled: row.get::<_, i32>(3)? != 0,
                last_scanned_at: row.get(4)?,
                track_count: row.get(5)?,
            })
        })?;

        let mut folders = Vec::new();
        for f in iter {
            folders.push(f?);
        }
        Ok(folders)
    }

    pub fn add_folder(&self, path: &str, recursive: bool) -> Result<FolderRecord, rusqlite::Error> {
        let conn = self.conn.lock();
        let id = uuid::Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO folders (id, path, recursive_scan, enabled, last_scanned_at)
             VALUES (?1, ?2, ?3, 1, datetime('now'))
             ON CONFLICT(path) DO UPDATE SET recursive_scan = excluded.recursive_scan, enabled = 1",
            params![id, path, if recursive { 1 } else { 0 }],
        )?;

        Ok(FolderRecord {
            id,
            path: path.to_string(),
            recursive_scan: recursive,
            enabled: true,
            last_scanned_at: Some(chrono::Utc::now().to_rfc3339()),
            track_count: 0,
        })
    }

    pub fn remove_folder(&self, id: &str) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute("DELETE FROM folders WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn update_folder_last_scanned(&self, path: &str) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute(
            "UPDATE folders SET last_scanned_at = datetime('now') WHERE path = ?1",
            params![path],
        )?;
        Ok(())
    }

    // --- FAVORITES & RATINGS ---
    pub fn toggle_favorite(&self, track_id: &str) -> Result<bool, rusqlite::Error> {
        let conn = self.conn.lock();
        let is_fav: bool = conn
            .query_row(
                "SELECT 1 FROM favorites WHERE track_id = ?1",
                params![track_id],
                |_| Ok(true),
            )
            .optional()?
            .unwrap_or(false);

        if is_fav {
            conn.execute("DELETE FROM favorites WHERE track_id = ?1", params![track_id])?;
            Ok(false)
        } else {
            conn.execute(
                "INSERT INTO favorites (track_id, created_at) VALUES (?1, datetime('now'))",
                params![track_id],
            )?;
            Ok(true)
        }
    }

    pub fn set_rating(&self, track_id: &str, rating: Option<u8>) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        if let Some(r) = rating {
            conn.execute(
                "INSERT INTO ratings (track_id, rating, updated_at) VALUES (?1, ?2, datetime('now'))
                 ON CONFLICT(track_id) DO UPDATE SET rating = excluded.rating, updated_at = datetime('now')",
                params![track_id, r],
            )?;
        } else {
            conn.execute("DELETE FROM ratings WHERE track_id = ?1", params![track_id])?;
        }
        Ok(())
    }

    // --- PLAYLISTS ---
    pub fn get_playlists(&self) -> Result<Vec<PlaylistRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT p.id, p.name, p.description, p.created_at, p.updated_at, p.playlist_type,
                    COUNT(pt.track_id) as track_count
             FROM playlists p
             LEFT JOIN playlist_tracks pt ON pt.playlist_id = p.id
             GROUP BY p.id
             ORDER BY p.name COLLATE NOCASE ASC",
        )?;

        let iter = stmt.query_map([], |row| {
            Ok(PlaylistRecord {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
                playlist_type: row.get(5)?,
                track_count: row.get(6)?,
            })
        })?;

        let mut playlists = Vec::new();
        for p in iter {
            playlists.push(p?);
        }
        Ok(playlists)
    }

    pub fn create_playlist(&self, name: &str, description: Option<&str>) -> Result<PlaylistRecord, rusqlite::Error> {
        let conn = self.conn.lock();
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO playlists (id, name, description, created_at, updated_at, playlist_type)
             VALUES (?1, ?2, ?3, ?4, ?4, 'manual')",
            params![id, name, description, now],
        )?;

        Ok(PlaylistRecord {
            id,
            name: name.to_string(),
            description: description.map(|s| s.to_string()),
            created_at: now.clone(),
            updated_at: now,
            playlist_type: "manual".to_string(),
            track_count: 0,
        })
    }

    pub fn delete_playlist(&self, playlist_id: &str) -> Result<(), rusqlite::Error> {
        let mut conn = self.conn.lock();
        let tx = conn.transaction()?;
        tx.execute("DELETE FROM playlist_tracks WHERE playlist_id = ?1", params![playlist_id])?;
        tx.execute("DELETE FROM playlists WHERE id = ?1", params![playlist_id])?;
        tx.commit()?;
        Ok(())
    }

    pub fn add_tracks_to_playlist(&self, playlist_id: &str, track_ids: &[String]) -> Result<(), rusqlite::Error> {
        let mut conn = self.conn.lock();
        let tx = conn.transaction()?;
        let current_max: u32 = tx
            .query_row(
                "SELECT COALESCE(MAX(position), 0) FROM playlist_tracks WHERE playlist_id = ?1",
                params![playlist_id],
                |r| r.get(0),
            )
            .unwrap_or(0);

        let mut pos = current_max + 1;
        for tid in track_ids {
            tx.execute(
                "INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position) VALUES (?1, ?2, ?3)",
                params![playlist_id, tid, pos],
            )?;
            pos += 1;
        }

        tx.execute(
            "UPDATE playlists SET updated_at = datetime('now') WHERE id = ?1",
            params![playlist_id],
        )?;

        tx.commit()?;
        Ok(())
    }

    pub fn remove_track_from_playlist(&self, playlist_id: &str, track_id: &str) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute(
            "DELETE FROM playlist_tracks WHERE playlist_id = ?1 AND track_id = ?2",
            params![playlist_id, track_id],
        )?;
        Ok(())
    }

    pub fn reorder_playlist_tracks(&self, playlist_id: &str, track_ids: &[String]) -> Result<(), rusqlite::Error> {
        let mut conn = self.conn.lock();
        let tx = conn.transaction()?;
        tx.execute("DELETE FROM playlist_tracks WHERE playlist_id = ?1", params![playlist_id])?;
        for (i, tid) in track_ids.iter().enumerate() {
            tx.execute(
                "INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (?1, ?2, ?3)",
                params![playlist_id, tid, i as u32 + 1],
            )?;
        }
        tx.execute(
            "UPDATE playlists SET updated_at = datetime('now') WHERE id = ?1",
            params![playlist_id],
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn get_playlist_tracks(&self, playlist_id: &str) -> Result<Vec<TrackRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.file_path, t.title, t.artist, t.album, t.album_artist,
                    t.duration, t.format, t.bitrate, t.sample_rate, t.track_number,
                    t.disc_number, t.year, t.genre, t.file_size, t.modified_at,
                    t.date_added,
                    (f.track_id IS NOT NULL) as favorite,
                    r.rating
             FROM playlist_tracks pt
             JOIN tracks t ON t.id = pt.track_id
             LEFT JOIN favorites f ON f.track_id = t.id
             LEFT JOIN ratings r ON r.track_id = t.id
             WHERE pt.playlist_id = ?1
             ORDER BY pt.position ASC",
        )?;

        let iter = stmt.query_map(params![playlist_id], |row| {
            Ok(TrackRecord {
                id: row.get(0)?,
                file_path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                duration: row.get(6)?,
                format: row.get(7)?,
                bitrate: row.get(8)?,
                sample_rate: row.get(9)?,
                track_number: row.get(10)?,
                disc_number: row.get(11)?,
                year: row.get(12)?,
                genre: row.get(13)?,
                file_size: row.get(14)?,
                modified_at: row.get(15)?,
                date_added: row.get(16)?,
                favorite: row.get(17)?,
                rating: row.get(18)?,
            })
        })?;

        let mut tracks = Vec::new();
        for t in iter {
            tracks.push(t?);
        }
        Ok(tracks)
    }

    // --- PLAY EVENTS & STATS ---
    pub fn record_play_event(&self, track_id: &str, listened_seconds: f64, completed: bool) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO play_events (id, track_id, started_at, listened_seconds, completed)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, track_id, now, listened_seconds, if completed { 1 } else { 0 }],
        )?;
        Ok(())
    }

    pub fn get_play_history(&self, limit: u32) -> Result<Vec<PlayEventRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT pe.id, pe.track_id, pe.started_at, pe.listened_seconds, pe.completed,
                    t.title, t.artist
             FROM play_events pe
             JOIN tracks t ON t.id = pe.track_id
             ORDER BY pe.started_at DESC
             LIMIT ?1",
        )?;

        let iter = stmt.query_map(params![limit], |row| {
            Ok(PlayEventRecord {
                id: row.get(0)?,
                track_id: row.get(1)?,
                started_at: row.get(2)?,
                listened_seconds: row.get(3)?,
                completed: row.get::<_, i32>(4)? != 0,
                track_title: row.get(5)?,
                artist_name: row.get(6)?,
            })
        })?;

        let mut events = Vec::new();
        for e in iter {
            events.push(e?);
        }
        Ok(events)
    }

    pub fn clear_history(&self) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute("DELETE FROM play_events", [])?;
        Ok(())
    }

    pub fn get_library_stats(&self) -> Result<LibraryStats, rusqlite::Error> {
        let conn = self.conn.lock();
        let total_tracks: u32 = conn.query_row("SELECT COUNT(*) FROM tracks", [], |r| r.get(0))?;
        let total_albums: u32 = conn.query_row("SELECT COUNT(DISTINCT album) FROM tracks", [], |r| r.get(0))?;
        let total_artists: u32 = conn.query_row("SELECT COUNT(DISTINCT artist) FROM tracks", [], |r| r.get(0))?;
        let total_duration: f64 = conn.query_row("SELECT COALESCE(SUM(duration), 0.0) FROM tracks", [], |r| r.get(0))?;
        let total_play_time: f64 = conn.query_row("SELECT COALESCE(SUM(listened_seconds), 0.0) FROM play_events", [], |r| r.get(0))?;
        let total_plays: u32 = conn.query_row("SELECT COUNT(*) FROM play_events", [], |r| r.get(0))?;

        Ok(LibraryStats {
            total_tracks,
            total_albums,
            total_artists,
            total_duration_seconds: total_duration,
            total_play_time_seconds: total_play_time,
            total_plays,
        })
    }

    // --- LYRICS ---
    pub fn get_lyrics(&self, track_id: &str) -> Result<Option<LyricRecord>, rusqlite::Error> {
        let conn = self.conn.lock();
        let content: Option<String> = conn
            .query_row("SELECT content FROM lyrics WHERE track_id = ?1", params![track_id], |r| r.get(0))
            .optional()?;

        match content {
            Some(raw) => Ok(Some(Self::parse_lyrics_text(track_id, &raw))),
            None => Ok(None),
        }
    }

    pub fn save_lyrics(&self, track_id: &str, content: &str) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute(
            "INSERT INTO lyrics (track_id, content, format, updated_at) VALUES (?1, ?2, 'lrc', datetime('now'))
             ON CONFLICT(track_id) DO UPDATE SET content = excluded.content, updated_at = datetime('now')",
            params![track_id, content],
        )?;
        Ok(())
    }

    pub fn parse_lyrics_text(track_id: &str, content: &str) -> LyricRecord {
        let mut lines = Vec::new();
        let mut is_synced = false;

        for line in content.lines() {
            let trimmed = line.trim();
            // Check for [mm:ss.xx] or [mm:ss]
            if trimmed.starts_with('[') && trimmed.len() > 7 {
                if let Some(bracket_end) = trimmed.find(']') {
                    let timestamp_str = &trimmed[1..bracket_end];
                    let text = trimmed[bracket_end + 1..].trim().to_string();
                    if let Some(seconds) = Self::parse_lrc_timestamp(timestamp_str) {
                        is_synced = true;
                        lines.push(LyricLineRecord {
                            time: seconds,
                            text,
                        });
                        continue;
                    }
                }
            }
            if !trimmed.is_empty() {
                lines.push(LyricLineRecord {
                    time: -1.0,
                    text: trimmed.to_string(),
                });
            }
        }

        LyricRecord {
            track_id: track_id.to_string(),
            is_synced,
            lines,
            plain_text: content.to_string(),
        }
    }

    fn parse_lrc_timestamp(ts: &str) -> Option<f64> {
        let parts: Vec<&str> = ts.split(':').collect();
        if parts.len() == 2 {
            let minutes: f64 = parts[0].parse().ok()?;
            let seconds: f64 = parts[1].parse().ok()?;
            return Some(minutes * 60.0 + seconds);
        }
        None
    }

    // --- DUPLICATE HANDLING (PRD Section 4.5) ---
    pub fn get_potential_duplicates(&self) -> Result<Vec<Vec<TrackRecord>>, rusqlite::Error> {
        let tracks = self.get_all_tracks()?;
        let mut groups: std::collections::HashMap<String, Vec<TrackRecord>> = std::collections::HashMap::new();

        for t in tracks {
            // Group by normalized title + artist
            let key = format!("{}:{}", t.title.to_lowercase().trim(), t.artist.to_lowercase().trim());
            groups.entry(key).or_default().push(t);
        }

        let duplicates = groups
            .into_values()
            .filter(|g| g.len() > 1)
            .collect();

        Ok(duplicates)
    }

    // --- SETTINGS ---
    pub fn get_setting(&self, key: &str) -> Result<Option<String>, rusqlite::Error> {
        let conn = self.conn.lock();
        conn.query_row("SELECT value FROM settings WHERE key = ?1", params![key], |r| r.get(0))
            .optional()
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock();
        conn.execute(
            "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, datetime('now'))
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
            params![key, value],
        )?;
        Ok(())
    }

    pub fn get_all_settings(&self) -> Result<std::collections::HashMap<String, String>, rusqlite::Error> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
        let rows = stmt.query_map([], |r| Ok((r.get(0)?, r.get(1)?)))?;
        let mut map = std::collections::HashMap::new();
        for r in rows {
            let (k, v) = r?;
            map.insert(k, v);
        }
        Ok(map)
    }

    // --- BACKUP & RESTORE (PRD Section 13.3) ---
    pub fn export_backup_json(&self) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let tracks = self.get_all_tracks()?;
        let folders = self.get_folders()?;
        let playlists = self.get_playlists()?;
        let settings = self.get_all_settings()?;
        let history = self.get_play_history(1000)?;

        let backup = serde_json::json!({
            "version": "1.0",
            "exported_at": chrono::Utc::now().to_rfc3339(),
            "tracks": tracks,
            "folders": folders,
            "playlists": playlists,
            "settings": settings,
            "history": history,
        });

        Ok(serde_json::to_string_pretty(&backup)?)
    }
}
