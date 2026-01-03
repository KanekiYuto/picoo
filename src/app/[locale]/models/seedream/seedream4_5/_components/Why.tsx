'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ImageSwitch from './ImageSwitch';
import PromptImage from './PromptImage';

export default function Why() {
  const t = useTranslations('seedream.why');

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* 原图保持能力 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="flex-1 w-full md:w-auto">
              <ImageSwitch
                image1="/material/1a7b99d8-b90b-4446-98b9-81220f1b8ea0.webp"
                image2="/material/18c2269a-f962-437a-b1cb-d344fcace12e.webp"
                alt1={t('alts.original')}
                alt2={t('alts.generated')}
              />
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-3xl font-semibold mb-4">{t('items.0.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {t('items.0.description')}
              </p>
            </div>
          </motion.div>

          {/* 海报、Logo 设计排版能力 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row-reverse gap-8 items-center"
          >
            <div className="flex-1 w-full md:w-auto">
              <PromptImage
                image="/material/7a0b7687806a40c7af4d6af4ca009070.jpeg"
                prompt='The poster for the minimalist art exhibition features a beige background with a black line drawing of Van Gogh slightly to the right of center. The title, "A/W ART FAIR," is in serif font in the upper left corner. The lower left corner contains three lines of very small font detailing the exhibition dates, location, and story, all left-aligned and uniformly written.'
                alt={t('alts.design')}
              />
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-3xl font-semibold mb-4">{t('items.1.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {t('items.1.description')}
              </p>
            </div>
          </motion.div>

          {/* 多图组合能力 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="flex-1 w-full md:w-auto">
              <ImageSwitch
                image1="/material/3919a936-7f42-4dae-88c4-9e35bc562f3b-1767385243294.jpeg"
                image2="/material/ebd84639-da1e-4bd7-b49f-905e7054b2ef.jpeg"
                alt1={t('alts.original')}
                alt2={t('alts.generated')}
              />
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-3xl font-semibold mb-4">{t('items.2.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {t('items.2.description')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
