import { getTranslations } from 'next-intl/server';
import CTAClient from './CTAClient';

export default async function CTA() {
  const t = await getTranslations('seedream.cta');

  const data = {
    title: t('title'),
    description: t('description'),
    primaryButton: t('buttons.primary'),
    secondaryButton: t('buttons.secondary'),
    note: t('note'),
  };

  return <CTAClient {...data} />;
}
