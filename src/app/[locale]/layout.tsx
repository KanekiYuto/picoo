import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLayout } from "@/components/layout";
import { siteConfig } from "@/config/site";
import { UserProvider } from "@/components/providers/UserProvider";
import { UserStoreProvider } from "@/components/providers/UserStoreProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '../../../i18n/routing';
import { rtlLocales } from '../../../i18n/config';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${siteConfig.fullName} - ${siteConfig.tagline}`,
  description: siteConfig.description,
  icons: {
    icon: siteConfig.favicon,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 设置请求的 locale（这会影响 HTML lang 属性）
  setRequestLocale(locale);

  // 获取当前语言的翻译消息
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as any) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <UserProvider>
            <UserStoreProvider>
              <AppLayout>{children}</AppLayout>
            </UserStoreProvider>
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
