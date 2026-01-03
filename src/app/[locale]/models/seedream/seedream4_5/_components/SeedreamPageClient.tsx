'use client';

import { useTranslations } from 'next-intl';
import Hero from './Hero';
import Why from './Why';
import How from './How';
import FAQ from './FAQ';
import CTA from './CTA';

export default function SeedreamPageClient() {
  const t = useTranslations('seedream');

  return (
    <>
      <div className="container mx-auto px-4">
        <Hero
          title={t('hero.title')}
          description={t('hero.description')}
          images={[
            'https://d1q70pf5vjeyhc.cloudfront.net/predictions/8d08e36a1a7049379c25299e82eef019/1.jpeg',
            'https://d1q70pf5vjeyhc.cloudfront.net/predictions/8d08e36a1a7049379c25299e82eef019/1.jpeg',
          ]}
          features={[
            t('hero.features.0'),
            t('hero.features.1'),
            t('hero.features.2'),
            t('hero.features.3'),
          ]}
          primaryCta={t('hero.cta.primary')}
          secondaryCta={t('hero.cta.secondary')}
          noImages={t('hero.noImages')}
        />
      </div>
      <Why />
      <How />
      <FAQ />
      <CTA />
    </>
  );
}
