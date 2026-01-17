import type { Metadata } from 'next';
import { generateAlternates } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import { Hero } from '@/components/rootPage/Hero';
import { ModelsShowcase } from '@/components/rootPage/ModelsShowcase';
import { FAQ } from '@/components/rootPage/FAQ';
import { CTA } from '@/components/rootPage/CTA';
import { Pricing } from '@/components/pricing/Pricing';
import { PricingHeader } from '@/components/pricing/PricingHeader';
import { Footer } from '@/components/layout';
import { RootPageHeader } from '@/components/rootPage/RootPageHeader';
import { ThirdPartyBadges } from '@/components/rootPage/ThirdPartyBadges';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'rootPage' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/'),
  };
}

export default function Home() {
  return (
    <>
      {/* Fixed Header */}
      <RootPageHeader />

      <Hero />

      {/* Main Content */}
      <div className="flex flex-col gap-16 md:gap-32 lg:gap-48">
        <ModelsShowcase />
        <div className='px-4 md:px-6 lg:px-8'>
          <PricingHeader />
          <Pricing />
        </div>
        <FAQ />
        <CTA />
        <ThirdPartyBadges
          className="px-4 md:px-6 lg:px-8"
          items={[
            {
              href: 'https://startupfa.me/s/picoo?utm_source=picooai.com',
              imgSrc: 'https://startupfa.me/badges/featured-badge.webp',
              imgAlt: 'Picoo - Featured on Startup Fame',
              width: 171,
              height: 54,
            },
            {
              href: 'https://twelve.tools',
              imgSrc: 'https://twelve.tools/badge0-white.svg',
              imgAlt: 'Featured on Twelve Tools',
              width: 200,
              height: 54,
            },
            {
              href: 'https://turbo0.com/item/picoo',
              imgSrc: 'https://img.turbo0.com/badge-listed-light.svg',
              imgAlt: '在 Turbo0 上列出',
              width: 162,
              height: 54,
            },
            {
              href: 'https://goodaitools.com',
              imgSrc: 'https://goodaitools.com/assets/images/badge.png',
              imgAlt: 'Good AI Tools',
              width: 207,
              height: 54,
            },
            {
              href: 'https://wired.business',
              imgSrc: 'https://wired.business/badge0-white.svg',
              imgAlt: 'Featured on Wired Business',
              width: 200,
              height: 54,
            },
            {
              href: 'https://findly.tools/picoo?utm_source=picoo',
              imgSrc: 'https://findly.tools/badges/findly-tools-badge-light.svg',
              imgAlt: 'Featured on findly.tools',
              width: 150,
              height: 48,
            },
            {
              kind: 'text',
              href: 'https://aitop10.tools/',
              label: 'AiTop10 Tools Diresctory',
            },
          ]}
        />
        <Footer />
      </div>
    </>
  );
}

