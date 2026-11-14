import React from 'react';
import { Star, Sparkles, Check } from 'lucide-react';
import { useGradientStore, gradientToCss } from '../../stores/gradientStore';
import type { GradientPreset } from '../../types';

interface GradientPresetGalleryProps {
  onSelect: (preset: GradientPreset) => void;
}

export const GradientPresetGallery: React.FC<GradientPresetGalleryProps> = ({
  onSelect,
}) => {
  const { source, presetId, randomStyle } = useGradientStore();
  const isPresetSelected = source === 'preset';

  const categories = [
    ...new Set(useGradientStore.getState().presets.map((p) => p.category)),
  ];

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => {
            // Select first preset as default when "All" clicked
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            true
              ? 'bg-primary text-primary-text'
              : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors bg-surface text-text-muted hover:text-text hover:bg-surface-hover"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {useGradientStore.getState().presets.map((preset) => {
          const css = gradientToCss(preset);
          const isActive =
            isPresetSelected && presetId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset)}
              className={`group relative h-24 rounded-xl overflow-hidden border transition-all duration-200 ${
                isActive
                  ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-surface shadow-lg'
                  : 'border-border/60 hover:border-primary/50 hover:shadow-md'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{ background: css }}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-2 left-2 right-2 p-2">
                <h4 className="text-xs font-bold text-text truncate">{preset.name}</h4>
                <p className="text-[10px] text-text-muted truncate">{preset.category}</p>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 bg-primary text-primary-text rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
