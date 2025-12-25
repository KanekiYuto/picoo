"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserProfile } from "@/components/settings/UserProfile";
import { BillingInfo } from "@/components/settings/BillingInfo";
import { TeamList } from "@/components/settings/TeamList";
import { useSettingsNav } from "@/components/settings/SettingsNavContext";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Organization {
  id: string;
  name: string;
  memberCount: number;
  role: string;
}

export default function ProfilePage() {
  const t = useTranslations("settings.profile");
  const { openMenu } = useSettingsNav();
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 获取用户数据
        const userRes = await fetch("/api/user/profile");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // 获取团队数据
        const teamsRes = await fetch("/api/user/teams");
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setOrganizations(teamsData);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Not signed in</div>
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

      {/* 设置部分 */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">{t("sections.settings")}</h2>
        <UserProfile user={user} />
      </div>

      {/* 账单部分 */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">{t("sections.billing")}</h2>
        <BillingInfo />
      </div>

      {/* 我的团队部分 */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted">{t("sections.teams")}</h2>
        <TeamList organizations={organizations} />
      </div>
    </div>
  );
}
