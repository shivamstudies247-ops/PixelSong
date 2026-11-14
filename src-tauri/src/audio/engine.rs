use crate::audio::analyzer::AudioAnalyzer;
use crate::audio::equalizer::EqualizerDSP;
use crate::models::{AudioStatus, VisualizerAnalysis};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use parking_lot::Mutex;
use std::fs::File;
use std::path::Path;
use std::sync::Arc;
use symphonia::core::audio::SampleBuffer;
use symphonia::core::codecs::{Decoder, DecoderOptions};
use symphonia::core::errors::Error as SymphoniaError;
use symphonia::core::formats::{FormatOptions, FormatReader, SeekMode, SeekTo};
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

struct DecoderState {
    format: Box<dyn FormatReader>,
    decoder: Box<dyn Decoder>,
    track_id: u32,
    sample_rate: u32,
    channels: usize,
    sample_buf: Option<SampleBuffer<f32>>,
    sample_buf_idx: usize,
    total_samples_played: u64,
}

struct EngineShared {
    decoder_state: Option<DecoderState>,
    is_playing: bool,
    volume: f32,
    is_muted: bool,
    current_path: Option<String>,
    duration: f64,
    position: f64,
    equalizer: EqualizerDSP,
}

pub struct SafeStream(pub cpal::Stream);
unsafe impl Send for SafeStream {}
unsafe impl Sync for SafeStream {}

pub struct AudioEngine {
    shared: Arc<Mutex<EngineShared>>,
    analyzer: Arc<Mutex<AudioAnalyzer>>,
    _stream: Option<SafeStream>,
}

impl AudioEngine {
    pub fn new() -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let sample_rate = 44100.0f32;
        let shared = Arc::new(Mutex::new(EngineShared {
            decoder_state: None,
            is_playing: false,
            volume: 0.85,
            is_muted: false,
            current_path: None,
            duration: 0.0,
            position: 0.0,
            equalizer: EqualizerDSP::new(sample_rate),
        }));

        let analyzer = Arc::new(Mutex::new(AudioAnalyzer::new(1024)));

        // Setup CPAL output stream with separate shared and analyzer locks
        let stream = Self::setup_cpal_stream(shared.clone(), analyzer.clone())?.map(SafeStream);

