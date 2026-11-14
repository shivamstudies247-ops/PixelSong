import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import {
  FontCategory,
  FontOption,
  TypographyConfig,
} from '../types';

// ===== FONT LIBRARY =====
// All fonts are bundled locally in src/assets/fonts/

export const FONT_LIBRARY: FontOption[] = [
  // Modern & Premium
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    category: 'modern-premium',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fileName: 'PlusJakartaSans-VariableFont_wght.ttf',
    weights: [200, 300, 400, 500, 600, 700, 800],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    category: 'modern-premium',
    fontFamily: '"Manrope", sans-serif',
    fileName: 'Manrope-VariableFont_wght.ttf',
    weights: [200, 300, 400, 500, 600, 700, 800],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'modern-premium',
    fontFamily: '"Inter", sans-serif',
    fileName: 'Inter-VariableFont_slnt,wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    category: 'modern-premium',
    fontFamily: '"DM Sans", sans-serif',
    fileName: 'DMSans-VariableFont_opsz,wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'modern-premium',
    fontFamily: '"Outfit", sans-serif',
    fileName: 'Outfit-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'sora',
    name: 'Sora',
    category: 'modern-premium',
    fontFamily: '"Sora", sans-serif',
    fileName: 'Sora-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'urbanist',
    name: 'Urbanist',
    category: 'modern-premium',
    fontFamily: '"Urbanist", sans-serif',
    fileName: 'Urbanist-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'general-sans',
    name: 'General Sans',
    category: 'modern-premium',
    fontFamily: '"General Sans", sans-serif',
    fileName: 'GeneralSans-VariableFont_wght.ttf',
    weights: [200, 300, 400, 500, 600, 700, 800],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },

  // Geometric & Futuristic
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    category: 'geometric-futuristic',
    fontFamily: '"Space Grotesk", sans-serif',
    fileName: 'SpaceGrotesk-VariableFont_wght.ttf',
    weights: [300, 400, 500, 600, 700],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    category: 'geometric-futuristic',
    fontFamily: '"Space Mono", monospace',
    fileName: 'SpaceMono-Regular.ttf',
    weights: [400, 700],
    fallback: 'monospace',
  },
  {
    id: 'oxanium',
    name: 'Oxanium',
    category: 'geometric-futuristic',
    fontFamily: '"Oxanium", sans-serif',
    fileName: 'Oxanium-VariableFont_wght.ttf',
    weights: [200, 300, 400, 500, 600, 700, 800],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'rajdhani',
    name: 'Rajdhani',
    category: 'geometric-futuristic',
    fontFamily: '"Rajdhani", sans-serif',
    fileName: 'Rajdhani-VariableFont_wght.ttf',
    weights: [300, 400, 500, 600, 700],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'exo-2',
    name: 'Exo 2',
    category: 'geometric-futuristic',
    fontFamily: '"Exo 2", sans-serif',
    fileName: 'Exo2-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'orbitron',
    name: 'Orbitron',
    category: 'geometric-futuristic',
    fontFamily: '"Orbitron", sans-serif',
    fileName: 'Orbitron-VariableFont_wght.ttf',
    weights: [400, 500, 700, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },

  // Minimal & Professional
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'minimal-professional',
    fontFamily: '"Roboto", sans-serif',
    fileName: 'Roboto-VariableFont_wght.ttf',
    weights: [100, 300, 400, 500, 700, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'minimal-professional',
    fontFamily: '"Open Sans", sans-serif',
    fileName: 'OpenSans-VariableFont_wdth,wght.ttf',
    weights: [300, 400, 500, 600, 700, 800],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'lato',
    name: 'Lato',
    category: 'minimal-professional',
    fontFamily: '"Lato", sans-serif',
    fileName: 'Lato-VariableFont_wght.ttf',
    weights: [100, 300, 400, 700, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'nunito-sans',
    name: 'Nunito Sans',
    category: 'minimal-professional',
    fontFamily: '"Nunito Sans", sans-serif',
    fileName: 'NunitoSans-VariableFont_wght.ttf',
    weights: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'ibm-plex-sans',
    name: 'IBM Plex Sans',
    category: 'minimal-professional',
    fontFamily: '"IBM Plex Sans", sans-serif',
    fileName: 'IBMPlexSans-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'source-sans-3',
    name: 'Source Sans 3',
    category: 'minimal-professional',
    fontFamily: '"Source Sans 3", sans-serif',
    fileName: 'SourceSans3-VariableFont_wght.ttf',
    weights: [200, 300, 400, 500, 600, 700, 900],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  {
    id: 'work-sans',
    name: 'Work Sans',
    category: 'minimal-professional',
    fontFamily: '"Work Sans", sans-serif',
    fileName: 'WorkSans-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },

  // Elegant & Editorial
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'elegant-editorial',
    fontFamily: '"Playfair Display", serif',
    fileName: 'PlayfairDisplay-VariableFont_wght.ttf',
    weights: [400, 500, 600, 700, 800, 900],
    fallback: 'Georgia, serif',
  },
  {
    id: 'cormorant-garamond',
    name: 'Cormorant Garamond',
    category: 'elegant-editorial',
    fontFamily: '"Cormorant Garamond", serif',
    fileName: 'CormorantGaramond-VariableFont_wght.ttf',
    weights: [300, 400, 500, 600, 700],
    fallback: 'Georgia, serif',
  },
  {
    id: 'libre-baskerville',
    name: 'Libre Baskerville',
    category: 'elegant-editorial',
    fontFamily: '"Libre Baskerville", serif',
    fileName: 'LibreBaskerville-Regular.ttf',
    weights: [400, 700],
    fallback: 'Georgia, serif',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'elegant-editorial',
    fontFamily: '"Lora", serif',
    fileName: 'Lora-VariableFont_wght.ttf',
    weights: [400, 500, 600, 700],
    fallback: 'Georgia, serif',
  },

  // Monospace
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    category: 'monospace',
    fontFamily: '"JetBrains Mono", monospace',
    fileName: 'JetBrainsMono-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    fallback: 'monospace',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    category: 'monospace',
    fontFamily: '"Fira Code", monospace',
    fileName: 'FiraCode-VariableFont_wght.ttf',
    weights: [300, 400, 500, 600, 700],
    fallback: 'monospace',
  },
  {
    id: 'ibm-plex-mono',
    name: 'IBM Plex Mono',
    category: 'monospace',
    fontFamily: '"IBM Plex Mono", monospace',
    fileName: 'IBMPlexMono-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700],
    fallback: 'monospace',
  },
  {
    id: 'roboto-mono',
    name: 'Roboto Mono',
    category: 'monospace',
    fontFamily: '"Roboto Mono", monospace',
    fileName: 'RobotoMono-VariableFont_wght.ttf',
    weights: [100, 200, 300, 400, 500, 600, 700],
    fallback: 'monospace',
  },
  {
    id: 'source-code-pro',
    name: 'Source Code Pro',
    category: 'monospace',
    fontFamily: '"Source Code Pro", monospace',
    fileName: 'SourceCodePro-VariableFont_wght.ttf',
    weights: [200, 300, 400, 500, 600, 700, 900],
    fallback: 'monospace',
  },
];

// Default font
const DEFAULT_FONT: FontOption = FONT_LIBRARY.find((f) => f.id === 'plus-jakarta-sans')!;

const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  fontFamily: DEFAULT_FONT.fontFamily,
  fontWeight: 400,
  globalSizeScale: 1.0,
  headingSizeScale: 1.0,
  uiTextSizeScale: 1.0,
  letterSpacing: 0,
};

