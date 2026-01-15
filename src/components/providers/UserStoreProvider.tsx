"use client";

import { useEffect } from "react";
import { useUserStore, type User } from "@/store/useUserStore";
import { useCreditStore } from "@/store/useCreditStore";

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
        const response = await fetch("/api/credit/balance");

        if (!response.ok) {
          throw new Error("Failed to fetch credits");
        }

        const data = await response.json();
        const summary = data.summary || null;

        setCredits({
          credits: data.credits || [],
          summary,
          balance: summary?.totalRemaining || 0,
        });
      } catch (error) {
        console.error("Failed to fetch credits:", error);
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
