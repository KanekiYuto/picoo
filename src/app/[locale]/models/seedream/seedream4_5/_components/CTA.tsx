'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { Link } from '@i18n/routing';
import { Button } from '@/components/ui/button';

export default function CTA() {
  const t = useTranslations('seedream.cta');
  const { openGeneratorModal } = useGeneratorStore();

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-8 sm:p-12 md:p-16"
        >
          {/* 扫描线动画 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full bg-repeat" style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                #ffb3d9 2px,
                #ffb3d9 4px
              )`,
            }} />
          </div>

          {/* 动画光效 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#ff3466]/30 via-transparent to-[#c721ff]/30 blur-2xl animate-pulse" />
          </div>

          <div className="relative z-10 text-center">
            {/* 标题 */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 text-foreground">
              {t('title')}
            </h2>

            {/* 副标题 */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('description')}
            </p>

            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={openGeneratorModal}
                variant="gradient"
                size="lg"
                className="w-full sm:w-auto"
              >
                {t('buttons.primary')}
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/pricing">
                  {t('buttons.secondary')}
                </Link>
              </Button>
            </div>

            {/* 底部提示 */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('note')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
