"use client";

import { Pricing } from "@/components/pricing";
import { PaymentIcons } from "@/components/pricing/PaymentIcons";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

export default function PricingPage() {
  const handleSelectPlan = (planId: string) => {
    console.log("Selected plan:", planId);
    // TODO: 实现订阅逻辑
  };

  return (
    <div className="min-h-screen">
      <Pricing onSelectPlan={handleSelectPlan} />

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
