import { DocumentLayout } from "@/components/document";
import { siteConfig } from "@/config/site";
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import { generateRefundMarkdown } from '@/lib/legal-markdown';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'refund' });

  return {
    title: t('meta.title', { siteName: siteConfig.name }),
    description: t('meta.description', { siteName: siteConfig.name }),
    alternates: generateAlternates(locale, '/legal/refund'),
  };
}

export default async function RefundPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'refund' });

  // 生成 Markdown 内容
  const refundMarkdown = generateRefundMarkdown(t, {
    siteName: siteConfig.name,
    lastUpdated: siteConfig.legal.termsLastUpdated,
    email: siteConfig.contact.email,
  });

  return (
    <DocumentLayout
      content={refundMarkdown}
      showNav={true}
    />
  );
}
