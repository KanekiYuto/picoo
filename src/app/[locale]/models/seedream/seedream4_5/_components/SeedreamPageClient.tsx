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
            '/material/7d6004e4-4b06-4e95-8dc1-4e5500d3dfbd.webp',
            '/material/efbb54c4-f034-4c13-afda-e061cf38ae0d.webp',
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
