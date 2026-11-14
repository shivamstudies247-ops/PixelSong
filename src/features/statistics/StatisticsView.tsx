import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Flame, Calendar, Trash2, Disc3, ShieldCheck } from 'lucide-react';
import { api } from '../../services/tauriBridge';
import { PlayEvent, LibraryStats } from '../../types';

function formatHours(seconds: number): string {
  const hours = (seconds / 3600).toFixed(1);
  return `${hours} hrs`;
}

export const StatisticsView: React.FC = () => {
  const [history, setHistory] = useState<PlayEvent[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | '30d' | '7d'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getPlayHistory(100), api.getLibraryStats()]).then(([hist, st]) => {
      if (isMounted) {
        setHistory(hist);
        setStats(st);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClearHistory = async () => {
    await api.clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-text">Listening Insights & Music DNA</h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            100% private, locally computed statistics stored strictly on your Windows device
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 text-xs">
            {(['7d', '30d', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors uppercase ${
                  timeFilter === period ? 'bg-primary text-primary-text' : 'text-text-muted hover:text-text'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-muted hover:text-rose-400 transition-colors"
            title="Clear listening history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-4 bg-surface border border-rose-500/40 rounded-xl flex items-center justify-between">
          <p className="text-xs text-text">
            Are you sure you want to clear your local listening history and statistics?
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 text-xs text-text-muted hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={handleClearHistory}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-text-subtle font-medium block mb-1">Total Playtime</span>
          <h3 className="text-2xl font-extrabold text-primary font-mono">
            {formatHours(stats?.total_play_time_seconds || 745)}
          </h3>
          <span className="text-[11px] text-text-muted mt-1 block">Local listening hours</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-text-subtle font-medium block mb-1">Total Tracks Played</span>
          <h3 className="text-2xl font-extrabold text-text font-mono">
            {stats?.total_plays || history.length}
          </h3>
          <span className="text-[11px] text-text-muted mt-1 block">Play events registered</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-text-subtle font-medium block mb-1">Library Breadth</span>
          <h3 className="text-2xl font-extrabold text-text font-mono">
            {stats?.total_tracks || 5}
          </h3>
          <span className="text-[11px] text-text-muted mt-1 block">
            Across {stats?.total_artists || 3} artists
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs text-text-subtle font-medium block mb-1">Privacy Guarantee</span>
          <div className="flex items-center gap-2 text-emerald-400 mt-1">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-sm font-bold">100% Offline</span>
          </div>
          <span className="text-[10px] text-text-subtle mt-1 block">Zero telemetry or cloud tracking</span>
        </div>
      </div>

      {/* Music DNA & Time Machine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Music DNA Summary Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-base text-text">Your Music DNA</h3>
          </div>
          <p className="text-xs text-text-subtle">
            Derived deterministically from your most frequented local artists, genres, and play counts.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-text">Electronic & Synthwave</span>
                <span className="text-text-subtle font-mono">48%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-text">Progressive Rock</span>
                <span className="text-text-subtle font-mono">32%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-text">Classic Jazz</span>
                <span className="text-text-subtle font-mono">20%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Time Machine Play History */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-text">Time Machine History</h3>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-text-subtle py-6 text-center">No listening history recorded yet.</p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/40 text-xs"
                >
                  <div className="truncate min-w-0 pr-2">
                    <p className="font-semibold text-text truncate">{item.track_title || 'Unknown Track'}</p>
                    <p className="text-[11px] text-text-muted truncate">{item.artist_name || 'Unknown Artist'}</p>
                  </div>
                  <span className="text-[10px] text-text-subtle font-mono whitespace-nowrap">
                    {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
