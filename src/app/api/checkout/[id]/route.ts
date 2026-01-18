import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { credit, transaction } from '@/server/db/schema';

/**
 * 获取一次性支付详情（积分包）
 * GET /api/checkout/[id]
 *
 * 参数 id: 支付平台交易/Checkout ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const [transactionData] = await db
      .select()
      .from(transaction)
      .where(eq(transaction.paymentTransactionId, id))
      .limit(1);

    if (!transactionData) {
      return NextResponse.json(
        { success: false, error: 'Checkout not found' },
        { status: 404 },
      );
    }

    if (transactionData.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const [creditData] = await db
      .select()
      .from(credit)
      .where(eq(credit.transactionId, transactionData.id))
      .limit(1);

    if (!creditData) {
      return NextResponse.json(
        { success: false, error: 'Credit not found' },
        { status: 404 },
      );
    }

    const creditType = creditData.type || '';
    const creditPackId = creditType.startsWith('credit_pack_')
      ? creditType.replace('credit_pack_', '')
      : null;

    return NextResponse.json({
      success: true,
      data: {
        paymentTransactionId: transactionData.paymentTransactionId,
        amount: transactionData.amount,
        currency: transactionData.currency,
        credits: creditData.amount,
        creditPackId,
        expiresAt: creditData.expiresAt,
      },
    });
  } catch (error) {
    console.error('Failed to fetch checkout:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
