import { create } from 'zustand';
import { VisualizerConfig, VisualizerMode } from '../types';

interface VisualizerStoreState extends VisualizerConfig {
  setMode: (mode: VisualizerMode) => void;
  setBarCount: (count: number) => void;
  setSensitivity: (val: number) => void;
  setSmoothing: (val: number) => void;
  setColorScheme: (scheme: VisualizerConfig['colorScheme']) => void;
  setAnimationSpeed: (speed: number) => void;
  toggleFullscreen: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_CONFIG: VisualizerConfig = {
  mode: 'spectrum',
  barCount: 48,
  sensitivity: 1.2,
  smoothing: 0.75,
  colorScheme: 'theme',
  animationSpeed: 1.0,
  isFullscreen: false,
  showFPS: false,
};

export const useVisualizerStore = create<VisualizerStoreState>((set) => ({
  ...DEFAULT_CONFIG,

  setMode: (mode) => set({ mode }),
  setBarCount: (barCount) => set({ barCount }),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setSmoothing: (smoothing) => set({ smoothing }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  resetToDefaults: () => set({ ...DEFAULT_CONFIG }),
}));
