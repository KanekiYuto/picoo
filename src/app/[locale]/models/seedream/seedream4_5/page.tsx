import type { Metadata } from 'next';
import { generateAlternates } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import Hero from './_components/Hero';

const Why = dynamicImport(() => import('./_components/Why'), {
  loading: () => <div className="h-screen" />,
});
const How = dynamicImport(() => import('./_components/How'), {
  loading: () => <div className="h-96" />,
});
const FAQ = dynamicImport(() => import('./_components/FAQ'), {
  loading: () => <div className="h-96" />,
});
const CTA = dynamicImport(() => import('./_components/CTA'), {
  loading: () => <div className="h-96" />,
});

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seedream' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/models/seedream/seedream4_5'),
  };
}

export default async function SeedreamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seedream' });

  const heroData = {
    title: t('hero.title'),
    description: t('hero.description'),
    images: ['/material/7d6004e4-4b06-4e95-8dc1-4e5500d3dfbd.webp'],
    features: [
      t('hero.features.0'),
      t('hero.features.1'),
      t('hero.features.2'),
      t('hero.features.3'),
    ],
    primaryCta: t('hero.cta.primary'),
    secondaryCta: t('hero.cta.secondary'),
    noImages: t('hero.noImages'),
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <Hero {...heroData} />
      </div>
      <Why />
      <How />
      <FAQ />
      <CTA />
    </>
  );
}
