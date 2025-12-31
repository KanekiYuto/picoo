"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/userStore";
import { usePathname } from "next/navigation";
import { getPlanInfo } from "@/lib/utils/plan";

export function BillingInfo() {
  const t = useTranslations("settings.profile.billing");
  const tPlans = useTranslations("common.plans");
  const { user } = useUserStore();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] ?? "";

  if (!user) return null;

  const planInfo = getPlanInfo(user.type, (key) => tPlans(key));
  const pricingPath = locale ? `/${locale}/pricing` : "/pricing";

  return (
    <div className="bg-background border border-border rounded-2xl p-5 md:p-6">
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
