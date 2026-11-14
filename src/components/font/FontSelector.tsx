import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, Check, ArrowUpDown, Layout } from 'lucide-react';
import { useFontStore } from '../../stores/fontStore';
import { FontOption, FontCategory } from '../../types';

interface FontSelectorProps {
  onClose: () => void;
}

const CATEGORY_LABELS: Record<FontCategory, string> = {
  'modern-premium': 'Modern & Premium',
  'geometric-futuristic': 'Geometric & Futuristic',
  'minimal-professional': 'Minimal & Professional',
  'elegant-editorial': 'Elegant & Editorial',
  monospace: 'Monospace',
};

export const FontSelector: React.FC<FontSelectorProps> = ({ onClose }) => {
  const {
    fontFamily,
    fontWeight,
    favoriteFontIds,
    toggleFavoriteFont,
    fontLibrary,
    loadFont,
    isFontLoaded,
    setFontFamily,
    setFontWeight,
    setGlobalSizeScale,
    setHeadingSizeScale,
    setUiTextSizeScale,
    setLetterSpacing,
    globalSizeScale,
    headingSizeScale,
    uiTextSizeScale,
    letterSpacing,
  } = useFontStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | 'all'>('all');
  const [previewText, setPreviewText] = useState('PixelSong');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredFonts = useMemo(() => {
    return fontLibrary
      .filter((f) => {
        if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
        if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? cmp : -cmp;
      });
  }, [searchQuery, selectedCategory, sortDirection, fontLibrary]);

  const currentFont = fontLibrary.find((f) => f.fontFamily === fontFamily);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-text">Typography Studio</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Customize the application font. Changes apply across the entire player.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:text-rose-400 hover:bg-surface-hover transition-colors"
          >
            <span className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-text outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-text'
                : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
            }`}
          >
            All
          </button>
          {['modern-premium', 'geometric-futuristic', 'minimal-professional', 'elegant-editorial', 'monospace'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as FontCategory)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-text'
                  : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              {CATEGORY_LABELS[cat as FontCategory]}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {/* Font Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFonts.map((font) => {
              const isSelected = font.fontFamily === fontFamily;
              const isFav = favoriteFontIds.includes(font.id);
              const isLoaded = isFontLoaded(font.id);

              return (
                <div
                  key={font.id}
                  onClick={() => {
                    loadFont(font.id);
                    setFontFamily(font.fontFamily);
                  }}
                  className={`group cursor-pointer p-3 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/60 hover:border-primary/50 hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text truncate">{font.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteFont(font.id);
                      }}
                      className="p-1 transition-colors"
                    >
                      {isFav ? (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ) : (
                        <Star className="w-4 h-4 text-text-subtle" />
                      )}
                    </button>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary fill-primary" />
                    )}
                  </div>

                  {/* Preview */}
                  <div
                    className="h-20 rounded-lg border border-border overflow-hidden mb-2 relative"
                    style={{
                      fontFamily: font.fontFamily,
                      fontWeight: isLoaded ? '400' : '400',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <p
                        className="text-sm font-medium text-text truncate"
                        style={{ fontFamily: font.fontFamily }}
                      >
                        {previewText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-subtle capitalize">{CATEGORY_LABELS[font.category]}</span>
                    {!isLoaded && (
                      <span className="text-[10px] text-primary animate-pulse">Loading...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Typography Controls */}
          <div className="mt-8 pt-6 border-t border-border/60 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
                Font Weight
              </label>
              <div className="flex gap-2">
                {[400, 500, 600, 700].map((w) => (
                  <button
                    key={w}
                    onClick={() => setFontWeight(w)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      fontWeight === w
                        ? 'bg-primary text-primary-text'
                        : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-subtle">Global Size</span>
                <span className="text-text-muted font-mono">{globalSizeScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.5}
                step={0.1}
                value={globalSizeScale}
                onChange={(e) => setGlobalSizeScale(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-subtle">Heading Size</span>
                <span className="text-text-muted font-mono">{headingSizeScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.5}
                step={0.1}
                value={headingSizeScale}
                onChange={(e) => setHeadingSizeScale(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-subtle">UI Text Size</span>
                <span className="text-text-muted font-mono">{uiTextSizeScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.5}
                step={0.1}
                value={uiTextSizeScale}
                onChange={(e) => setUiTextSizeScale(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-subtle">Letter Spacing</span>
                <span className="text-text-muted font-mono">{letterSpacing.toFixed(2)}em</span>
              </div>
              <input
                type="range"
                min={-0.05}
                max={0.1}
                step={0.01}
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-primary-text text-xs font-semibold shadow hover:bg-primary-hover transition-colors"
              >
                Apply Font
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
