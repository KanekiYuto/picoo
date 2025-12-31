import type { GeneratorSettings, RequestResponse } from "./panels/settings/types";
import type { GeneratorMode } from "./config";
import { MODE_CONFIGS } from "./config";

/**
 * 处理 AI 生成请求
 */
export async function handleAIGenerate(params: {
  prompt?: string;
  mode: GeneratorMode;
  settings: GeneratorSettings;
  images?: string[];
}): Promise<RequestResponse> {
  const { prompt, mode, settings, images } = params;

  console.log("AI Generate Request:", { prompt, mode, settings, images });

  const modeConfig = MODE_CONFIGS[mode];
  if (!modeConfig.models) {
    throw new Error(`Mode ${mode} has no models configured`);
  }

  const modelInfo = modeConfig.models[settings.model];
  if (!modelInfo) {
    throw new Error(`Unsupported model: ${settings.model}`);
  }

  // 直接调用模型的请求处理函数
  return await modelInfo.requestConfig.handler(prompt, mode, settings, images);
}

/**
 * 轮询任务状态
 */
export function startPolling(
  webhookTaskId: string,
  onSuccess: (results: Array<{ url: string; type: string }>) => void,
  onError: (error: string) => void
): void {
  let retries = 0;
  const maxRetries = 300; // 最多轮询 5 分钟（每 1 秒轮询一次）

  const pollStatus = async () => {
    try {
      const response = await fetch(`/api/ai-generator/status/${webhookTaskId}`);
      const data = await response.json();

      console.log('Polling response:', data);

      // 处理嵌套的响应格式 { success: true, data: { status, results, ... } }
      const taskData = data.data || data;
      const status = taskData.status;
      const results = taskData.results;

      if (status === 'completed') {
        // 处理 results 数组格式
        if (results && Array.isArray(results)) {
          const imageResults = results.filter((item: any) => item.type === 'image' && item.url);
          onSuccess(imageResults);
        } else {
          onError('生成完成但未返回图片');
        }
      } else if (status === 'failed') {
        // 失败
        onError(taskData.error || taskData.errorMessage || '生成失败');
      } else if (status === 'processing' || status === 'pending') {
        // 继续轮询
        if (retries < maxRetries) {
          retries++;
          setTimeout(pollStatus, 1000); // 1 秒后重新轮询
        } else {
          // 超时
          onError('生成超时');
        }
      } else {
        // 未知状态，继续轮询
        console.warn('Unknown status:', status);
        if (retries < maxRetries) {
          retries++;
          setTimeout(pollStatus, 1000);
        } else {
          onError('轮询超时：未知状态');
        }
      }
    } catch (error) {
      console.error("Polling status failed:", error);
      if (retries < maxRetries) {
        retries++;
        setTimeout(pollStatus, 2000); // 错误时延长间隔
      } else {
        onError('轮询失败');
      }
    }
  };

  // 开始轮询
  pollStatus();
}
