import React, { useState } from 'react';
import { Palette, Sparkles, Image, RotateCcw, Check, Plus } from 'lucide-react';
import { useGradientStore } from '../../stores/gradientStore';
import { GradientEditor } from './GradientEditor';
import { GradientPresetGallery } from './GradientPresetGallery';
import { GradientRandomControls } from './GradientRandomControls';
import { gradientToCss } from '../../stores/gradientStore';
import type { CustomGradient, GradientSource, RandomGradientStyle } from '../../types';

interface GradientSettingsProps {
  onClose?: () => void;
}

const SOURCE_LABELS: Record<GradientSource, string> = {
  custom: 'Custom Gradient',
  preset: 'Preset Gallery',
  random: 'Random Generator',
};

const SOURCE_ICONS: Record<GradientSource, any> = {
  custom: Palette,
  preset: Image,
  random: Sparkles,
};

export const GradientSettings: React.FC<GradientSettingsProps> = ({ onClose }) => {
  const {
    enabled,
    source,
    customGradientId,
    presetId,
    randomStyle,
    animationEnabled,
    animationSpeed,
    customGradients,
    presets,
    setEnabled,
    setSource,
    setCustomGradient,
    setPreset,
    setRandomStyle,
    setAnimation,
    setAnimationSpeed,
    addCustomGradient,
    generateRandomGradient,
    resetToDefault,
  } = useGradientStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGradient, setEditingGradient] = useState<CustomGradient | null>(null);

  const currentGradient = customGradients.find((g) => g.id === customGradientId);
  const currentPreset = presets.find((p) => p.id === presetId);

  const handleSourceChange = (src: GradientSource) => {
    setSource(src);
  };

  const handleApplyPreset = (preset: import('../../stores/gradientStore').GradientPreset) => {
    setPreset(preset.id);
    setSource('preset');
  };

  const handleApplyRandom = (gradient: ReturnType<typeof generateRandomGradient>) => {
    addCustomGradient({
      name: gradient.name,
      type: gradient.type,
      angle: gradient.angle,
      stops: gradient.stops,
      isDefault: false,
    });
    setSource('custom');
  };

  const handleNewCustom = () => {
    setEditingGradient(null);
    setEditorOpen(true);
  };

  const handleEditCustom = (grad: typeof editingGradient) => {
    setEditingGradient(grad);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-text">Now Playing Background</h3>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-surface'
          }`}
        >
          <span
            className={`absolute top-1 ${
              enabled ? 'right-1' : 'left-1'
            } w-3 h-3 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="text-[11px] text-text-subtle">
        Apply a beautiful gradient background to the Now Playing screen.
      </p>

      {/* Gradient Source Selector */}
      <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider block">
          Gradient Source
        </label>
        <div className="flex gap-2">
          {(['custom', 'preset', 'random'] as GradientSource[]).map((src) => {
            const Icon = SOURCE_ICONS[src];
            const isActive = source === src;
            return (
              <button
                key={src}
                onClick={() => handleSourceChange(src)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover border border-transparent'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{SOURCE_LABELS[src]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Gradient Section */}
      {source === 'custom' && (
        <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-text">Custom Gradients</h4>
              <p className="text-[10px] text-text-muted">
                Create and save your own gradients
              </p>
            </div>
            <button
              onClick={handleNewCustom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs transition-colors"
            >
              <Plus className="w-3 h-3" /> New
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {customGradients.map((g) => {
              const isActive = customGradientId === g.id;
              const css = gradientToCss(g);
              return (
                <button
                  key={g.id}
                  onClick={() => setCustomGradient(g.id)}
                  className={`relative h-16 rounded-lg overflow-hidden border transition-all duration-200 ${
                    isActive
                      ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-surface shadow-md'
                      : 'border-border/60 hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <div className="absolute inset-0" style={{ background: css }} />
                  <div className="absolute bottom-1 left-1 right-1 p-1">
                    <p className="text-[9px] font-bold text-text truncate">{g.name}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-text rounded p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-black/30 text-white rounded px-1 py-0.5">
                    <span className="text-[9px]">{g.type}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Section */}
      {source === 'preset' && (
        <GradientPresetGallery onSelect={handleApplyPreset} />
      )}

      {/* Random Section */}
      {source === 'random' && (
        <GradientRandomControls onSelect={handleApplyRandom} />
      )}

      {/* Animation Controls */}
      <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-text">Animation</h4>
            <p className="text-[10px] text-text-muted">
              Subtle gradient animation while music plays
            </p>
          </div>
          <button
            onClick={() => setAnimation(!animationEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              animationEnabled ? 'bg-primary' : 'bg-surface'
            }`}
          >
            <span
              className={`absolute top-1 ${
                animationEnabled ? 'right-1' : 'left-1'
              } w-3 h-3 rounded-full bg-white transition-transform ${
                animationEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-subtle">Speed</span>
            <span className="text-text-muted font-mono">{animationSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full accent-primary"
            disabled={!animationEnabled}
          />
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={resetToDefault}
        className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
      >
        <RotateCcw className="w-3 h-3 inline mr-1" />
        Reset to Default
      </button>
    </div>
  );
};
