import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { db } from '@/server/db';
import { generationTask, storage } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import mime from 'mime-types';
import { refundCredit } from '@/server/credit/transaction';
import { uploadToR2 } from '@/server/storage/r2';
import { addWatermark } from '@/lib/image/watermark';
import { saveGenerationResults, failGenerationTask, updateGenerationTaskStatus } from '@/server/db/services/generation-task';

/**
 * Webhook 处理流程说明：
 *
 * 1. 解析 Webhook 请求
 *    └─ 根据 provider (wavespeed/fal) 解析数据，映射到统一状态格式
 *
 * 2. 查询任务信息
 *    └─ 根据 taskId 和 provider 查询数据库中的任务
 *    └─ 验证任务所有权和当前状态，避免重复处理
 *
 * 3. 根据任务状态处理：
 *    ├─ 'completed':
 *    │  ├─ 下载生成的图片
 *    │  ├─ 上传原始版本到 R2
 *    │  ├─ 生成水印版本并上传到 R2
 *    │  ├─ 保存结果记录到 generationResult 表
 *    │  └─ 更新任务为 completed
 *    │
 *    ├─ 'failed':
 *    │  ├─ 如有消费配额，执行退款
 *    │  ├─ 关联退款交易ID（如果成功）
 *    │  └─ 更新任务为 failed
 *    │
 *    └─ 'processing':
 *       └─ 更新任务进度为 50%
 *
 * 4. 返回响应
 *    └─ 返回成功/失败状态给服务商
 */

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
function calculateDuration(startedAt: Date | null): number | undefined {
  if (!startedAt) return undefined;
  return Date.now() - new Date(startedAt).getTime();
}

/**
 * 从 URL 下载图片
 */
