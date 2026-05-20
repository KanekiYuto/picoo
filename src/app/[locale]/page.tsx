import type { Metadata } from 'next';
import { generateAlternates } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import { Hero } from '@/components/rootPage/Hero';
import { ModelsShowcase } from '@/components/rootPage/ModelsShowcase';
import { FAQ } from '@/components/rootPage/FAQ';
import { CTA } from '@/components/rootPage/CTA';
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
      <div className="flex flex-col gap-20 md:gap-28 lg:gap-36">
        <ModelsShowcase />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
