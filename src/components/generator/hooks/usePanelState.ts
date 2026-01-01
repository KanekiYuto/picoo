import { useState } from 'react';

export type PanelType = 'upload' | 'settings' | 'mode' | 'mobile-images' | null;

export interface UsePanelStateReturn {
  activePanel: PanelType;
  selectedImageUrl: string | undefined;
  replaceIndex: number | undefined;
  openUploadPanel: () => void;
  openUploadPanelForReplace: (url: string, index: number) => void;
  openSettingsPanel: () => void;
  openModePanel: () => void;
  openMobileImagePanel: () => void;
  closePanel: () => void;
  togglePanel: (panel: 'upload' | 'settings' | 'mode') => void;
  setSelectedImageUrl: (url: string | undefined) => void;
  setReplaceIndex: (index: number | undefined) => void;
  setActivePanel: (panel: PanelType) => void;
}

export function usePanelState(): UsePanelStateReturn {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(undefined);
  const [replaceIndex, setReplaceIndex] = useState<number | undefined>(undefined);

  const openUploadPanel = () => {
    setSelectedImageUrl(undefined);
    setReplaceIndex(undefined);
    setActivePanel('upload');
  };

  const openUploadPanelForReplace = (url: string, index: number) => {
    setSelectedImageUrl(url);
    setReplaceIndex(index);
    setActivePanel('upload');
  };

  const openSettingsPanel = () => {
    setActivePanel('settings');
  };

  const openModePanel = () => {
    setActivePanel('mode');
  };

  const openMobileImagePanel = () => {
    setActivePanel('mobile-images');
  };

  const closePanel = () => {
    setActivePanel(null);
    setSelectedImageUrl(undefined);
    setReplaceIndex(undefined);
  };

  const togglePanel = (panel: 'upload' | 'settings' | 'mode') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return {
    activePanel,
    selectedImageUrl,
    replaceIndex,
    openUploadPanel,
    openUploadPanelForReplace,
    openSettingsPanel,
    openModePanel,
    openMobileImagePanel,
    closePanel,
    togglePanel,
    setSelectedImageUrl,
    setReplaceIndex,
    setActivePanel,
  };
}
