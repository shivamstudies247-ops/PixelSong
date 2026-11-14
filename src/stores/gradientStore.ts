import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import {
  CustomGradient,
  GradientConfig,
  GradientPreset,
  GradientSource,
  GradientStop,
  GradientType,
  RandomGradientStyle,
} from '../types';

export type { CustomGradient, GradientPreset, GradientStop, GradientType, RandomGradientStyle };

// ===== PRESET GRADIENTS =====

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#0f0c29', position: 0 },
      { id: 's2', color: '#302b63', position: 50 },
      { id: 's3', color: '#24243e', position: 100 },
    ],
    category: 'Dark',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#001f3f', position: 0 },
      { id: 's2', color: '#0074D9', position: 50 },
      { id: 's3', color: '#7FDBFF', position: 100 },
    ],
    category: 'Cool',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#FF512F', position: 0 },
      { id: 's2', color: '#DD2476', position: 50 },
      { id: 's3', color: '#8E2DE2', position: 100 },
    ],
    category: 'Warm',
  },
  {
    id: 'aurora-green',
    name: 'Aurora Green',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#11998e', position: 0 },
      { id: 's2', color: '#38ef7d', position: 50 },
      { id: 's3', color: '#48c6ef', position: 100 },
    ],
    category: 'Cool',
  },
  {
    id: 'crimson-night',
    name: 'Crimson Night',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#1a1a1a', position: 0 },
      { id: 's2', color: '#8E0E00', position: 50 },
      { id: 's3', color: '#1F1C18', position: 100 },
    ],
    category: 'Dark',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#0f0c29', position: 0 },
      { id: 's2', color: '#ff00ff', position: 30 },
      { id: 's3', color: '#00ffff', position: 70 },
      { id: 's4', color: '#0f0c29', position: 100 },
    ],
    category: 'Neon',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#E6C9A8', position: 0 },
      { id: 's2', color: '#E8D5B5', position: 50 },
      { id: 's3', color: '#D4C1A3', position: 100 },
    ],
    category: 'Soft',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#FFA17F', position: 0 },
      { id: 's2', color: '#FAD0C4', position: 50 },
      { id: 's3', color: '#A18CD1', position: 100 },
    ],
    category: 'Warm',
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    type: 'radial',
    angle: 0,
    stops: [
      { id: 's1', color: '#000000', position: 0 },
      { id: 's2', color: '#0A0A2E', position: 40 },
      { id: 's3', color: '#1A1A3E', position: 100 },
    ],
    category: 'Dark',
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#1B4332', position: 0 },
      { id: 's2', color: '#2D6A4F', position: 50 },
      { id: 's3', color: '#40916C', position: 100 },
    ],
    category: 'Nature',
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#E0F7FA', position: 0 },
      { id: 's2', color: '#B2EBF2', position: 50 },
      { id: 's3', color: '#80DEEA', position: 100 },
    ],
    category: 'Cool',
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    type: 'linear',
    angle: 135,
    stops: [
      { id: 's1', color: '#FFE5E5', position: 0 },
      { id: 's2', color: '#FFC8DD', position: 50 },
      { id: 's3', color: '#FFAFCC', position: 100 },
    ],
    category: 'Soft',
  },
];

// ===== DEFAULT CUSTOM GRADIENT =====

const DEFAULT_CUSTOM: CustomGradient = {
  id: 'custom-default',
  name: 'My Gradient',
  type: 'linear',
  angle: 135,
  stops: [
    { id: 's1', color: '#0f172a', position: 0 },
    { id: 's2', color: '#38bdf8', position: 50 },
    { id: 's3', color: '#818cf8', position: 100 },
  ],
  isDefault: true,
};

// ===== DEFAULT CONFIG =====

const DEFAULT_CONFIG: GradientConfig = {
  enabled: true,
  source: 'custom',
  customGradientId: 'custom-default',
  presetId: null,
  randomStyle: null,
  animationEnabled: true,
  animationSpeed: 2,
};

