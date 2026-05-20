"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getPlanInfo } from "@/lib/utils/plan";
import { useCreditStore } from "@/store/useCreditStore";
import { useUserStore } from "@/store/useUserStore";
import { CreditsFilter } from "./_components/CreditsFilter";
import { CreditsList } from "./_components/CreditsList";
import { CreditsOverview } from "./_components/CreditsOverview";
import { CreditsSkeleton } from "./_components/CreditsSkeleton";

export default function CreditsPage() {
  const tPage = useTranslations("settings.page");
  const tCredits = useTranslations("settings.credits");
  const tProfile = useTranslations("settings.profile");
  const tPlans = useTranslations("common.plans");
  const { user, isLoading: userLoading } = useUserStore();
  const { credits, summary, state: creditState } = useCreditStore();
  const [creditFilter, setCreditFilter] = useState<"all" | "active" | "expired">("active");
  const isCreditLoading = creditState === "loading" || creditState === "idle";

  const planInfo = user ? getPlanInfo(user.type, (key) => tPlans(key)) : null;
  const filteredCredits = credits.filter((credit) => {
    if (creditFilter === "all") return true;
    const isExpired =
      credit.expiresAt && new Date(credit.expiresAt) < new Date();
    if (creditFilter === "active") return !isExpired;
    if (creditFilter === "expired") return isExpired;
    return true;
  });

  if (userLoading || isCreditLoading) {
    return <CreditsSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted">{tProfile("notSignedIn")}</div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {tPage("creditsTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tPage("creditsDescription")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <CreditsOverview
            summary={summary}
            planInfo={planInfo}
            currentBalanceLabel={tCredits("overview.currentBalance")}
            availableCreditsLabel={tCredits("overview.availableCredits")}
            currentPlanLabel={tCredits("overview.currentPlan")}
            consumedLabel={tCredits("overview.totalConsumed")}
            creditsUsedLabel={tCredits("overview.creditsUsed")}
          />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-medium text-muted">
                {tCredits("details.title")}
              </h2>
              <CreditsFilter
                filter={creditFilter}
                onChange={setCreditFilter}
                allLabel={tCredits("details.filter.all")}
                activeLabel={tCredits("details.filter.active")}
                expiredLabel={tCredits("details.filter.expired")}
              />
            </div>
            <CreditsList
              credits={credits}
              filteredCredits={filteredCredits}
              noCreditsLabel={tCredits("details.noCredits")}
              noMatchingLabel={tCredits("details.noMatchingCredits")}
              consumedLabel={tCredits("details.consumed")}
              remainingLabel={tCredits("details.remaining")}
              statusActiveLabel={tCredits("details.active")}
              statusExpiringLabel={tCredits("details.expiringSoon")}
              statusExpiredLabel={tCredits("details.expired")}
              typeLabel={(type) => tCredits(`details.types.${type}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
