"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-sidebar-hover/40 p-4 shadow-sm sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-4 w-1 shrink-0 rounded-full bg-primary/70" />
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
