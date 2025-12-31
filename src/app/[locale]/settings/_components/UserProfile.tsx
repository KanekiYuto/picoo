"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { User } from "@/stores/userStore";
import { EditProfileModal } from "./EditProfileModal";
import { useUserStore } from "@/stores/userStore";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const t = useTranslations("settings.profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateUser } = useUserStore();

  const handleSuccess = (updatedUser: User) => {
    // 更新用户状态
    updateUser(updatedUser);
  };

  return (
    <>
      <div className="bg-background border border-border rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* 用户头像 */}
            <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl md:text-2xl font-bold text-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 用户信息 */}
            <div className="min-w-0">
              <div className="text-base md:text-lg font-semibold text-foreground truncate">
                {user.name}
              </div>
              <div className="text-xs md:text-sm text-muted truncate">
                {user.email}
              </div>
            </div>
          </div>

          {/* 编辑按钮 */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-sidebar-hover hover:bg-sidebar-active border border-border text-foreground text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
          >
            {t("editProfile")}
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={handleSuccess}
      />
    </>
  );
}
