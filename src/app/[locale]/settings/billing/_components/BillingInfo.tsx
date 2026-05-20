"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@i18n/routing";
import { CreditCard } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { getPlanInfo } from "@/lib/utils/plan";
import { ManageSubscriptionButton } from "@/components/subscription/ManageSubscriptionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  }, [user]);

  if (!user) return null;

  if (!isLoading && !subscriptionData) {
    return (
      <Card className="h-full overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 px-4 py-2.5">
          <CreditCard className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
        </CardHeader>

        <CardContent className="rounded-t-2xl border-t border-background-2 bg-background p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardDescription>{t("currentPlan")}</CardDescription>
              <CardTitle className="mt-1 text-xl">{planName}</CardTitle>
            </div>
            <Badge variant="error" className="w-fit text-sm px-3 py-1">
              {t("noSubscription")}
            </Badge>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            {t("noSubscriptionDescription")}
          </p>
          <Button asChild variant="default" size="sm" className="mt-4 w-full rounded-lg sm:w-auto">
            <Link href="/pricing">
              {t("upgradePlan")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="h-full overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none">
      <CardHeader className="flex flex-row items-center gap-2 px-4 py-2.5">
        <CreditCard className="size-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
      </CardHeader>

      <CardContent className="rounded-t-2xl border-t border-background-2 bg-background p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardDescription>{t("currentPlan")}</CardDescription>
            <CardTitle className="mt-1 text-xl">{planName}</CardTitle>
          </div>
          <Badge variant="success" className="w-fit text-sm px-3 py-1">
            {t("active")}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-background-1 p-3">
          <div className="mb-2 text-xs text-muted-foreground">{t("billingAmount")}</div>
          <div className="text-sm font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.amount || "-"}
          </div>
        </div>
        <div className="rounded-xl bg-background-1 p-3">
          <div className="mb-2 text-xs text-muted-foreground">{t("paymentPlatform")}</div>
          <div className="text-sm font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.platform || "-"}
          </div>
        </div>
        <div className="rounded-xl bg-background-1 p-3">
          <div className="mb-2 text-xs text-muted-foreground">{t("startDate")}</div>
          <div className="text-sm font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.startDate || "-"}
          </div>
        </div>
        <div className="rounded-xl bg-background-1 p-3">
          <div className="mb-2 text-xs text-muted-foreground">{t("expiryDate")}</div>
          <div className="text-sm font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.expiryDate || "-"}
          </div>
        </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-4 border-t border-background-2 bg-background-2/30 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">{t("renewalDate")}</div>
          <div className="text-sm font-semibold text-foreground">
            {isLoading ? "-" : subscriptionData?.renewalDate || "-"}
          </div>
        </div>
        {subscriptionData?.customerId && (
          <ManageSubscriptionButton customerId={subscriptionData.customerId} />
        )}
      </CardFooter>
    </Card>
  );
}
