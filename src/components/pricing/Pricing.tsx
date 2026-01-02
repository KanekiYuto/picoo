"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { PricingCard } from "./PricingCard";
import { createPricingPlans, createBillingCycles } from "./data";
import { BillingCycle } from "./types";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/userStore";

interface PricingProps {
  /** 自定义类名 */
  className?: string;
}

/**
 * 定价组件
 * 展示所有定价方案，支持月付/季付/年付切换
 */
export function Pricing({
  className = "",
}: PricingProps) {
  const t = useTranslations("pricing");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currentSubscriptionPlanType, setCurrentSubscriptionPlanType] = useState<string | null>(null);

  // 从 store 获取用户信息和登录状态
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // 获取当前订阅信息
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCurrentSubscriptionPlanType(null);
      return;
    }

    const fetchCurrentSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/current');
        const result = await response.json();

        if (result.success && result.data?.planType) {
          setCurrentSubscriptionPlanType(result.data.planType);
        } else {
          setCurrentSubscriptionPlanType(null);
        }
      } catch (error) {
        console.error('Failed to fetch current subscription:', error);
        setCurrentSubscriptionPlanType(null);
      }
    };

    fetchCurrentSubscription();
  }, [isAuthenticated, user]);

  // 使用 useMemo 缓存国际化数据
  const billingCycles = useMemo(() => createBillingCycles(t), [t]);
  const pricingPlans = useMemo(() => createPricingPlans(t, billingCycle as 'monthly' | 'yearly'), [t, billingCycle]);

  // 检查指定计划是否为当前订阅（需要同时匹配 billingCycle 和计划 ID）
  const isCurrentPlan = (planId: string): boolean => {
    if (!currentSubscriptionPlanType) return false;
    // 比较完整的订阅类型，确保计费周期和计划 ID 都匹配
    const expectedPlanType = `${billingCycle}_${planId}`;
    return currentSubscriptionPlanType === expectedPlanType;
  };

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
                    className="absolute inset-0 rounded-md bg-background shadow-lg z-0"
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
              isCurrent={isCurrentPlan(plan.id)}
              user={user}
            />
          ))}
        </div>

        {/* 底部说明 */}
        <div className="text-center">
          <p className="inline-block px-4 py-2 rounded-lg border border-muted-foreground/20 text-muted-foreground text-xs font-medium tracking-wide bg-background">
            {t("footer.guarantee")}
          </p>
        </div>
      </div>
    </div>
  );
}
