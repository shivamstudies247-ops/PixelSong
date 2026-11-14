import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Check, Palette, RotateCcw, Save, X } from 'lucide-react';
import { useGradientStore } from '../../stores/gradientStore';
import {
  CustomGradient,
  GradientStop,
  GradientType,
  gradientToCss,
  gradientPreviewCss,
} from '../../stores/gradientStore';
import { api } from '../../services/tauriBridge';

interface GradientEditorProps {
  onClose: () => void;
  gradient?: CustomGradient;
  onSave?: (gradient: Omit<CustomGradient, 'id'>) => void;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
  onClose,
  gradient: initialGradient,
  onSave,
}) => {
  const [gradient, setGradient] = useState<CustomGradient>(() =>
    initialGradient
      ? initialGradient
      : {
          id: '',
          name: 'New Gradient',
          type: 'linear' as GradientType,
          angle: 135,
          stops: [
            { id: 's1', color: '#0f172a', position: 0 },
            { id: 's2', color: '#38bdf8', position: 100 },
          ],
          isDefault: false,
        }
  );

  const [isSaving, setIsSaving] = useState(false);

  const cssPreview = useMemo(() => gradientToCss(gradient), [gradient]);

  const addStop = () => {
    setGradient((prev) => {
      const newStops = [...prev.stops];
      const position = prev.stops.length > 0 ? Math.floor(100 / (prev.stops.length + 1)) : 50;
      newStops.push({
        id: `s-${Date.now()}`,
        color: '#38bdf8',
        position,
      });
      newStops.sort((a, b) => a.position - b.position);
      return { ...prev, stops: newStops };
    });
  };

  const removeStop = (id: string) => {
    setGradient((prev) => ({
      ...prev,
      stops: prev.stops.filter((s) => s.id !== id),
    }));
  };

  const updateStopColor = (id: string, color: string) => {
    setGradient((prev) => ({
      ...prev,
      stops: prev.stops.map((s) => (s.id === id ? { ...s, color } : s)),
    }));
  };

  const updateStopPosition = (id: string, position: number) => {
    setGradient((prev) => {
      const newStops = [...prev.stops];
      const stop = newStops.find((s) => s.id === id);
      if (stop) {
        stop.position = Math.max(0, Math.min(100, position));
        newStops.sort((a, b) => a.position - b.position);
      }
      return { ...prev, stops: newStops };
    });
  };

  const updateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGradient((prev) => ({ ...prev, name: e.target.value }));
  };

  const updateType = (type: GradientType) => {
    setGradient((prev) => ({ ...prev, type }));
  };

  const updateAngle = (angle: number) => {
    setGradient((prev) => ({ ...prev, angle }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    const { id, ...saveData } = gradient;
    onSave(saveData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-text">Gradient Editor</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Create a custom gradient for Now Playing background
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:text-rose-400 hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
            Gradient Name
          </label>
          <input
            type="text"
            value={gradient.name}
            onChange={updateName}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text outline-none focus:border-primary"
          />
        </div>

        {/* Type selector */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
            Gradient Type
          </label>
          <div className="flex gap-2">
            {['linear', 'radial'].map((t) => (
              <button
                key={t}
                onClick={() => updateType(t as GradientType)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  gradient.type === t
                    ? 'bg-primary text-primary-text'
                    : 'bg-surface text-text hover:text-text hover:bg-surface-hover'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Angle (linear only) */}
        {gradient.type === 'linear' && (
          <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
              Angle
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={gradient.angle}
                onChange={(e) => updateAngle(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="w-12 text-xs font-mono text-text">{gradient.angle}°</span>
            </div>
          </div>
        )}

        {/* Color stops */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
              Color Stops
            </label>
            <button
              onClick={addStop}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Stop
            </button>
          </div>
          <div className="space-y-2">
            {gradient.stops.map((stop, idx) => (
              <div
                key={stop.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="gradient-stop-preview"
                      style={{ backgroundColor: stop.color }}
                      onClick={() => {
                        const input = document.getElementById(
                          `color-picker-${stop.id}`
                        ) as HTMLInputElement;
                        input?.click();
                      }}
                    />
                    <input
                      id={`color-picker-${stop.id}`}
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStopColor(stop.id, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-text-muted truncate">
                      {stop.color}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={stop.position}
                    onChange={(e) => updateStopPosition(stop.id, parseInt(e.target.value))}
                    className="w-full mt-1 accent-primary"
                  />
                </div>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={gradient.stops.length <= 2}
                  className="p-1 text-text-muted hover:text-rose-400 disabled:opacity-30 transition-colors"
                  title="Remove stop"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
              Live Preview
            </span>
            <span className="text-[10px] text-text-muted">{cssPreview}</span>
          </div>
          <div
            className="h-32 rounded-xl border border-border overflow-hidden relative"
            style={{ background: cssPreview }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-lg text-center">
                <p className="text-xs font-bold text-text">{gradient.name}</p>
                <p className="text-[10px] text-text-subtle">
                  {gradient.type} • {gradient.stops.length} stops
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-text text-xs font-semibold shadow hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Gradient'}
          </button>
        </div>
      </div>
    </div>
  );
};
