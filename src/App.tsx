import React, { useState, useEffect } from 'react';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PlayerBar } from './components/layout/PlayerBar';
import { RightQueuePanel } from './components/layout/RightQueuePanel';

// Views
import { HomeView } from './features/home/HomeView';
import { SongsView } from './features/songs/SongsView';
import { AlbumsView } from './features/albums/AlbumsView';
import { ArtistsView } from './features/artists/ArtistsView';
import { FoldersView } from './features/folders/FoldersView';
import { PlaylistsView } from './features/playlists/PlaylistsView';
import { FavoritesView } from './features/collection/FavoritesView';
import { RecentlyPlayedView } from './features/collection/RecentlyPlayedView';
import { VisualizerStudio } from './features/visualizer/VisualizerStudio';
import { EqualizerView } from './features/equalizer/EqualizerView';
import { LyricsStudio } from './features/lyrics/LyricsStudio';
import { StatisticsView } from './features/statistics/StatisticsView';
import { SettingsView } from './features/settings/SettingsView';
import { NowPlayingView } from './features/player/NowPlayingView';
import { MiniPlayerWidget } from './features/player/MiniPlayerWidget';
import { VibeSearch } from './features/search/VibeSearch';

// Stores
import { useLibraryStore } from './stores/libraryStore';
import { usePlayerStore } from './stores/playerStore';
import { useQueueStore } from './stores/queueStore';
import { useThemeStore } from './stores/themeStore';
import { useFontStore } from './stores/fontStore';
import { useGradientStore } from './stores/gradientStore';

export const App: React.FC = () => {
  // Widget mode: when launched as a floating widget window (?widget=1),
  // render only the mini player instead of the full app shell.
  const isWidgetMode =
    typeof window !== 'undefined' && window.location.search.includes('widget=1');

  if (isWidgetMode) {
    return <MiniPlayerWidget />;
  }

  const [currentView, setCurrentView] = useState<NavView>('home');
  const [isVibeSearchOpen, setIsVibeSearchOpen] = useState(false);

  const { loadLibrary } = useLibraryStore();
  const { isFullPlayerOpen, setFullPlayerOpen, togglePlay, seek, position, setVolume, volume, toggleMute } =
    usePlayerStore();
  const { nextTrack, prevTrack, toggleQueueOpen } = useQueueStore();
  const { theme, accentColor } = useThemeStore();
  const {
    fontFamily,
    fontWeight,
    globalSizeScale,
    headingSizeScale,
    uiTextSizeScale,
    letterSpacing,
  } = useFontStore();
  const { enabled: gradientEnabled } = useGradientStore();

  // Apply typography CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--font-weight', fontWeight.toString());
    root.style.setProperty('--font-global-scale', globalSizeScale.toString());
    root.style.setProperty('--font-heading-scale', headingSizeScale.toString());
    root.style.setProperty('--font-ui-scale', uiTextSizeScale.toString());
    root.style.setProperty('--font-letter-spacing', `${letterSpacing}em`);
  }, [fontFamily, fontWeight, globalSizeScale, headingSizeScale, uiTextSizeScale, letterSpacing]);

  // Clear gradient when no track is playing
  useEffect(() => {
    if (!gradientEnabled) {
      document.documentElement.style.removeProperty('--gradient-bg');
    }
  }, [gradientEnabled]);

  // Initial load
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Global Keyboard Shortcuts (PRD Section 5.5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && !e.ctrlKey) {
        seek(position + 5);
      } else if (e.code === 'ArrowLeft' && !e.ctrlKey) {
        seek(Math.max(0, position - 5));
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        nextTrack();
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        prevTrack();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.05));
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (e.key.toLowerCase() === 'q') {
        toggleQueueOpen();
      } else if (e.key.toLowerCase() === 'v' && e.ctrlKey) {
        e.preventDefault();
        setIsVibeSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, position, nextTrack, prevTrack, setVolume, volume, toggleMute, toggleQueueOpen]);

  const renderMainView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView
            onNavigate={setCurrentView}
            onOpenFolderPicker={() => setCurrentView('folders')}
          />
        );
      case 'songs':
        return <SongsView />;
      case 'albums':
        return <AlbumsView />;
      case 'artists':
        return <ArtistsView />;
      case 'folders':
        return <FoldersView />;
      case 'playlists':
        return <PlaylistsView />;
      case 'favorites':
        return <FavoritesView />;
      case 'recent':
        return <RecentlyPlayedView />;
      case 'visualizer':
        return <VisualizerStudio />;
      case 'equalizer':
        return <EqualizerView />;
      case 'lyrics':
        return <LyricsStudio />;
      case 'statistics':
        return <StatisticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView onNavigate={setCurrentView} onOpenFolderPicker={() => setCurrentView('folders')} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-text overflow-hidden font-sans">
      {/* Top 3-Zone Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        {/* Center Main Stage */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          <Header onOpenVibeSearch={() => setIsVibeSearchOpen(true)} />
          <main className="flex-1 flex overflow-hidden">{renderMainView()}</main>
        </div>

        {/* Right Collapsible Queue Drawer */}
        <RightQueuePanel />
      </div>

      {/* Bottom Persistent Playback Bar */}
      <PlayerBar
        onOpenNowPlaying={() => setFullPlayerOpen(true)}
        onOpenVisualizer={() => setCurrentView('visualizer')}
        onOpenEqualizer={() => setCurrentView('equalizer')}
      />

      {/* Living Player Fullscreen Overlay */}
      {isFullPlayerOpen && <NowPlayingView />}

      {/* Natural Language Vibe Search Modal */}
      {isVibeSearchOpen && <VibeSearch onClose={() => setIsVibeSearchOpen(false)} />}
    </div>
  );
};
