"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useGeneratorStore } from "@/store/useGeneratorStore";
import { requireAuth } from "@/lib/guards";

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
      gradient: "bg-gradient-to-br from-cyan-500/5 via-card/50 to-blue-500/5",
      mediaType: 'video' as const,
    },
    {
      title: t('image.title'),
      description: t('image.description'),
      models: ["Gemini(Nano Banana)", "Flux AI", "GPT-image", "Seedream", "Flux Kontext", "Qwen Image", "Wan AI"],
      buttonText: t('image.buttonText'),
      gradient: "bg-gradient-to-br from-red-500/5 via-card/50 to-purple-500/5",
      mediaType: 'image' as const,
    },
  ];

  const handleOpenGenerator = (mediaType: 'image' | 'video') => {
    requireAuth(() => {
      openGeneratorModalWithPrompt('', mediaType);
    });
  };

  return (
    <section className="relative px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 md:mb-20 text-foreground leading-tight"
        >
          {t('title.line1')}
          <br />
          {t('title.line2')}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className={`p-10 md:p-12 rounded-2xl border border-border backdrop-blur relative overflow-hidden flex flex-col ${category.gradient}`}
            >
              <h3 className="text-2xl md:text-3xl font-semibold mb-5 text-foreground">
                {category.title}
              </h3>

              <p className="text-base md:text-lg text-muted-foreground mb-8">
                {category.description}
              </p>

              <div className="mb-8 flex-1">
                <div className="flex flex-wrap gap-3">
                  {category.models.map((model, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 text-sm md:text-base rounded-lg bg-foreground/5 text-foreground border border-foreground/10 whitespace-nowrap font-medium"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenGenerator(category.mediaType)}
                className="px-8 py-3 rounded-lg bg-foreground text-background hover:opacity-90 transition-all font-semibold cursor-pointer text-base md:text-lg shadow-lg"
              >
                {category.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