// ===== HELPERS =====

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function randomColor(style: RandomGradientStyle): string {
  const hueRanges: Record<RandomGradientStyle, [number, number]> = {
    'dark-moody': [240, 280],
    'vibrant-colorful': [0, 360],
    'pastel-soft': [200, 320],
    'neon-cyberpunk': [260, 300],
    'minimal-elegant': [0, 40],
    'completely-random': [0, 360],
  };
  const [min, max] = hueRanges[style];
  const hue = Math.floor(Math.random() * (max - min)) + min;
  const sat = style === 'pastel-soft' ? 40 + Math.random() * 30 : 60 + Math.random() * 40;
  const light = style === 'dark-moody' ? 15 + Math.random() * 20 : 40 + Math.random() * 30;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function generateRandomGradient(style: RandomGradientStyle): CustomGradient {
  const count = 2 + Math.floor(Math.random() * 3); // 2-4 stops
  const stops: GradientStop[] = [];
  for (let i = 0; i < count; i++) {
    stops.push({
      id: `s${i}`,
      color: randomColor(style),
      position: Math.round((i / (count - 1)) * 100),
    });
  }
  // Ensure first is 0 and last is 100
  if (stops.length > 0) {
    stops[0].position = 0;
    stops[stops.length - 1].position = 100;
  }
  return {
    id: `random-${generateId()}`,
    name: 'Random Gradient',
    type: Math.random() > 0.5 ? 'linear' : 'radial',
    angle: Math.floor(Math.random() * 360),
    stops,
    isDefault: false,
  };
}

// ===== STORE =====

interface GradientState extends GradientConfig {
  customGradients: CustomGradient[];
  presets: GradientPreset[];
  currentGradient: CustomGradient | null;
  lastSongId: string | null;

  // Actions
  setEnabled: (enabled: boolean) => void;
  setSource: (source: GradientSource) => void;
  setCustomGradient: (id: string | null) => void;
  setPreset: (id: string | null) => void;
  setRandomStyle: (style: RandomGradientStyle | null) => void;
  setAnimation: (enabled: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setGradient: (config: Partial<GradientConfig>) => void;

  // Custom gradient actions
  addCustomGradient: (gradient: Omit<CustomGradient, 'id'>) => void;
  updateCustomGradient: (id: string, updates: Partial<CustomGradient>) => void;
  deleteCustomGradient: (id: string) => void;
  setDefaultGradient: (id: string) => void;

  // Gradient generation
  generateRandomGradient: (style: RandomGradientStyle) => CustomGradient;
  getGradientForSong: (songId: string) => { css: string; gradient: CustomGradient | null };

  // Reset
  resetToDefault: () => void;
}

export const useGradientStore = create<GradientState>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_CONFIG,
        customGradients: [DEFAULT_CUSTOM],
        presets: GRADIENT_PRESETS,
        currentGradient: null,
        lastSongId: null,

        setEnabled: (enabled) => set({ enabled }),
        setSource: (source) => set({ source }),
        setCustomGradient: (id) => set({ customGradientId: id }),
        setPreset: (id) => set({ presetId: id }),
        setRandomStyle: (style) => set({ randomStyle: style }),
        setAnimation: (enabled) => set({ animationEnabled: enabled }),
        setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
        setGradient: (config) => set((state) => ({ ...state, ...config })),

        addCustomGradient: (gradient) => {
          const newGrad: CustomGradient = { ...gradient, id: generateId() };
          set((state) => ({
            customGradients: [...state.customGradients, newGrad],
            customGradientId: newGrad.id,
            source: 'custom',
          }));
        },

        updateCustomGradient: (id, updates) => {
          set((state) => ({
            customGradients: state.customGradients.map((g) =>
              g.id === id ? { ...g, ...updates } : g
            ),
          }));
        },

        deleteCustomGradient: (id) => {
          set((state) => {
            const filtered = state.customGradients.filter((g) => g.id !== id);
            let newId = state.customGradientId;
            if (state.customGradientId === id) {
              newId = filtered.length > 0 ? filtered[0].id : null;
            }
            return {
              customGradients: filtered,
              customGradientId: newId,
              source: newId ? 'custom' : 'preset',
            };
          });
        },

        setDefaultGradient: (id) => {
          set((state) => ({
            customGradients: state.customGradients.map((g) => ({
              ...g,
              isDefault: g.id === id,
            })),
            customGradientId: id,
            source: 'custom',
          }));
        },

        generateRandomGradient: (style) => {
          return generateRandomGradient(style);
        },

        getGradientForSong: (songId) => {
          const { source, customGradientId, presetId, randomStyle, customGradients, presets, lastSongId, currentGradient } = get();

          // If same song, return current gradient
          if (lastSongId === songId && currentGradient) {
            return { css: gradientToCss(currentGradient), gradient: currentGradient };
          }

          let gradient: CustomGradient | null = null;

          if (source === 'custom') {
            gradient =
              customGradients.find((g) => g.id === customGradientId) ||
              customGradients.find((g) => g.isDefault) ||
              customGradients[0] ||
              null;
          } else if (source === 'preset') {
            const preset = presets.find((p) => p.id === presetId) || presets[0];
            if (preset) {
              gradient = {
                id: preset.id,
                name: preset.name,
                type: preset.type,
                angle: preset.angle,
                stops: [...preset.stops],
                isDefault: false,
              };
            }
          } else if (source === 'random') {
            gradient = generateRandomGradient(randomStyle || 'completely-random');
          }

          if (!gradient) {
            gradient = customGradients.find((g) => g.isDefault) || customGradients[0] || null;
          }

          if (gradient) {
            set({ currentGradient: gradient, lastSongId: songId });
          }

          return gradient
            ? { css: gradientToCss(gradient), gradient }
            : { css: '', gradient: null };
        },

        resetToDefault: () => {
          set({
            ...DEFAULT_CONFIG,
            customGradients: [DEFAULT_CUSTOM],
            currentGradient: null,
            lastSongId: null,
          });
        },
      }),
      {
        name: 'pixelsong-gradient-storage',
        partialize: (state) => ({
          enabled: state.enabled,
          source: state.source,
          customGradientId: state.customGradientId,
          presetId: state.presetId,
          randomStyle: state.randomStyle,
          animationEnabled: state.animationEnabled,
          animationSpeed: state.animationSpeed,
          customGradients: state.customGradients,
        }),
      }
    )
  )
);

// ===== UTILITY =====

type GradientLike = Pick<CustomGradient, 'type' | 'angle' | 'stops'>;

export function gradientToCss(gradient: GradientLike): string {
  if (!gradient || gradient.stops.length === 0) return '';

  const stopsCss = gradient.stops
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');

  if (gradient.type === 'radial') {
    return `radial-gradient(circle at center, ${stopsCss})`;
  }

  return `linear-gradient(${gradient.angle}deg, ${stopsCss})`;
}

export function gradientPreviewCss(gradient: CustomGradient): string {
  return gradientToCss(gradient);
}
