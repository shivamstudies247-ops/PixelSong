import { create } from 'zustand';
import { api } from '../services/tauriBridge';

interface WidgetState {
  isOpen: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
  toggle: () => Promise<void>;
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  isOpen: false,

  open: async () => {
    await api.showWidget();
    set({ isOpen: true });
  },

  close: async () => {
    await api.hideWidget();
    set({ isOpen: false });
  },

  toggle: async () => {
    if (get().isOpen) {
      await api.hideWidget();
    } else {
      await api.showWidget();
    }
    set({ isOpen: !get().isOpen });
  },
}));
