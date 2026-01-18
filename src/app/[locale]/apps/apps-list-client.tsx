"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@i18n/routing";

type AppItem = {
  href: string;
  title: string;
  description: string;
  preview: {
    kind: "video";
    src: string;
    ariaLabel: string;
  };
};

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppsListClient({
  apps,
  openLabel,
}: {
  apps: AppItem[];
  openLabel: string;
}) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const measureLabelRef = useRef<HTMLSpanElement | null>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  const collapsedWidth = 36;
  const paddingX = 14;
  const gap = 8;
  const iconSize = 16;
  const expandedWidth = Math.max(
    collapsedWidth,
    Math.ceil(paddingX * 2 + iconSize + gap + labelWidth),
  );

  useLayoutEffect(() => {
    if (!measureLabelRef.current) return;
    const width = measureLabelRef.current.getBoundingClientRect().width;
    setLabelWidth(width);
  }, [openLabel]);

  return (
    <div className="relative mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      <span
        ref={measureLabelRef}
        className="pointer-events-none absolute -left-[9999px] top-0 whitespace-nowrap text-xs font-medium"
      >
        {openLabel}
      </span>
      {apps.map((app) => {
        const isHovered = hoveredHref === app.href;

        return (
          <Link
            key={app.href}
            href={app.href}
            aria-label={`${openLabel}: ${app.title}`}
            onPointerEnter={() => setHoveredHref(app.href)}
            onPointerLeave={() => setHoveredHref(null)}
            className="group relative w-full overflow-hidden rounded-3xl border border-border bg-muted/10 p-2.5 transition-colors hover:bg-muted/20"
          >
            <div className="flex h-full flex-col gap-3">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
                <div className="relative aspect-square w-full">
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={app.preview.src}
                    aria-label={app.preview.ariaLabel}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0 dark:from-black/40" />
                </div>
              </div>

              <div className="space-y-2 px-1">
                <h2 className="text-sm font-semibold leading-snug tracking-tight text-foreground md:text-base">
                  {app.title}
                </h2>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground md:text-xs">
                  {app.description}
                </p>
              </div>

              <div className="mt-auto flex justify-end">
                <motion.div
                  animate={{
                    width: isHovered ? expandedWidth : collapsedWidth,
                    paddingLeft: isHovered ? paddingX : 0,
                    paddingRight: isHovered ? paddingX : 0,
                  }}
                  transition={{ type: "spring", stiffness: 520, damping: 42 }}
                  className={[
                    "inline-flex h-9 items-center overflow-hidden rounded-full",
                    "bg-foreground text-background",
                    "gap-2",
                    isHovered ? "justify-end" : "justify-center",
                  ].join(" ")}
                >
                  {isHovered ? (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.18 }}
                      className="whitespace-nowrap text-xs font-medium"
                    >
                      {openLabel}
                    </motion.span>
                  ) : null}
                  <ArrowIcon className="h-4 w-4 shrink-0" />
                </motion.div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
