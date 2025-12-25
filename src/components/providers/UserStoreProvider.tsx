"use client";

import { useEffect } from "react";
import { useUserStore, type User } from "@/stores/userStore";

export function UserStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLoading, setUser } = useUserStore();

  // 获取用户完整信息（包括团队）
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
          currentTeamId: data.currentTeamId || null,
          teams: data.teams || [],
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };

        setUser(user);
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
