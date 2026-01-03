import { DocumentLayout } from "@/components/document";
import { siteConfig } from "@/config/site";
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import { generatePrivacyMarkdown } from '@/lib/legal-markdown';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return {
    title: t('meta.title', { siteName: siteConfig.name }),
    description: t('meta.description', { siteName: siteConfig.name }),
    alternates: generateAlternates(locale, '/legal/privacy'),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  // 生成 Markdown 内容
  const privacyMarkdown = generatePrivacyMarkdown(t, {
    siteName: siteConfig.name,
    lastUpdated: siteConfig.legal.privacyLastUpdated,
    email: siteConfig.contact.email,
  });

  return (
    <DocumentLayout
      content={privacyMarkdown}
      showNav={true}
    />
  );
}
