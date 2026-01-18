type CheckoutRequest = {
  productId: string;
  successUrl: string;
  metadata?: Record<string, string | number | null>;
  customer?: { email?: string; name?: string };
  units?: number;
  provider?: 'creem' | 'stripe' | 'paypal';
};

type CheckoutResponse = {
  checkoutUrl?: string;
};

export const createPaymentCheckout = async (
  payload: CheckoutRequest,
): Promise<CheckoutResponse> => {
  const response = await fetch('/api/payment/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout');
  }

  return (await response.json()) as CheckoutResponse;
};
