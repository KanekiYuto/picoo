'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { requireAuth } from '@/lib/guards';

const showcaseImages = [
  {
    src: '/material/root/hero/69c821a5-b495-4c1a-a098-030815ba42c5.webp',
    alt: 'AI generated portrait preview',
    className: 'col-span-5 row-span-5',
  },
  {
    src: '/material/root/hero/8f1067ff-4f2d-42cd-bfbb-5a4aff179223.webp',
    alt: 'AI generated visual preview',
    className: 'col-span-4 row-span-3 col-start-6',
  },
  {
    src: '/material/root/hero/a345527e-4fe5-4b96-b8e2-7e344217dc7a.webp',
    alt: 'AI hairstyle result preview',
    className: 'col-span-4 row-span-3 col-start-6 row-start-4',
  },
];

/**
 * Hero 主页标题区域组件
 */
export function Hero() {
  const t = useTranslations('rootPage.hero');
  const { openGeneratorModalWithPrompt } = useGeneratorStore();

  const handleOpenGenerator = (mediaType: 'image' | 'video') => {
    requireAuth(() => {
      openGeneratorModalWithPrompt('', mediaType);
    });
  };

  return (
    <div className="relative overflow-hidden px-3 pt-20 pb-12 sm:px-4 md:px-6 md:pt-28 md:pb-14 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,var(--background-2),transparent_30%),radial-gradient(circle_at_85%_18%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />

      <section className="relative mx-auto grid min-h-[76vh] w-full max-w-7xl items-center gap-8 sm:min-h-[80vh] md:gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col items-start">
          <h1 className="max-w-4xl text-[4.75rem] font-semibold leading-[0.88] tracking-normal text-foreground sm:text-8xl sm:leading-[0.9] md:text-7xl lg:text-8xl">
            <span className="block">{siteConfig.name}</span>
            <span className="block text-muted-foreground">{t('title.prefix')}</span>
            <span className="block text-gradient-primary">{t('title.highlight')}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-7 md:text-lg md:leading-8"
          >
            {t.rich('description', {
              models: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
            })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:mt-10 sm:flex-row"
          >
            <Button
              type="button"
              size="payment"
              className="h-12 w-full rounded-lg px-7 text-base font-semibold sm:h-14 sm:w-auto"
              onClick={() => handleOpenGenerator('image')}
            >
              {t('buttons.start')}
              <ArrowUpRight data-icon="inline-end" />
            </Button>
            <Button
              asChild
              variant="outline"
              size="payment"
              className="h-12 w-full rounded-lg px-7 text-base font-semibold sm:h-14 sm:w-auto"
            >
              <Link href="/pricing">
                {t('buttons.pricing')}
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.25 }}
          className="relative hidden min-h-[620px] lg:block"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rotate-[-2deg] rounded-[2rem] border border-border bg-background/60 shadow-2xl backdrop-blur" />
          <div className="absolute inset-6 grid grid-cols-9 grid-rows-6 gap-4">
            {showcaseImages.map((image) => (
              <div
                key={image.src}
                className={`${image.className} overflow-hidden rounded-2xl border border-border bg-background-1 shadow-lg`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={720}
                  height={720}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-border bg-background/85 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Seedream v4.5</span>
                <span className="text-xs text-muted-foreground">Image edit · 1920*1920</span>
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-background-2">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
