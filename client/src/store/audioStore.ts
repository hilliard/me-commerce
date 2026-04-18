import { create } from 'zustand';

export interface Track {
  id: number;
  title: string;
  url: string;
}

interface AudioState {
  playlist: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setIsPlaying: (playing: boolean) => void;
  clearPlayer: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  playlist: [],
  currentTrackIndex: 0,
  isPlaying: false,

  setPlaylist: (tracks, startIndex = 0) => {
    set({ playlist: tracks, currentTrackIndex: startIndex, isPlaying: true });
  },

  playTrack: (index) => {
    const { playlist } = get();
    if (index >= 0 && index < playlist.length) {
      set({ currentTrackIndex: index, isPlaying: true });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),

  nextTrack: () => {
    const { currentTrackIndex, playlist } = get();
    if (currentTrackIndex < playlist.length - 1) {
      set({ currentTrackIndex: currentTrackIndex + 1, isPlaying: true });
    } else {
      set({ currentTrackIndex: 0, isPlaying: false });
    }
  },

  prevTrack: () => {
    const { currentTrackIndex } = get();
    if (currentTrackIndex > 0) {
      set({ currentTrackIndex: currentTrackIndex - 1, isPlaying: true });
    } else {
      set({ currentTrackIndex: 0 });
    }
  },

  clearPlayer: () => set({ playlist: [], currentTrackIndex: 0, isPlaying: false })
}));
