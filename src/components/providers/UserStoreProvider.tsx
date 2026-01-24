"use client";

import { useEffect } from "react";
import { useUserStore, type User } from "@/store/useUserStore";
import { useCreditStore, type CreditItem, type CreditSummary } from "@/store/useCreditStore";

export function UserStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLoading, setUser, setError } = useUserStore();
  const {
    setLoading: setCreditLoading,
    setCredits,
    setError: setCreditError,
    clear: clearCredits,
  } = useCreditStore();

  // 获取用户完整信息
  useEffect(() => {
    const fetchCreditBalance = async () => {
      setCreditLoading(true);
      try {
        const fetchJson = async (url: string) => {
          const response = await fetch(url);
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
          const totalRemaining = credits.reduce((sum: number, c: CreditItem) => {
            const expiresAtMs =
              c.expiresAt === null ? null : new Date(c.expiresAt).getTime();
            const isValid = expiresAtMs === null || expiresAtMs >= now;
            return sum + (isValid ? Number(c.remaining) : 0);
          }, 0);
          const totalConsumed = credits.reduce(
            (sum: number, c: CreditItem) => sum + Number(c.consumed),
            0
          );
          const activeCreditsCount = credits.filter((c: CreditItem) => {
            const expiresAtMs =
              c.expiresAt === null ? null : new Date(c.expiresAt).getTime();
            const isValid = expiresAtMs === null || expiresAtMs >= now;
            return isValid && Number(c.remaining) > 0;
          }).length;
          summary = { totalRemaining, totalConsumed, activeCreditsCount };
        }

        if (statsResult.status === "rejected" && recordsResult.status === "rejected") {
          throw new Error("Failed to fetch credits");
        }

        if (statsResult.status === "rejected") {
          console.error("Failed to fetch credit stats:", statsResult.reason);
        }
        if (recordsResult.status === "rejected") {
          console.error("Failed to fetch credit records:", recordsResult.reason);
        }

        setCredits({
          credits,
          summary,
          balance: summary?.totalRemaining || 0,
        });
      } catch (error) {
        console.error("Failed to fetch credits:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
          clearCredits();
          return;
        }
        setCreditError("Failed to fetch credits");
      } finally {
        setCreditLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/user/profile");

        if (!response.ok) {
          if (response.status === 401) {
            // 未登录
            setUser(null);
            clearCredits();
          } else {
            console.error("Failed to fetch user profile");
            setError("Failed to fetch user profile");
          }
          return;
        }

        const data = await response.json();

        // 构建完整的用户信息
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified || false,
          image: data.image,
          type: data.type,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };

        setUser(user);
        await fetchCreditBalance();

        // 获取用户信息成功后，根据用户类型请求刷新每日积分
        if (user.type === 'free') {
          try {
            const creditResponse = await fetch("/api/credit/daily-check", {
              method: "POST",
            });

            if (creditResponse.ok) {
              const creditData = await creditResponse.json();
              if (creditData.issued) {
                console.log("Daily credit issued successfully");
              } else {
                console.log("Daily credit already issued today");
              }
              await fetchCreditBalance();
            }
          } catch (error) {
            console.error("Failed to check daily credit:", error);
            // 不影响用户信息的加载，静默失败
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUser(null);
        setError("Failed to fetch user profile");
        clearCredits();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [
    setUser,
    setLoading,
    setError,
    setCreditLoading,
    setCredits,
    setCreditError,
    clearCredits,
  ]);

  return <>{children}</>;
}
