"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useGeneratorStore } from "@/store/useGeneratorStore";
import { requireAuth } from "@/lib/guards";
import { ArrowUpRight, ImageIcon, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 模型展示组件
 * 展示平台支持的所有 AI 视频和图像生成模型
 */
export function ModelsShowcase() {
  const t = useTranslations('rootPage.modelsShowcase');
  const { openGeneratorModalWithPrompt } = useGeneratorStore();

  const categories = [
    {
      title: t('video.title'),
      description: t('video.description'),
      models: ["Veo 3", "Veo 2", "Sora 2", "Kling AI", "Sedarce", "Wan AI"],
      buttonText: t('video.buttonText'),
      mediaType: 'video' as const,
      icon: Video,
      gradientClassName: 'from-background via-background to-primary/10',
    },
    {
      title: t('image.title'),
      description: t('image.description'),
      models: ["Gemini(Nano Banana)", "Flux AI", "GPT-image", "Seedream", "Flux Kontext", "Qwen Image", "Wan AI"],
      buttonText: t('image.buttonText'),
      mediaType: 'image' as const,
      icon: ImageIcon,
      gradientClassName: 'from-background via-primary/5 to-primary/15',
    },
  ];

  const handleOpenGenerator = (mediaType: 'image' | 'video') => {
    requireAuth(() => {
      openGeneratorModalWithPrompt('', mediaType);
    });
  };

  return (
    <section className="relative px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex flex-col gap-8 md:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl"
          >
            <h2 className="text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {t('title.line1')}
              <br />
              <span className="text-gradient-primary">{t('title.line2')}</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative px-1 py-1.5 sm:px-2 sm:py-3 md:px-3 md:py-4"
          >
            <div className="absolute inset-0 rotate-[-1deg] rounded-[2rem] border border-border bg-background/60 shadow-2xl backdrop-blur" />
            <div className="relative grid gap-3 p-2.5 sm:gap-4 sm:p-4 md:gap-5 md:p-5 lg:grid-cols-2">
              {categories.map((category) => (
                <div
                  key={category.mediaType}
                  className={`flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${category.gradientClassName} p-3.5 shadow-lg backdrop-blur sm:min-h-[300px] sm:p-5 md:min-h-[320px] md:p-6`}
                >
                  <div className="mb-4 flex items-start gap-3 sm:mb-5 sm:gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background-1">
                      <category.icon className="size-5 text-foreground" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-semibold text-foreground md:text-2xl">
                        {category.title}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-1 flex-wrap content-start gap-2">
                    {category.models.map((model) => (
                      <Badge
                        key={model}
                        variant="outline"
                        className="rounded-full border-border bg-background-1 px-2.5 py-1 text-xs font-medium sm:px-3 sm:text-sm"
                      >
                        {model}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleOpenGenerator(category.mediaType)}
                    size="payment"
                    className="h-11 w-full rounded-lg px-6 text-base font-semibold sm:h-12"
                  >
                    <category.icon data-icon="inline-start" />
                    {category.buttonText}
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
