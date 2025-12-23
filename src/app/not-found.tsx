import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css";

export default async function NotFound() {
  // 默认使用英文
  const messages = await getMessages({ locale: 'en' });

  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider locale="en" messages={messages}>
          <div className="w-full flex flex-col bg-background">
            {/* 主内容区域 */}
            <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
              {/* 404 主标题 */}
              <div className="text-[clamp(8rem,20vw,16rem)] font-bold text-foreground/10 leading-none">
                404
              </div>

              {/* Not Found 副标题 */}
              <div className="text-[clamp(1.5rem,5vw,4rem)] font-semibold text-foreground/30 uppercase tracking-wider">
                Page Not Found
              </div>

              {/* 按钮组 */}
              <div className="flex gap-4 mt-4">
                <Link
                  href="/"
                  className="flex h-12 items-center justify-center px-8 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all cursor-pointer"
                >
                  Back to Home
                </Link>
                <Link
                  href="/pricing"
                  className="flex h-12 items-center justify-center px-8 rounded-full bg-card hover:bg-card-hover text-foreground font-medium transition-all cursor-pointer border border-border"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            {/* Footer 组件 */}
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
