use crate::models::VisualizerAnalysis;
use std::f32::consts::PI;

pub struct AudioAnalyzer {
    sample_buffer: Vec<f32>,
    write_pos: usize,
    buffer_size: usize,
    frequencies_cache: Vec<f32>,
    waveform_cache: Vec<f32>,
    smoothing: f32,
    // Precomputed tables for instant zero-trigonometry analysis
    cos_table: Vec<Vec<f32>>,
    sin_table: Vec<Vec<f32>>,
    hann_window: Vec<f32>,
    window_size: usize,
    target_frequencies: Vec<f32>,
}

impl AudioAnalyzer {
    pub fn new(buffer_size: usize) -> Self {
        let window_size = 256;
        let num_bands = 64;
        let sample_rate = 44100.0f32;

        let min_freq = 25.0f32;
        let max_freq = 18000.0f32;
        let log_min = min_freq.ln();
        let log_max = max_freq.ln();

        let mut cos_table = Vec::with_capacity(num_bands);
        let mut sin_table = Vec::with_capacity(num_bands);
        let mut target_frequencies = Vec::with_capacity(num_bands);

        // Precompute Hann window
        let mut hann_window = Vec::with_capacity(window_size);
        for i in 0..window_size {
            let mult = 0.5 * (1.0 - (2.0 * PI * i as f32 / (window_size as f32 - 1.0)).cos());
            hann_window.push(mult);
        }

        // Precompute cosine & sine tables for all 64 bands across all 256 window samples
        for b in 0..num_bands {
            let log_freq = log_min + (b as f32 / num_bands as f32) * (log_max - log_min);
            let freq = log_freq.exp();
            target_frequencies.push(freq);

            let omega = 2.0 * PI * freq / sample_rate;
            let mut cos_row = Vec::with_capacity(window_size);
            let mut sin_row = Vec::with_capacity(window_size);

            for i in 0..window_size {
                let angle = omega * i as f32;
                cos_row.push(angle.cos());
                sin_row.push(angle.sin());
            }

            cos_table.push(cos_row);
            sin_table.push(sin_row);
        }

        Self {
            sample_buffer: vec![0.0; buffer_size],
            write_pos: 0,
            buffer_size,
            frequencies_cache: vec![0.0; num_bands],
            waveform_cache: vec![0.0; 128],
            smoothing: 0.7,
            cos_table,
            sin_table,
            hann_window,
            window_size,
            target_frequencies,
        }
    }

    #[inline(always)]
    pub fn push_sample(&mut self, sample: f32) {
        self.sample_buffer[self.write_pos] = sample;
        self.write_pos = (self.write_pos + 1) % self.buffer_size;
    }

    pub fn push_slice(&mut self, samples: &[f32]) {
        for &s in samples {
            self.push_sample(s);
        }
    }

    pub fn compute_analysis(&mut self) -> VisualizerAnalysis {
        let n = self.window_size;
        let mut windowed = [0.0f32; 256];
        let start = (self.write_pos + self.buffer_size - n) % self.buffer_size;

        for i in 0..n {
            let idx = (start + i) % self.buffer_size;
            windowed[i] = self.sample_buffer[idx] * self.hann_window[i];
        }

        // Downsample waveform for display (128 points)
        let waveform_points = 128;
        let mut waveform = Vec::with_capacity(waveform_points);
        for i in 0..waveform_points {
            let idx = i * 2;
            let s = windowed[idx].clamp(-1.0, 1.0);
            waveform.push(s);
        }

        // Fast DFT using precomputed cosine and sine basis tables
        let num_bands = self.cos_table.len();
        let mut new_frequencies = Vec::with_capacity(num_bands);

        let mut bass_sum = 0.0f32;
        let mut mid_sum = 0.0f32;
        let mut treble_sum = 0.0f32;

        for b in 0..num_bands {
            let cos_row = &self.cos_table[b];
            let sin_row = &self.sin_table[b];
            let mut real = 0.0f32;
            let mut imag = 0.0f32;

            for i in 0..n {
                let s = windowed[i];
                real += s * cos_row[i];
                imag -= s * sin_row[i];
            }

            let magnitude = (real * real + imag * imag).sqrt() / (n as f32 * 0.25);
            let normalized = (magnitude * 3.5).min(1.0);

            let prev = self.frequencies_cache[b];
            let smoothed = prev * self.smoothing + normalized * (1.0 - self.smoothing);
            new_frequencies.push(smoothed);

            let freq = self.target_frequencies[b];
            if freq < 250.0 {
                bass_sum += smoothed;
            } else if freq < 4000.0 {
                mid_sum += smoothed;
            } else {
                treble_sum += smoothed;
            }
        }

        self.frequencies_cache = new_frequencies.clone();
        self.waveform_cache = waveform.clone();

        let bass_energy = (bass_sum / 16.0).min(1.0);
        let mid_energy = (mid_sum / 32.0).min(1.0);
        let treble_energy = (treble_sum / 16.0).min(1.0);

        VisualizerAnalysis {
            frequencies: new_frequencies,
            waveform,
            bass_energy,
            mid_energy,
            treble_energy,
        }
    }
}
