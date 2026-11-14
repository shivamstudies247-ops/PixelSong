import React from 'react';
import {
  Home,
  Music2,
  Disc3,
  Users,
  FolderOpen,
  ListMusic,
  Heart,
  Clock,
  Sparkles,
  Sliders,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';

export type NavView =
  | 'home'
  | 'songs'
  | 'albums'
  | 'artists'
  | 'folders'
  | 'playlists'
  | 'favorites'
  | 'recent'
  | 'visualizer'
  | 'equalizer'
  | 'lyrics'
  | 'statistics'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { tracks, folders } = useLibraryStore();
  const favoriteCount = tracks.filter((t) => t.favorite).length;

  const navItems = [
    { id: 'home' as NavView, label: 'Home', icon: Home },
    { id: 'songs' as NavView, label: 'Songs', icon: Music2, badge: tracks.length },
    { id: 'albums' as NavView, label: 'Albums', icon: Disc3 },
    { id: 'artists' as NavView, label: 'Artists', icon: Users },
    { id: 'folders' as NavView, label: 'Folders', icon: FolderOpen, badge: folders.length },
    { id: 'playlists' as NavView, label: 'Playlists', icon: ListMusic },
  ];

  const collectionItems = [
    { id: 'favorites' as NavView, label: 'Favorites', icon: Heart, badge: favoriteCount },
    { id: 'recent' as NavView, label: 'Recently Played', icon: Clock },
  ];

  const studioItems = [
    { id: 'visualizer' as NavView, label: 'Visualizer Studio', icon: Sparkles, accent: true },
    { id: 'equalizer' as NavView, label: '10-Band Equalizer', icon: Sliders },
    { id: 'lyrics' as NavView, label: 'Lyrics Studio', icon: FileText },
    { id: 'statistics' as NavView, label: 'Music DNA & Stats', icon: BarChart3 },
  ];

  return (
    <aside className="w-60 bg-background-secondary border-r border-border flex flex-col flex-shrink-0 select-none">
      {/* Brand Logo & Name */}
      <div className="h-14 px-5 flex items-center gap-3 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-lg border border-primary/30">
          ♪
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide text-text leading-tight">PixelSong</h1>
          <p className="text-[10px] text-text-subtle uppercase tracking-wider font-semibold">Offline Desktop Player</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-text-subtle uppercase mb-1.5">Library</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface text-text-subtle">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-text-subtle uppercase mb-1.5">Collection</p>
          <div className="space-y-0.5">
            {collectionItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface text-text-subtle">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-text-subtle uppercase mb-1.5">Studios & DNA</p>
          <div className="space-y-0.5">
            {studioItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Footer */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === 'settings'
              ? 'bg-primary/15 text-primary font-medium'
              : 'text-text-muted hover:text-text hover:bg-surface-hover'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
