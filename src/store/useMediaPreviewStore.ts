import { create } from 'zustand';

export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
}

interface MediaPreviewStore {
  isOpen: boolean;
  items: MediaItem[];
  currentIndex: number;
  open: (items: MediaItem[], startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export const useMediaPreviewStore = create<MediaPreviewStore>((set) => ({
  isOpen: false,
  items: [],
  currentIndex: 0,

  open: (items, startIndex = 0) =>
    set({
      isOpen: true,
      items,
      currentIndex: Math.min(startIndex, items.length - 1),
    }),

  close: () =>
    set({
      isOpen: false,
      items: [],
      currentIndex: 0,
    }),

  next: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.items.length - 1),
    })),

  prev: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  goTo: (index) =>
    set((state) => ({
      currentIndex: Math.max(0, Math.min(index, state.items.length - 1)),
    })),
}));
