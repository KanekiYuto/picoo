import type { Metadata } from "next";
import { generateAlternates } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import { Link } from "@i18n/routing";
import { AppsListClient } from "./apps-list-client";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apps.index" });

  return {
    title: t("seo.title"),
    description: t("seo.description"),
    alternates: generateAlternates(locale, "/apps"),
  };
}

export default async function AppsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [t, tHairColor, tHairstyle] = await Promise.all([
    getTranslations({ locale, namespace: "apps.index" }),
    getTranslations({ locale, namespace: "apps.aiHairColorChanger" }),
    getTranslations({ locale, namespace: "apps.aiHairstyleChanger" }),
  ]);

  const apps = [
    {
      href: "/apps/ai-hair-color-changer",
      title: tHairColor("hero.title"),
      description: tHairColor("hero.description"),
      preview: {
        kind: "video" as const,
        src: "/material/apps/ai-hair-color-changer/haircolor-changer-vid.mp4",
        ariaLabel: t("apps.aiHairColorChanger.previewAria"),
      },
    },
    {
      href: "/apps/ai-hairstyle-changer",
      title: tHairstyle("hero.title"),
      description: tHairstyle("hero.description"),
      preview: {
        kind: "video" as const,
        src: "/material/apps/ai-hairstyle-changer/hairstyle-changer1-vid.mp4",
        ariaLabel: t("apps.aiHairstyleChanger.previewAria"),
      },
    },
  ];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10 xl:px-40 xl:py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          {t("sectionTitle")}
        </h1>
        <Link
          href="/apps"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("viewAll")}
        </Link>
      </div>

      <AppsListClient apps={apps} openLabel={t("open")} />
    </div>
  );
}
