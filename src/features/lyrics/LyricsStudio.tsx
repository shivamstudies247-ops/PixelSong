import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Save, Edit3, Eye, Music2 } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { api } from '../../services/tauriBridge';
import { LyricsData } from '../../types';

export const LyricsStudio: React.FC = () => {
  const { currentTrack, position, seek } = usePlayerStore();
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentTrack) return;
    let isMounted = true;
    api.getLyrics(currentTrack.id).then((data) => {
      if (isMounted) {
        setLyricsData(data);
        setEditedText(data?.plainText || '');
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id]);

  const handleSave = async () => {
    if (!currentTrack) return;
    await api.saveLyrics(currentTrack.id, editedText);
    const updated = await api.getLyrics(currentTrack.id);
    setLyricsData(updated);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text && currentTrack) {
        setEditedText(text);
        await api.saveLyrics(currentTrack.id, text);
        const updated = await api.getLyrics(currentTrack.id);
        setLyricsData(updated);
      }
    };
    reader.readAsText(file);
  };

  // Find active lyric line
  let activeIndex = -1;
  if (lyricsData?.isSynced && lyricsData.lines.length > 0) {
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (position >= lyricsData.lines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-text">Lyrics Studio</h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {currentTrack
              ? `Displaying lyrics for: ${currentTrack.title} — ${currentTrack.artist}`
              : 'Select a track to view or edit lyrics'}
          </p>
        </div>

        {currentTrack && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-text cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import .LRC File</span>
              <input type="file" accept=".lrc,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-text text-xs font-semibold shadow transition-transform active:scale-95"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Save Lyrics' : 'Edit Lyrics'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Lyrics Display or Editor */}
      <div className="flex-1 rounded-2xl bg-surface border border-border overflow-hidden flex flex-col p-6 min-h-0">
        {!currentTrack ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-subtle">
            <Music2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-semibold text-text">No track selected</p>
            <p className="text-xs mt-1">Play or select a track from the library</p>
          </div>
        ) : isEditing ? (
          <div className="h-full flex flex-col space-y-3">
            <p className="text-xs text-text-subtle">
              Edit synchronized LRC format (with [mm:ss.xx] timestamps) or plain text:
            </p>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 w-full bg-background border border-border rounded-xl p-4 text-xs font-mono text-text outline-none focus:border-primary resize-none leading-relaxed"
              placeholder="[00:12.50] First lyric line&#10;[00:16.00] Second lyric line..."
            />
          </div>
        ) : lyricsData && lyricsData.lines.length > 0 ? (
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-4 py-8 text-center scroll-smooth">
            {lyricsData.lines.map((line, idx) => {
              const isActive = idx === activeIndex;
              return (
                <p
                  key={idx}
                  onClick={() => {
                    if (line.time >= 0) seek(line.time);
                  }}
                  className={`transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-xl font-extrabold text-primary scale-105'
                      : 'text-sm font-medium text-text-muted hover:text-text'
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-subtle p-8">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <h3 className="text-sm font-semibold text-text">No Lyrics Found</h3>
            <p className="text-xs max-w-sm mt-1 mb-4">
              Import a local synchronized .lrc file or write lyrics in the editor. PixelSong works 100% offline and never downloads copyrighted lyrics from online services.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-xs font-semibold"
            >
              Write Lyrics Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
