import { DocumentLayout } from "@/components/document";
import { siteConfig } from "@/config/site";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });

  return {
    title: t('meta.title', { siteName: siteConfig.name }),
    description: t('meta.description', { siteName: siteConfig.name }),
  };
}

// 辅助函数：生成 Markdown 内容
function generateTermsMarkdown(t: any, params: { siteName: string; lastUpdated: string; email: string }) {
  const sections = t.raw('sections');

  return `# ${t('title')}

**${t('lastUpdated', params)}**

---

## 1. ${sections.acceptance.title}

${sections.acceptance.intro.replace(/{siteName}/g, params.siteName)}

${sections.acceptance.content}

## 2. ${sections.services.title}

${sections.services.intro.replace(/{siteName}/g, params.siteName)}

${sections.services.items.map((item: string) => `- ${item}`).join('\n')}

## 3. ${sections.account.title}

### 3.1 ${sections.account.registration.title}

${sections.account.registration.content}

### 3.2 ${sections.account.security.title}

${sections.account.security.content}

### 3.3 ${sections.account.transfer.title}

${sections.account.transfer.content}

## 4. ${sections.usage.title}

${sections.usage.intro}

${sections.usage.items.map((item: string) => `- ${item}`).join('\n')}

## 5. ${sections.ip.title}

### 5.1 ${sections.ip.platform.title}

${sections.ip.platform.content.replace(/{siteName}/g, params.siteName)}

### 5.2 ${sections.ip.userContent.title}

${sections.ip.userContent.content}

### 5.3 ${sections.ip.license.title}

${sections.ip.license.intro}

${sections.ip.license.items.map((item: string) => `- ${item}`).join('\n')}

## 6. ${sections.privacy.title}

${sections.privacy.content}

## 7. ${sections.termination.title}

### 7.1 ${sections.termination.modification.title}

${sections.termination.modification.content}

### 7.2 ${sections.termination.ourTermination.title}

${sections.termination.ourTermination.content}

### 7.3 ${sections.termination.effect.title}

${sections.termination.effect.content}

## 8. ${sections.disclaimer.title}

### 8.1 ${sections.disclaimer.asIs.title}

${sections.disclaimer.asIs.content}

### 8.2 ${sections.disclaimer.liability.title}

${sections.disclaimer.liability.content.replace(/{siteName}/g, params.siteName)}

### 8.3 ${sections.disclaimer.userResponsibility.title}

${sections.disclaimer.userResponsibility.content}

## 9. ${sections.legal.title}

### 9.1 ${sections.legal.law.title}

${sections.legal.law.content.replace(/{siteName}/g, params.siteName)}

### 9.2 ${sections.legal.disputes.title}

${sections.legal.disputes.content}

## 10. ${sections.contact.title}

${sections.contact.intro}

**${sections.contact.email.replace(/{email}/g, params.email)}**
`;
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });

  // 生成 Markdown 内容
  const termsMarkdown = generateTermsMarkdown(t, {
    siteName: siteConfig.name,
    lastUpdated: siteConfig.legal.termsLastUpdated,
    email: siteConfig.contact.email,
  });

  return (
    <DocumentLayout
      content={termsMarkdown}
      showNav={true}
    />
  );
}
