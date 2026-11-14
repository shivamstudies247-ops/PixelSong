pub const EQUALIZER_FREQUENCIES: [f32; 10] = [
    31.25, 62.5, 125.0, 250.0, 500.0, 1000.0, 2000.0, 4000.0, 8000.0, 16000.0,
];

#[derive(Clone, Debug)]
pub struct BiquadFilter {
    b0: f32,
    b1: f32,
    b2: f32,
    a1: f32,
    a2: f32,
    x1: f32,
    x2: f32,
    y1: f32,
    y2: f32,
}

impl BiquadFilter {
    pub fn new() -> Self {
        Self {
            b0: 1.0,
            b1: 0.0,
            b2: 0.0,
            a1: 0.0,
            a2: 0.0,
            x1: 0.0,
            x2: 0.0,
            y1: 0.0,
            y2: 0.0,
        }
    }

    pub fn set_peaking(&mut self, sample_rate: f32, center_freq: f32, gain_db: f32, q: f32) {
        if gain_db.abs() < 0.05 {
            // Flat pass-through
            self.b0 = 1.0;
            self.b1 = 0.0;
            self.b2 = 0.0;
            self.a1 = 0.0;
            self.a2 = 0.0;
            return;
        }

        let a = 10.0f32.powf(gain_db / 40.0);
        let omega = 2.0 * std::f32::consts::PI * (center_freq.min(sample_rate * 0.49) / sample_rate);
        let sin_w = omega.sin();
        let cos_w = omega.cos();
        let alpha = sin_w / (2.0 * q);

        let b0 = 1.0 + alpha * a;
        let b1 = -2.0 * cos_w;
        let b2 = 1.0 - alpha * a;
        let a0 = 1.0 + alpha / a;
        let a1 = -2.0 * cos_w;
        let a2 = 1.0 - alpha / a;

        self.b0 = b0 / a0;
        self.b1 = b1 / a0;
        self.b2 = b2 / a0;
        self.a1 = a1 / a0;
        self.a2 = a2 / a0;
    }

    #[inline(always)]
    pub fn process(&mut self, sample: f32) -> f32 {
        let out = self.b0 * sample + self.b1 * self.x1 + self.b2 * self.x2 - self.a1 * self.y1 - self.a2 * self.y2;
        self.x2 = self.x1;
        self.x1 = sample;
        self.y2 = self.y1;
        self.y1 = out;
        out
    }

    pub fn reset(&mut self) {
        self.x1 = 0.0;
        self.x2 = 0.0;
        self.y1 = 0.0;
        self.y2 = 0.0;
    }
}

pub struct EqualizerDSP {
    sample_rate: f32,
    enabled: bool,
    preamp_gain: f32,
    filters_left: Vec<BiquadFilter>,
    filters_right: Vec<BiquadFilter>,
    clipping_detected: bool,
}

impl EqualizerDSP {
    pub fn new(sample_rate: f32) -> Self {
        let mut filters_left = Vec::with_capacity(10);
        let mut filters_right = Vec::with_capacity(10);
        for _ in 0..10 {
            filters_left.push(BiquadFilter::new());
            filters_right.push(BiquadFilter::new());
        }

        Self {
            sample_rate,
            enabled: false,
            preamp_gain: 1.0,
            filters_left,
            filters_right,
            clipping_detected: false,
        }
    }

    pub fn update_params(&mut self, enabled: bool, bands: &[f32], preamp_db: f32) {
        self.enabled = enabled;
        self.preamp_gain = 10.0f32.powf(preamp_db / 20.0);

        for (i, &gain_db) in bands.iter().take(10).enumerate() {
            let freq = EQUALIZER_FREQUENCIES[i];
            self.filters_left[i].set_peaking(self.sample_rate, freq, gain_db, 1.414);
            self.filters_right[i].set_peaking(self.sample_rate, freq, gain_db, 1.414);
        }
    }

    pub fn set_sample_rate(&mut self, sample_rate: f32) {
        self.sample_rate = sample_rate;
    }

    #[inline]
    pub fn process_stereo(&mut self, left: f32, right: f32) -> (f32, f32) {
        if !self.enabled {
            return (left, right);
        }

        let mut out_left = left * self.preamp_gain;
        let mut out_right = right * self.preamp_gain;

        for f in &mut self.filters_left {
            out_left = f.process(out_left);
        }
        for f in &mut self.filters_right {
            out_right = f.process(out_right);
        }

        if out_left.abs() > 1.0 || out_right.abs() > 1.0 {
            self.clipping_detected = true;
            // Soft-saturation to prevent harsh digital wrap-around distortion
            out_left = out_left.clamp(-1.0, 1.0);
            out_right = out_right.clamp(-1.0, 1.0);
        }

        (out_left, out_right)
    }

    pub fn check_and_clear_clipping(&mut self) -> bool {
        let clip = self.clipping_detected;
        self.clipping_detected = false;
        clip
    }

    pub fn reset(&mut self) {
        for f in &mut self.filters_left {
            f.reset();
        }
        for f in &mut self.filters_right {
            f.reset();
        }
        self.clipping_detected = false;
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_biquad_flat_gain() {
        let mut filter = BiquadFilter::new();
        filter.set_peaking(44100.0, 1000.0, 0.0, 1.414);
        let sample = 0.5f32;
        let out = filter.process(sample);
        assert!((out - sample).abs() < 1e-4);
    }

    #[test]
    fn test_equalizer_boost_and_cut() {
        let mut eq = EqualizerDSP::new(44100.0);
        let mut bands = vec![0.0f32; 10];
        bands[0] = 6.0; // +6dB at 31Hz
        bands[9] = -6.0; // -6dB at 16kHz
        eq.update_params(true, &bands, 0.0);

        let (left, right) = eq.process_stereo(0.2, 0.2);
        assert!(left.is_finite());
        assert!(right.is_finite());
    }

    #[test]
    fn test_clipping_indicator() {
        let mut eq = EqualizerDSP::new(44100.0);
        let bands = vec![12.0f32; 10]; // High boost to test clipping
        eq.update_params(true, &bands, 6.0);

        let _ = eq.process_stereo(0.95, 0.95);
        assert!(eq.check_and_clear_clipping());
        // After checking, clipping flag should be cleared
        assert!(!eq.check_and_clear_clipping());
    }
}
