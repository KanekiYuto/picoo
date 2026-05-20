"use client";

import { ReactNode } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { MainContent } from "./MainContent";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

const HIDE_FOOTER_PATHS: string[] = [];

export function AppLayout({ children, className }: AppLayoutProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const shouldShowFooter = !HIDE_FOOTER_PATHS.some((path) => {
    const localePrefix = `/${locale}`;
    const pathWithoutLocale = pathname.startsWith(localePrefix)
      ? pathname.slice(localePrefix.length)
      : pathname;
    const normalizedPath = pathWithoutLocale || "/";

    return normalizedPath === path || normalizedPath.startsWith(`${path}/`);
  });

  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <Sidebar />
      <SidebarInset className={cn("h-svh overflow-hidden md:h-[calc(100svh-1rem)]", className)}>
        <Header />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto custom-scrollbar">
          <MainContent>{children}</MainContent>
          {shouldShowFooter && <Footer />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
