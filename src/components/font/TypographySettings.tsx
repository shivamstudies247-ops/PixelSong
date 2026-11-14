import React, { useState } from 'react';
import { Layout, RotateCcw, Check } from 'lucide-react';
import { useFontStore } from '../../stores/fontStore';
import { FontSelector } from './FontSelector';
import { FontOption } from '../../types';

interface TypographySettingsProps {
  onClose?: () => void;
}

export const TypographySettings: React.FC<TypographySettingsProps> = ({ onClose }) => {
  const {
    fontFamily,
    fontWeight,
    globalSizeScale,
    headingSizeScale,
    uiTextSizeScale,
    letterSpacing,
    fontLibrary,
    isFontLoaded,
    loadFont,
    resetToDefault,
    setFontWeight,
    setGlobalSizeScale,
    setHeadingSizeScale,
    setUiTextSizeScale,
    setLetterSpacing,
    setFontFamily,
  } = useFontStore();

  const [selectorOpen, setSelectorOpen] = useState(false);

  const currentFont = fontLibrary.find((f) => f.fontFamily === fontFamily);
  const fontLoaded = currentFont ? isFontLoaded(currentFont.id) : true;

  const applyFontChanges = () => {
    // Font changes are applied in real-time via zustand store + CSS variables
    // This just closes the settings panel
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-text">Application Typography</h3>
        </div>
        <button
          onClick={() => setSelectorOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs transition-colors"
        >
          <Check className="w-3 h-3" />
          <span>Change Font</span>
        </button>
      </div>

      <p className="text-[11px] text-text-subtle">
        Customize the typography across the entire PixelSong application.
      </p>

      {/* Current Font Display */}
      <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center border border-border/50"
              style={{ fontFamily: fontFamily }}
            >
              {currentFont?.name.charAt(0) || 'P'}
            </div>
            <div>
              <p className="text-xs font-bold text-text">{currentFont?.name || 'Unknown'}</p>
              <p className="text-[10px] text-text-muted">
                {currentFont?.category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
                  'Custom'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fontLoaded ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Loaded
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-medium animate-pulse">
                Loading...
              </span>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="pt-2">
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-background border border-border/50">
              <p className="text-xs font-semibold text-text" style={{ fontFamily }}>
                Song Title Preview
              </p>
              <p className="text-[10px] text-text-muted" style={{ fontFamily }}>
                Artist Name • Album Name
              </p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-background border border-border/50">
              <p className="text-xs font-bold text-text" style={{ fontFamily, fontWeight: 700 }}>
                PLAYLIST TITLE
              </p>
              <p className="text-[10px] text-text-muted" style={{ fontFamily }}>
                Navigation • Settings • Library
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Controls */}
      <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider block">
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
            <span className="text-text-subtle">Global Size Scale</span>
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
            <span className="text-text-subtle">Heading Size Scale</span>
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
            <span className="text-text-subtle">UI Text Size Scale</span>
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
      </div>

      {/* Font Selector Button (also accessible here) */}
      <div className="flex justify-end">
        <button
          onClick={() => setSelectorOpen(true)}
          className="text-xs text-primary hover:text-primary-hover underline"
        >
          Browse All Fonts {'>'}
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={resetToDefault}
        className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
      >
        <RotateCcw className="w-3 h-3 inline mr-1" />
        Reset Typography to Default
      </button>
    </div>
  );
};
