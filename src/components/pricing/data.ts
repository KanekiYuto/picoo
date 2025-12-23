import { PricingPlan, BillingCycleConfig } from "./types";

/**
 * 创建计费周期配置
 * @param t 翻译函数
 */
export function createBillingCycles(t: (key: string) => string): BillingCycleConfig[] {
  return [
    { id: "monthly", label: t("billingCycle.monthly") },
    { id: "yearly", label: t("billingCycle.yearly"), savePercent: 20 },
  ];
}

/**
 * 创建定价方案数据
 * @param t 翻译函数
 */
export function createPricingPlans(t: (key: string, values?: Record<string, string | number>) => string): PricingPlan[] {
  return [
    {
      id: "free",
      name: t("plans.free.name"),
      monthlyPrice: 0,
      ctaText: t("plans.free.ctaText"),
      colorClass: "from-[rgba(156,163,175,0.8)] to-[rgba(0,0,0,0.8)]",
      features: [
        { text: t("plans.free.features.0", { credits: 100 }) },
        { text: t("plans.free.features.1", { images: 20 }) },
        { text: t("plans.free.features.2") },
        { text: t("plans.free.features.3") },
        { text: t("plans.free.features.4", { concurrent: 1 }) },
        { text: t("plans.free.features.5") },
        { text: t("plans.free.features.6", { seats: 2 }) },
        { text: t("plans.free.features.7"), isNotSupported: true },
      ],
    },
    {
      id: "basic",
      name: t("plans.basic.name"),
      monthlyPrice: 10,
      ctaText: t("plans.basic.ctaText"),
      colorClass: "from-[rgba(169,255,105,0.8)] to-[rgba(0,0,0,0.8)]",
      features: [
        { text: t("plans.basic.features.0", { credits: 1500 }) },
        { text: t("plans.basic.features.1", { images: 240 }) },
        { text: t("plans.basic.features.2", { videos: 40 }) },
        { text: t("plans.basic.features.3") },
        { text: t("plans.basic.features.4") },
        { text: t("plans.basic.features.5", { imageConcurrent: 8 }) },
        { text: t("plans.basic.features.6", { videoConcurrent: 2 }) },
        { text: t("plans.basic.features.7", { support: "7×24" }) },
        { text: t("plans.basic.features.8", { seats: 5 }) },
      ],
    },
    {
      id: "plus",
      name: t("plans.plus.name"),
      monthlyPrice: 20,
      ctaText: t("plans.plus.ctaText"),
      isPopular: true,
      colorClass: "from-[rgba(96,165,250,0.8)] to-[rgba(0,0,0,0.8)]",
      features: [
        { text: t("plans.plus.features.0", { credits: 1500 }) },
        { text: t("plans.plus.features.1", { images: 240 }) },
        { text: t("plans.plus.features.2", { videos: 40 }) },
        { text: t("plans.plus.features.3") },
        { text: t("plans.plus.features.4") },
        { text: t("plans.plus.features.5", { imageConcurrent: 12 }) },
        { text: t("plans.plus.features.6", { videoConcurrent: 4 }) },
        { text: t("plans.plus.features.7", { support: "7×24" }) },
        { text: t("plans.plus.features.8", { seats: 10 }) },
      ],
    },
    {
      id: "pro",
      name: t("plans.pro.name"),
      monthlyPrice: 100,
      ctaText: t("plans.pro.ctaText"),
      isSpecialOffer: true,
      colorClass: "from-[rgba(236,72,153,0.8)] to-[rgba(0,0,0,0.8)]",
      features: [
        { text: t("plans.pro.features.0", { credits: 1500 }) },
        { text: t("plans.pro.features.1", { images: 240 }) },
        { text: t("plans.pro.features.2", { videos: 40 }) },
        { text: t("plans.pro.features.3") },
        { text: t("plans.pro.features.4") },
        { text: t("plans.pro.features.5", { imageConcurrent: 60 }) },
        { text: t("plans.pro.features.6", { videoConcurrent: 20 }) },
        { text: t("plans.pro.features.7", { support: "7×24" }) },
        { text: t("plans.pro.features.8") },
        { text: t("plans.pro.features.9", { seats: 50 }) },
      ],
    },
  ];
}
