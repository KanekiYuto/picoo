import { NextRequest, NextResponse } from 'next/server';
import { handleFalRequest } from '@/lib/ai-generator/handleFalRequest';
import { ProcessParamsResult } from '@/lib/ai-generator/handleRequest';

// 请求参数接口
interface TextToImageRequest {
  prompt: string;
  num_images: number;
  seed: number;
  quality: 'low' | 'medium' | 'high';
  size: '1024x1024' | '1024x1536' | '1536x1024';
  background: string;
  output_format: string;
}

/**
 * POST /api/ai-generator/provider/fal/gpt-image-1.5/text-to-image
 * GPT Image 1.5 文生图 API (异步模式，使用 webhook)
 */
export async function POST(request: NextRequest) {
  return handleFalRequest(request, {
    endpoint: 'fal-ai/gpt-image-1.5',
    taskType: 'text-to-image',
    model: 'gpt-image-1.5',

    // 参数处理回调函数
    processParams: (body: TextToImageRequest): ProcessParamsResult | NextResponse => {
      // 解析参数
      const {
        prompt,
        num_images,
        background,
        seed,
        quality,
        size,
        output_format,
      } = body;

      // 验证必填参数
      if (!prompt || !prompt.trim()) {
        return NextResponse.json(
          { success: false, error: 'Prompt is required' },
          { status: 400 }
        );
      }

      // 构建 API 请求参数
      const apiParams: Record<string, any> = {
        prompt,
        output_format,
        num_images,
        quality,
        size,
        background,
      };

      // 返回处理结果
      return {
        // 用于积分计算的参数
        creditsParams: {
          num_images: num_images || 1,
          quality: quality || 'medium',
          size: size || '1024x1024',
        },
        // 发送给 Fal AI API 的参数
        apiParams,
        // 存储到数据库的参数
        dbParams: {
          prompt,
          num_images,
          seed,
          quality,
          size,
          output_format,
          background,
        },
        // 配额消费描述
        description: `Text-to-image generation: ${prompt.substring(0, 50)}...`,
      };
    },
  });
}
