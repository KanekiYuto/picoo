"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, oneTap } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // 初始化 Google One Tap（仅在生产环境）
  useEffect(() => {
    if (!session && process.env.NODE_ENV === "production") {
      const initializeOneTap = async () => {
        try {
          const callbackURL = pathname === "/" ? siteConfig.auth.defaultRedirectAfterLogin : pathname;
          await oneTap({ callbackURL });
        } catch (error) {
          console.error("One Tap initialization failed:", error);
        }
      };

      // 延迟1秒后初始化
      const timer = setTimeout(initializeOneTap, 1000);
      return () => clearTimeout(timer);
    }
  }, [session, pathname]);

  return <>{children}</>;
}
