import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Session } from "@/lib/auth";

// 用户信息类型
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 用户状态类型
interface UserState {
  // 状态
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 操作
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearUser: () => void;
}

// 创建用户状态管理
export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      // 初始状态
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      // 设置用户信息
      setUser: (user) =>
        set(
          {
            user,
            isAuthenticated: !!user,
          },
          false,
          "setUser"
        ),

      // 设置会话信息
      setSession: (session) =>
        set(
          {
            session,
            user: session?.user
              ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                emailVerified: session.user.emailVerified,
                image: session.user.image,
                createdAt: session.user.createdAt,
                updatedAt: session.user.updatedAt,
              }
              : null,
            isAuthenticated: !!session?.user,
          },
          false,
          "setSession"
        ),

      // 设置加载状态
      setLoading: (isLoading) =>
        set(
          {
            isLoading,
          },
          false,
          "setLoading"
        ),

      // 清除用户信息
      clearUser: () =>
        set(
          {
            user: null,
            session: null,
            isAuthenticated: false,
          },
          false,
          "clearUser"
        ),
    }),
    { name: "UserStore" }
  )
);