async function downloadImage(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl, {
      cache: "no-store",
    });
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
  taskType: string,
  model: string
): Promise<{ url: string; watermarkUrl: string; storageId: string; watermarkStorageId: string } | null> {
  try {
    // 下载原始图片
    const imageBuffer = await downloadImage(originalUrl);

    // 获取文件扩展名和 MIME 类型
    const urlPath = new URL(originalUrl).pathname;
    const ext = (path.extname(urlPath).slice(1)).toLowerCase();
    const fileName = `${taskId}-${index}.${ext}`;
    const contentType = mime.lookup(fileName);

    if (!contentType) {
      throw new Error(`Invalid file type for ${fileName}`);
    }

    // 1. 上传原始图片到 R2
    const uploadResult = await uploadToR2({
      file: imageBuffer,
      fileName,
      contentType,
      prefix: `${taskType}/${model}`,
    });

    // 创建或查询原始图片的 storage 记录
    const storageKey = `${taskType}/${model}/${fileName}`;
    const storageRecords = await db
      .select({ id: storage.id })
      .from(storage)
      .where(eq(storage.key, storageKey))
      .limit(1);

    let storageId: string;

    // 从 mime 类型提取文件类型
    const fileType = contentType.split('/')[0];

    if (storageRecords.length === 0) {
      // 如果记录不存在，创建新记录
      const insertResult = await db
        .insert(storage)
        .values({
          key: storageKey,
          url: uploadResult.url,
          filename: fileName,
          originalFilename: fileName,
          type: fileType,
          mimeType: contentType,
          size: imageBuffer.length,
        })
        .returning();
      storageId = insertResult[0].id;
    } else {
      storageId = storageRecords[0].id;
    }

    // 2. 生成带水印的图片
    const watermarkedBuffer = await addWatermark(imageBuffer);

    // 3. 上传带水印的图片到 R2
    const watermarkFileName = `${taskId}-${index}-watermark.${ext}`;
    const watermarkUploadResult = await uploadToR2({
      file: watermarkedBuffer,
      fileName: watermarkFileName,
      contentType,
      prefix: `${taskType}/${model}`,
    });

    // 创建或查询水印图片的 storage 记录
    const watermarkStorageKey = `${taskType}/${model}/${watermarkFileName}`;
    const watermarkStorageRecords = await db
      .select({ id: storage.id })
      .from(storage)
      .where(eq(storage.key, watermarkStorageKey))
      .limit(1);

    let watermarkStorageId: string;
    if (watermarkStorageRecords.length === 0) {
      // 如果记录不存在，创建新记录
      const insertResult = await db
        .insert(storage)
        .values({
          key: watermarkStorageKey,
          url: watermarkUploadResult.url,
          filename: watermarkFileName,
          originalFilename: fileName,
          type: fileType,
          mimeType: contentType,
          size: watermarkedBuffer.length,
        })
        .returning();
      watermarkStorageId = insertResult[0].id;
    } else {
      watermarkStorageId = watermarkStorageRecords[0].id;
    }

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
 * 批量转存图片到 R2
 * 返回转存结果（包含 storageId）
 */
async function batchTransferImages(
  outputs: string[],
  taskId: string,
  taskType: string,
  model: string
): Promise<Array<{ storageId: string; watermarkStorageId: string; orderIndex: number }>> {
  const transferredImages = await Promise.all(
    outputs.map((url, index) => transferImageToR2(url, taskId, index, taskType, model))
  );

  return transferredImages
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
}

/**
 * 保存任务结果到数据库
 */
async function saveTaskResults(
  taskId: string,
  generationResults: Array<{ storageId: string; watermarkStorageId: string; orderIndex: number }>
): Promise<void> {
  if (generationResults.length === 0) {
    console.warn(`No valid generation results for task ${taskId}`);
    return;
  }

  try {
    await saveGenerationResults(taskId, generationResults);
    console.log(`Generation results saved for task ${taskId}`);
  } catch (saveError) {
    console.error(`Failed to save generation results for task ${taskId}:`, saveError);
    throw saveError;
  }
}

/**
 * 完成任务：转存图片、保存结果、更新状态
 */
async function completeTask(
  taskId: string,
  outputs: string[],
  taskType: string,
  model: string,
  startedAt: Date | null
): Promise<void> {
  try {
    console.log(`Starting task completion for ${taskId}, outputs: ${outputs.length}`);

    // 1. 转存所有图片到 R2
    const generationResults = await batchTransferImages(outputs, taskId, taskType, model);
    console.log(`Images transferred for task ${taskId}, results: ${generationResults.length}`);

    // 2. 保存结果到数据库
    await saveTaskResults(taskId, generationResults);

    // 3. 更新任务状态为 completed
    const durationMs = calculateDuration(startedAt);
    await updateGenerationTaskStatus(taskId, 'completed', {
      progress: 100,
      completedAt: new Date(),
      durationMs,
    });

    console.log(`Task completed successfully: ${taskId}`);
  } catch (error) {
    console.error(`Task completion failed for ${taskId}:`, error);

    // 转存或保存失败时，将任务标记为失败
    try {
      await failGenerationTask(
        taskId,
        {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'completion_failed',
        },
        calculateDuration(startedAt)
      );
      console.log(`Task marked as failed: ${taskId}`);
    } catch (updateError) {
      console.error(`Failed to mark task as failed: ${taskId}`, updateError);
    }

    throw error;
  }
}

/**
 * 处理任务成功完成
 */
async function handleTaskCompleted(taskId: string, outputs: string[], startedAt: Date | null, taskType: string, model: string) {
  try {
    // 更新状态为 processing，表示正在处理
    await updateGenerationTaskStatus(taskId, 'processing', {
      progress: 50,
    });
    console.log(`Task status updated to processing: ${taskId}`);

    // 执行完成逻辑
    await completeTask(taskId, outputs, taskType, model, startedAt);
  } catch (error) {
    console.error(`Failed to handle task completion for ${taskId}:`, error);
    // 错误已在 completeTask 中处理
  }
}

/**
 * 执行退款（如果需要）
 */
async function processRefund(consumeTransactionId: string | null): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  if (!consumeTransactionId) {
    return { success: true }; // 无需退款
  }

  const refundResult = await refundCredit(
    consumeTransactionId,
    'Task failed - refund credit'
  );

  return refundResult;
}

/**
 * 处理任务失败并退款
 */
async function handleTaskFailed(taskId: string, consumeTransactionId: string | null, startedAt: Date | null, error?: string) {
  const errorMessage = error || 'Unknown error';
  const durationMs = calculateDuration(startedAt);

  console.log(`Handling task failure for ${taskId}: ${errorMessage}`);

  try {
    // 1. 尝试退款
    const refundResult = await processRefund(consumeTransactionId);

    if (!refundResult.success) {
      console.error(`Refund failed for task ${taskId}:`, refundResult.error);
    } else if (refundResult.transactionId) {
      console.log(`Refund successful for task ${taskId}:`, refundResult.transactionId);
    }

    // 2. 标记任务失败
    await failGenerationTask(
      taskId,
      {
        message: errorMessage,
        code: 'generation_failed',
        ...(refundResult.success ? {} : { refundError: refundResult.error }),
      },
      durationMs,
      refundResult.transactionId
    );

    console.log(`Task marked as failed: ${taskId}, duration: ${durationMs}ms`);
  } catch (error) {
    console.error(`Error handling task failure for ${taskId}:`, error);
    throw error;
  }
}

/**
 * 处理任务进行中
 */
async function handleTaskProcessing(taskId: string) {
  await updateGenerationTaskStatus(taskId, 'processing', {
    progress: 50,
  });

  console.log(`Task processing: ${taskId}`);
}

/**
 * 解析 Webhook 请求体
 */
async function parseWebhookPayload(request: NextRequest, provider: string, taskId: string): Promise<any> {
  try {
    const text = await request.text();
    if (!text || text.trim() === '') {
      throw new Error('Empty request body');
    }
    return JSON.parse(text);
  } catch (error) {
    console.error(`Failed to parse webhook from ${provider} for task ${taskId}:`, error);
    throw error;
  }
}

/**
 * 查询任务信息
 */
async function fetchTask(taskId: string, provider: string) {
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
    throw new Error(`Task not found: ${taskId}`);
  }

  return tasks[0];
}

