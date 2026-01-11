import { create } from 'zustand';

interface GeneratorState {
  isGeneratorModalOpen: boolean;
  openGeneratorModal: () => void;
  closeGeneratorModal: () => void;
}

/**
 * 全局生成器模态框状态管理
 */
export const useGeneratorStore = create<GeneratorState>((set) => ({
  isGeneratorModalOpen: false,
  openGeneratorModal: () => set({ isGeneratorModalOpen: true }),
  closeGeneratorModal: () => set({ isGeneratorModalOpen: false }),
}));
