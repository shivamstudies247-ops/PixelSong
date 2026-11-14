use crate::database::repository::Repository;
use crate::metadata::extractor::extract_metadata;
use crate::models::ScanProgress;
use parking_lot::Mutex;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use walkdir::WalkDir;

pub struct Scanner {
    repository: Arc<Repository>,
    thumbnails_dir: PathBuf,
    is_scanning: Arc<AtomicBool>,
    current_progress: Arc<Mutex<ScanProgress>>,
}

impl Scanner {
    pub fn new(repository: Arc<Repository>, thumbnails_dir: PathBuf) -> Self {
        Self {
            repository,
            thumbnails_dir,
            is_scanning: Arc::new(AtomicBool::new(false)),
            current_progress: Arc::new(Mutex::new(ScanProgress {
                is_scanning: false,
                current_folder: String::new(),
                files_discovered: 0,
                files_processed: 0,
                skipped_files: 0,
                errors: Vec::new(),
            })),
        }
    }

    pub fn get_progress(&self) -> ScanProgress {
        self.current_progress.lock().clone()
    }

    pub fn scan_folder(&self, folder_path: &Path, recursive: bool) -> Result<u32, Box<dyn std::error::Error + Send + Sync>> {
        if self.is_scanning.swap(true, Ordering::SeqCst) {
            // Already scanning
            return Ok(0);
        }

        let folder_str = folder_path.to_string_lossy().to_string();
        {
            let mut p = self.current_progress.lock();
            p.is_scanning = true;
            p.current_folder = folder_str.clone();
            p.files_discovered = 0;
            p.files_processed = 0;
            p.skipped_files = 0;
            p.errors.clear();
        }

        let max_depth = if recursive { usize::MAX } else { 1 };
        let mut audio_files = Vec::new();

        for entry in WalkDir::new(folder_path).max_depth(max_depth).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                if let Some(ext) = entry.path().extension().and_then(|s| s.to_str()) {
                    let ext_lower = ext.to_lowercase();
                    if matches!(ext_lower.as_str(), "mp3" | "flac" | "wav" | "ogg") {
                        audio_files.push(entry.path().to_path_buf());
                    }
                }
            }
        }

        {
            let mut p = self.current_progress.lock();
            p.files_discovered = audio_files.len() as u32;
        }

        let mut processed = 0;
        let mut discovered_paths = Vec::new();

        for file_path in audio_files {
            discovered_paths.push(file_path.to_string_lossy().to_string());
            match extract_metadata(&file_path, &self.thumbnails_dir) {
                Ok(track) => {
                    if let Err(e) = self.repository.insert_or_update_track(&track) {
                        let mut p = self.current_progress.lock();
                        p.errors.push(format!("DB error for {}: {}", file_path.display(), e));
                        p.skipped_files += 1;
                    } else {
                        processed += 1;
                        let mut p = self.current_progress.lock();
                        p.files_processed += 1;
                    }
                }
                Err(e) => {
                    let mut p = self.current_progress.lock();
                    p.errors.push(format!("Metadata error for {}: {}", file_path.display(), e));
                    p.skipped_files += 1;
                }
            }
        }

        let _ = self.repository.update_folder_last_scanned(&folder_str);

        {
            let mut p = self.current_progress.lock();
            p.is_scanning = false;
        }
        self.is_scanning.store(false, Ordering::SeqCst);

        Ok(processed)
    }

    pub fn scan_all_folders(&self) -> Result<u32, Box<dyn std::error::Error + Send + Sync>> {
        let folders = self.repository.get_folders()?;
        let mut total = 0;
        for folder in folders {
            if folder.enabled {
                let p = Path::new(&folder.path);
                if p.exists() {
                    total += self.scan_folder(p, folder.recursive_scan)?;
                }
            }
        }
        Ok(total)
    }
}
