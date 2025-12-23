"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Users, Home, CreditCard, Receipt, Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "我的信息",
    items: [
      { label: "轮廓", href: "/settings/profile", icon: User },
    ],
  },
  {
    title: "团队信息",
    items: [
      { label: "概述", href: "/settings/team", icon: Home },
    ],
  },
  {
    title: "成员",
    items: [
      { label: "团队", href: "/settings/members", icon: Users },
    ],
  },
  {
    title: "账单",
    items: [
      { label: "订阅计划", href: "/settings/billing", icon: CreditCard },
      { label: "账单详情", href: "/settings/billing/details", icon: Receipt },
    ],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors"
        aria-label="打开菜单"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 移动端遮罩 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          {/* 移动端关闭按钮 */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <div className="text-sm font-medium text-muted">设置</div>
            <button
              onClick={closeMobileMenu}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-foreground hover:bg-muted transition-colors"
              aria-label="关闭菜单"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden lg:block text-sm font-medium text-muted mb-6">设置</div>

          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <div className="text-xs text-muted mb-2">{section.title}</div>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
