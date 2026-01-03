'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function How() {
  const t = useTranslations('seedream.how');

  return (
    <section className="relative py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* 步骤卡片列表 */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-muted/5 border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border/80 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-foreground mb-2">{t(`steps.${index}.title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`steps.${index}.description`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
