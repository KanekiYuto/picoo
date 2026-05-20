'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-border/70 last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6"
      >
        <span className="text-base font-semibold leading-6 text-foreground transition-colors group-hover:text-primary sm:text-lg">
          {question}
        </span>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background-1 transition-colors group-hover:bg-primary/10">
          {isOpen ? (
            <Minus className="size-4 text-foreground" />
          ) : (
            <Plus className="size-4 text-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-10 sm:pb-6 md:pr-14">
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const t = useTranslations('rootPage.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <section className="px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-[1.5rem] border border-border bg-gradient-to-br from-background via-background to-primary/10 p-4 backdrop-blur sm:gap-8 sm:rounded-[2rem] sm:p-6 md:grid-cols-[0.9fr_1.4fr] md:gap-10 md:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:sticky md:top-24 md:self-start"
          >
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary sm:mb-5 sm:w-16" />
            <h2 className="mb-4 text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl md:text-5xl">
              {t('title')}
            </h2>
            <p className="max-w-md text-base leading-7 text-muted-foreground md:text-lg">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-background-1 px-3.5 sm:px-5 md:px-6"
          >
            {faqItems.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