/**
 * 检查是否应该处理此任务（避免重复处理）
 */
function shouldProcessTask(task: any): boolean {
  const alreadyProcessed = task.status === 'processing' || task.status === 'completed' || task.status === 'failed';
  if (alreadyProcessed) {
    console.warn(`Task already processed, skipping: ${task.taskId} (status: ${task.status})`);
  }
  return !alreadyProcessed;
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

    // 1. 解析请求
    const rawPayload = await parseWebhookPayload(request, provider, taskId);
    console.log(`Webhook received from ${provider}:`, { taskId });

    // 2. 转换状态
    const { status, outputs, error } = processWebhookByProvider(provider, rawPayload);
    console.log(`Webhook processed:`, { taskId, status, outputCount: outputs?.length ?? 0 });

    // 3. 查询任务
    const task = await fetchTask(taskId, provider);

    // 4. 检查是否需要处理（避免重复）
    if (!shouldProcessTask(task)) {
      return NextResponse.json({ success: true, message: 'Task already processed' });
    }

    // 5. 根据状态分发处理
    switch (status) {
      case 'completed':
        if (outputs && outputs.length > 0) {
          console.log(`Completing task with ${outputs.length} outputs: ${taskId}`);
          await handleTaskCompleted(taskId, outputs, task.startedAt, task.taskType, task.model);
        } else {
          console.warn(`Task completed but no outputs: ${taskId}`);
        }
        break;

      case 'failed':
        console.log(`Failing task with error: ${taskId}`);
        await handleTaskFailed(taskId, task.consumeTransactionId, task.startedAt, error);
        break;

      case 'processing':
        console.log(`Processing task: ${taskId}`);
        await handleTaskProcessing(taskId);
        break;

      default:
        console.warn(`Unknown status: ${status} for task ${taskId}`);
    }

    // 6. 返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: error instanceof Error && error.message === 'Task not found' ? 404 : 500 }
    );
  }
}
