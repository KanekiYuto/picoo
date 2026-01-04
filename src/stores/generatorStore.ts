import { create } from 'zustand';

interface GeneratorState {
  isGeneratorModalOpen: boolean;
  initialPrompt: string;
  initialMediaType: 'image' | 'video';
  openGeneratorModal: () => void;
  openGeneratorModalWithPrompt: (prompt: string, mediaType: 'image' | 'video') => void;
  closeGeneratorModal: () => void;
}

/**
 * 全局生成器模态框状态管理
 */
export const useGeneratorStore = create<GeneratorState>((set) => ({
  isGeneratorModalOpen: false,
  initialPrompt: '',
  initialMediaType: 'image',
  openGeneratorModal: () => set({ isGeneratorModalOpen: true }),
  openGeneratorModalWithPrompt: (prompt: string, mediaType: 'image' | 'video') =>
    set({ isGeneratorModalOpen: true, initialPrompt: prompt, initialMediaType: mediaType }),
  closeGeneratorModal: () => set({ isGeneratorModalOpen: false }),
}));
