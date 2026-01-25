"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/routing";
import { useUserStore } from "@/store/useUserStore";
import { getPlanInfo } from "@/lib/utils/plan";
import { ManageSubscriptionButton } from "@/components/subscription/ManageSubscriptionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionData {
  planType: string;
  customerId: string;
  amount: string;
  platform: string;
  startDate: string;
  expiryDate: string;
  renewalDate: string;
}

export function BillingInfo() {
  const t = useTranslations("settings.billing");
  const tPlans = useTranslations("common.plans");
  const { user } = useUserStore();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const planName = subscriptionData
    ? tPlans(subscriptionData.planType)
    : user
      ? getPlanInfo(user.type, (key) => tPlans(key)).name
      : "";

  useEffect(() => {
    if (!user) {
      setSubscriptionData(null);
      setIsLoading(false);
      return;
    }

    // Free 用户没有订阅时，不要展示“订阅详情卡片”
    if (user.type === "free") {
      setSubscriptionData(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchSubscription() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/subscription/list", {
          signal: controller.signal,
        });
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const subscription = result.data[0];

          const amount = subscription.amount / 100;
          const currency = subscription.currency;

          const formatDate = (dateStr: string) => {
            if (!dateStr) return "-";
            return new Date(dateStr).toLocaleDateString();
          };

          setSubscriptionData({
            planType: subscription.planType,
            customerId: subscription.paymentCustomerId,
            amount: `${currency} ${amount.toFixed(2)}`,
            platform: subscription.paymentPlatform,
            startDate: formatDate(subscription.startedAt),
            expiryDate: formatDate(subscription.expiresAt),
            renewalDate: formatDate(subscription.nextBillingAt),
          });
          return;
        }

        setSubscriptionData(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch subscription:", error);
        setSubscriptionData(null);
      } finally {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      }
    }

    fetchSubscription();
    return () => controller.abort();
  }, [user?.id, user?.type]);

  if (!user) return null;

  if (!isLoading && !subscriptionData) {
    return (
      <div className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            {planName}
          </h3>
          <Badge variant="error" className="text-sm px-3 py-1">
            {t("noSubscription")}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {t("noSubscriptionDescription")}
        </p>

        <Button asChild variant="default">
          <Link href="/pricing">
            {t("upgradePlan")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          {planName}
        </h3>
        <Badge variant="success" className="text-sm px-3 py-1">
          {t("active")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <div className="text-xs text-muted-foreground mb-2">{t("billingAmount")}</div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.amount || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">{t("paymentPlatform")}</div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.platform || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">{t("startDate")}</div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.startDate || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">{t("expiryDate")}</div>
          <div className="text-sm md:text-base font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.expiryDate || "-"}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">{t("renewalDate")}</div>
          <div className="text-sm font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.renewalDate || "-"}
          </div>
        </div>
        {subscriptionData?.customerId && (
          <ManageSubscriptionButton customerId={subscriptionData.customerId} />
        )}
      </div>
    </div>
  );
}
