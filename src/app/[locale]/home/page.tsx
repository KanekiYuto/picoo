import type { Metadata } from 'next';
import { generateAlternates } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/home/HeroSection';
import { WhatsNew } from '@/components/home/WhatsNew';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/'),
  };
}

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16 py-8 md:py-12">
      {/* Hero Section */}
      <HeroSection />

      {/* What's New Section */}
      <WhatsNew />
    </div>
  );
}
