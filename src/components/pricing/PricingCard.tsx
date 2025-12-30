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
    <div className="relative h-full rounded-2xl overflow-hidden border border-border bg-card">
      {/* 顶部模糊色块 - 关键效果 */}
      <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-center h-40 blur-[100px]">
        <div className={`w-full h-full bg-gradient-to-b ${plan.colorClass}`}></div>
      </div>

      <div className="p-8 flex flex-col h-full relative z-20">
        {/* 方案名称 */}
        <h3 className="text-2xl font-bold text-foreground mb-4">
          {plan.name}
        </h3>

        {/* 价格 */}
        {!isEnterprise ? (
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              {originalPrice > 0 && (
                <span className="text-muted-foreground line-through text-2xl">
                  ${originalPrice.toFixed(0)}
                </span>
              )}
              <span className="text-5xl font-bold text-foreground">
                ${Math.round(price)}
              </span>
              <span className="text-lg text-muted-foreground">
                /{billingCycle === "yearly" ? "yearly" : "monthly"}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="text-3xl font-bold text-foreground mb-2">
              让我们聊聊
            </div>
            <div className="text-sm text-muted-foreground">
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
              ? "bg-muted/20 text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }
            `}
        >
          {isCurrent ? "当前方案" : plan.ctaText}
        </button>

        {/* 功能列表 */}
        <div className="space-y-3 flex-1">
          {plan.features.map((feature, index) => {
            // 解析文本中的 [[value]] 标记，将其渲染为标签
            const parseFeatureText = (text: string) => {
              const parts: (string | { type: "tag"; value: string })[] = [];
              let remaining = text;

              while (true) {
                const openIndex = remaining.indexOf("[[");
                if (openIndex === -1) {
                  if (remaining.length > 0) {
                    parts.push(remaining);
                  }
                  break;
                }

                if (openIndex > 0) {
                  parts.push(remaining.substring(0, openIndex));
                }

                const closeIndex = remaining.indexOf("]]", openIndex + 2);
                if (closeIndex === -1) {
                  parts.push(remaining.substring(openIndex));
                  break;
                }

                const tagValue = remaining.substring(openIndex + 2, closeIndex);
                parts.push({ type: "tag", value: tagValue });
                remaining = remaining.substring(closeIndex + 2);
              }

              return parts.map((part, i) => {
                if (typeof part === "object") {
                  return (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-muted/20 text-foreground font-semibold text-xs mx-1">
                      {part.value}
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
                  <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                ) : (
                  <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className={`text-sm leading-relaxed ${feature.isNotSupported ? "text-muted-foreground" : "text-foreground"}`}>
                    {parseFeatureText(feature.text)}
                  </span>
                  <div className="flex items-center gap-2">
                    {feature.isUnlimited && (
                      <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">
                        UNLIMITED
                      </span>
                    )}
                    {feature.hasTooltip && (
                      <HelpCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
