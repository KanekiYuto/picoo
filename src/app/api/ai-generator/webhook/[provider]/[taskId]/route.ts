import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generationTask, storage } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { refundCredit } from '@/lib/credit/transaction';
import { uploadToR2 } from '@/lib/storage/r2';
import { addWatermark } from '@/lib/image/watermark';
import { saveGenerationResults } from '@/lib/db/services/generation-task';

// 通用任务状态
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Wavespeed Webhook 格式
interface WavespeedWebhook {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputs?: string[];
  error?: string;
  executionTime?: number;
}

// FAL Webhook 格式
interface FalWebhook {
  request_id: string;
  gateway_request_id?: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'OK' | 'COMPLETED' | 'FAILED' | 'ERROR';
  payload?: {
    images?: Array<{
      url: string;
      content_type?: string;
      file_name?: string;
      file_size?: number | null;
      height?: number | null;
      width?: number | null;
    }>;
  };
  error?: string | null | {
    message: string;
    code: string;
  };
}

// 统一的处理结果
interface ProcessedWebhook {
  status: TaskStatus;
  outputs?: string[];
  error?: string;
}

/**
 * 映射 Wavespeed 状态到统一状态
 */
function mapWavespeedStatus(status: WavespeedWebhook['status']): TaskStatus {
  const statusMap: Record<WavespeedWebhook['status'], TaskStatus> = {
    'pending': 'pending',
    'processing': 'processing',
    'completed': 'completed',
    'failed': 'failed',
  };
  return statusMap[status] || 'pending';
}

/**
 * 映射 FAL 状态到统一状态
 */
function mapFalStatus(status: FalWebhook['status']): TaskStatus {
  const statusMap: Record<FalWebhook['status'], TaskStatus> = {
    'IN_QUEUE': 'pending',
    'IN_PROGRESS': 'processing',
    'OK': 'completed',
    'COMPLETED': 'completed',
    'ERROR': 'failed',
    'FAILED': 'failed',
  };
  return statusMap[status] || 'pending';
}

/**
 * 处理 Wavespeed webhook 数据
 */
function processWavespeedWebhook(payload: WavespeedWebhook): ProcessedWebhook {
  return {
    status: mapWavespeedStatus(payload.status),
    outputs: payload.outputs,
    error: payload.error,
  };
}

/**
 * 处理 FAL webhook 数据
 */
function processFalWebhook(payload: FalWebhook): ProcessedWebhook {
  // 处理错误信息
  let errorMessage: string | undefined;
  if (payload.error) {
    if (typeof payload.error === 'string') {
      errorMessage = payload.error;
    } else if (typeof payload.error === 'object' && payload.error.message) {
      errorMessage = payload.error.message;
    }
  }

  return {
    status: mapFalStatus(payload.status),
    outputs: payload.payload?.images?.map(img => img.url),
    error: errorMessage,
  };
}

/**
 * 根据 provider 处理 webhook 数据
 */
function processWebhookByProvider(provider: string, payload: any): ProcessedWebhook {
  switch (provider.toLowerCase()) {
    case 'wavespeed':
      return processWavespeedWebhook(payload as WavespeedWebhook);

    case 'fal':
      return processFalWebhook(payload as FalWebhook);

    default:
      // 默认按 Wavespeed 格式处理
      return processWavespeedWebhook(payload as WavespeedWebhook);
  }
}

/**
 * 计算任务耗时（毫秒）
 */
function calculateDuration(startedAt: Date | null): number | null {
  if (!startedAt) return null;
  return Date.now() - new Date(startedAt).getTime();
}

/**
 * 从 URL 下载图片
 */
async function downloadImage(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error(`Failed to download image from ${imageUrl}:`, error);
    throw error;
  }
}

/**
 * 转存图片到 R2 并返回原始地址和带水印地址
 */
