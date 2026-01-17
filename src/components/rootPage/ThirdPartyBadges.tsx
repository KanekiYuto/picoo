'use client';

import { cn } from '@/lib/utils';

export type ThirdPartyBadgeItem = {
  href: string;
  imgSrc: string;
  imgAlt: string;
  width: number;
  height: number;
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
          key={`${item.href}-${item.imgSrc}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-border bg-background/40 px-4 py-2 transition-colors hover:bg-background/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imgSrc}
            alt={item.imgAlt}
            width={item.width}
            height={item.height}
            loading="lazy"
            decoding="async"
            className="h-9 w-auto"
          />
        </a>
      ))}
    </div>
  );
}

