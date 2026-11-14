import React, { useState } from 'react';
import { FolderOpen, FolderPlus, RefreshCw, Trash2, CheckCircle2, AlertCircle, FileMusic, Loader2 } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';

export const FoldersView: React.FC = () => {
  const { folders, scanProgress, addFolder, removeFolder, scanFolder, rescanAll } = useLibraryStore();
  const [manualPath, setManualPath] = useState('');
  const [isRecursive, setIsRecursive] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddFolder = async () => {
    if (!manualPath.trim()) return;
    await addFolder(manualPath.trim(), isRecursive);
    setManualPath('');
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Music Folders</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Manage local directories monitored for audio tracks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => rescanAll()}
            disabled={scanProgress.isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanProgress.isScanning ? 'animate-spin text-primary' : ''}`} />
            <span>Rescan All</span>
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-text text-xs font-semibold shadow transition-transform active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Folder</span>
          </button>
        </div>
      </div>

      {/* Live Scanning Status Banner */}
      {scanProgress.isScanning && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-text">Scanning audio library...</p>
              <p className="text-[11px] text-text-muted truncate max-w-lg">
                Directory: {scanProgress.currentFolder}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-primary font-mono">
              {scanProgress.filesProcessed} / {scanProgress.filesDiscovered}
            </span>
            <p className="text-[10px] text-text-subtle">tracks processed</p>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showAddForm && (
        <div className="p-5 bg-surface border border-border rounded-2xl shadow-xl space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-text">Add Music Folder</h3>
          <p className="text-xs text-text-subtle">
            Enter the absolute Windows path to your music collection (e.g. C:\Users\Username\Music or D:\Audio).
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="C:\Music or D:\Songs"
              value={manualPath}
              onChange={(e) => setManualPath(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-primary"
              autoFocus
            />

            <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={isRecursive}
                onChange={(e) => setIsRecursive(e.target.checked)}
                className="rounded accent-primary"
              />
              <span>Recursively scan subfolders for audio files</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFolder}
              className="px-4 py-1.5 bg-primary text-primary-text rounded-lg text-xs font-semibold shadow"
            >
              Scan & Add
            </button>
          </div>
        </div>
      )}

      {/* Folders List */}
      <div className="space-y-3">
        {folders.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-border rounded-2xl text-text-subtle text-xs">
            No music folders added yet. Click &quot;Add Folder&quot; above to import your music files.
          </div>
        ) : (
          folders.map((folder) => (
            <div
              key={folder.id}
              className="p-4 rounded-xl bg-surface border border-border/70 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-text truncate" title={folder.path}>
                    {folder.path}
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    {folder.track_count} audio files discovered • {folder.recursive_scan ? 'Recursive' : 'Top level only'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scanFolder(folder.path, folder.recursive_scan)}
                  className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                  title="Rescan this folder"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeFolder(folder.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-rose-400 hover:bg-surface-hover transition-colors"
                  title="Remove from library (does NOT delete files from disk)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
