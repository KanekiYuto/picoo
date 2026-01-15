import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../i18n/config';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from './server/auth';

const intlMiddleware = createMiddleware({
  // 支持的所有语言
  locales,

  // 默认语言
  defaultLocale,

  // URL 策略:
  // - 'always': 总是显示语言前缀 (/zh-CN/page, /en/page)
  // - 'as-needed': 默认语言不显示前缀 (/page), 其他语言显示 (/en/page)
  // - 'never': 从不显示前缀 (需要其他方式检测语言)
  localePrefix: 'as-needed',

  // 自动语言检测（基于 Cookie、Accept-Language header）
  localeDetection: true,

  // 使用 alternate links 来记住语言偏好
  alternateLinks: true,
});

// 需要身份验证的 API 路由模式
const protectedApiPatterns = [
  /^\/api\/asset\/?/,
  /^\/api\/history\/?/,
  /^\/api\/subscription\/?/,
  /^\/api\/upload\/?/,
  /^\/api\/user\/?/,
  /^\/api\/credit\/?/,
  /^\/api\/ai-generator\/provider\/?/,
  /^\/api\/ai-generator\/status\/?/,
];

function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiPatterns.some(pattern => pattern.test(pathname));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 检查是否为受保护的 API 路由
  if (isProtectedApiRoute(pathname)) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 验证通过，注入userId到header，继续处理
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.user.id);
    return response;
  }

  // 处理 i18n 路由
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // i18n 路由
    '/',
    '/((?!_next/static|_next/image|_vercel|\\.well-known|api/|.*\\..*).+)',
    // 受保护的 API 路由
    '/api/asset',
    '/api/asset/:path*',
    '/api/history',
    '/api/history/:path*',
    '/api/subscription',
    '/api/subscription/:path*',
    '/api/upload',
    '/api/upload/:path*',
    '/api/user',
    '/api/user/:path*',
    '/api/credit',
    '/api/credit/:path*',
    '/api/ai-generator/provider/:path*',
    '/api/ai-generator/status/:path*',
  ],
};
