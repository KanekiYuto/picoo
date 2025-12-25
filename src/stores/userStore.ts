import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Session } from "@/lib/auth";

// 团队信息类型
export interface Team {
  id: string;
  name: string;
  type: string; // free, pro, enterprise
  role: string; // owner, admin, member
  memberCount: number;
}

// 用户信息类型
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  currentTeamId?: string | null;
  teams?: Team[];
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
  currentTeam: Team | null;

  // 操作
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setCurrentTeam: (teamId: string | null) => void;
  updateTeams: (teams: Team[]) => void;
  clearUser: () => void;
}

// 创建用户状态管理
export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      currentTeam: null,

      // 设置用户信息
      setUser: (user) =>
        set(
          (state) => {
            const currentTeam = user?.currentTeamId && user?.teams
              ? user.teams.find(t => t.id === user.currentTeamId) || null
              : null;

            return {
              user,
              isAuthenticated: !!user,
              currentTeam,
            };
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

      // 设置当前团队
      setCurrentTeam: (teamId) =>
        set(
          (state) => {
            const currentTeam = teamId && state.user?.teams
              ? state.user.teams.find(t => t.id === teamId) || null
              : null;

            return {
              user: state.user ? {
                ...state.user,
                currentTeamId: teamId,
              } : null,
              currentTeam,
            };
          },
          false,
          "setCurrentTeam"
        ),

      // 更新团队列表
      updateTeams: (teams) =>
        set(
          (state) => {
            if (!state.user) return {};

            const currentTeam = state.user?.currentTeamId
              ? teams.find(t => t.id === state.user?.currentTeamId) || null
              : null;

            return {
              user: {
                ...state.user,
                teams,
              },
              currentTeam,
            };
          },
          false,
          "updateTeams"
        ),

      // 清除用户信息
      clearUser: () =>
        set(
          {
            user: null,
            session: null,
            isAuthenticated: false,
            currentTeam: null,
          },
          false,
          "clearUser"
        ),
    }),
    { name: "UserStore" }
  )
);
