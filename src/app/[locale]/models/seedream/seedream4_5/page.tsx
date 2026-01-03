import type { Metadata } from 'next';
import { generateAlternates } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import SeedreamPageClient from './_components/SeedreamPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seedream' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/models/seedream/seedream4_5'),
  };
}

export default function SeedreamPage() {
  return <SeedreamPageClient />;
}
