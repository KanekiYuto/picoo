import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { generateAlternates } from '@/lib/metadata';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return {
        title: 'Back links',
        description: 'Links on other websites',
        alternates: generateAlternates(locale, '/legal/refund'),
    };
}

export default async function BackLinksPage({ params }: { params: Promise<{ locale: string }> }) {
    const { } = await params;

    const links = [
        'https://www.saashub.com/list?q=picooai',
        'https://www.bing.com/search?q=picooai.com&form=QBLH&sp=-1&ghc=1&lq=0&pq=picooai.com&sc=0-11&qs=n&sk=&cvid=E4DD8ABD875C4AB085BAADF515DFF414',
        'https://blog.csdn.net/qq_44894205/article/details/157065677',
        'https://2048ai.net/696b4e427c1d88441d8d7fc6.html',
        'https://github.com/SouthWan/Picoo',
        'https://sg.search.yahoo.com/search?p=picooai.com&fr=yfp-t&fr2=p%3Afp%2Cm%3Asb&fp=1'
    ];

    const table = (links: string[]) => {
        return links.map((link: string) => (
            <TableRow>
                <TableCell>
                    <a
                        href={link}
                        {...{
                            target: '_blank',
                            rel: 'nofollow noopener noreferrer',
                        }}
                        className="text-text-muted hover:text-primary transition-colors text-sm inline-flex items-center gap-1.5 group"
                    >
                        <span className="truncate">{link}</span>
                        <svg className="w-3 h-3 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="grid gap-24 px-4 py-8 sm:px-6 lg:px-10 xl:px-40 xl:py-16">
            <div className="bg-background-1 border border-background-2 rounded-2xl p-5 md:p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>BackLink</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {table(links)}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}