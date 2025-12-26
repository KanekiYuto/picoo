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
  logo: "/dark-logo.png",

  // Favicon 路径
  favicon: "/favicon.ico",

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
    github: "https://github.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    discord: "https://discord.com",
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
      { label: "教程", href: "/tutorials" },
      { label: "博客", href: "/blog" },
    ],
    community: [
      { label: "Discord", href: "https://discord.com" },
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "YouTube", href: "https://youtube.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
    ],
    contact: [
      { label: "技术支持", href: "/support" },
      { label: "商务合作", href: "/business" },
      { label: "个人演示", href: "/demo/individual" },
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
