const { locales, defaultLocale } = require('./config/locales');

const excludePaths = [
  '/api/*',
  '/checkout/*',
  '/portal/*',
  '/settings/*',
  '/subscription/*',
  '/assets',
  '/history',
  '/assets/*',
  '/history/*',
];

// 从路径中提取基础路由（去除语言前缀）
function getBaseRoute(path) {
  const match = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/(.*))?$/);
  if (match) {
    return match[2] || '';
  }
  return path;
}

// 检查路由是否应该被排除
function isExcludedPath(baseRoute) {
  return excludePaths.some(pattern => {
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
      .replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test('/' + baseRoute);
  });
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: excludePaths,
  changefreq: 'weekly',
  priority: 0.7,

  // 手动添加所有需要包含在 sitemap 中的路由
  additionalPaths: async (config) => {
    const result = [];

    // 定义所有需要包含的路由（不包含语言前缀）
    const routes = [
      '/',
      '/home',
      '/pricing',
      '/help',
      '/legal/privacy',
      '/legal/terms',
      '/legal/refund',
      '/models/seedream/seedream4_5',
      // 如果有其他模型页面，在这里添加
      // '/apps/image-editing/watermark-remover', // 如果需要的话
    ];

    // 为每个路由生成多语言版本
    for (const route of routes) {
      for (const locale of locales) {
        const path = locale === defaultLocale ? route : `/${locale}${route}`;
        result.push({
          loc: path,
          changefreq: route === '/' ? 'daily' : 'weekly',
          priority: route === '/' ? 1.0 : 0.7,
          lastmod: new Date().toISOString(),
        });
      }
    }

    return result;
  },

  transform: async (_config, path) => {
    const baseRoute = getBaseRoute(path);

    // 检查是否应该排除此路由
    if (isExcludedPath(baseRoute)) {
      return null;
    }

    // 过滤掉默认语言（en）的前缀路径，因为它们不应该出现在 sitemap 中
    // 默认语言不使用前缀（localePrefix: 'as-needed'）
    if (path.startsWith(`/${defaultLocale}/`) || path === `/${defaultLocale}`) {
      return null;
    }

    return {
      loc: path,
      changefreq: path === '/' || path === '' ? 'daily' : 'weekly',
      priority: path === '/' || path === '' ? 1.0 : 0.7,
      lastmod: new Date().toISOString()
    };
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: excludePaths,
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: excludePaths,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: excludePaths,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: excludePaths,
      },
      {
        userAgent: 'Anthropic-AI',
        allow: '/',
        disallow: excludePaths,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: excludePaths,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: excludePaths,
      },
    ],
  },
};
