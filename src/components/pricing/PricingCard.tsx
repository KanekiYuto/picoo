"use client";

import { Check, X, HelpCircle } from "lucide-react";
import { PricingPlan, BillingCycle } from "./types";

interface PricingCardProps {
  /** 定价方案 */
  plan: PricingPlan;
  /** 计费周期 */
  billingCycle: BillingCycle;
  /** 年付节省百分比（0-100，如 20 表示节省 20%） */
  savePercent?: number;
  /** 点击CTA回调 */
  onSelect?: (planId: string) => void;
  /** 是否为当前方案 */
  isCurrent?: boolean;
}

/**
 * 定价卡片组件
 * 使用模糊的顶部色块实现渐变效果
 */
export function PricingCard({
  plan,
  billingCycle,
  savePercent = 0,
  onSelect,
  isCurrent = false,
}: PricingCardProps) {
  // 计算折扣比例（将百分比转换为小数，如 20% -> 0.2）
  const discountRate = savePercent / 100;

  // 计算年付总价格（应用折扣后）
  const yearlyPrice = plan.monthlyPrice * 12 * (1 - discountRate);

  // 根据计费周期获取价格
  const price = billingCycle === "monthly" ? plan.monthlyPrice : yearlyPrice;

  // 计算原价（用于显示折扣）
  const originalPrice = billingCycle === "yearly" ? plan.monthlyPrice * 12 : 0;

  const handleClick = () => {
    if (onSelect && !isCurrent && plan.id !== "enterprise") {
      onSelect(plan.id);
    }
  };

  const isEnterprise = plan.id === "enterprise";

  return (
    <div className="relative h-full">
      {/* 顶部标签 */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            最受欢迎
          </span>
        </div>
      )}
      {plan.isSpecialOffer && !plan.isPopular && (
        <div className="absolute -top-3 right-4 z-10">
          <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            特别优惠
          </span>
        </div>
      )}

      {/* 卡片主体 */}
      <div className="relative h-full rounded-2xl overflow-hidden border border-white/10 bg-header-bg backdrop-blur-sm">
        {/* 顶部模糊色块 - 关键效果 */}
        <div className="absolute top-0 left-0 -z-10 flex w-full items-center justify-center h-40 blur-[100px]">
          <div className={`w-full h-full bg-gradient-to-b ${plan.colorClass}`}></div>
        </div>

        <div className="p-8 flex flex-col h-full relative z-0">
          {/* 方案名称 */}
          <h3 className="text-2xl font-bold text-white mb-4">
            {plan.name}
          </h3>

          {/* 价格 */}
          {!isEnterprise ? (
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                {originalPrice > 0 && (
                  <span className="text-gray-400 line-through text-2xl">
                    ${originalPrice.toFixed(0)}
                  </span>
                )}
                <span className="text-5xl font-bold text-white">
                  ${Math.round(price)}
                </span>
                <span className="text-lg text-gray-400">
                  /{billingCycle === "yearly" ? "yearly" : "monthly"}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                让我们聊聊
              </div>
              <div className="text-sm text-gray-300">
                {plan.description}
              </div>
            </div>
          )}

          {/* CTA 按钮 */}
          <button
            onClick={handleClick}
            disabled={isCurrent}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold mb-8
              transition-all duration-200
              ${isCurrent
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            {isCurrent ? "当前方案" : plan.ctaText}
          </button>

          {/* 功能列表 */}
          <div className="space-y-3 flex-1">
            {plan.features.map((feature, index) => {
              // 解析文本中的 [[value]] 标记，将其渲染为标签（使用双方括号避免与 i18n 的 {variable} 语法冲突）
              const parseFeatureText = (text: string) => {
                const parts = text.split(/(\[\[[^\]]+\]\])/g);
                return parts.map((part, i) => {
                  if (part.match(/^\[\[[^\]]+\]\]$/)) {
                    // 这是一个标签
                    const value = part.slice(2, -2);
                    return (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-white/10 text-white font-semibold text-xs mx-1">
                        {value}
                      </span>
                    );
                  }
                  return <span key={i}>{part}</span>;
                });
              };

              return (
                <div key={index} className="flex items-start gap-3">
                  {/* 图标：支持/不支持 */}
                  {feature.isNotSupported ? (
                    <X className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className={`text-sm leading-relaxed ${feature.isNotSupported ? "text-gray-500" : "text-white"}`}>
                      {parseFeatureText(feature.text)}
                    </span>
                    <div className="flex items-center gap-2">
                      {feature.isUnlimited && (
                        <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">
                          UNLIMITED
                        </span>
                      )}
                      {feature.hasTooltip && (
                        <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
