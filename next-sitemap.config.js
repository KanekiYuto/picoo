// 导入语言配置（与 i18n/config.ts 保持同步）
const { locales, defaultLocale } = require('./config/locales');

// 需要登录或不需要索引的路径
const excludePaths = [
  '/api/*',
  '/checkout',
  '/portal/*',
  '/settings/*',
  '/subscription/*',
  '/assets/*',
  '/history/*',
];

// robots.txt 禁止爬取的路径
const disallowPaths = [
  '/api/',
  '/checkout/*',
  '/portal/*',
  '/settings/*',
  '/subscription/*',
  '/assets/*',
  '/history/*',
];

// 高价值语言配置（按消费能力和市场价值排序）
const highValueLocales = {
  en: 0.90,       // 英文 - 默认语言，全球消费能力最强
  'zh-CN': 0.60,  // 简体中文 - 中国市场
};

// 静态页面路由
const staticRoutes = [
  '', // 首页
  '/legal/terms',
  '/legal/privacy',
  '/legal/refund',
  '/pricing',
];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: excludePaths,

  // 多语言 alternate refs
  alternateRefs: locales.map((locale) => ({
    href: locale === defaultLocale
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`,
    hreflang: locale,
  })),

  // 生成所有语言版本的路径
  additionalPaths: async () => {
    const paths = [];

    // 静态页面生成所有语言版本
    locales.forEach((locale) => {
      staticRoutes.forEach((route) => {
        const isHome = route === '';
        const path = locale === defaultLocale
          ? route || '/'
          : `/${locale}${route}`;

        // 根据语言获取对应的权重，默认为 0.6
        const localePriority = highValueLocales[locale] || 0.6;

        paths.push({
          loc: path,
          changefreq: isHome ? 'daily' : 'weekly',
          priority: isHome ? 1.0 : localePriority,
          lastmod: new Date().toISOString(),
        });
      });
    });

    return paths;
  },

  // 默认配置
  changefreq: 'weekly',
  priority: 0.7,

  // robots.txt 配置
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowPaths,
      },
      // AI 爬虫友好配置
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Anthropic-AI',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: disallowPaths,
      },
    ],
  },
};
