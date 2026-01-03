import type { Metadata } from 'next';
import { generateAlternates } from '@/lib/metadata';
import { getTranslations } from 'next-intl/server';
import HelpPageClient from './_components/HelpPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/help'),
  };
}

export default function HelpPage() {
  return <HelpPageClient />;
}
