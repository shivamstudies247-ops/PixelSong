import { create } from 'zustand';
import { EQUALIZER_PRESETS } from '../services/mockData';
import { api } from '../services/tauriBridge';

interface EqualizerState {
  enabled: boolean;
  bands: number[]; // 10 gain values (-12 to +12 dB)
  preamp: number; // -6 to +6 dB
  selectedPreset: string;
  isClipping: boolean;

  setBandGain: (bandIndex: number, gain: number) => void;
  applyPreset: (presetId: string) => void;
  toggleEnabled: () => void;
  setPreamp: (gain: number) => void;
  resetToFlat: () => void;
}

export const useEqualizerStore = create<EqualizerState>((set, get) => ({
  enabled: false,
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  preamp: 0,
  selectedPreset: 'flat',
  isClipping: false,

  setBandGain: (bandIndex: number, gain: number) => {
    set((s) => {
      const copy = [...s.bands];
      copy[bandIndex] = Math.max(-12, Math.min(12, Math.round(gain * 10) / 10));
      return { bands: copy, selectedPreset: 'custom' };
    });
    const { enabled, bands, preamp } = get();
    api.updateEqualizer(enabled, bands, preamp);
  },

  applyPreset: (presetId: string) => {
    const preset = EQUALIZER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set({ bands: [...preset.bands], selectedPreset: preset.id });
      const { enabled, preamp } = get();
      api.updateEqualizer(enabled, preset.bands, preamp);
    }
  },

  toggleEnabled: () => {
    const nextEnabled = !get().enabled;
    set({ enabled: nextEnabled });
    const { bands, preamp } = get();
    api.updateEqualizer(nextEnabled, bands, preamp);
  },

  setPreamp: (gain: number) => {
    const clamped = Math.max(-6, Math.min(6, Math.round(gain * 10) / 10));
    set({ preamp: clamped });
    const { enabled, bands } = get();
    api.updateEqualizer(enabled, bands, clamped);
  },

  resetToFlat: () => {
    const flat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    set({ bands: flat, selectedPreset: 'flat', preamp: 0 });
    const { enabled } = get();
    api.updateEqualizer(enabled, flat, 0);
  },
}));
