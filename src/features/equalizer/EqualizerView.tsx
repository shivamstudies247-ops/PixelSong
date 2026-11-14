import React from 'react';
import { Sliders, RotateCcw, Power, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEqualizerStore } from '../../stores/equalizerStore';
import { EQUALIZER_PRESETS } from '../../services/mockData';
import { Slider } from '../../components/ui/Slider';

const FREQUENCY_LABELS = ['31Hz', '63Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const EqualizerView: React.FC = () => {
  const {
    enabled,
    bands,
    preamp,
    selectedPreset,
    isClipping,
    setBandGain,
    applyPreset,
    toggleEnabled,
    setPreamp,
    resetToFlat,
  } = useEqualizerStore();

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-text">10-Band Equalizer</h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Hardware-accurate biquad peaking DSP filters processing audio output directly in Rust
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToFlat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Flat</span>
          </button>

          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              enabled
                ? 'bg-primary text-primary-text border-primary shadow'
                : 'bg-surface text-text-muted border-border hover:text-text'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{enabled ? 'Active' : 'Bypassed'}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold uppercase tracking-wider text-text-subtle mr-2 flex-shrink-0">
          Presets:
        </span>
        {EQUALIZER_PRESETS.map((p) => {
          const isActive = selectedPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-surface hover:bg-surface-hover text-text-muted hover:text-text border border-border/50'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* EQ Sliders Board */}
      <div className="p-8 rounded-2xl bg-surface border border-border space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text">Preamp Gain</span>
            <div className="w-36">
              <Slider value={preamp} min={-6} max={6} step={0.5} onChange={setPreamp} />
            </div>
            <span className="text-xs font-mono text-primary font-bold">
              {preamp > 0 ? `+${preamp.toFixed(1)}` : preamp.toFixed(1)} dB
            </span>
          </div>

          {/* Headroom / Distortion Guard */}
          <div className="flex items-center gap-2">
            {isClipping ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>Clipping Detected (Attenuate Preamp)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Headroom Safe</span>
              </div>
            )}
          </div>
        </div>

        {/* 10 Vertical Band Faders */}
        <div className="grid grid-cols-10 gap-2 h-64 items-end pt-4">
          {bands.map((gain, idx) => (
            <div key={idx} className="flex flex-col items-center justify-between h-full">
              {/* Gain readout */}
              <span className={`text-[11px] font-mono font-bold ${gain > 0 ? 'text-primary' : gain < 0 ? 'text-text-subtle' : 'text-text-muted'}`}>
                {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
              </span>

              {/* Vertical slider */}
              <div className="flex-1 flex items-center justify-center my-2">
                <Slider
                  value={gain}
                  min={-12}
                  max={12}
                  step={0.5}
                  onChange={(val) => setBandGain(idx, val)}
                  vertical
                />
              </div>

              {/* Frequency label */}
              <span className="text-[11px] font-semibold text-text-muted mt-2">
                {FREQUENCY_LABELS[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
