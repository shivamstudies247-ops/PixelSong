# PixelSong Gen 1 — Manual Test Checklist

Use this checklist to perform complete acceptance verification against the requirements in the Master PRD.

---

### Phase 1: Installation & Offline Launch
- [x] Launch the application with network connection disconnected.
- [x] Verify window opens cleanly with default Obsidian Dark theme.
- [x] Verify no network requests or external CDN dependencies are invoked.
- [x] Confirm three-zone desktop workspace layout (Left Sidebar, Main Stage, Bottom PlayerBar, and Collapsible Queue).

---

### Phase 2: Local Music Import & Scanning
- [x] Navigate to **Folders** view and add a local music directory.
- [x] Verify live scanning banner shows discovered and processed file counts.
- [x] Verify supported audio formats (.mp3, .flac, .wav, .ogg) appear in Songs view.
- [x] Verify embedded metadata (Title, Artist, Album, Year, Genre, Track Number) is extracted without fabricated values.
- [x] Verify embedded album artwork appears as cached thumbnails.
- [x] Verify removing a folder removes the records from PixelSong but leaves physical audio files untouched on disk.

---

### Phase 3: Playback Controls & Transitions
- [x] Click play on any song in Songs view.
- [x] Verify audio plays cleanly through default Windows audio device.
- [x] Verify Play, Pause, Resume, Stop, Next, and Previous controls.
- [x] Drag the timeline slider to seek to different timestamps; verify playback seeks accurately.
- [x] Test volume slider and mute toggle.
- [x] Test Shuffle and Repeat modes (Off, All, One).
- [x] Verify playback continues seamlessly when navigating between views (Home, Songs, Albums, Artists, Folders, Settings).

---

### Phase 4: Queue & Playlist Management
- [x] Add individual tracks and albums to the "Up Next" queue.
- [x] Open the right queue panel and reorder items using move up/down controls.
- [x] Remove an item from the queue; verify queue updates.
- [x] Click "Save Queue as Playlist", provide a name, and verify the new playlist appears in Playlists view.
- [x] In Playlists view, play the playlist, shuffle it, and delete it.

---

### Phase 5: Visualizer Studio & Living Album Art
- [x] Open Visualizer Studio.
- [x] Cycle through all 10 modes:
  1. Spectrum Bars
  2. Circular Spectrum
  3. Waveform
  4. Oscilloscope
  5. Radial Waveform
  6. Frequency Rings
  7. Particle Field
  8. Ambient Waves
  9. Mirror Spectrum
  10. Album-Reactive
- [x] Verify visualizers react to audio frequencies in real-time.
- [x] Adjust Sensitivity, Smoothing, Segments, Speed, and Color Palettes.
- [x] Expand "Now Playing" view and verify Living Album Art ambient glow reacting to music.

---

### Phase 6: 10-Band Equalizer DSP
- [x] Open the Equalizer view.
- [x] Toggle the EQ from Bypassed to Active.
- [x] Boost or cut bands (31Hz to 16kHz) and verify the physical audio tone changes accordingly.
- [x] Switch presets (Bass Boost, Treble Boost, Vocal, Classical, Rock, Electronic, Acoustic).
- [x] Boost Preamp gain and verify clipping distortion warning illuminates if signals exceed headroom.
- [x] Click "Reset Flat" and verify all bands return to 0dB.

---

### Phase 7: Lyrics Studio
- [x] Play a track and open Lyrics Studio.
- [x] Import an `.lrc` file or edit lyrics manually.
- [x] Verify active lyric line is highlighted and scrolls automatically with the track position.
- [x] Click any timestamped line to seek audio playback directly to that lyric moment.

---

### Phase 8: Statistics & Music DNA
- [x] View Statistics view; verify total playtime, plays count, and library track count.
- [x] Check Music DNA genre breakdown percentages.
- [x] Verify Time Machine history shows recent play events with timestamps.
- [x] Test "Clear History" button with confirmation modal.

---

### Phase 9: Settings, Themes & Database Backup
- [x] Switch between built-in themes (Obsidian Dark, Clean Slate Light, Cyber Neon, Deep Velvet, Nordic Midnight).
- [x] Change accent color and interface density.
- [x] Click "Export Database Backup" and verify JSON backup is downloaded.
- [x] Verify settings persist across app reloads.
