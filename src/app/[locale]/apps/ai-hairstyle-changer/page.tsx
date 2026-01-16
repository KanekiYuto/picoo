import type { Metadata } from "next";
import { generateAlternates } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import { App } from "../_components/app";
import { FeatureComparisons } from "../_components/feature-comparisons";
import { FAQ } from "../_components/faq";
import { HowItWorks } from "../_components/how-it-works";
import { PromptResultExamples } from "../_components/prompt-result-examples";
import { Testimonials } from "../_components/testimonials";
import { getAiHairstyleChangerContent, type TranslationFn } from "./content";
import { AiHairstyleChangerFormClient } from "./form-client";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apps.aiHairstyleChanger" });

  return {
    title: t("seo.title"),
    description: t("seo.description"),
    alternates: generateAlternates(locale, "/apps/ai-hairstyle-changer"),
  };
}

export default async function AiHairstyleChangerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apps.aiHairstyleChanger" });
  const tc = await getTranslations({ locale, namespace: "apps.components" });
  const content = getAiHairstyleChangerContent(
    t as unknown as TranslationFn,
    tc as unknown as TranslationFn,
  );

  return (
    <div className="grid gap-24 px-4 py-8 sm:px-6 lg:px-10 xl:px-40 xl:py-16">
      <App
        title={content.hero.title}
        description={content.hero.description}
        form={
          <AiHairstyleChangerFormClient
            formContent={content.form}
            imageUploadStrings={content.imageUpload.strings}
          />
        }
      />

      <HowItWorks
        title={content.howItWorks.title}
        stepLabel={tc("howItWorks.step", { number: "{n}" })}
        steps={[
          {
            title: content.howItWorks.steps[0].title,
            description: content.howItWorks.steps[0].description,
            media: {
              kind: "image",
              src: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
              alt: content.howItWorks.steps[0].mediaAlt,
              priority: true,
            },
          },
          {
            title: content.howItWorks.steps[1].title,
            description: content.howItWorks.steps[1].description,
            media: {
              kind: "image",
              src: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
              alt: content.howItWorks.steps[0].mediaAlt,
            },
          },
          {
            title: content.howItWorks.steps[2].title,
            description: content.howItWorks.steps[2].description,
            media: {
              kind: "image",
              src: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
              alt: content.howItWorks.steps[2].mediaAlt,
            },
          },
        ]}
      />

      <FeatureComparisons
        ctaLabel={content.featureComparisons.cta}
        ctaHref="#"
        labels={content.featureComparisons.labels}
        items={[
          {
            title: content.featureComparisons.items[0].title,
            description: content.featureComparisons.items[0].description,
            media: {
              kind: "image",
              src: "/material/apps/ai-hairstyle-changer/ai_hairstyle_1_f09bca678b.webp",
              alt: "AI hairstyle example",
            },
          },
          {
            title: content.featureComparisons.items[1].title,
            description: content.featureComparisons.items[1].description,
            media: {
              kind: "image",
              src: "/material/apps/ai-hairstyle-changer/ai_hairstyle_2_022a75da4d.webp",
              alt: "AI hairstyle example",
            },
          },
          {
            title: content.featureComparisons.items[2].title,
            description: content.featureComparisons.items[2].description,
            media: {
              kind: "image",
              src: "/material/apps/ai-hairstyle-changer/ai_hairstyle_3_668eed9f89.webp",
              alt: "AI hairstyle example",
            },
          },
        ]}
      />

      <Testimonials
        title={content.testimonials.title}
        subtitle={content.testimonials.subtitle}
        ratingLabel={content.testimonials.ratingLabel}
        items={[
          {
            quote: content.testimonials.items[0].quote,
            name: content.testimonials.items[0].name,
            title: content.testimonials.items[0].title,
            rating: 5,
          },
          {
            quote: content.testimonials.items[1].quote,
            name: content.testimonials.items[1].name,
            title: content.testimonials.items[1].title,
            rating: 5,
          },
          {
            quote: content.testimonials.items[2].quote,
            name: content.testimonials.items[2].name,
            title: content.testimonials.items[2].title,
            rating: 5,
          },
          {
            quote: content.testimonials.items[3].quote,
            name: content.testimonials.items[3].name,
            title: content.testimonials.items[3].title,
            rating: 5,
          },
        ]}
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
