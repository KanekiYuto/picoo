import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type ThirdPartyBadgeItem = ReactNode;

export interface ThirdPartyBadgesProps {
  items: ThirdPartyBadgeItem[];
  className?: string;
}

export function ThirdPartyBadges({ items, className }: ThirdPartyBadgesProps) {
  return (
    <div className={cn('mx-auto w-full max-w-4xl', className)}>
      <div className="overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 text-muted-foreground">Badges</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell
                  className={cn(
                    'px-6 py-3 text-left',
                    '[&_a]:inline-flex [&_a]:items-center [&_a]:justify-center [&_a]:rounded-md [&_a]:p-1',
                    '[&_a:hover]:bg-muted/40',
                    '[&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-primary/60',
                    '[&_a:focus-visible]:ring-offset-2 [&_a:focus-visible]:ring-offset-background',
                    '[&_img]:max-h-10 [&_img]:h-auto [&_img]:w-auto',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">{item}</div>
                    <Badge variant="outline" className="shrink-0 text-muted-foreground">
                      AD
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
