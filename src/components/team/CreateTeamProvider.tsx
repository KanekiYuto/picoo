"use client";

import { ReactNode } from "react";
import { CreateTeamProvider as Provider, useCreateTeam } from "./CreateTeamContext";
import { CreateTeamModal } from "./CreateTeamModal";
import { useRouter } from "next/navigation";

function CreateTeamModalWrapper() {
  const { isOpen, closeModal } = useCreateTeam();
  const router = useRouter();

  const handleSuccess = (team: any) => {
    console.log("Team created successfully:", team);
    // 刷新页面数据
    router.refresh();
  };

  return (
    <CreateTeamModal
      isOpen={isOpen}
      onClose={closeModal}
      onSuccess={handleSuccess}
    />
  );
}

export function CreateTeamProvider({ children }: { children: ReactNode }) {
  return (
    <Provider>
      {children}
      <CreateTeamModalWrapper />
    </Provider>
  );
}
