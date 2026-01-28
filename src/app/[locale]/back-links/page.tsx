import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import { generateAlternates } from '@/lib/metadata';

export const dynamic = 'force-static';

const BACK_LINKS: string[] = [
  'https://www.saashub.com/list?q=picooai',
  'https://www.bing.com/search?q=picooai.com&form=QBLH&sp=-1&ghc=1&lq=0&pq=picooai.com&sc=0-11&qs=n&sk=&cvid=E4DD8ABD875C4AB085BAADF515DFF414',
  'https://blog.csdn.net/qq_44894205/article/details/157065677',
  'https://2048ai.net/696b4e427c1d88441d8d7fc6.html',
  'https://github.com/SouthWan/Picoo',
  'https://sg.search.yahoo.com/search?p=picooai.com&fr=yfp-t&fr2=p%3Afp%2Cm%3Asb&fp=1',
  'https://duckduckgo.com/?ia=web&origin=funnel_home_website&t=h_&q=picooai.com&chip-select=search',
  'https://yandex.ru/search?text=picooai.com&lr=10636&promo=',
  'https://www.crunchbase.com/person/picoo-picoo',
  'https://www.brownbook.net/business/54743828/picoo',
  'https://www.callupcontact.com/b/businessprofile/Picoo/9952577',
  'https://stackshare.io/picoo',
];

function getHostname(link: string) {
  try {
    return new URL(link).hostname;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'back-links' });

  return {
    title: t('seo.title', { siteName: siteConfig.name }),
    description: t('seo.description', { siteName: siteConfig.name }),
    alternates: generateAlternates(locale, '/back-links'),
  };
}

export default async function BackLinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'back-links' });

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-10 xl:px-40 xl:py-16">
      <header className="max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          {t('description', { siteName: siteConfig.name })}
        </p>
      </header>

      <section className="mt-8 bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <caption className="text-muted-foreground mt-4 text-sm text-left">
              {t('table.caption', { siteName: siteConfig.name })}
            </caption>
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors">
                <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                  {t('table.header')}
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {BACK_LINKS.map((link) => {
                const hostname = getHostname(link);
                return (
                  <tr
                    key={link}
                    className="hover:bg-muted/50 border-b transition-colors"
                  >
                    <td className="p-2 align-middle whitespace-normal">
                      <a
                        href={link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="min-w-0 text-muted-foreground hover:text-primary transition-colors text-sm inline-flex items-center gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-1 -mx-1 break-all"
                      >
                        <span className="min-w-0">{link}</span>
                        <span className="sr-only">
                          {t('link.opensInNewTab')}
                          {hostname ? ` (${hostname})` : ''}
                        </span>
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          className="w-3 h-3 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
