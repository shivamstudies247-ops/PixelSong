import { describe, it, expect, beforeEach } from 'vitest';
import { useQueueStore } from '../src/stores/queueStore';
import { usePlayerStore } from '../src/stores/playerStore';
import { useEqualizerStore } from '../src/stores/equalizerStore';
import { useThemeStore } from '../src/stores/themeStore';
import { Track } from '../src/types';

const testTrackA: Track = {
  id: 'test-a',
  file_path: 'C:\\Music\\SongA.mp3',
  title: 'Song A',
  artist: 'Artist A',
  album: 'Album A',
  duration: 180,
  format: 'mp3',
  file_size: 5000000,
  modified_at: '2026-01-01T00:00:00Z',
  date_added: '2026-01-01T00:00:00Z',
  favorite: false,
};

const testTrackB: Track = {
  id: 'test-b',
  file_path: 'C:\\Music\\SongB.flac',
  title: 'Song B',
  artist: 'Artist B',
  album: 'Album B',
  duration: 240,
  format: 'flac',
  file_size: 25000000,
  modified_at: '2026-01-02T00:00:00Z',
  date_added: '2026-01-02T00:00:00Z',
  favorite: true,
};

describe('Queue Store', () => {
  beforeEach(() => {
    useQueueStore.getState().clearQueue();
  });

  it('adds tracks to queue and reorders correctly', () => {
    const queueStore = useQueueStore.getState();
    queueStore.addToQueue(testTrackA);
    queueStore.addToQueue(testTrackB);

    expect(useQueueStore.getState().queue.length).toBe(2);
    expect(useQueueStore.getState().queue[0].id).toBe('test-a');
    expect(useQueueStore.getState().queue[1].id).toBe('test-b');

    // Move track B to index 0
    useQueueStore.getState().moveItem(1, 0);
    expect(useQueueStore.getState().queue[0].id).toBe('test-b');
    expect(useQueueStore.getState().queue[1].id).toBe('test-a');
  });

  it('removes track from queue', () => {
    useQueueStore.getState().addToQueue([testTrackA, testTrackB]);
    expect(useQueueStore.getState().queue.length).toBe(2);

    useQueueStore.getState().removeFromQueue(0);
    expect(useQueueStore.getState().queue.length).toBe(1);
    expect(useQueueStore.getState().queue[0].id).toBe('test-b');
  });
});

describe('Player Store Controls', () => {
  it('cycles repeat mode off -> all -> one -> off', () => {
    const player = usePlayerStore.getState();
    expect(player.repeatMode).toBe('off');

    player.cycleRepeatMode();
    expect(usePlayerStore.getState().repeatMode).toBe('all');

    usePlayerStore.getState().cycleRepeatMode();
    expect(usePlayerStore.getState().repeatMode).toBe('one');

    usePlayerStore.getState().cycleRepeatMode();
    expect(usePlayerStore.getState().repeatMode).toBe('off');
  });

  it('clamps volume properly between 0.0 and 1.0', async () => {
    const player = usePlayerStore.getState();
    await player.setVolume(1.5);
    expect(usePlayerStore.getState().volume).toBe(1.0);

    await player.setVolume(-0.2);
    expect(usePlayerStore.getState().volume).toBe(0.0);
  });
});

describe('Equalizer Store DSP Controls', () => {
  it('applies Bass Boost preset accurately', () => {
    const eq = useEqualizerStore.getState();
    eq.applyPreset('bass_boost');

    const state = useEqualizerStore.getState();
    expect(state.selectedPreset).toBe('bass_boost');
    expect(state.bands[0]).toBe(6); // 31Hz boosted to +6dB
    expect(state.bands[1]).toBe(5); // 63Hz boosted to +5dB
  });

  it('resets to Flat properly', () => {
    const eq = useEqualizerStore.getState();
    eq.applyPreset('treble_boost');
    eq.resetToFlat();

    const state = useEqualizerStore.getState();
    expect(state.selectedPreset).toBe('flat');
    expect(state.bands.every((b) => b === 0)).toBe(true);
    expect(state.preamp).toBe(0);
  });
});

describe('Theme Store', () => {
  it('switches themes and accents', () => {
    const themeStore = useThemeStore.getState();
    themeStore.setTheme('cyber-neon');
    expect(useThemeStore.getState().theme).toBe('cyber-neon');

    themeStore.setAccentColor('#34d399');
    expect(useThemeStore.getState().accentColor).toBe('#34d399');
  });
});
