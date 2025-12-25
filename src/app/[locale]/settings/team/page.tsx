"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettingsNav } from "@/components/settings/SettingsNavContext";
import { useUserStore } from "@/stores/userStore";

interface Team {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  type: string;
  memberCount: number;
  ownerId: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
}

export default function TeamPage() {
  const t = useTranslations("settings.team");
  const { openMenu } = useSettingsNav();
  const { currentTeam } = useUserStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const response = await fetch("/api/team/current");
        if (response.ok) {
          const data = await response.json();
          setTeam(data);
        }
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (currentTeam) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [currentTeam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">{t("noTeam")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="bg-sidebar-bg border border-border rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="lg:hidden flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-sidebar-hover border border-border text-foreground hover:bg-sidebar-active transition-colors"
              aria-label={t("openMenu")}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              {t("title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Settings 区域 */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">{t("sections.settings")}</h2>
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              {/* 团队图标 */}
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl md:text-2xl flex-shrink-0">
                {team.name.charAt(0).toUpperCase()}
              </div>

              {/* 团队信息 */}
              <div className="min-w-0">
                <div className="text-base md:text-lg font-semibold text-foreground truncate">
                  {team.name}
                </div>
                <div className="text-xs md:text-sm text-muted">
                  {t(`plans.${team.type}`)} · {" "}
                  {t("members", { count: team.memberCount })}
                </div>
              </div>
            </div>

            {/* 编辑按钮 */}
            <button className="w-full sm:w-auto px-4 py-2 bg-sidebar-hover hover:bg-sidebar-active border border-border text-foreground text-sm font-medium rounded-xl transition-colors whitespace-nowrap">
              {t("editProfile")}
            </button>
          </div>
        </div>
      </div>

      {/* Teams 区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Who has access */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted">{t("sections.teams")}</h2>
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm md:text-base font-semibold text-foreground mb-1">
                    {t("whoHasAccess")}
                  </div>
                  <div className="text-xs md:text-sm text-muted">
                    {team.memberCount} {t("member", { count: team.memberCount })}
                  </div>
                </div>
              </div>

              {/* 成员头像列表 */}
              <div className="flex items-center -space-x-2">
                {team.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-hover ring-2 ring-card flex items-center justify-center overflow-hidden"
                    title={member.name}
                  >
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs font-bold text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {team.memberCount > 5 && (
                  <div className="h-8 w-8 rounded-full bg-muted ring-2 ring-card flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{team.memberCount - 5}
                    </span>
                  </div>
                )}
              </div>

              {/* 按钮组 */}
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-sidebar-hover hover:bg-sidebar-active border border-border text-foreground text-xs font-medium rounded-lg transition-colors">
                  {t("inviteMember")}
                </button>
                <button className="flex-1 px-3 py-2 bg-sidebar-hover hover:bg-sidebar-active border border-border text-foreground text-xs font-medium rounded-lg transition-colors">
                  {t("manageAccess")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage analytics */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted">{t("sections.usageAnalytics")}</h2>
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm md:text-base font-semibold text-foreground mb-1">
                    {t("analyzeTeamSpends")}
                  </div>
                  <div className="text-xs md:text-sm text-muted">
                    {team.memberCount} {t("member", { count: team.memberCount })}
                  </div>
                </div>
              </div>

              {/* 成员头像 */}
              <div className="flex items-center -space-x-2">
                {team.members.slice(0, 1).map((member) => (
                  <div
                    key={member.id}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-hover ring-2 ring-card flex items-center justify-center overflow-hidden"
                    title={member.name}
                  >
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs font-bold text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 详情按钮 */}
              <button className="w-full px-3 py-2 bg-sidebar-hover hover:bg-sidebar-active border border-border text-foreground text-xs font-medium rounded-lg transition-colors">
                {t("details")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing 区域 */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">{t("sections.billing")}</h2>
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm md:text-base font-semibold text-foreground mb-2">
                {t("currentTeamPlan")}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm font-medium rounded-full">
                {t(`plans.${team.type}`)}
              </div>
            </div>

            {/* 升级按钮 */}
            <button className="w-full sm:w-auto px-5 py-2 bg-gradient-primary text-white text-sm font-medium rounded-xl transition-all whitespace-nowrap hover:opacity-90">
              {t("upgradePlan")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
