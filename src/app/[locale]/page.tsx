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
            <a
              key="startupfame"
              href="https://startupfa.me/s/picoo?utm_source=picooai.com"
              target="_blank"
              rel="noopener noreferrer"
            ></a>,
            <a href="https://turbo0.com/item/picoo" target="_blank" rel="noopener noreferrer"></a>,
          ]}
        />
        <Footer />
      </div>
    </>
  );
}
