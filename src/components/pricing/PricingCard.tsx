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

const POPULAR_BADGE_ICON = (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-3 md:w-3 lg:w-4 h-3 md:h-3 lg:h-4">
    <path fill="currentColor" d="M9.382 8.912h5.236L12.14 4h-.28L9.382 8.912ZM11.299 20v-9.684H3.234L11.299 20Zm1.402 0 8.065-9.684h-8.065V20Zm3.46-11.088H21L19.06 5.03a2.058 2.058 0 0 0-.69-.748A1.743 1.743 0 0 0 17.4 4h-3.67l2.431 4.912ZM3 8.912h4.839L10.27 4H6.6c-.358 0-.682.094-.97.28a2.057 2.057 0 0 0-.69.75L3 8.911Z"></path>
  </svg>
);

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
      {plan.isPopular ? (
        <div className={`relative h-full rounded-2xl p-[3px] flex flex-col ${plan.outerColor}`}>
          {/* 推荐标签 */}
          <span className="text-white text-xs md:text-sm lg:text-base font-semibold px-4 py-3 rounded-full flex items-center justify-center w-full gap-1">
            {POPULAR_BADGE_ICON}
            MOST POPULAR
          </span>

          {/* 内层内容卡片 */}
          <div className={`rounded-xl overflow-hidden bg-[#0F0F0F] ${plan.colorClass} flex flex-col flex-1`}>
            <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full">
              {/* 方案名称 */}
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
                {plan.name}
              </h3>

              {/* 价格 */}
              {!isEnterprise ? (
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    {originalPrice > 0 && (
                      <span className="text-white/60 line-through text-sm md:text-lg lg:text-2xl">
                        ${originalPrice.toFixed(0)}
                      </span>
                    )}
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      ${Math.round(price)}
                    </span>
                    <span className="text-xs md:text-sm lg:text-lg text-white/70">
                      /{billingCycle === "yearly" ? "yearly" : "monthly"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                    让我们聊聊
                  </div>
                  <div className="text-xs md:text-sm lg:text-base text-white/70">
                    {plan.description}
                  </div>
                </div>
              )}

              {/* CTA 按钮 */}
              <button
                onClick={handleClick}
                disabled={isCurrent}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold mb-8 text-xs md:text-sm lg:text-base
                  transition-all duration-200
                  ${isCurrent
                    ? "bg-white/20 text-white cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90"
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
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs md:text-xs lg:text-sm mx-1">
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
                        <X className="w-4 md:w-4 lg:w-5 h-4 md:h-4 lg:h-5 text-white/40 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-4 md:w-4 lg:w-5 h-4 md:h-4 lg:h-5 text-white flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className={`text-xs md:text-sm lg:text-base leading-relaxed ${feature.isNotSupported ? "text-white/40" : "text-white"}`}>
                          {parseFeatureText(feature.text)}
                        </span>
                        <div className="flex items-center gap-2">
                          {feature.isUnlimited && (
                            <span className="bg-yellow-400 text-black text-xs md:text-xs lg:text-sm font-bold px-2 py-0.5 rounded">
                              UNLIMITED
                            </span>
                          )}
                          {feature.hasTooltip && (
                            <HelpCircle className="w-3 md:w-3 lg:w-4 h-3 md:h-3 lg:h-4 text-white/40 flex-shrink-0" />
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
      ) : (
        <div className="relative h-full rounded-2xl p-[3px] flex flex-col md:pt-[51px]">
          {/* 内层内容卡片 */}
          <div className={`rounded-xl overflow-hidden bg-[#0F0F0F] ${plan.colorClass} flex flex-col flex-1`}>
            <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full">
              {/* 方案名称 */}
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
                {plan.name}
              </h3>

              {/* 价格 */}
              {!isEnterprise ? (
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    {originalPrice > 0 && (
                      <span className="text-white/60 line-through text-sm md:text-lg lg:text-2xl">
                        ${originalPrice.toFixed(0)}
                      </span>
                    )}
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                      ${Math.round(price)}
                    </span>
                    <span className="text-xs md:text-sm lg:text-lg text-white/70">
                      /{billingCycle === "yearly" ? "yearly" : "monthly"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                    让我们聊聊
                  </div>
                  <div className="text-xs md:text-sm lg:text-base text-white/70">
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
                    ? "bg-white/20 text-white cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90"
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
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white font-semibold text-xs md:text-xs lg:text-sm mx-1">
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
                        <X className="w-4 md:w-4 lg:w-5 h-4 md:h-4 lg:h-5 text-white/40 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-4 md:w-4 lg:w-5 h-4 md:h-4 lg:h-5 text-white flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className={`text-xs md:text-sm lg:text-base leading-relaxed ${feature.isNotSupported ? "text-white/40" : "text-white"}`}>
                          {parseFeatureText(feature.text)}
                        </span>
                        <div className="flex items-center gap-2">
                          {feature.isUnlimited && (
                            <span className="bg-yellow-400 text-black text-xs md:text-xs lg:text-sm font-bold px-2 py-0.5 rounded">
                              UNLIMITED
                            </span>
                          )}
                          {feature.hasTooltip && (
                            <HelpCircle className="w-3 md:w-3 lg:w-4 h-3 md:h-3 lg:h-4 text-white/40 flex-shrink-0" />
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
      )}
    </div>
  );
}
