"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, UserIcon } from "lucide-react";
import type { User } from "@/store/useUserStore";
import { EditProfileModal } from "../../_components/EditProfileModal";
import { useUserStore } from "@/store/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const t = useTranslations("settings.profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateUser } = useUserStore();
  const displayName = user.name ?? "";
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const avatarAlt = displayName || "User avatar";

  const handleSuccess = (updatedUser: User) => {
    // 更新用户状态
    updateUser(updatedUser);
  };

  return (
    <>
      <Card className="h-full overflow-hidden rounded-2xl border-background-2 bg-background-1 shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 px-4 py-2.5">
          <UserIcon className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-t-2xl border-t border-background-2 bg-background px-4 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar size="lg" className="size-12 sm:size-14">
              <AvatarImage src={user.image ?? undefined} alt={avatarAlt} />
              <AvatarFallback className="text-base font-semibold">
                {displayInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">
                {displayName}
              </CardTitle>
              <CardDescription className="truncate">{user.email}</CardDescription>
            </div>
          </div>
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-lg text-muted-foreground hover:text-foreground"
              title={t("editProfile")}
              aria-label={t("editProfile")}
            >
              <Pencil />
            </Button>
          </CardAction>
        </CardContent>
      </Card>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={handleSuccess}
      />
    </>
  );
}
