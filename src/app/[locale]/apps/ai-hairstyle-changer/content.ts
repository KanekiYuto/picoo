export type TranslationFn = (
  key: string,
  values?: Record<string, unknown>,
) => string;

export function getAiHairstyleChangerContent(t: TranslationFn, tc: TranslationFn) {
  return {
    hero: {
      title: t("hero.title"),
      description: t("hero.description"),
    },
    form: {
      image: {
        label: t("form.image.label"),
        description: t("form.image.description"),
      },
      prompt: {
        label: t("form.prompt.label"),
        help: t("form.prompt.help"),
      },
      aspectRatio: {
        label: t("form.aspectRatio.label"),
        help: t("form.aspectRatio.help"),
        options: [
          { value: "1:1", label: "1:1" },
          { value: "4:5", label: "4:5" },
          { value: "3:4", label: "3:4" },
          { value: "9:16", label: "9:16" },
        ] as const,
      },
      submit: t("form.submit"),
    },
    howItWorks: {
      title: t("howItWorks.title"),
      stepLabel: (index: number) => tc("howItWorks.step", { number: index + 1 }),
      steps: [
        {
          title: t("howItWorks.steps.0.title"),
          description: t("howItWorks.steps.0.description"),
          mediaAlt: t("howItWorks.mediaAlt.upload"),
        },
        {
          title: t("howItWorks.steps.1.title"),
          description: t("howItWorks.steps.1.description"),
          mediaAlt: t("howItWorks.mediaAlt.prompt"),
        },
        {
          title: t("howItWorks.steps.2.title"),
          description: t("howItWorks.steps.2.description"),
          mediaAlt: t("howItWorks.mediaAlt.result"),
        },
      ],
    },
    featureComparisons: {
      labels: {
        before: tc("featureComparisons.before"),
        after: tc("featureComparisons.after"),
        compare: tc("featureComparisons.compare"),
      },
      cta: t("featureComparisons.cta"),
      items: [
        {
          title: t("featureComparisons.items.0.title"),
          description: t("featureComparisons.items.0.description"),
        },
        {
          title: t("featureComparisons.items.1.title"),
          description: t("featureComparisons.items.1.description"),
        },
        {
          title: t("featureComparisons.items.2.title"),
          description: t("featureComparisons.items.2.description"),
        },
      ],
    },
    testimonials: {
      title: t("testimonials.title"),
      subtitle: t("testimonials.subtitle"),
      ratingLabel: (rating: number) => tc("testimonials.ratingLabel", { rating }),
      items: [
        {
          quote:
            "The previews look surprisingly real. I tested short haircuts for men and low fade haircut men options before committing—saved me a lot of regret.",
          name: "Emily R.",
          title: "Content Creator",
        },
        {
          quote:
            "Super fast and fun to iterate. I compared hairstyles for curly hair men and mens medium curly hairstyles, then matched it with medium beard styles in minutes.",
          name: "Jason K.",
          title: "Designer",
        },
        {
          quote:
            "Perfect for sharing. My friends helped me pick round face hairstyles men and short hair hairstyles for men that actually suit my face shape.",
          name: "Sofia M.",
          title: "Student",
        },
        {
          quote:
            "I was nervous about changing length. Seeing a long hair cut style preview first made the salon decision so easy.",
          name: "Hannah P.",
          title: "Marketing",
        },
      ],
    },
    faq: {
      title: t("faq.title"),
      labels: {
        expand: tc("faq.expand"),
        collapse: tc("faq.collapse"),
      },
      items: [
        {
          question: t("faq.items.0.question"),
          answer: t("faq.items.0.answer"),
        },
        {
          question: t("faq.items.1.question"),
          answer: t("faq.items.1.answer"),
        },
        {
          question: t("faq.items.2.question"),
          answer: t("faq.items.2.answer"),
        },
        {
          question: t("faq.items.3.question"),
          answer: t("faq.items.3.answer"),
        },
        {
          question: t("faq.items.4.question"),
          answer: t("faq.items.4.answer"),
        },
        {
          question: t("faq.items.5.question"),
          answer: t("faq.items.5.answer"),
        },
        {
          question: t("faq.items.6.question"),
          answer: t("faq.items.6.answer"),
        },
        {
          question: t("faq.items.7.question"),
          answer: t("faq.items.7.answer"),
        },
      ],
    },
    promptExamples: {
      title: t("promptExamples.title"),
      description: t("promptExamples.description"),
      promptLabel: tc("promptExamples.promptLabel"),
      items: [
        {
          imageSrc: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
          imageAlt: t("promptExamples.items.0.alt"),
          imageWidth: 1920,
          imageHeight: 1088,
          prompt:
            "Change my hairstyle to short haircuts for men with a clean low fade haircut men finish. Keep it natural, realistic texture, and maintain my facial features.",
        },
        {
          imageSrc: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
          imageAlt: t("promptExamples.items.1.alt"),
          imageWidth: 1920,
          imageHeight: 1088,
          prompt:
            "Give me shoulder length layered hair with soft waves. Add warm brown color with light highlights and a natural finish (long hair cutting style for female).",
        },
        {
          imageSrc: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
          imageAlt: t("promptExamples.items.0.alt"),
          imageWidth: 1920,
          imageHeight: 1088,
          prompt:
            "Try hairstyles for curly hair men: mens medium curly hairstyles with defined curls, volume on top, and tapered sides. Keep it photoreal with soft lighting.",
        },
        {
          imageSrc: "/material/apps/1cf9b810-81b0-489a-8c80-3073013caac3.webp",
          imageAlt: t("promptExamples.items.0.alt"),
          imageWidth: 1920,
          imageHeight: 1088,
          prompt:
            "Haircuts for girls with long hair inspired by ms dhoni hairstyle: long, sleek long hair cut style with a middle part, subtle caramel highlights, photoreal finish.",
        },
      ],
    },
    imageUpload: {
      strings: {
        remove: tc("imageUpload.remove"),
        change: tc("imageUpload.change"),
        cta: tc("imageUpload.cta"),
        recommendation: tc("imageUpload.recommendation"),
        previewAlt: tc("imageUpload.previewAlt"),
        maxSizeHint: tc("imageUpload.maxSizeHint", { maxSizeMB: "{maxSizeMB}" }),
        errors: {
          invalidType: tc("imageUpload.errors.invalidType"),
          maxSize: tc("imageUpload.errors.maxSize", { maxSizeMB: "{maxSizeMB}" }),
        },
      },
    },
  };
}
