import { getTranslations } from 'next-intl/server';
import FAQClient from './FAQClient';

export default async function FAQ() {
  const t = await getTranslations('seedream.faq');

  const data = {
    title: t('title'),
    items: Array.from({ length: 4 }, (_, i) => ({
      question: t(`items.${i}.question`),
      answer: t(`items.${i}.answer`),
    })),
  };

  return <FAQClient {...data} />;
}
