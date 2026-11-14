# PixelSong Gen 1 — Known Limitations & System Specifications

## 1. Supported Audio Formats & Codecs
PixelSong Gen 1 supports the following target audio formats natively decoded via Symphonia:
- **MP3 (MPEG-1/2 Audio Layer III)**: Supported across all standard bitrates (CBR, VBR 32kbps to 320kbps).
- **FLAC (Free Lossless Audio Codec)**: Fully supported with 16-bit and 24-bit samples.
- **WAV (PCM Waveform)**: 16-bit, 24-bit, and 32-bit float PCM audio streams supported.
- **OGG Vorbis**: Ogg containers with Vorbis audio streams supported.

### Excluded / Deferred Codecs
- **AAC / M4A (MPEG-4 Audio)** and **ALAC**: Deferred to future releases pending platform codec container validation.
- **WMA (Windows Media Audio)**: Not supported in Gen 1.
- **DRM Encrypted Files**: Strictly unsupported. PixelSong only plays unencrypted local audio files.

---

## 2. Windows Audio Device Support
- **Default Audio Device**: PixelSong utilizes the Windows WASAPI default playback device configured in Windows Sound Settings.
- **Device Switching**: If default audio devices are changed while playback is in progress, restarting the track or pressing pause/resume will switch to the newly selected default output device.
- **Sample Rates**: Supported nominal sample rates range from 44,100 Hz to 192,000 Hz. The audio mixer automatically configures the hardware stream based on the Windows soundcard device capabilities.

---

## 3. Visualizer Studio Performance
- All 10 visualizer modes run on hardware-accelerated 2D Canvas via `requestAnimationFrame`.
- On low-power battery saving modes, lowering the "Segments" slider and reducing "Smoothing" will reduce GPU rendering overhead.
- When minimized, the visualizer loop automatically pauses rendering to conserve CPU cycles.

---

## 4. Local File Tags & Metadata
- Editing metadata in PixelSong updates the local SQLite database. It intentionally does not modify original file bytes to prevent any risk of data loss on external or network drives.
- Removing a folder from the library removes its records and cached thumbnails from the PixelSong database without deleting any files from your disk.
