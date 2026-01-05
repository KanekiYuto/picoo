import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig } from "@/config/site";
import { UserProvider } from "@/components/providers/UserProvider";
import { UserStoreProvider } from "@/components/providers/UserStoreProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@i18n/routing';
import { rtlLocales } from '@i18n/config';
import { Toaster } from "sonner";
import { LayoutWrapper } from "./LayoutWrapper";
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
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  other: {
    'google': 'notranslate',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    title: `${siteConfig.fullName} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/og-image.webp`,
        width: 1200,
        height: 660,
        alt: siteConfig.fullName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.fullName} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.webp`],
  },
  icons: {
    icon: [
      { url: siteConfig.favicon, sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning translate="no">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <UserProvider>
              <UserStoreProvider>
                <TooltipProvider>
                  <LayoutWrapper>{children}</LayoutWrapper>
                  <ModalProvider />
                </TooltipProvider>
              </UserStoreProvider>
            </UserProvider>
          </NextIntlClientProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
