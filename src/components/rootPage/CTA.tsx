'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Check } from 'lucide-react';
import { requireAuth } from '@/lib/guards';

/**
 * CTA 行动召唤组件
 * 引导用户开始使用平台
 */
export function CTA() {
  const { openGeneratorModal } = useGeneratorStore();
  const t = useTranslations('rootPage.cta');

  const features = [
    t('features.free'),
    t('features.noCard'),
    t('features.instant'),
  ];

  const handleStart = () => {
    requireAuth(() => {
      openGeneratorModal();
    });
  };

  return (
    <section className="relative px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden px-0 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {t('title')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg"
            >
              {t('description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              viewport={{ once: true }}
              className="mt-7 flex flex-wrap justify-center gap-2.5"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm text-foreground">
                  <Check className="size-3.5 text-primary" strokeWidth={3} />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto"
            >
              <Button
                type="button"
                onClick={handleStart}
                variant="default"
                size="payment"
                className="h-12 w-full rounded-lg px-8 text-base font-semibold sm:w-auto md:h-14 md:text-lg"
              >
                {t('primaryButton')}
                <ArrowUpRight data-icon="inline-end" />
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('footer')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
