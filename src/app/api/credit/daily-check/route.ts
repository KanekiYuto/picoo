import { NextRequest, NextResponse } from 'next/server';
import { checkAndIssueDailyCredit } from '@/lib/credit/daily-credit';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 从 session 中获取当前用户
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userType = (session.user as any).type || 'free';

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
