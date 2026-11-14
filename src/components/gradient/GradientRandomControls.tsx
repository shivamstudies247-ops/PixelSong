import React, { useState } from 'react';
import { Sparkles, Shuffle, RefreshCw } from 'lucide-react';
import { useGradientStore } from '../../stores/gradientStore';
import type { CustomGradient, RandomGradientStyle } from '../../types';

interface GradientRandomControlsProps {
  onSelect: (gradient: CustomGradient) => void;
}

const RANDOM_STYLES: { id: RandomGradientStyle; label: string; icon: any }[] = [
  { id: 'dark-moody', label: 'Dark & Moody', icon: null },
  { id: 'vibrant-colorful', label: 'Vibrant & Colorful', icon: null },
  { id: 'pastel-soft', label: 'Pastel & Soft', icon: null },
  { id: 'neon-cyberpunk', label: 'Neon & Cyberpunk', icon: null },
  { id: 'minimal-elegant', label: 'Minimal & Elegant', icon: null },
  { id: 'completely-random', label: 'Completely Random', icon: null },
];

export const GradientRandomControls: React.FC<GradientRandomControlsProps> = ({
  onSelect,
}) => {
  const { randomStyle, setRandomStyle, generateRandomGradient } = useGradientStore();
  const [selectedStyle, setSelectedStyle] = useState<RandomGradientStyle>('completely-random');

  const handleGenerate = () => {
    const gradient = generateRandomGradient(selectedStyle);
    onSelect(gradient);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider block mb-2">
          Random Style
        </label>
        <div className="flex gap-2 overflow-x-auto">
          {RANDOM_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedStyle(s.id);
                setRandomStyle(s.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStyle === s.id
                  ? 'bg-primary text-primary-text shadow'
                  : 'bg-surface text-text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-text text-xs font-semibold shadow-lg hover:bg-primary-hover transition-transform active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Randomize Now</span>
      </button>

      <div className="p-3 rounded-xl bg-background border border-border/50 text-xs">
        <p className="text-text-muted mb-1">
          <Sparkles className="w-3 h-3 inline mr-1" />
          New gradient generates automatically when a different song starts.
        </p>
        <p className="text-text-subtle">
          2–4 harmonious colors generated locally, no internet required.
        </p>
      </div>
    </div>
  );
};
