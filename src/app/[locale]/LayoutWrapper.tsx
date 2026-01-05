"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppLayout } from "@/components/layout";

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // 检测是否是首页 (/)
  const isHomePage = pathname === '/' || pathname.match(/^\/[a-z]{2}(-[A-Z]{2})?\/?$/);

  if (isHomePage) {
    return (
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}