async function transferImageToR2(
  originalUrl: string,
  taskId: string,
  index: number,
  model: string
): Promise<{ url: string; watermarkUrl: string; storageId: string; watermarkStorageId: string } | null> {
  try {
    // 下载原始图片
    const imageBuffer = await downloadImage(originalUrl);

    // 获取文件扩展名
    const urlPath = new URL(originalUrl).pathname;
    const ext = urlPath.split('.').pop() || 'jpg';
    const fileName = `${taskId}-${index}.${ext}`;
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    // 1. 上传原始图片到 R2
    const uploadResult = await uploadToR2({
      file: imageBuffer,
      fileName,
      contentType,
      prefix: `text-to-image/${model}`,
    });

    // 查询原始图片的 storage ID
    const storageKey = `text-to-image/${model}/${fileName}`;
    const storageRecords = await db
      .select({ id: storage.id })
      .from(storage)
      .where(eq(storage.key, storageKey))
      .limit(1);

    if (storageRecords.length === 0) {
      throw new Error(`Storage record not found for key: ${storageKey}`);
    }

    const storageId = storageRecords[0].id;

    // 2. 生成带水印的图片
    const watermarkedBuffer = await addWatermark(imageBuffer);

    // 3. 上传带水印的图片到 R2
    const watermarkFileName = `${taskId}-${index}-watermark.${ext}`;
    const watermarkUploadResult = await uploadToR2({
      file: watermarkedBuffer,
      fileName: watermarkFileName,
      contentType,
      prefix: `text-to-image/${model}`,
    });

    // 查询水印图片的 storage ID
    const watermarkStorageKey = `text-to-image/${model}/${watermarkFileName}`;
    const watermarkStorageRecords = await db
      .select({ id: storage.id })
      .from(storage)
      .where(eq(storage.key, watermarkStorageKey))
      .limit(1);

    if (watermarkStorageRecords.length === 0) {
      throw new Error(`Storage record not found for watermark key: ${watermarkStorageKey}`);
    }

    const watermarkStorageId = watermarkStorageRecords[0].id;

    console.log(`Image transferred for task ${taskId}:`, {
      original: originalUrl,
      r2: uploadResult.url,
      watermark: watermarkUploadResult.url,
      storageId,
      watermarkStorageId,
    });

    return {
      url: uploadResult.url,
      watermarkUrl: watermarkUploadResult.url,
      storageId,
      watermarkStorageId,
    };
  } catch (error) {
    console.error(`Failed to transfer image to R2:`, error);
    return null;
  }
}

/**
 * 异步处理任务完成：转存图片和更新数据库
 */
async function transferAndUpdateTask(
  taskId: string,
  outputs: string[],
  model: string,
  startedAt: Date | null
) {
  try {
    const durationMs = calculateDuration(startedAt);

    // 1. 转存图片到 R2
    const transferredImages = await Promise.all(
      outputs.map((url, index) => transferImageToR2(url, taskId, index, model))
    );

    // 2. 构建生成结果数组：包含 storageId 和 watermarkStorageId
    const generationResults = transferredImages
      .map((transferred, index) => {
        if (transferred) {
          return {
            storageId: transferred.storageId,
            watermarkStorageId: transferred.watermarkStorageId,
            orderIndex: index,
          };
        }
        return null;
      })
      .filter((result): result is NonNullable<typeof result> => result !== null);

    // 3. 保存生成结果到数据库
    if (generationResults.length > 0) {
      await saveGenerationResults(taskId, generationResults);
    }

    // 4. 更新任务状态为 completed
    await db
      .update(generationTask)
      .set({
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        durationMs,
        updatedAt: new Date(),
      })
      .where(eq(generationTask.taskId, taskId));

    console.log(`Task completed and images transferred for task ${taskId}`);
  } catch (error) {
    console.error(`Failed to transfer images for task ${taskId}:`, error);
  }
}

/**
 * 处理任务完成
 */
async function handleTaskCompleted(taskId: string, outputs: string[], startedAt: Date | null, model: string) {
  try {
    // 1. 先将状态更新为 processing，表示正在处理
    await db
      .update(generationTask)
      .set({
        status: 'processing',
        progress: 50,
        updatedAt: new Date(),
      })
      .where(eq(generationTask.taskId, taskId));

    console.log(`Task ${taskId} status updated to processing, starting image transfer`);

    // 2. 同步转存图片到 R2 并生成水印，完成后更新为 completed
    await transferAndUpdateTask(taskId, outputs, model, startedAt);
  } catch (error) {
    console.error(`Failed to handle task completion for ${taskId}:`, error);
  }
}

/**
 * 处理任务失败并退款
 */
