"use client";

import { Calendar, Gem, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Summary {
  totalRemaining: number;
  totalConsumed: number;
}

interface PlanInfo {
  name: string;
  colorClass: string;
}

interface CreditsOverviewProps {
  summary: Summary | null;
  planInfo: PlanInfo | null;
  currentBalanceLabel: string;
  availableCreditsLabel: string;
  currentPlanLabel: string;
  consumedLabel: string;
  creditsUsedLabel: string;
}

export function CreditsOverview({
  summary,
  planInfo,
  currentBalanceLabel,
  availableCreditsLabel,
  currentPlanLabel,
  consumedLabel,
  creditsUsedLabel,
}: CreditsOverviewProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none">
      <CardHeader className="flex flex-row items-center gap-2 px-4 py-2.5">
        <Gem className="size-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">{currentBalanceLabel}</CardTitle>
      </CardHeader>
      <CardContent className="rounded-t-2xl border-t border-background-2 bg-background p-4">
        <div className="mb-4 flex items-end gap-2">
          <div className="text-4xl font-bold leading-none text-foreground">
            {(summary?.totalRemaining || 0).toLocaleString()}
          </div>
          <div className="pb-1 text-sm text-muted-foreground">
            {availableCreditsLabel}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-background-1 p-3">
          <Gem />
          <div>
            <div className="text-xs text-muted-foreground">{availableCreditsLabel}</div>
            <div className="text-sm font-medium text-foreground">
              {(summary?.totalRemaining || 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-background-1 p-3">
          <TrendingUp />
          <div>
            <div className="text-xs text-muted-foreground">{currentPlanLabel}</div>
            <div className={`text-sm font-medium ${planInfo?.colorClass || "text-foreground"}`}>
              {planInfo?.name || "-"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-background-1 p-3">
          <Calendar />
          <div>
            <div className="text-xs text-muted-foreground">{consumedLabel}</div>
            <div className="text-sm font-medium text-foreground">
              {(summary?.totalConsumed || 0).toLocaleString()} {creditsUsedLabel}
            </div>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