        Ok(Self {
            shared,
            analyzer,
            _stream: stream,
        })
    }

    fn setup_cpal_stream(
        shared: Arc<Mutex<EngineShared>>,
        analyzer: Arc<Mutex<AudioAnalyzer>>,
    ) -> Result<Option<cpal::Stream>, Box<dyn std::error::Error + Send + Sync>> {
        let host = cpal::default_host();
        let device = match host.default_output_device() {
            Some(d) => d,
            None => {
                log::warn!("No audio output device found");
                return Ok(None);
            }
        };

        let default_config = match device.default_output_config() {
            Ok(c) => c,
            Err(e) => {
                log::warn!("Failed to query audio device output config: {}", e);
                return Ok(None);
            }
        };

        let sample_rate = default_config.sample_rate().0 as f32;
        let channels = default_config.channels() as usize;

        {
            let mut s = shared.lock();
            s.equalizer.set_sample_rate(sample_rate);
        }

        let stream_res = match default_config.sample_format() {
            cpal::SampleFormat::F32 => {
                let shared_clone = shared.clone();
                let analyzer_clone = analyzer.clone();
                device.build_output_stream(
                    &default_config.into(),
                    move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                        Self::render_samples(data, &shared_clone, &analyzer_clone, channels);
                    },
                    |err| log::error!("Audio stream error: {}", err),
                    None,
                )
            }
            _ => {
                log::warn!("Unsupported sample format for default output");
                return Ok(None);
            }
        };

        match stream_res {
            Ok(stream) => {
                let _ = stream.play();
                Ok(Some(stream))
            }
            Err(e) => {
                log::warn!("Failed to build audio stream: {}", e);
                Ok(None)
            }
        }
    }

    fn render_samples(
        out_buffer: &mut [f32],
        shared: &Arc<Mutex<EngineShared>>,
        analyzer: &Arc<Mutex<AudioAnalyzer>>,
        dev_channels: usize,
    ) {
        let mut s = match shared.try_lock() {
            Some(guard) => guard,
            None => {
                out_buffer.fill(0.0);
                return;
            }
        };

        if !s.is_playing || s.decoder_state.is_none() {
            out_buffer.fill(0.0);
            return;
        }

        let volume = if s.is_muted { 0.0 } else { s.volume };
        let mut frames_written = 0;
        let total_frames = out_buffer.len() / dev_channels;

        // Buffer up to 256 mono samples for the visualizer without locking inside the inner loop
        let mut mono_samples = Vec::with_capacity(total_frames.min(256));

        while frames_written < total_frames {
            let (left_raw, right_raw, has_sample) = {
                if let Some(dec) = &mut s.decoder_state {
                    match Self::read_next_frame(dec) {
                        Some((l, r)) => (l, r, true),
                        None => (0.0, 0.0, false),
                    }
                } else {
                    (0.0, 0.0, false)
                }
            };

            if !has_sample {
                s.is_playing = false;
                for i in (frames_written * dev_channels)..out_buffer.len() {
                    out_buffer[i] = 0.0;
                }
                break;
            }

            // 1. Process 10-band Equalizer
            let (eq_left, eq_right) = s.equalizer.process_stereo(left_raw, right_raw);

            // 2. Apply master volume
            let out_l = (eq_left * volume).clamp(-1.0, 1.0);
            let out_r = (eq_right * volume).clamp(-1.0, 1.0);

            // 3. Stash mono sample for analyzer (downsampled)
            if mono_samples.len() < 256 {
                mono_samples.push((out_l + out_r) * 0.5);
            }

            // 4. Output to hardware buffer
            let base_idx = frames_written * dev_channels;
            if dev_channels >= 2 {
                out_buffer[base_idx] = out_l;
                out_buffer[base_idx + 1] = out_r;
                for ch in 2..dev_channels {
                    out_buffer[base_idx + ch] = 0.0;
                }
            } else {
                out_buffer[base_idx] = (out_l + out_r) * 0.5;
            }

            frames_written += 1;
        }

        // Update position in seconds
        if let Some(dec) = &s.decoder_state {
            if dec.sample_rate > 0 {
                s.position = dec.total_samples_played as f64 / dec.sample_rate as f64;
            }
        }

        // Drop the shared audio lock BEFORE pushing to the analyzer
        drop(s);

        // Non-blocking try_lock on the analyzer: zero impact on audio output!
        if !mono_samples.is_empty() {
            if let Some(mut a) = analyzer.try_lock() {
                a.push_slice(&mono_samples);
            }
        }
    }

    fn read_next_frame(state: &mut DecoderState) -> Option<(f32, f32)> {
        loop {
            if let Some(buf) = &state.sample_buf {
                let samples = buf.samples();
                if state.sample_buf_idx + state.channels <= samples.len() {
                    let left = samples[state.sample_buf_idx];
                    let right = if state.channels > 1 {
                        samples[state.sample_buf_idx + 1]
                    } else {
                        left
                    };
                    state.sample_buf_idx += state.channels;
                    state.total_samples_played += 1;
                    return Some((left, right));
                }
            }

            // Decode next packet
            match state.format.next_packet() {
                Ok(packet) => {
                    if packet.track_id() != state.track_id {
                        continue;
                    }

                    match state.decoder.decode(&packet) {
                        Ok(audio_buf_ref) => {
                            let mut sample_buf = match &state.sample_buf {
                                Some(existing) if existing.capacity() >= audio_buf_ref.frames() * state.channels => {
                                    state.sample_buf.take().unwrap()
                                }
                                _ => SampleBuffer::new(
                                    audio_buf_ref.capacity() as u64,
                                    *audio_buf_ref.spec(),
                                ),
                            };

                            sample_buf.copy_interleaved_ref(audio_buf_ref);
                            state.sample_buf = Some(sample_buf);
                            state.sample_buf_idx = 0;
                        }
                        Err(SymphoniaError::DecodeError(_)) => {
                            continue;
                        }
                        Err(_) => return None,
                    }
                }
                Err(_) => return None,
            }
        }
    }

    pub fn play_file(&self, file_path: &Path) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let file = File::open(file_path)?;
        let mss = MediaSourceStream::new(Box::new(file), Default::default());

        let mut hint = Hint::new();
        if let Some(ext) = file_path.extension().and_then(|e| e.to_str()) {
            hint.with_extension(ext);
        }

        let format_opts = FormatOptions {
            enable_gapless: true,
            ..Default::default()
        };
        let metadata_opts = MetadataOptions::default();

        let probed = symphonia::default::get_probe().format(&hint, mss, &format_opts, &metadata_opts)?;
        let format = probed.format;

        let track = format
            .tracks()
            .iter()
            .find(|t| t.codec_params.codec != symphonia::core::codecs::CODEC_TYPE_NULL)
            .ok_or("No supported audio track found")?;

        let track_id = track.id;
        let sample_rate = track.codec_params.sample_rate.unwrap_or(44100);
        let channels = track.codec_params.channels.map(|c| c.count()).unwrap_or(2);

        let duration_seconds = track
            .codec_params
            .n_frames
            .map(|n| n as f64 / sample_rate as f64)
            .unwrap_or(0.0);

        let decoder_opts = DecoderOptions::default();
        let decoder = symphonia::default::get_codecs().make(&track.codec_params, &decoder_opts)?;

        let state = DecoderState {
            format,
            decoder,
            track_id,
            sample_rate,
            channels,
            sample_buf: None,
            sample_buf_idx: 0,
            total_samples_played: 0,
        };

        {
            let mut s = self.shared.lock();
            s.decoder_state = Some(state);
            s.current_path = Some(file_path.to_string_lossy().to_string());
            s.duration = duration_seconds;
            s.position = 0.0;
            s.is_playing = true;
            s.equalizer.reset();
        }

        Ok(())
    }

    pub fn pause(&self) {
        let mut s = self.shared.lock();
        s.is_playing = false;
    }

    pub fn resume(&self) {
        let mut s = self.shared.lock();
        if s.decoder_state.is_some() {
            s.is_playing = true;
        }
    }

    pub fn stop(&self) {
        let mut s = self.shared.lock();
        s.is_playing = false;
        s.position = 0.0;
        s.decoder_state = None;
        s.current_path = None;
    }

    pub fn seek(&self, seconds: f64) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut s = self.shared.lock();
        if let Some(dec) = &mut s.decoder_state {
            let target_sample = (seconds * dec.sample_rate as f64) as u64;
            let seek_to = SeekTo::TimeStamp {
                ts: target_sample,
                track_id: dec.track_id,
            };

            if let Ok(_) = dec.format.seek(SeekMode::Coarse, seek_to) {
                dec.decoder.reset();
                dec.sample_buf = None;
                dec.sample_buf_idx = 0;
                dec.total_samples_played = target_sample;
                s.position = seconds;
            }
        }
        Ok(())
    }

    pub fn set_volume(&self, volume: f32) {
        let mut s = self.shared.lock();
        s.volume = volume.clamp(0.0, 1.0);
    }

    pub fn set_muted(&self, muted: bool) {
        let mut s = self.shared.lock();
        s.is_muted = muted;
    }

    pub fn get_status(&self) -> AudioStatus {
        let s = self.shared.lock();
        AudioStatus {
            is_playing: s.is_playing,
            position: s.position,
            duration: s.duration,
            volume: s.volume,
            is_muted: s.is_muted,
            current_path: s.current_path.clone(),
        }
    }

    pub fn update_equalizer(&self, enabled: bool, bands: &[f32], preamp: f32) {
        let mut s = self.shared.lock();
        s.equalizer.update_params(enabled, bands, preamp);
    }

    pub fn get_analysis(&self) -> VisualizerAnalysis {
        // Locks ONLY self.analyzer; never blocks or contends with audio thread!
        let mut a = self.analyzer.lock();
        a.compute_analysis()
    }
}
