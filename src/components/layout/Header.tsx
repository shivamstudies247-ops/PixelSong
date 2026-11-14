import React from 'react';
import { Search, Sparkles, Loader2, ListMusic, Palette } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useQueueStore } from '../../stores/queueStore';
import { useThemeStore } from '../../stores/themeStore';

interface HeaderProps {
  onOpenVibeSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenVibeSearch }) => {
  const { filterText, setFilterText, scanProgress } = useLibraryStore();
  const { isQueueOpen, toggleQueueOpen, queue } = useQueueStore();
  const { theme, setTheme } = useThemeStore();

  const themes: Array<'obsidian' | 'slate-light' | 'cyber-neon' | 'deep-velvet' | 'nordic-midnight'> = [
    'obsidian',
    'slate-light',
    'cyber-neon',
    'deep-velvet',
    'nordic-midnight',
  ];

  const cycleTheme = () => {
    const idx = themes.indexOf(theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
  };

  return (
    <header className="h-14 px-6 border-b border-border bg-background flex items-center justify-between gap-4 flex-shrink-0 select-none">
      {/* Search Bar & Vibe Search */}
      <div className="flex items-center gap-2 max-w-md w-full">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search tracks, artists, albums, genres..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-surface border border-border/80 rounded-full pl-9 pr-4 py-1.5 text-sm text-text placeholder-text-subtle outline-none focus:border-primary transition-colors"
          />
        </div>

        <button
          onClick={onOpenVibeSearch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/25 transition-colors whitespace-nowrap"
          title="Open natural language Vibe Search"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vibe Search</span>
        </button>
      </div>

      {/* Right Action Icons: Scanner indicator, Theme toggle, Queue button */}
      <div className="flex items-center gap-3">
        {scanProgress.isScanning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-text-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span className="truncate max-w-[150px]">Scanning: {scanProgress.filesDiscovered} files</span>
          </div>
        )}

        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover border border-transparent hover:border-border transition-colors"
          title={`Theme: ${theme}. Click to switch`}
        >
          <Palette className="w-4 h-4" />
        </button>

        <button
          onClick={toggleQueueOpen}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            isQueueOpen
              ? 'bg-primary/20 border-primary text-primary font-medium'
              : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-hover'
          }`}
          title="Toggle Up Next Queue"
        >
          <ListMusic className="w-4 h-4" />
          <span className="text-xs font-semibold">{queue.length}</span>
        </button>
      </div>
    </header>
  );
};
