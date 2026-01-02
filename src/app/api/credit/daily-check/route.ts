import { NextRequest, NextResponse } from 'next/server';
import { checkAndIssueDailyCredit } from '@/lib/credit/daily-credit';
import { getUserType } from '@/lib/db/services/user';
import type { UserType } from '@/lib/image/resource';

export async function POST(request: NextRequest) {
  try {
    // 从 header 中获取当前用户
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取用户类型
    const userType = (await getUserType(userId)) as UserType;

    // 检查并下发每日积分
    const issued = await checkAndIssueDailyCredit(userId, userType);

    return NextResponse.json({
      success: true,
      issued,
      message: issued ? 'Daily credit issued' : 'Daily credit already issued',
    });
  } catch (error) {
    console.error('Daily credit check failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
