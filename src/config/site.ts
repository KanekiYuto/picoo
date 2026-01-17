import { locales } from '../../i18n/config';

// 站点配置
export const siteConfig = {
  // 站点名称
  name: "Picoo",

  // 站点完整名称
  fullName: "PicooAI.com",

  // 站点描述
  description: "One platform. Full creative power.",

  // 站点标语
  tagline: "AI. Powering Limitless Creativity.",

  // Logo 路径
  logo: {
    light: "/light-logo.webp",
    dark: "/dark-logo.webp",
  },

  // Favicon 路径
  favicon: "/favicon.ico",

  url: process.env.NEXT_PUBLIC_SITE_URL,

  // 支持的语言列表（从 i18n 配置导入）
  locales,

  // 联系方式
  contact: {
    email: "support@fluxreve.com",
  },

  // 法律信息
  legal: {
    termsLastUpdated: "2025-12-23",
    privacyLastUpdated: "2025-12-23",
  },

  // 社交媒体链接
  social: {
    discord: "https://discord.gg/sQT3rkAN28",
  },

  // 导航链接
  links: {
    models: [
      { label: "Seedream 4.5", href: "/models/seedream/seedream4_5" },
    ],
    apps: [{ label: "AI Hairstyle Changer", href: "/apps/ai-hairstyle-changer" }],
    resources: [
      { label: "Pricing", href: "/pricing" },
      { label: "Help Center", href: "/help" },
    ],
    community: [
      { label: "Discord", href: "https://discord.gg/sQT3rkAN28" },
    ],
    contact: [
      { label: "Discord", href: "https://discord.gg/sQT3rkAN28" },
      { label: "Email", href: "mailto:support@fluxreve.com" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Refund Policy", href: "/legal/refund" },
    ],
  },

  // 版权信息
  copyright: {
    year: new Date().getFullYear(),
    text: "All rights reserved.",
  },

  // 认证配置
  auth: {
    // 登录后默认重定向地址
    defaultRedirectAfterLogin: "/dashboard",
  },
} as const;

export type SiteConfig = typeof siteConfig;
