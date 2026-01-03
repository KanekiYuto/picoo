"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, Zap, Palette } from "lucide-react";
import { siteConfig } from "@/config/site";

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpPageClient() {
  const t = useTranslations("help");

  const faqs: FAQItem[] = [
    {
      question: t("faq.0.question"),
      answer: t("faq.0.answer", { name: siteConfig.name }),
    },
    {
      question: t("faq.1.question"),
      answer: t("faq.1.answer", { name: siteConfig.name }),
    },
    {
      question: t("faq.2.question"),
      answer: t("faq.2.answer", { name: siteConfig.name }),
    },
    {
      question: t("faq.3.question"),
      answer: t("faq.3.answer", { name: siteConfig.name }),
    },
  ];

  const features = [
    {
      icon: Zap,
      title: t("features.0.title"),
      description: t("features.0.description"),
    },
    {
      icon: Palette,
      title: t("features.1.title"),
      description: t("features.1.description"),
    },
    {
      icon: MessageSquare,
      title: t("features.2.title"),
      description: t("features.2.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">{t("subtitle", { name: siteConfig.name })}</p>
        </motion.div>

        {/* 功能特性 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="rounded-lg border border-border bg-sidebar-bg p-6"
              >
                <Icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* FAQ 部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/5 transition-colors"
              >
                <summary className="flex items-center justify-between font-semibold text-foreground">
                  {faq.question}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </motion.div>

        {/* 底部联系 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 rounded-lg border border-border bg-sidebar-bg p-8 text-center"
        >
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("contact.title")}
          </h3>
          <p className="text-muted-foreground mb-4">{t("contact.description")}</p>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="inline-block px-6 py-2 border border-border bg-muted/20 text-foreground rounded-lg hover:bg-muted/40 transition-colors"
          >
            {t("contact.button")}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
