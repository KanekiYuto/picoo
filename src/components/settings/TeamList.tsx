"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronRight } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  memberCount: number;
  role: string;
}

interface TeamListProps {
  organizations: Organization[];
}

export function TeamList({ organizations }: TeamListProps) {
  const t = useTranslations("settings.profile.teams");
  const [currentTeamId, setCurrentTeamId] = useState<string>(
    organizations[0]?.id ?? ""
  );

  // 角色映射
  const getRoleLabel = (role: string) => {
    const roleKey = role.toLowerCase();
    return t(`roles.${roleKey}`, { default: role });
  };

  // 切换团队
  const handleTeamSwitch = async (teamId: string) => {
    if (teamId === currentTeamId) return;

    try {
      // TODO: 调用 API 切换团队
      // await fetch("/api/user/switch-team", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ teamId }),
      // });

      setCurrentTeamId(teamId);
      console.log("Switched to team:", teamId);
    } catch (error) {
      console.error("Failed to switch team:", error);
    }
  };

  if (organizations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
        <div className="text-sm text-muted text-center">{t("empty")}</div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="divide-y divide-border">
        {organizations.map((org) => {
          const isActive = org.id === currentTeamId;
          return (
            <button
              key={org.id}
              onClick={() => handleTeamSwitch(org.id)}
              className="w-full flex items-center justify-between gap-4 p-4 md:p-5 hover:bg-sidebar-hover transition-colors text-left group"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                {/* 团队图标 */}
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base md:text-lg">
                  {org.name.charAt(0).toUpperCase()}
                </div>

                {/* 团队信息 */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm md:text-base font-semibold text-foreground truncate">
                    {org.name}
                  </div>
                  <div className="text-xs md:text-sm text-muted">
                    {getRoleLabel(org.role)} • {" "}
                    {t("members", { count: org.memberCount })}
                  </div>
                </div>
              </div>

              {/* 右侧指示器 */}
              <div className="flex-shrink-0">
                {isActive ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-4 w-4" />
                  </div>
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted group-hover:text-foreground transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
