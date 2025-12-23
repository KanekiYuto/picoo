/**
 * 语言配置 - 与 i18n/config.ts 保持同步
 * 这个文件用于 JavaScript 配置（如 next-sitemap.config.js）
 */

const locales = ['en', 'zh-CN'];
const defaultLocale = 'zh-CN';

const localeNames = {
  en: 'English',
  'zh-CN': '简体中文',
};

const rtlLocales = [];

module.exports = {
  locales,
  defaultLocale,
  localeNames,
  rtlLocales,
};
