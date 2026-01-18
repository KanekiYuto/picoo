import { NextRequest } from 'next/server';
import { DEFAULT_PAYMENT_PROVIDER } from '@/shared/payment/config';
import { getPaymentProvider } from '@/shared/payment/providers';
import { siteConfig } from '@/config/site';
import type { PaymentProvider } from '@/shared/payment/config/payment.types';

type CheckoutRequest = {
  productId: string;
  successUrl?: string;
  metadata?: Record<string, string | number | null>;
  customer?: { email?: string; name?: string };
  units?: number;
  provider?: PaymentProvider;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CheckoutRequest;

  if (!body.productId) {
    return Response.json({ error: 'Missing productId' }, { status: 400 });
  }

  const origin = siteConfig.url ?? request.nextUrl.origin;
  const successUrl = body.successUrl ?? `${origin}/subscription/success`;
  const provider = body.provider ?? DEFAULT_PAYMENT_PROVIDER;

  try {
    const adapter = getPaymentProvider(provider);
    const { checkoutUrl } = await adapter.createCheckout({
      productId: body.productId,
      successUrl,
      metadata: body.metadata,
      customer: body.customer,
      units: body.units,
    });

    return Response.json({ checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
