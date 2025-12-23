"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useUserStore } from "@/stores/userStore";

export function UserStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const { setSession, setLoading } = useUserStore();

  // 监听会话变化并更新 store
  useEffect(() => {
    setLoading(isPending);

    if (!isPending) {
      setSession(session ?? null);
    }
  }, [session, isPending, setSession, setLoading]);

  return <>{children}</>;
}
