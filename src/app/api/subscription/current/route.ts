import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { subscription } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * 获取用户当前的订阅信息
 * GET /api/subscription/current
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

    // 查询用户的当前激活订阅
    const [currentSubscription] = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          eq(subscription.status, 'active')
        )
      )
      .orderBy(subscription.createdAt)
      .limit(1);

    if (!currentSubscription) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: currentSubscription,
    });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
