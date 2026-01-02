import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * 获取用户的订阅列表
 * GET /api/subscription/list
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户会话
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 查询用户的所有订阅记录，按创建时间倒序
    const subscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .orderBy(desc(subscription.createdAt));

    return NextResponse.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
