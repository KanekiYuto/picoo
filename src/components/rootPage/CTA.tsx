'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGeneratorStore } from '@/stores/generatorStore';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
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
    <section className="relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* 主标题 */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 tracking-tight"
          >
            {t('title')}
          </motion.h2>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {t('description')}
          </motion.p>

          {/* 功能列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-foreground/80">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                </div>
                <span className="text-base">{feature}</span>
              </div>
            ))}
          </motion.div>

          {/* 按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Button
              onClick={handleStart}
              variant="gradient"
              size="lg"
              className="text-xl font-semibold px-12 py-6 h-auto"
            >
              {t('primaryButton')}
            </Button>
          </motion.div>

          {/* 底部提示 */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8 text-sm text-muted-foreground"
          >
            {t('footer')}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
