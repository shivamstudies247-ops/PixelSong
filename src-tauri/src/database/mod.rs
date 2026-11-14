pub mod repository;

use directories::ProjectDirs;
use parking_lot::Mutex;
use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;

pub struct Database {
    pub conn: Arc<Mutex<Connection>>,
    pub data_dir: PathBuf,
    pub thumbnails_dir: PathBuf,
}

impl Database {
    pub fn new() -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let (data_dir, thumbnails_dir) = Self::resolve_dirs()?;
        fs::create_dir_all(&data_dir)?;
        fs::create_dir_all(&thumbnails_dir)?;

        let db_path = data_dir.join("pixelsong.db");
        let conn = Connection::open(&db_path)?;

        // Enable foreign keys and WAL mode for high concurrency & reliability
        conn.execute_batch(
            "PRAGMA foreign_keys = ON;
             PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;",
        )?;

        let db = Database {
            conn: Arc::new(Mutex::new(conn)),
            data_dir,
            thumbnails_dir,
        };

        db.run_migrations()?;

        Ok(db)
    }

    fn resolve_dirs() -> Result<(PathBuf, PathBuf), Box<dyn std::error::Error + Send + Sync>> {
        if let Some(proj_dirs) = ProjectDirs::from("com", "pixelsong", "PixelSong") {
            let data_dir = proj_dirs.data_local_dir().to_path_buf();
            let thumbnails_dir = data_dir.join("thumbnails");
            Ok((data_dir, thumbnails_dir))
        } else {
            let data_dir = PathBuf::from("./pixelsong_data");
            let thumbnails_dir = data_dir.join("thumbnails");
            Ok((data_dir, thumbnails_dir))
        }
    }

    pub fn run_migrations(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock();
        let schema_sql = include_str!("../../migrations/001_initial_schema.sql");
        conn.execute_batch(schema_sql)?;
        Ok(())
    }
}
