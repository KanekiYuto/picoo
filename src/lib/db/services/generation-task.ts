import { db } from '@/lib/db';
import {
  generationTask,
  generationResult,
  generationParameters,
  storage,
} from '@/lib/db/schema';
import { eq, desc, and, count, isNull } from 'drizzle-orm';

/**
 * 获取任务详情（包括结果和参数）
 */
export async function getGenerationTaskWithResults(taskId: string) {
  // 获取任务基本信息
  const tasks = await db
    .select()
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);

  if (tasks.length === 0) {
    return null;
  }

  const task = tasks[0];

  // 获取结果
  const results = await db
    .select({
      url: storage.url,
      watermarkUrl: storage.url,
      type: storage.type,
      orderIndex: generationResult.orderIndex,
    })
    .from(generationResult)
    .innerJoin(storage, eq(generationResult.storageId, storage.id))
    .where(eq(generationResult.taskId, task.id))
    .orderBy(generationResult.orderIndex);

  return {
    ...task,
    results,
  };
}

/**
 * 获取用户的生成历史列表
 */
export async function getUserGenerationHistory(userId: string, limit: number = 20, offset: number = 0) {
  // 获取总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(generationTask)
    .where(
      and(
        eq(generationTask.userId, userId),
        isNull(generationTask.deletedAt)
      )
    );

  // 获取任务列表
  const tasks = await db
    .select({
      id: generationTask.id,
      parameters: generationTask.parameters,
      taskType: generationTask.taskType,
      createdAt: generationTask.createdAt,
      updatedAt: generationTask.updatedAt,
    })
    .from(generationTask)
    .where(
      and(
        eq(generationTask.userId, userId),
        isNull(generationTask.deletedAt)
      )
    )
    .orderBy(desc(generationTask.createdAt))
    .limit(limit)
    .offset(offset);

  // 获取每个任务的结果
  const taskIds = tasks.map(t => t.id);
  const resultsMap = new Map<string, Array<{ url: string }>>();

  if (taskIds.length > 0) {
    for (const taskId of taskIds) {
      const taskResults = await db
        .select({
          url: storage.url,
          orderIndex: generationResult.orderIndex,
        })
        .from(generationResult)
        .innerJoin(storage, eq(generationResult.storageId, storage.id))
        .where(eq(generationResult.taskId, taskId))
        .orderBy(generationResult.orderIndex);

      resultsMap.set(
        taskId,
        taskResults.map(r => ({ url: r.url }))
      );
    }
  }

  // 组装历史记录
  const histories = tasks.map((task) => {
    const parameters = task.parameters as Record<string, any> || {};
    const resultsArray = resultsMap.get(task.id) || [];
    const resultUrls = resultsArray.map((r: any) => r.url).filter(Boolean);

    return {
      id: task.id,
      prompt: parameters.prompt || "",
      results: resultUrls,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  });

  return {
    histories,
    total,
    limit,
    offset,
    hasMore: offset + histories.length < total,
  };
}

/**
 * 更新任务状态
 */
export async function updateGenerationTaskStatus(
  taskId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  updates: Record<string, any> = {}
) {
  return db
    .update(generationTask)
    .set({
      status,
      updatedAt: new Date(),
      ...updates,
    })
    .where(eq(generationTask.taskId, taskId));
}

/**
 * 标记任务完成并保存结果
 */
export async function completeGenerationTask(
  taskId: string,
  results: Array<{
    url: string;
    watermarkUrl?: string;
    type: string;
  }>,
  durationMs?: number
) {
  // 获取任务 ID
  const tasks = await db
    .select({ id: generationTask.id })
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);

  if (tasks.length === 0) {
    throw new Error('Task not found');
  }

  const task = tasks[0];

  // 首先创建 storage 记录和 generationResult 关联
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    // 创建 storage 记录（如果需要）
    // 注意：这里假设 URL 和文件信息已经在上传时保存到 storage 表
    // 实际使用时可能需要根据业务逻辑调整

    // 为简化起见，这里假设只需创建 generationResult 关联
    // 实际实现中应该先查询或创建 storage 记录
  }

  // 更新任务状态为完成
  return db
    .update(generationTask)
    .set({
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      durationMs,
      updatedAt: new Date(),
    })
    .where(eq(generationTask.taskId, taskId));
}

/**
 * 标记任务失败
 */
export async function failGenerationTask(
  taskId: string,
  errorMessage: Record<string, any>,
  durationMs?: number,
  refundTransactionId?: string
) {
  return db
    .update(generationTask)
    .set({
      status: 'failed',
      errorMessage,
      refundTransactionId,
      completedAt: new Date(),
      durationMs,
      updatedAt: new Date(),
    })
    .where(eq(generationTask.taskId, taskId));
}

/**
 * 软删除历史记录
 */
export async function deleteGenerationHistory(taskId: string, userId: string) {
  const tasks = await db
    .select({ id: generationTask.id })
    .from(generationTask)
    .where(
      and(
        eq(generationTask.id, taskId),
        eq(generationTask.userId, userId)
      )
    )
    .limit(1);

  if (tasks.length === 0) {
    throw new Error('Task not found or unauthorized');
  }

  return db
    .update(generationTask)
    .set({ deletedAt: new Date() })
    .where(eq(generationTask.id, taskId));
}

/**
 * 保存生成结果到 generationResult 和 storage 表
 */
export async function saveGenerationResults(
  taskId: string,
  results: Array<{
    storageId: string;
    watermarkStorageId?: string;
    orderIndex: number;
  }>
) {
  // 获取任务 ID
  const tasks = await db
    .select({ id: generationTask.id })
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);

  if (tasks.length === 0) {
    throw new Error('Task not found');
  }

  const task = tasks[0];

  // 保存每个结果
  for (const result of results) {
    await db
      .insert(generationResult)
      .values({
        taskId: task.id,
        storageId: result.storageId,
        watermarkStorageId: result.watermarkStorageId,
        orderIndex: result.orderIndex,
      });
  }
}

/**
 * 保存生成参数引用的资源
 */
export async function saveGenerationParameters(
  taskId: string,
  parameters: Array<{
    storageId: string;
    paramType: string;
  }>
) {
  // 获取任务 ID
  const tasks = await db
    .select({ id: generationTask.id })
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);

  if (tasks.length === 0) {
    throw new Error('Task not found');
  }

  const task = tasks[0];

  // 保存每个参数
  for (const param of parameters) {
    await db
      .insert(generationParameters)
      .values({
        taskId: task.id,
        storageId: param.storageId,
        paramType: param.paramType,
      });
  }
}
