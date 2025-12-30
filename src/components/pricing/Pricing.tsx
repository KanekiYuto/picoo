"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PricingCard } from "./PricingCard";
import { createPricingPlans, createBillingCycles } from "./data";
import { BillingCycle } from "./types";
import { useTranslations } from "next-intl";

interface PricingProps {
  /** 当前用户方案ID */
  currentPlanId?: string;
  /** 选择方案回调 */
  onSelectPlan?: (planId: string) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 定价组件
 * 展示所有定价方案，支持月付/季付/年付切换
 */
export function Pricing({
  currentPlanId,
  onSelectPlan,
  className = "",
}: PricingProps) {
  const t = useTranslations("pricing");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

  // 使用 useMemo 缓存国际化数据
  const billingCycles = useMemo(() => createBillingCycles(t), [t]);
  const pricingPlans = useMemo(() => createPricingPlans(t, billingCycle as 'monthly' | 'yearly'), [t, billingCycle]);

  // 获取当前计费周期的折扣百分比
  const currentCycle = billingCycles.find((c) => c.id === billingCycle);
  const savePercent = currentCycle?.savePercent || 0;

  return (
    <div className={`py-16 px-4 md:px-6 lg:px-8 ${className}`}>
      <div className="container mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("header.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("header.description")}
          </p>
        </div>

        {/* 计费周期切换器 */}
        <div className="flex justify-center mb-16">
          <div className="relative inline-flex gap-2 rounded-lg bg-muted/20 p-1">
            {billingCycles.map((cycle) => (
              <motion.button
                key={cycle.id}
                onClick={() => setBillingCycle(cycle.id)}
                className={`
                  relative px-8 py-2.5 rounded-md font-medium text-sm
                  transition-colors cursor-pointer overflow-visible
                  ${billingCycle === cycle.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {/* 节省标签 */}
                {cycle.savePercent && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap uppercase tracking-wide z-20">
                    {t("billingCycle.save")} {cycle.savePercent}%
                  </span>
                )}

                {/* 背景滑块 - 使用 Framer Motion layoutId 实现平滑动画 */}
                {billingCycle === cycle.id && (
                  <motion.div
                    layoutId="billing-cycle-tab"
                    className="absolute inset-0 rounded-md bg-card shadow-lg z-0"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}

                <span className="relative z-10">{cycle.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* 定价卡片网格和底部说明 - 共享背景色 */}
      <div className="w-full bg-muted/20 p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              savePercent={savePercent}
              onSelect={onSelectPlan}
              isCurrent={currentPlanId === plan.id}
            />
          ))}
        </div>

        {/* 底部说明 */}
        <div className="text-center">
          <p className="inline-block px-4 py-2 rounded-lg border border-muted-foreground/20 text-muted-foreground text-xs font-medium tracking-wide">
            {t("footer.guarantee")}
          </p>
        </div>
      </div>
    </div>
  );
}
