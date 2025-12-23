import { create } from 'zustand';

interface LanguageState {
  isLanguageModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

/**
 * 语言切换模态框状态管理
 */
export const useLanguageStore = create<LanguageState>((set) => ({
  isLanguageModalOpen: false,
  openLanguageModal: () => set({ isLanguageModalOpen: true }),
  closeLanguageModal: () => set({ isLanguageModalOpen: false }),
}));
