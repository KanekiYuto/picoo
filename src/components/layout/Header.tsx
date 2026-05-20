"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Coins, Moon, RefreshCw, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { useCreditStore, type CreditItem, type CreditSummary } from "@/store/useCreditStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const t = useTranslations("layout.header");
  const tUserMenu = useTranslations("common.userMenu");
  const { theme, toggleTheme } = useThemeStore();
  const balance = useCreditStore((state) => state.balance);
  const creditState = useCreditStore((state) => state.state);
  const setCreditLoading = useCreditStore((state) => state.setLoading);
  const setCredits = useCreditStore((state) => state.setCredits);
  const setCreditError = useCreditStore((state) => state.setError);
  const clearCredits = useCreditStore((state) => state.clear);
  const [isRefreshingCredits, setIsRefreshingCredits] = useState(false);

  const handleRefreshCredits = async () => {
    if (isRefreshingCredits) {
      return;
    }

    setIsRefreshingCredits(true);
    setCreditLoading(true);

    try {
      const fetchJson = async (url: string) => {
        const response = await fetch(url, { cache: "no-store" });
        if (response.status === 401) throw new Error("Unauthorized");
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        return response.json();
      };

      const [statsResult, recordsResult] = await Promise.allSettled([
        fetchJson("/api/credit/balance/stats"),
        fetchJson("/api/credit/balance/records"),
      ]);

      const credits =
        recordsResult.status === "fulfilled"
          ? (recordsResult.value?.credits || []) as CreditItem[]
          : [];

      const isUnauthorized =
        (statsResult.status === "rejected" &&
          statsResult.reason instanceof Error &&
          statsResult.reason.message === "Unauthorized") ||
        (recordsResult.status === "rejected" &&
          recordsResult.reason instanceof Error &&
          recordsResult.reason.message === "Unauthorized");

      if (isUnauthorized) {
        clearCredits();
        return;
      }

      let summary: CreditSummary | null =
        statsResult.status === "fulfilled"
          ? {
              totalRemaining: statsResult.value?.totalRemaining || 0,
              totalConsumed: statsResult.value?.totalConsumed || 0,
              activeCreditsCount: statsResult.value?.activeCreditsCount || 0,
            }
          : null;

      if (!summary && credits.length > 0) {
        const now = Date.now();
        const totalRemaining = credits.reduce((sum: number, credit: CreditItem) => {
          const expiresAtMs =
            credit.expiresAt === null ? null : new Date(credit.expiresAt).getTime();
          const isValid = expiresAtMs === null || expiresAtMs >= now;
          return sum + (isValid ? Number(credit.remaining) : 0);
        }, 0);
        const totalConsumed = credits.reduce(
          (sum: number, credit: CreditItem) => sum + Number(credit.consumed),
          0
        );
        const activeCreditsCount = credits.filter((credit: CreditItem) => {
          const expiresAtMs =
            credit.expiresAt === null ? null : new Date(credit.expiresAt).getTime();
          const isValid = expiresAtMs === null || expiresAtMs >= now;
          return isValid && Number(credit.remaining) > 0;
        }).length;
        summary = { totalRemaining, totalConsumed, activeCreditsCount };
      }

      if (statsResult.status === "rejected" && recordsResult.status === "rejected") {
        throw new Error("Failed to fetch credits");
      }

      setCredits({
        credits,
        summary,
        balance: summary?.totalRemaining || 0,
      });
    } catch (error) {
      console.error("Failed to refresh credits:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        clearCredits();
        return;
      }
      setCreditError("Failed to refresh credits");
    } finally {
      setCreditLoading(false);
      setIsRefreshingCredits(false);
    }
  };

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur transition-[width,height] ease-linear",
        className
      )}
    >
      <div className="flex w-full items-center gap-1 px-3 sm:px-4 lg:px-5">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t("toggleTheme")}
            className="size-8"
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>

          <LanguageSwitcher />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshCredits}
            disabled={isRefreshingCredits}
            className="ml-1 h-8 gap-2 rounded-full border-border/80 bg-background-1 pl-2.5 pr-3 text-sm text-foreground hover:border-border hover:bg-background-2"
            title={tUserMenu("pointsDetails")}
          >
            <Coins data-icon="inline-start" />
            <span className="font-semibold tabular-nums">
              {creditState === "loading" ? "..." : balance}
            </span>
            <span className="hidden text-muted-foreground sm:inline">
              {tUserMenu("points")}
            </span>
            <RefreshCw
              data-icon="inline-end"
              className={cn(isRefreshingCredits && "animate-spin")}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
