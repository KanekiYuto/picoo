import { getTranslations } from 'next-intl/server';
import HowClient from './HowClient';

export default async function How() {
  const t = await getTranslations('seedream.how');

  const data = {
    title: t('title'),
    subtitle: t('subtitle'),
    steps: [0, 1, 2, 3].map((index) => ({
      title: t(`steps.${index}.title`),
      description: t(`steps.${index}.description`),
    })),
  };

  return <HowClient {...data} />;
}
