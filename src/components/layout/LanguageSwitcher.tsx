"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "../../../i18n/routing";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "lucide-react";
import { localeNames, locales, type Locale } from "../../../i18n/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 语言切换下拉菜单
 */
export function LanguageSwitcher() {
  const t = useTranslations("layout");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale || isPending) {
      return;
    }

    startTransition(() => {
      router.push(pathname, { locale: newLocale });
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Change language"
          variant="outline"
          size="sm"
          className="h-9 min-w-0 gap-2 rounded-full border-border bg-transparent pl-2.5 pr-3 text-muted-foreground hover:bg-secondary hover:text-foreground sm:h-10"
        >
          <GlobeIcon className="size-4" />
          <span className="hidden max-w-28 truncate sm:inline">
            {localeNames[locale]}
          </span>
          <ChevronDownIcon className={cn("size-4", isPending && "animate-pulse")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("switchLanguage")}</DropdownMenuLabel>
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              disabled={isPending}
              onSelect={() => handleLanguageChange(loc)}
              className="justify-between"
            >
              <span>{localeNames[loc]}</span>
              {locale === loc ? (
                <CheckIcon className="size-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
