import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { useVisualizerStore } from '../../stores/visualizerStore';
import { usePlayerStore } from '../../stores/playerStore';
import { VisualizerMode } from '../../types';
import { renderVisualizer } from './renderers';
import { api } from '../../services/tauriBridge';
import { Slider } from '../../components/ui/Slider';

export const VisualizerStudio: React.FC = () => {
  const {
    mode,
    barCount,
    sensitivity,
    smoothing,
    colorScheme,
    animationSpeed,
    isFullscreen,
    setMode,
    setBarCount,
    setSensitivity,
    setSmoothing,
    setColorScheme,
    setAnimationSpeed,
    toggleFullscreen,
    resetToDefaults,
  } = useVisualizerStore();

  const { currentTrack, isPlaying } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const modes: { id: VisualizerMode; label: string }[] = [
    { id: 'spectrum', label: 'Spectrum Bars' },
    { id: 'circular', label: 'Circular' },
    { id: 'waveform', label: 'Waveform' },
    { id: 'oscilloscope', label: 'Oscilloscope' },
    { id: 'radial-waveform', label: 'Radial' },
    { id: 'frequency-rings', label: 'Rings' },
    { id: 'particle-field', label: 'Particles' },
    { id: 'ambient-waves', label: 'Ambient Waves' },
    { id: 'mirror-spectrum', label: 'Mirror' },
    { id: 'album-reactive', label: 'Album Reactive' },
  ];

  const colorSchemes: Array<'theme' | 'neon' | 'rainbow' | 'sunset' | 'fire' | 'monochrome'> = [
    'theme',
    'neon',
    'rainbow',
    'sunset',
    'fire',
    'monochrome',
  ];

  useEffect(() => {
    let active = true;
    let lastFetchTime = 0;
    let isFetching = false;
    let currentAnalysis = {
      frequencies: new Array(64).fill(0),
      waveform: new Array(128).fill(0),
      bass_energy: 0,
      mid_energy: 0,
      treble_energy: 0,
    };

    const render = async (timestamp: number) => {
      // Fetch analysis at ~30 FPS (32ms intervals) without blocking the 60fps canvas render
      if (timestamp - lastFetchTime >= 32 && !isFetching) {
        lastFetchTime = timestamp;
        isFetching = true;
        api
          .getVisualizerAnalysis()
          .then((res) => {
            currentAnalysis = res;
            isFetching = false;
          })
          .catch(() => {
            isFetching = false;
          });
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        if (active) animFrameRef.current = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (active) animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      renderVisualizer(
        ctx,
        width,
        height,
        currentAnalysis.frequencies,
        currentAnalysis.waveform,
        {
          mode,
          barCount,
          sensitivity,
          smoothing,
          colorScheme,
          animationSpeed,
          isFullscreen,
          showFPS: false,
        },
        {
          bass: currentAnalysis.bass_energy,
          mid: currentAnalysis.mid_energy,
          treble: currentAnalysis.treble_energy,
        }
      );

      ctx.restore();

      if (active) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, barCount, sensitivity, smoothing, colorScheme, animationSpeed, isFullscreen]);

  return (
    <div
      className={`flex flex-col select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-background p-6'
          : 'flex-1 overflow-hidden p-6 space-y-4'
      }`}
    >
      {/* Studio Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-extrabold text-text">Visualizer Studio</h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time FFT audio analysis rendered natively via HTML5 Canvas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text transition-colors"
            title="Reset parameters to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Selector Carousel/Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-shrink-0 scrollbar-none">
        {modes.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-text shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-text-muted hover:text-text border border-border/50'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative rounded-2xl bg-black/40 border border-border/70 overflow-hidden min-h-[300px]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live track overlay pill */}
        {currentTrack && (
          <div className="absolute top-4 left-4 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold text-text truncate max-w-[200px]">{currentTrack.title}</span>
            <span className="text-text-subtle">•</span>
            <span className="text-text-muted truncate max-w-[150px]">{currentTrack.artist}</span>
          </div>
        )}
      </div>

      {/* Studio Tuning Controls Drawer */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-xl bg-surface border border-border flex-shrink-0 text-xs">
        {/* Sensitivity */}
        <div>
          <div className="flex justify-between text-text-subtle mb-1">
            <span>Sensitivity</span>
            <span className="font-mono text-text">{sensitivity.toFixed(1)}x</span>
          </div>
          <Slider value={sensitivity * 10} min={5} max={25} onChange={(val) => setSensitivity(val / 10)} />
        </div>

        {/* Smoothing */}
        <div>
          <div className="flex justify-between text-text-subtle mb-1">
            <span>Smoothing</span>
            <span className="font-mono text-text">{Math.round(smoothing * 100)}%</span>
          </div>
          <Slider value={smoothing * 100} min={10} max={95} onChange={(val) => setSmoothing(val / 100)} />
        </div>

        {/* Bar Count */}
        <div>
          <div className="flex justify-between text-text-subtle mb-1">
            <span>Segments</span>
            <span className="font-mono text-text">{barCount}</span>
          </div>
          <Slider value={barCount} min={16} max={96} step={8} onChange={(val) => setBarCount(val)} />
        </div>

        {/* Speed */}
        <div>
          <div className="flex justify-between text-text-subtle mb-1">
            <span>Speed</span>
            <span className="font-mono text-text">{animationSpeed.toFixed(1)}x</span>
          </div>
          <Slider value={animationSpeed * 10} min={5} max={20} onChange={(val) => setAnimationSpeed(val / 10)} />
        </div>

        {/* Color Palette */}
        <div>
          <span className="text-text-subtle block mb-1">Color Palette</span>
          <select
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value as any)}
            className="w-full bg-background border border-border rounded px-2 py-1 text-text outline-none focus:border-primary text-xs capitalize"
          >
            {colorSchemes.map((cs) => (
              <option key={cs} value={cs}>
                {cs}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
