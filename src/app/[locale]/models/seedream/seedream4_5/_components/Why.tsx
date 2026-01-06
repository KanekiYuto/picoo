import { getTranslations } from 'next-intl/server';
import WhyClient from './WhyClient';

export default async function Why() {
  const t = await getTranslations('seedream.why');

  const data = {
    title: t('title'),
    subtitle: t('subtitle'),
    items: [
      {
        title: t('items.0.title'),
        description: t('items.0.description'),
      },
      {
        title: t('items.1.title'),
        description: t('items.1.description'),
      },
      {
        title: t('items.2.title'),
        description: t('items.2.description'),
      },
    ],
    alts: {
      design: t('alts.design'),
    },
  };

  return <WhyClient {...data} />;
}
