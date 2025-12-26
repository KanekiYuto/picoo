"use client";

import { useEffect } from "react";
import { useUserStore, type User } from "@/stores/userStore";

export function UserStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLoading, setUser } = useUserStore();

  // 获取用户完整信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/user/profile");

        if (!response.ok) {
          if (response.status === 401) {
            // 未登录
            setUser(null);
          } else {
            console.error("Failed to fetch user profile");
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
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };

        setUser(user);

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
            }
          } catch (error) {
            console.error("Failed to check daily credit:", error);
            // 不影响用户信息的加载，静默失败
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
