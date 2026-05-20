"use client";

import { ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Link } from "@i18n/routing";
import { useTranslations } from "next-intl";

interface FooterProps {
  className?: string;
}

type FooterLinkItem = {
  label: string;
  href: string;
};

type FooterSection = {
  title: string;
  links: FooterLinkItem[];
};

function isExternalLink(href: string) {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
        className="text-[15px] leading-7 text-muted-foreground transition-colors hover:text-foreground dark:text-zinc-300 dark:hover:text-white"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="text-[15px] leading-7 text-muted-foreground transition-colors hover:text-foreground dark:text-zinc-300 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, links }: FooterSection) {
  return (
    <section className="min-w-0">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="mt-5 grid gap-1.5">
        {links.map((item) => (
          <FooterLink key={`${title}-${item.label}`} href={item.href}>
            {item.label}
          </FooterLink>
        ))}
      </div>
    </section>
  );
}

export function Footer({ className }: FooterProps) {
  const tSections = useTranslations("layout.footer.sections");
  const tLinks = useTranslations("layout.footer.links");
  const tFooter = useTranslations("layout.footer");

  const sections: FooterSection[] = [
    {
      title: tSections("models"),
      links: [
        { label: tLinks("seedream45"), href: "/models/seedream/seedream4_5" },
      ],
    },
    {
      title: tSections("apps"),
      links: [
        { label: tLinks("aiHairstyleChanger"), href: "/apps/ai-hairstyle-changer" },
        { label: tLinks("aiHairColorChanger"), href: "/apps/ai-hair-color-changer" },
      ],
    },
    {
      title: tSections("resources"),
      links: [
        { label: tLinks("pricing"), href: "/pricing" },
        { label: tLinks("helpCenter"), href: "/help" },
      ],
    },
    {
      title: tSections("community"),
      links: [
        { label: tLinks("discord"), href: siteConfig.social.discord },
      ],
    },
    {
      title: tSections("contact"),
      links: [
        { label: tLinks("discord"), href: siteConfig.social.discord },
        { label: tLinks("email"), href: `mailto:${siteConfig.contact.email}` },
      ],
    },
    {
      title: tSections("legal"),
      links: [
        { label: tLinks("privacyPolicy"), href: "/legal/privacy" },
        { label: tLinks("termsOfService"), href: "/legal/terms" },
        { label: tLinks("refundPolicy"), href: "/legal/refund" },
      ],
    },
  ];

  return (
    <footer className={cn("px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6", className)}>
      <div className="overflow-hidden rounded-[2rem] border border-border bg-background-1 text-foreground dark:border-white/5 dark:bg-[#111112]">
        <div className="px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-10">
            <aside className="max-w-[520px]">
              <div className="max-w-[520px] border-l border-border pl-5 text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[0.96] tracking-normal text-foreground dark:text-white">
                {tFooter("taglineLine1")}
                <br />
                {tFooter("taglineLine2")}
              </div>
            </aside>

            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {sections.map((section) => (
                <FooterColumn
                  key={section.title}
                  title={section.title}
                  links={section.links}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 md:px-8">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4" />
              <p>
                © {siteConfig.copyright.year} {siteConfig.fullName}. {siteConfig.copyright.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
