"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/components/settings/UserProfile";
import { BillingInfo } from "@/components/settings/BillingInfo";
import { TeamList } from "@/components/settings/TeamList";

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

        // 获取组织数据
        const orgsRes = await fetch("/api/user/organizations");
        if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          setOrganizations(orgsData);
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
    <div className="space-y-12">
      <div className="space-y-2">
        <div className="text-2xl md:text-3xl font-semibold text-foreground">
          Profile settings
        </div>
      </div>

      {/* 设置部分 */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted">Settings</div>
        <UserProfile user={user} />
      </div>

      {/* 账单部分 */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted">Billing</div>
        <BillingInfo />
      </div>

      {/* 我的团队部分 */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted">My teams</div>
        <TeamList organizations={organizations} />
      </div>
    </div>
  );
}