// ===== STORE =====

interface FontState extends TypographyConfig {
  fontLibrary: FontOption[];
  favoriteFontIds: string[];
  isLoading: boolean;
  loadedFonts: Set<string>;

  // Actions
  setFontFamily: (fontFamily: string) => void;
  setFontWeight: (weight: number) => void;
  setGlobalSizeScale: (scale: number) => void;
  setHeadingSizeScale: (scale: number) => void;
  setUiTextSizeScale: (scale: number) => void;
  setLetterSpacing: (spacing: number) => void;
  toggleFavoriteFont: (fontId: string) => void;
  setTypography: (config: Partial<TypographyConfig>) => void;
  loadFont: (fontId: string) => Promise<void>;
  resetToDefault: () => void;

  // Helpers
  getFontById: (id: string) => FontOption | undefined;
  getFontsByCategory: (category: FontCategory) => FontOption[];
  isFontLoaded: (fontId: string) => boolean;
}

export const useFontStore = create<FontState>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_TYPOGRAPHY,
        fontLibrary: FONT_LIBRARY,
        favoriteFontIds: [],
        isLoading: false,
        loadedFonts: new Set(),

        setFontFamily: (fontFamily) => set({ fontFamily }),
        setFontWeight: (weight) => set({ fontWeight: weight }),
        setGlobalSizeScale: (scale) => set({ globalSizeScale: scale }),
        setHeadingSizeScale: (scale) => set({ headingSizeScale: scale }),
        setUiTextSizeScale: (scale) => set({ uiTextSizeScale: scale }),
        setLetterSpacing: (spacing) => set({ letterSpacing: spacing }),
        setTypography: (config) => set((state) => ({ ...state, ...config })),

        toggleFavoriteFont: (fontId) =>
          set((state) => {
            const isFav = state.favoriteFontIds.includes(fontId);
            return {
              favoriteFontIds: isFav
                ? state.favoriteFontIds.filter((id) => id !== fontId)
                : [...state.favoriteFontIds, fontId],
            };
          }),

        loadFont: async (fontId) => {
          const font = get().getFontById(fontId);
          if (!font || get().loadedFonts.has(fontId)) return;
          set({ isLoading: true });
          try {
            const cssFont = new FontFace(
              font.name,
              `url('../assets/fonts/${font.fileName}') format('truetype')`,
              { weight: font.weights[0]?.toString() || '400' }
            );
            await cssFont.load();
            document.fonts.add(cssFont);
            set((state) => {
              const loaded = new Set(state.loadedFonts);
              loaded.add(fontId);
              return { loadedFonts: loaded, isLoading: false };
            });
          } catch (e) {
            console.warn(`Failed to load font ${fontId}:`, e);
            set({ isLoading: false });
          }
        },

        resetToDefault: () => {
          set({
            ...DEFAULT_TYPOGRAPHY,
            favoriteFontIds: [],
            loadedFonts: new Set(),
          });
        },

        getFontById: (id) => get().fontLibrary.find((f) => f.id === id),

        getFontsByCategory: (category) =>
          get().fontLibrary.filter((f) => f.category === category),

        isFontLoaded: (id) => get().loadedFonts.has(id),
      }),
      {
        name: 'pixelsong-font-storage',
        partialize: (state) => ({
          fontFamily: state.fontFamily,
          fontWeight: state.fontWeight,
          globalSizeScale: state.globalSizeScale,
          headingSizeScale: state.headingSizeScale,
          uiTextSizeScale: state.uiTextSizeScale,
          letterSpacing: state.letterSpacing,
          favoriteFontIds: state.favoriteFontIds,
        }),
      }
    )
  )
);
