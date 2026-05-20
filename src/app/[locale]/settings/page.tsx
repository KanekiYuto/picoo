"use client";

import { useTranslations } from "next-intl";
import { useUserStore } from "@/store/useUserStore";
import { ProfileSkeleton } from "./profile/_components/ProfileSkeleton";
import { UserProfile } from "./profile/_components/UserProfile";

export default function SettingsPage() {
  const tPage = useTranslations("settings.page");
  const tProfile = useTranslations("settings.profile");
  const { user, isLoading: userLoading } = useUserStore();

  if (userLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted">{tProfile("notSignedIn")}</div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {tPage("accountTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tPage("accountDescription")}
          </p>
        </div>

        <UserProfile user={user} />
      </div>
    </div>
  );
}
