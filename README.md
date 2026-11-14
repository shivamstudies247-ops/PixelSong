<<<<<<< HEAD
# PixelSong — Premium Offline Music Player for Windows

PixelSong is a high-performance, beautiful, fully offline desktop music player engineered for Windows 10 and Windows 11. It brings together local library management, native multi-format audio playback with Symphonia, real-time 10-band biquad equalizer DSP, and an expressive 10-mode Canvas visualizer studio.

---

## 🌟 Key Features

- **100% Fully Offline**: Operates strictly on your PC without accounts, sign-ins, streaming, cloud dependencies, or telemetry.
- **Native Audio Subsystem**: High-performance audio decoding (MP3, WAV, FLAC, OGG Vorbis) via `symphonia` and low-latency Windows output via `cpal` (WASAPI).
- **10-Band Biquad Equalizer**: Real-time DSP equalizer with -12dB to +12dB faders across 31Hz to 16kHz, preamp gain, clipping detection, and curated presets (Bass Boost, Treble Boost, Vocal, Classical, Rock, Electronic, Acoustic).
- **Visualizer Studio**: 10 real-time visualizer modes (Spectrum Bars, Circular Spectrum, Waveform, Oscilloscope, Radial Waveform, Frequency Rings, Particle Field, Ambient Waves, Mirror Spectrum, Album-Reactive) driven by FFT frequency binning and waveform analysis.
- **Lyrics Studio**: Synchronized LRC line-by-line auto-scrolling with timestamp highlighting, manual scrolling, and integrated local LRC editor.
- **Living Album Art**: Immersive Now Playing display with dynamic color blooms responding to the musical energy and artwork palette.
- **Music DNA & Time Machine**: Private, deterministic local insights summarizing top genres, listening periods, and historical playback logs.
- **Vibe Search**: Natural-language deterministic local search filter (e.g. "short songs", "rock epics", "70s favorites").
- **Reliable Local Storage**: Persistent SQLite database in `%LOCALAPPDATA%\PixelSong` with JSON backup export and restore capabilities.
- **5 Custom Built-In Themes**: Obsidian Dark, Clean Slate Light, Cyber Neon, Deep Velvet, and Nordic Midnight, with customizable accent colors and interface density.

---

## 🏗 Architecture & Tech Stack

```text
PixelSong/
├── src/                                  # Frontend (React 18 + TypeScript + Vite)
│   ├── app/                              # Shell & Routing
│   ├── components/
│   │   ├── layout/                       # Sidebar, Header, PlayerBar, RightQueuePanel
│   │   └── ui/                           # Slider, Artwork, Modal
│   ├── features/
│   │   ├── home/                         # Quick Resume & Overview
│   │   ├── songs/                        # Full tracklist, sorting, multi-select, metadata editor
│   │   ├── albums/                       # Album grid & track listings
│   │   ├── artists/                      # Artist discography
│   │   ├── folders/                      # Monitored folder scanner
│   │   ├── playlists/                    # Manual playlists & track reordering
│   │   ├── collection/                   # Favorites & Recently Played
│   │   ├── visualizer/                   # 10 Canvas visualizer modes & presets
│   │   ├── equalizer/                    # 10-Band biquad EQ & clipping guard
│   │   ├── lyrics/                       # Synchronized LRC viewer & editor
│   │   ├── statistics/                   # Music DNA & Time Machine
│   │   ├── search/                       # Vibe Search query engine
│   │   └── settings/                     # Themes, library management, JSON backup/export
│   ├── services/                         # Typed Tauri IPC command bridge & mock fallback
│   ├── stores/                           # Zustand stores (player, queue, library, equalizer, visualizer, theme)
│   └── types/                            # Shared data contracts
├── src-tauri/                            # Native Backend (Rust + Tauri 2 + SQLite)
│   ├── migrations/                       # 001_initial_schema.sql
│   └── src/
│       ├── audio/                        # Symphonia decoder, CPAL stream, 10-band EQ DSP, FFT analyzer
│       ├── database/                     # SQLite connection & repository CRUD
│       ├── library/                      # Recursive folder scanner & deduplicator
│       ├── metadata/                     # Lofty tag extractor & thumbnail cache
│       ├── commands/                     # Tauri command handlers
│       ├── models.rs                     # Data models
│       └── lib.rs                        # Tauri runtime builder
└── tests/                                # Automated Vitest and Rust unit tests
```

---

## 🚀 Development & Build Instructions

### Prerequisites
- Windows 10 or 11 (64-bit)
- Node.js (v18+) and npm
- Rust toolchain (`rustc`, `cargo` with MSVC build tools)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
To launch the desktop application in dev mode with live reload:
```bash
npm run tauri dev
```
To run the frontend in a web browser with simulated audio data:
```bash
npm run dev
```

### 3. Run Automated Tests
```bash
# Run frontend unit tests (Vitest)
npm test

# Run Rust DSP & backend unit tests
cd src-tauri
cargo test
```

### 4. Build Production Binaries
```bash
# Build frontend bundle
npm run build

# Build native Windows release executable
cd src-tauri
cargo build --release
```
The compiled standalone Windows binary will be available at:
`src-tauri/target/release/pixelsong.exe`

---

## 🔒 Offline & Privacy Policy
PixelSong strictly upholds offline principles:
- **No telemetry, ads, or tracking pixels.**
- **No cloud servers or online API dependencies.**
- **No background web downloads or remote script execution.**
- All library indices, listening metrics, lyrics, and thumbnails stay 100% on the local disk.

---

## 📄 License
PixelSong Core — Built for desktop music collectors.
=======
# PixelSong
PixelSong is a retro-inspired, pixel-art music player that transforms your local music library into an immersive RPG-style listening experience. Discover, organize, and play your favorite tracks with beautiful visuals, animated interfaces, custom playlists, and nostalgic gaming aesthetics.
>>>>>>> b5b7ac978c5015333156638d52ec491f2bc0f986
