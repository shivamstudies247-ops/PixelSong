import { create } from 'zustand';
import { AppSettings } from '../types';

interface ThemeState {
  theme: AppSettings['theme'];
  accentColor: string;
  density: AppSettings['density'];

  setTheme: (theme: AppSettings['theme']) => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: AppSettings['density']) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'obsidian',
  accentColor: '#38bdf8',
  density: 'comfortable',

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ theme });
  },

  setAccentColor: (accentColor) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-primary', accentColor);
    }
    set({ accentColor });
  },

  setDensity: (density) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (density === 'compact') {
        root.style.setProperty('--font-density-padding-y', '4px');
        root.style.setProperty('--font-density-padding-x', '8px');
      } else if (density === 'spacious') {
        root.style.setProperty('--font-density-padding-y', '12px');
        root.style.setProperty('--font-density-padding-x', '16px');
      } else {
        root.style.setProperty('--font-density-padding-y', '8px');
        root.style.setProperty('--font-density-padding-x', '12px');
      }
    }
    set({ density });
  },
}));