async function handleTaskFailed(taskId: string, consumeTransactionId: string | null, startedAt: Date | null, error?: string) {
  const errorMessage = error || 'Unknown error';
  const durationMs = calculateDuration(startedAt);

  // 如果有消费交易，执行退款
  if (consumeTransactionId) {
    const refundResult = await refundCredit(
      consumeTransactionId,
      `Task failed: ${errorMessage}`
    );

    if (refundResult.success) {
      console.log(`Refund successful for task ${taskId}:`, refundResult.transactionId);

      // 更新任务状态并关联退款交易ID
      await db
        .update(generationTask)
        .set({
          status: 'failed',
          errorMessage: {
            message: errorMessage,
            code: 'generation_failed',
          },
          refundTransactionId: refundResult.transactionId,
          completedAt: new Date(),
          durationMs,
          updatedAt: new Date(),
        })
        .where(eq(generationTask.taskId, taskId));
    } else {
      console.error(`Refund failed for task ${taskId}:`, refundResult.error);

      // 即使退款失败，也要更新任务状态
      await db
        .update(generationTask)
        .set({
          status: 'failed',
          errorMessage: {
            message: errorMessage,
            code: 'generation_failed',
            refundError: refundResult.error,
          },
          completedAt: new Date(),
          durationMs,
          updatedAt: new Date(),
        })
        .where(eq(generationTask.taskId, taskId));
    }
  } else {
    // 没有消费交易ID，直接标记失败
    await db
      .update(generationTask)
      .set({
        status: 'failed',
        errorMessage: {
          message: errorMessage,
          code: 'generation_failed',
        },
        completedAt: new Date(),
        durationMs,
        updatedAt: new Date(),
      })
      .where(eq(generationTask.taskId, taskId));
  }

  console.error(`Task failed: ${taskId}, duration: ${durationMs}ms`, errorMessage);
}

/**
 * 处理任务进行中
 */
async function handleTaskProcessing(taskId: string) {
  await db
    .update(generationTask)
    .set({
      status: 'processing',
      progress: 50,
      updatedAt: new Date(),
    })
    .where(eq(generationTask.taskId, taskId));

  console.log(`Task processing: ${taskId}`);
}

/**
 * POST /api/ai-generator/webhook/[provider]/[taskId]
 * AI 生成器 webhook 回调接口
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; taskId: string }> }
) {
  try {
    const { provider, taskId } = await params;

    // 解析原始 webhook 数据
    let rawPayload: any;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        console.error(`Empty webhook body from ${provider} for task ${taskId}`);
        return NextResponse.json(
          { success: false, error: 'Empty request body' },
          { status: 400 }
        );
      }
      rawPayload = JSON.parse(text);
    } catch (parseError) {
      console.error(`Failed to parse webhook JSON from ${provider}:`, parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    console.log(`Webhook received from ${provider}:`, { taskId, rawPayload });

    // 根据 provider 处理数据
    const { status, outputs, error } = processWebhookByProvider(provider, rawPayload);

    console.log(`Webhook processed from ${provider}:`, { taskId, status, outputs });

    // 查找任务
    const tasks = await db
      .select()
      .from(generationTask)
      .where(
        and(
          eq(generationTask.taskId, taskId),
          eq(generationTask.provider, provider)
        )
      )
      .limit(1);

    if (tasks.length === 0) {
      console.error(`Task not found for ${provider}:`, taskId);
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = tasks[0];

    // 验证任务状态（避免重复处理）
    // 如果任务已经是处理中、完成或失败状态，直接返回
    if (task.status === 'processing' || task.status === 'completed' || task.status === 'failed') {
      console.warn(`Task ${taskId} already in status: ${task.status}, skipping webhook`);
      return NextResponse.json({ success: true, message: 'Task already processed or being processed' });
    }

    // 根据状态处理任务
    switch (status) {
      case 'completed':
        if (outputs && outputs.length > 0) {
          await handleTaskCompleted(taskId, outputs, task.startedAt, task.model);
        }
        break;

      case 'failed':
        await handleTaskFailed(taskId, task.consumeTransactionId, task.startedAt, error);
        break;

      case 'processing':
        await handleTaskProcessing(taskId);
        break;

      default:
        console.warn(`Unknown status: ${status}`);
    }

    // 返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
