import { useState } from 'react';
import { MODE_CONFIGS } from '../config';
import type { GeneratorMode } from '../panels/mode';
import type { GeneratorSettings } from '../panels/settings';

export interface UseGeneratorSettingsReturn {
  mode: GeneratorMode;
  settings: GeneratorSettings;
  setMode: (mode: GeneratorMode) => void;
  setSettings: (settings: GeneratorSettings) => void;
  handleModeChange: (newMode: GeneratorMode) => void;
}

const getDefaultSettings = (
  currentMode: GeneratorMode,
  modelName?: string
): GeneratorSettings => {
  const modeConfig = MODE_CONFIGS[currentMode];
  const targetModelName = modelName || modeConfig.defaultModel || 'nano-banana-pro';
  const modelInfo = modeConfig.models?.[targetModelName];
  const modelDefaults = modelInfo?.defaultSettings || {};

  return {
    model: targetModelName,
    variations: 1,
    visibility: 'public',
    ...modelDefaults,
  };
};

export function useGeneratorSettings(): UseGeneratorSettingsReturn {
  const [mode, setMode] = useState<GeneratorMode>('text-to-image');
  const [settings, setSettings] = useState<GeneratorSettings>(() =>
    getDefaultSettings('text-to-image')
  );

  const handleModeChange = (newMode: GeneratorMode) => {
    setMode(newMode);

    const newModeConfig = MODE_CONFIGS[newMode];
    const newModeModels = newModeConfig?.models;
    const currentModel = settings.model;

    // 检查当前模型是否在新模式中存在
    const modelExistsInNewMode = newModeModels && currentModel && newModeModels[currentModel];

    if (modelExistsInNewMode) {
      // 模型在新模式中存在，保留模型但更新其默认设置
      const newModelDefaults = getDefaultSettings(newMode, currentModel);
      setSettings({
        ...settings,
        ...newModelDefaults,
      });
    } else {
      // 模型不在新模式中，切换到新模式的默认模型和默认设置
      setSettings(getDefaultSettings(newMode));
    }
  };

  return {
    mode,
    settings,
    setMode,
    setSettings,
    handleModeChange,
  };
}
