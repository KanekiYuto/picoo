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

  transform: async (_config, path) => {
    const baseRoute = getBaseRoute(path);

    // 检查是否应该排除此路由
    if (isExcludedPath(baseRoute)) {
      return null;
    }

    const defaultHref = baseRoute ? `${process.env.NEXT_PUBLIC_SITE_URL}/${baseRoute}` : process.env.NEXT_PUBLIC_SITE_URL;

    // 为所有语言版本生成 alternateRefs
    let alternateRefs = locales.filter((lang) => lang !== defaultLocale).map((lang) => {
      const langHref = baseRoute ? `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/${baseRoute}` : `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}`;

      return {
        href: langHref,
        hreflang: lang,
      };
    });

    // 为默认语言添加 x-default
    alternateRefs.push({
      href: defaultHref,
      hreflang: 'x-default',
    });

    return {
      loc: path,
      changefreq: path === '/' || path === '' ? 'daily' : 'weekly',
      priority: path === '/' || path === '' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
      alternateRefs,
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
