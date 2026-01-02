import { locales } from '../../i18n/config';

// 站点配置
export const siteConfig = {
  // 站点名称
  name: "Picoo",

  // 站点完整名称
  fullName: "PicooAI.com",

  // 站点描述
  description: "Building the future of AI-powered solutions.",

  // 站点标语
  tagline: "AI-Powered Solutions",

  // Logo 路径
  logo: "/dark-logo.webp",

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
    product: [
      { label: "登录", href: "/login" },
    ],
    tools: [
      { label: "AI 图像", href: "/tools/image" },
      { label: "AI 艺术", href: "/tools/art" },
      { label: "AI 视频", href: "/tools/video" },
      { label: "AI 音乐", href: "/tools/music" },
      { label: "AI 配音", href: "/tools/voice" },
    ],
    resources: [
      { label: "定价", href: "/pricing" },
      { label: "帮助中心", href: "/help" },
    ],
    community: [
      { label: "Discord", href: "https://discord.gg/sQT3rkAN28" },
    ],
    contact: [
      { label: "Discord", href: "https://discord.gg/sQT3rkAN28" },
      { label: "Email", href: "mailto:support@fluxreve.com" },
    ],
    legal: [
      { label: "隐私政策", href: "/legal/privacy" },
      { label: "服务条款", href: "/legal/terms" },
      { label: "退款政策", href: "/legal/refund" },
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
