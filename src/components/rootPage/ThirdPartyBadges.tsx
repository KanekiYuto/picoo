'use client';

import { cn } from '@/lib/utils';

export type ThirdPartyBadgeItem =
  | {
      kind?: 'image';
      href: string;
      imgSrc: string;
      imgAlt: string;
      width: number;
      height: number;
    }
  | {
      kind: 'text';
      href: string;
      label: string;
    };

export interface ThirdPartyBadgesProps {
  items: ThirdPartyBadgeItem[];
  className?: string;
}

export function ThirdPartyBadges({ items, className }: ThirdPartyBadgesProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', className)}>
      {items.map((item) => (
        <a
          key={`${item.href}-${item.kind === 'text' ? item.label : item.imgSrc}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group inline-flex items-center justify-center rounded-2xl border border-border/60',
            'bg-gradient-to-b from-background/70 to-background/40',
            'h-16 min-w-[240px] px-5 shadow-sm backdrop-blur transition',
            'hover:border-border hover:from-background/80 hover:to-background/50 hover:shadow-md',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          {item.kind === 'text' ? (
            <span className="text-sm font-semibold text-foreground/90 transition-colors group-hover:text-foreground">
              {item.label}
            </span>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imgSrc}
                alt={item.imgAlt}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
                className="h-auto w-auto max-h-14 opacity-90 transition group-hover:opacity-100"
              />
            </>
          )}
        </a>
      ))}
    </div>
  );
}
