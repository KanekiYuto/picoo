"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CreditItem {
  id: string;
  type: string;
  amount: number;
  consumed: number;
  remaining: number;
  issuedAt: string;
  expiresAt: string | null;
}

interface CreditsListProps {
  credits: CreditItem[];
  filteredCredits: CreditItem[];
  noCreditsLabel: string;
  noMatchingLabel: string;
  consumedLabel: string;
  remainingLabel: string;
  statusActiveLabel: string;
  statusExpiringLabel: string;
  statusExpiredLabel: string;
  typeLabel: (type: string) => string;
}

export function CreditsList({
  credits,
  filteredCredits,
  noCreditsLabel,
  noMatchingLabel,
  consumedLabel,
  remainingLabel,
  statusActiveLabel,
  statusExpiringLabel,
  statusExpiredLabel,
  typeLabel,
}: CreditsListProps) {
  if (filteredCredits.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none">
        <CardContent className="p-6 text-center text-muted-foreground">
        {credits.length === 0 ? noCreditsLabel : noMatchingLabel}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filteredCredits.map((credit) => {
        const percentage =
          credit.amount > 0 ? (credit.remaining / credit.amount) * 100 : 0;
        const usageRate = 100 - percentage;
        const expiresTime = credit.expiresAt
          ? new Date(credit.expiresAt).getTime()
          : null;
        const currentTime = new Date().getTime();
        const isExpiringSoon =
          expiresTime &&
          expiresTime > currentTime &&
          expiresTime - currentTime < 7 * 24 * 60 * 60 * 1000;
        const isExpired = expiresTime && expiresTime <= currentTime;

        let progressColor = "";
        if (usageRate < 50) {
          progressColor = "bg-green-600 dark:bg-green-500";
        } else if (usageRate < 80) {
          progressColor = "bg-yellow-600 dark:bg-yellow-500";
        } else {
          progressColor = "bg-red-600 dark:bg-red-500";
        }

        return (
          <Card
            key={credit.id}
            className="overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-3">
              <CardTitle className="text-base">
                {typeLabel(credit.type)}
              </CardTitle>
              <Badge
                variant={isExpired ? "error" : isExpiringSoon ? "warning" : "success"}
              >
                {isExpired
                  ? statusExpiredLabel
                  : isExpiringSoon
                  ? statusExpiringLabel
                  : statusActiveLabel}
              </Badge>
            </CardHeader>

            <CardContent className="grid gap-4 rounded-t-2xl border-t border-background-2 bg-background p-4 sm:grid-cols-[1fr_220px]">
              <div className="flex flex-col gap-3">
                {credit.expiresAt && (
                  <div className="flex items-center gap-2 rounded-xl bg-background-1 px-3 py-2 text-sm text-muted-foreground">
                    <Clock />
                    <span>
                      {new Date(credit.issuedAt).toLocaleDateString()} {"->"} {new Date(credit.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {credit.remaining.toLocaleString()}
                    </span>
                    <span className="text-base text-muted-foreground">
                      / {credit.amount.toLocaleString()}
                    </span>
                    <span className="ml-auto text-sm font-medium text-muted">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                <div className="rounded-xl bg-background-1 p-3">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {consumedLabel}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {credit.consumed.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl bg-background-1 p-3">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {remainingLabel}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {credit.remaining.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
