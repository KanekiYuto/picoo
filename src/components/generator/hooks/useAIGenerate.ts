import { useState } from 'react';
import { handleAIGenerate, startPolling } from '../apiHandler';
import { MODE_CONFIGS } from '../config';
import type { GeneratorSettings } from '../panels/settings';
import type { GeneratorMode } from '../panels/mode';

export type ImageItem =
  | { type: 'loading'; id: string }
  | { type: 'success'; id: string; url: string }
  | { type: 'error'; id: string; error: string };

export interface UseAIGenerateReturn {
  resultImages: ImageItem[];
  handleGenerate: (
    prompt: string,
    mode: string,
    settings: GeneratorSettings,
    images: string[]
  ) => Promise<void>;
  handleDeleteError: (id: string) => void;
  clearResults: () => void;
}

export function useAIGenerate(): UseAIGenerateReturn {
  const [resultImages, setResultImages] = useState<ImageItem[]>([]);

  const handleGenerate = async (
    prompt: string,
    modeParam: string,
    settingsParam: GeneratorSettings,
    imagesParam: string[]
  ) => {
    const displayTaskId = `task-${Date.now()}`;
    const modeConfig = MODE_CONFIGS[modeParam as GeneratorMode];
    const modelInfo = modeConfig.models?.[settingsParam.model];

    if (!modelInfo) {
      throw new Error(`Model ${settingsParam.model} not found`);
    }

    const variationsCount = modelInfo.getVariations(settingsParam);
    const loadingItems = Array.from({ length: variationsCount }, (_, index) => ({
      type: 'loading' as const,
      id: `${displayTaskId}-${index}`,
    }));
    setResultImages((prev) => [...prev, ...loadingItems]);

    try {
      const result = await handleAIGenerate({
        prompt,
        mode: modeParam as GeneratorMode,
        settings: settingsParam,
        images: imagesParam,
      });

      if (!result.success) {
        const errorMsg = result.error || 'Generation failed';
        setResultImages((prev) =>
          prev.map(item =>
            item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
              ? { ...item, type: 'error', error: errorMsg }
              : item
          ));
        return;
      }

      console.log('result', result);

      if (modelInfo.requestConfig.type === 'webhook') {
        // Webhook 异步模式：启动轮询
        if (!result.data.task_id) {
          throw new Error('Webhook mode requires taskId in response');
        }

        startPolling(
          result.data.task_id,
          (results) => {
            setResultImages((prev) => {
              console.log('results', results);
              console.log('prev', prev);

              // 先替换 loading 项为成功结果
              let resultIndex = 0;
              let newImages = prev.map(item =>
                item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
                  ? {
                      type: 'success' as const,
                      id: item.id,
                      url: results[resultIndex++].url,
                    }
                  : item
              );

              // 如果结果数大于预期的 loading 项数，添加额外的结果
              while (resultIndex < results.length) {
                newImages.push({
                  type: 'success' as const,
                  id: `${displayTaskId}-extra-${resultIndex}`,
                  url: results[resultIndex++].url,
                });
              }

              return newImages;
            });
          },
          (error) => {
            // 确保 error 始终是字符串
            const errorMessage = typeof error === 'string' ? error : (error as any)?.message || 'Generation failed';
            setResultImages((prev) =>
              prev.map(item =>
                item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
                  ? { ...item, type: 'error', error: errorMessage }
                  : item
              )
            );
          }
        );
      } else if (modelInfo.requestConfig.type === 'direct') {
        // Direct 模式：处理多个结果
        if (!result.data.results || !Array.isArray(result.data.results)) {
          throw new Error('Direct mode requires results array in response');
        }

        setResultImages((prev) => {
          // 先替换 loading 项为成功结果
          let resultIndex = 0;
          let newImages = prev.map(item =>
            item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
              ? {
                  type: 'success' as const,
                  id: item.id,
                  url: result.data.results![resultIndex++].url,
                }
              : item
          );

          // 如果结果数大于预期的 loading 项数，添加额外的结果
          while (resultIndex < result.data.results!.length) {
            newImages.push({
              type: 'success' as const,
              id: `${displayTaskId}-extra-${resultIndex}`,
              url: result.data.results![resultIndex++].url,
            });
          }

          return newImages;
        });
      }
    } catch (error) {
      console.error('Generate failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Generation failed';
      setResultImages((prev) =>
        prev.map(item =>
          item.type === 'loading' && item.id.startsWith(`${displayTaskId}-`)
            ? { ...item, type: 'error', error: errorMessage }
            : item
        )
      );
    }
  };

  const handleDeleteError = (id: string) => {
    setResultImages((prev) => prev.filter((item) => item.id !== id));
  };

  const clearResults = () => {
    setResultImages([]);
  };

  return {
    resultImages,
    handleGenerate,
    handleDeleteError,
    clearResults,
  };
}
