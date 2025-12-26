"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/userStore";
import { usePathname } from "next/navigation";

export function BillingInfo() {
  const t = useTranslations("settings.profile.billing");
  const { user } = useUserStore();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] ?? "";

  if (!user) return null;

  // 根据用户类型获取套餐名称和样式
  const getPlanInfo = (type: string) => {
    const planMap: Record<string, { name: string; colorClass: string; bgClass: string }> = {
      free: {
        name: t("plans.free"),
        colorClass: "text-gray-600",
        bgClass: "bg-gray-100",
      },
      basic: {
        name: t("plans.basic"),
        colorClass: "text-green-600",
        bgClass: "bg-green-50",
      },
      plus: {
        name: t("plans.plus"),
        colorClass: "text-blue-600",
        bgClass: "bg-blue-50",
      },
      pro: {
        name: t("plans.pro"),
        colorClass: "text-pink-600",
        bgClass: "bg-pink-50",
      },
    };
    return planMap[type] || planMap.free;
  };

  const planInfo = getPlanInfo(user.type);
  const pricingPath = locale ? `/${locale}/pricing` : "/pricing";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm md:text-base font-semibold text-foreground mb-2">
            {t("currentPlan")}
          </div>
          <div className={`inline-flex items-center px-3 py-1 ${planInfo.bgClass} ${planInfo.colorClass} text-xs md:text-sm font-medium rounded-full`}>
            {planInfo.name}
          </div>
        </div>

        {/* 升级按钮 - 只在免费版显示 */}
        {user.type === "free" && (
          <Link
            href={pricingPath}
            className="w-full sm:w-auto px-5 py-2 bg-gradient-primary text-white text-sm font-medium rounded-xl transition-all whitespace-nowrap hover:opacity-90"
          >
            {t("upgradePlan")}
          </Link>
        )}
      </div>
    </div>
  );
}
