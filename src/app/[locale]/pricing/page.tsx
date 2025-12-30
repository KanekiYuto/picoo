"use client";

import { Pricing } from "@/components/pricing";
import { PaymentIcons } from "@/components/pricing/PaymentIcons";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Pricing />

      {/* 支付方式图标 */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <PaymentIcons />
        </div>
      </div>

      {/* FAQ 部分 */}
      <PricingFAQ />
    </div>
  );
}
