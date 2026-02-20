import type { Metadata } from "next";
import { generateAlternates } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import { App } from "../_components/app";
import { AppFormClient } from "../_components/AppFormClient";
import { FeatureComparisons } from "../_components/feature-comparisons";
import { FAQ } from "../_components/faq";
import { HowItWorks } from "../_components/how-it-works";
import { PromptResultExamples } from "../_components/prompt-result-examples";
import { Testimonials } from "../_components/testimonials";
import { getAiHairColorChangerContent, type TranslationFn } from "./content";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apps.aiHairColorChanger" });

  return {
    title: t("seo.title"),
    description: t("seo.description"),
    alternates: generateAlternates(locale, "/apps/ai-hair-color-changer"),
  };
}

export default async function AiHairColorChangerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "apps.aiHairColorChanger" }),
    getTranslations({ locale, namespace: "apps.components" }),
  ]);

  const content = getAiHairColorChangerContent(
    t as unknown as TranslationFn,
    tc as unknown as TranslationFn,
  );

  return (
    <div className="grid gap-24 px-4 py-8 sm:px-6 lg:px-10 xl:px-48 xl:py-16">
      <App
        title={content.hero.title}
        description={content.hero.description}
        previewMedia={{
          kind: "video",
          src: "/material/apps/ai-hair-color-changer/haircolor-changer-vid.mp4",
          ariaLabel: "AI hair color changer preview video",
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          preload: "metadata",
        }}
        form={
          <AppFormClient
            formContent={content.form}
            imageUploadStrings={content.imageUpload.strings}
          />
        }
      />

      <HowItWorks
        title={content.howItWorks.title}
        stepLabel={tc("howItWorks.step", { number: "{n}" })}
        steps={content.howItWorks.steps.map((step, i) => ({
          title: step.title,
          description: step.description,
          media: {
            kind: "image" as const,
            src: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
            alt: step.mediaAlt,
            ...(i === 0 && { priority: true }),
          },
        }))}
      />

      <FeatureComparisons
        ctaLabel={content.featureComparisons.cta}
        ctaHref="#"
        labels={content.featureComparisons.labels}
        items={content.featureComparisons.items.map((item) => ({
          title: item.title,
          description: item.description,
          media: { kind: "image" as const, src: item.mediaSrc, alt: item.mediaAlt },
        }))}
      />

      <Testimonials
        title={content.testimonials.title}
        subtitle={content.testimonials.subtitle}
        ratingLabel={content.testimonials.ratingLabel}
        items={content.testimonials.items.map((item) => ({ ...item, rating: 5 as const }))}
      />

      <PromptResultExamples
        title={content.promptExamples.title}
        description={content.promptExamples.description}
        promptLabel={content.promptExamples.promptLabel}
        items={content.promptExamples.items}
      />

      <FAQ
        title={content.faq.title}
        defaultOpenIndex={1}
        labels={content.faq.labels}
        items={content.faq.items}
      />
    </div>
  );
}
