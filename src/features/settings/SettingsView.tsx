import React, { useState } from 'react';
import {
  Settings,
  Palette,
  FolderOpen,
  Volume2,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { api } from '../../services/tauriBridge';
import { GradientSettings } from '../../components/gradient/GradientSettings';
import { TypographySettings } from '../../components/font/TypographySettings';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor, density, setDensity } = useThemeStore();
  const { folders, scanProgress, rescanAll } = useLibraryStore();
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    appearance: true,
    library: true,
    audio: true,
    database: true,
  });

  const themes = [
    { id: 'obsidian', name: 'Obsidian Dark', desc: 'Deep graphite dark theme with cyan accents' },
    { id: 'slate-light', name: 'Clean Slate Light', desc: 'Crisp light desktop theme with slate blues' },
    { id: 'cyber-neon', name: 'Cyber Neon', desc: 'Vibrant neon contrast on pitch black' },
    { id: 'deep-velvet', name: 'Deep Velvet', desc: 'Rich dark violet and midnight purple' },
    { id: 'nordic-midnight', name: 'Nordic Midnight', desc: 'Calm arctic navy blue' },
  ] as const;

  const accentColors = [
    { name: 'Cyan', color: '#38bdf8' },
    { name: 'Emerald', color: '#34d399' },
    { name: 'Purple', color: '#c084fc' },
    { name: 'Rose', color: '#fb7185' },
    { name: 'Amber', color: '#fbbf24' },
  ];

  const handleExportBackup = async () => {
    try {
      const json = await api.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelsong_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMessage('Database & settings successfully exported to JSON backup.');
      setTimeout(() => setBackupMessage(null), 4000);
    } catch (e) {
      setBackupMessage('Failed to export backup.');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionCard = ({
    id,
    icon: Icon,
    title,
    description,
    children,
    className = '',
  }: {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isExpanded = expandedSections[id];
    return (
      <div className={`group relative overflow-hidden bg-surface/60 backdrop-blur-xl border border-border/50 rounded-2xl transition-all duration-300 hover:border-border/80 hover:bg-surface/70 ${className}`}>
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-5 flex items-start gap-3"
          style={{ textAlign: 'left' }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary/15">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-sm text-text">{title}</h3>
            <p className="text-[11px] text-text-subtle mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-2 text-text-subtle">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform duration-200 -rotate-180" />
            )}
          </div>
        </button>
        <div className={`transition-all duration-300 ease-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-5 pb-5 pt-1 border-t border-border/30 bg-background/30 backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 select-none max-w-4xl">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-2xl blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-lg shadow-primary/5">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-text tracking-tight">Preferences & Settings</h2>
            <p className="text-sm text-text-muted mt-1">Customize appearance, audio, library, and backups</p>
          </div>
        </div>
      </div>

      {backupMessage && (
        <div className="relative p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 flex items-center gap-3 animate-slide-in">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-medium">{backupMessage}</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* 1. Theme & Appearance */}
        <SectionCard
          id="appearance"
          icon={Palette}
          title="Appearance & Themes"
          description="Choose your color theme, accent color, density, and Now Playing background"
        >
          <div className="space-y-6">
            {/* Theme cards */}
            <div>
              <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider block mb-3">Color Theme</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`relative p-4 rounded-xl border transition-all duration-200 group ${
                      theme === t.id
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20'
                        : 'bg-background/50 border-border hover:border-text-subtle hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-sm font-semibold ${theme === t.id ? 'text-primary' : 'text-text'}`}>
                        {t.name}
                      </span>
                      {theme === t.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-primary-text" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-text-subtle">{t.desc}</p>
                    {/* Theme color indicator */}
                    <div className="absolute bottom-3 right-3 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-border/50"
                      style={{ background: `var(--color-primary)` }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Colors */}
            <div className="pt-4 border-t border-border/30">
              <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider block mb-3">Accent Color</label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {accentColors.map((ac) => (
                  <button
                    key={ac.color}
                    onClick={() => setAccentColor(ac.color)}
                    style={{ backgroundColor: ac.color }}
                    className={`relative w-10 h-10 rounded-full shadow-md transition-all duration-200 ${
                      accentColor === ac.color
                        ? 'scale-110 ring-3 ring-primary ring-offset-2 ring-offset-surface shadow-lg'
                        : 'hover:scale-110 hover:ring-2 hover:ring-primary/50'
                    }`}
                    title={ac.name}
                    aria-label={ac.name}
                  >
                    {accentColor === ac.color && (
                      <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div className="pt-4 border-t border-border/30">
              <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider block mb-3">Interface Density</label>
              <div className="flex items-center gap-2 flex-wrap">
                {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${
                      density === d
                        ? 'bg-primary text-primary-text shadow-md shadow-primary/20'
                        : 'bg-background/50 border border-border text-text-muted hover:text-text hover:bg-surface/50 hover:border-text-subtle'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Background */}
            <div className="pt-4 border-t border-border/30">
              <GradientSettings />
            </div>

            {/* Typography */}
            <div className="pt-4 border-t border-border/30">
              <TypographySettings />
            </div>
          </div>
        </SectionCard>

        {/* 2. Library & Rescan */}
        <SectionCard
          id="library"
          icon={FolderOpen}
          title="Music Library"
          description="Manage monitored folders and rescan for new tracks"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-text">Monitored Folders</p>
                  <p className="text-[11px] text-text-subtle">{folders.length} director{folders.length === 1 ? 'y' : 'ies'} configured</p>
                </div>
              </div>
              <button
                onClick={() => rescanAll()}
                disabled={scanProgress.isScanning}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-text hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${scanProgress.isScanning ? 'animate-spin text-primary' : ''}`} />
                <span className="font-medium text-sm">{scanProgress.isScanning ? 'Scanning...' : 'Rescan Library'}</span>
              </button>
            </div>

            {folders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {folders.map((folder, idx) => (
                  <div key={folder.path} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50">
                    <span className="text-[10px] text-text-subtle w-5 text-right">{idx + 1}.</span>
                    <span className="text-xs text-text truncate font-mono" title={folder.path}>{folder.path}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* 3. Audio & Hardware */}
        <SectionCard
          id="audio"
          icon={Volume2}
          title="Audio Engine & Output"
          description="View audio backend, codec support, and DSP capabilities"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AudioInfoRow label="Audio Output Backend" value="Windows WASAPI (Low Latency via CPAL)" />
              <AudioInfoRow label="Supported Codecs" value="MP3, WAV, FLAC, OGG Vorbis" />
              <AudioInfoRow label="Equalizer DSP" value="10-Band Biquad Peaking Filters" />
              <AudioInfoRow label="Sample Rate" value="44.1kHz / 48kHz / 96kHz" />
              <AudioInfoRow label="Bit Depth" value="16-bit / 24-bit / 32-bit float" />
              <AudioInfoRow label="Channel Config" value="Stereo (2.0) / Surround (5.1/7.1)" />
            </div>
          </div>
        </SectionCard>

        {/* 4. Database Backup & Export */}
        <SectionCard
          id="database"
          icon={HardDrive}
          title="Database & Privacy"
          description="Local SQLite storage with optional JSON backup export"
        >
          <div className="space-y-4">
            <p className="text-sm text-text-subtle leading-relaxed">
              PixelSong stores all records locally in SQLite (%LOCALAPPDATA%\PixelSong). No cloud connections or remote servers are ever used. You can create a local JSON backup of your tracks, playlists, and settings.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-text text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                <Download className="w-4.5 h-4.5" />
                <span>Export Database Backup</span>
              </button>

              <button
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-text hover:bg-surface-hover hover:border-text-subtle transition-all duration-200"
              >
                <Upload className="w-4.5 h-4.5" />
                <span>Import Backup</span>
              </button>

              <button
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-text hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all duration-200"
              >
                <Shield className="w-4.5 h-4.5" />
                <span>Privacy Settings</span>
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

const AudioInfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-background/50 border border-border/50 hover:border-border/80 hover:bg-surface/50 transition-all duration-200">
    <p className="text-[11px] font-semibold text-text-subtle uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-mono text-primary font-medium">{value}</p>
  </div>
);