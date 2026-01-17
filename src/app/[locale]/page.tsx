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
        <Footer />

        <div className="sr-only" aria-hidden="true">
          <a
            href="https://startupfa.me/s/picoo?utm_source=picooai.com"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://startupfa.me/images/logo-dark.webp"
              alt="Startup Fame"
              width="208"
              height="36"
            />
          </a>
        </div>
      </div>
    </>
  );
}

