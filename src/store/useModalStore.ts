import { create } from 'zustand';

export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
}

interface ModalState {
  // 登录模态框
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // 定价模态框
  isPricingModalOpen: boolean;
  openPricingModal: () => void;
  closePricingModal: () => void;

  // 媒体预览模态框
  isMediaPreviewOpen: boolean;
  mediaPreviewItems: MediaItem[];
  mediaPreviewCurrentIndex: number;
  openMediaPreview: (items: MediaItem[], startIndex?: number) => void;
  closeMediaPreview: () => void;
  nextMediaPreview: () => void;
  prevMediaPreview: () => void;
  goToMediaPreview: (index: number) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  // 登录模态框
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  // 定价模态框
  isPricingModalOpen: false,
  openPricingModal: () => set({ isPricingModalOpen: true }),
  closePricingModal: () => set({ isPricingModalOpen: false }),

  // 媒体预览模态框
  isMediaPreviewOpen: false,
  mediaPreviewItems: [],
  mediaPreviewCurrentIndex: 0,

  openMediaPreview: (items, startIndex = 0) =>
    set({
      isMediaPreviewOpen: true,
      mediaPreviewItems: items,
      mediaPreviewCurrentIndex: Math.min(startIndex, items.length - 1),
    }),

  closeMediaPreview: () =>
    set({
      isMediaPreviewOpen: false,
      mediaPreviewItems: [],
      mediaPreviewCurrentIndex: 0,
    }),

  nextMediaPreview: () =>
    set((state) => ({
      mediaPreviewCurrentIndex: Math.min(
        state.mediaPreviewCurrentIndex + 1,
        state.mediaPreviewItems.length - 1
      ),
    })),

  prevMediaPreview: () =>
    set((state) => ({
      mediaPreviewCurrentIndex: Math.max(state.mediaPreviewCurrentIndex - 1, 0),
    })),

  goToMediaPreview: (index) =>
    set((state) => ({
      mediaPreviewCurrentIndex: Math.max(
        0,
        Math.min(index, state.mediaPreviewItems.length - 1)
      ),
    })),
}));

