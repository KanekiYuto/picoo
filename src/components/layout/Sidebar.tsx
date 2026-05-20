"use client";

import type { ComponentProps } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronsUpDown,
  ChevronRight,
  Clock,
  CreditCard,
  HelpCircle,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Settings,
} from "lucide-react";
import { Link } from "@i18n/routing";
import { signOut } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";
import { useThemeStore } from "@/store/useThemeStore";
import { useUserStore } from "@/store/useUserStore";
import { useCreditStore } from "@/store/useCreditStore";
import { useModalStore } from "@/store/useModalStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive?: boolean;
  items?: {
    label: string;
    href: string;
    isActive?: boolean;
  }[];
}

interface SidebarProps extends ComponentProps<typeof ShadcnSidebar> {
  className?: string;
}

function normalizePath(pathname: string, locale: string) {
  const localePrefix = `/${locale}`;
  const pathWithoutLocale = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length)
    : pathname;

  return pathWithoutLocale || "/";
}

function isActiveRoute(currentPath: string, href: string) {
  if (href === "/") {
    return currentPath === "/";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function SidebarUserMenu() {
  const { isMobile } = useSidebar();
  const { user, isLoading, clearUser } = useUserStore();
  const clearCredits = useCreditStore((state) => state.clear);
  const { openLoginModal } = useModalStore();
  const tHeader = useTranslations("layout.header");
  const tUserMenu = useTranslations("common.userMenu");
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    clearUser();
    clearCredits();
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">...</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={openLoginModal} className="cursor-pointer">
            <LogIn />
            <span>{tHeader("signIn")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl border-border bg-popover p-1.5 shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm">
                <Avatar className="size-9 rounded-lg">
                  <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                  <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="h-9 rounded-lg px-2.5">
                <Link href="/settings/profile">
                  <Settings className="size-4" />
                  {tUserMenu("settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="h-9 rounded-lg px-2.5">
                <Link href="/settings/billing">
                  <CreditCard className="size-4" />
                  {tUserMenu("manageSubscription")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="h-9 rounded-lg px-2.5">
              <LogOut className="size-4" />
              {tUserMenu("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("layout.sidebar");
  const { theme } = useThemeStore();
  const currentPath = normalizePath(pathname, locale);

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: t("home"),
      href: "/home",
      isActive: isActiveRoute(currentPath, "/home"),
    },
    {
      icon: LayoutGrid,
      label: t("apps"),
      href: "/apps",
      isActive: isActiveRoute(currentPath, "/apps"),
      items: [
        {
          label: t("apps"),
          href: "/apps",
          isActive: currentPath === "/apps",
        },
      ],
    },
    {
      icon: Clock,
      label: t("history"),
      href: "/history",
      isActive: isActiveRoute(currentPath, "/history"),
    },
  ];

  const secondaryItems: NavItem[] = [
    {
      icon: Settings,
      label: t("settings"),
      href: "/settings/profile",
      isActive: isActiveRoute(currentPath, "/settings"),
    },
    {
      icon: HelpCircle,
      label: t("help"),
      href: "/help",
      isActive: isActiveRoute(currentPath, "/help"),
    },
  ];

  return (
    <ShadcnSidebar variant="inset" className={className} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src={theme === "light" ? siteConfig.logo.light : siteConfig.logo.dark}
                    alt={`${siteConfig.name} Logo`}
                    width={24}
                    height={24}
                    className="size-6 rounded-md object-contain"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{siteConfig.name}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("apps")}</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <Collapsible
                key={item.href}
                asChild
                defaultOpen={item.isActive}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={item.isActive}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">{item.label}</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItem.isActive}
                              >
                                <Link href={subItem.href}>
                                  <span>{subItem.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            {secondaryItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  tooltip={item.label}
                  isActive={item.isActive}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
