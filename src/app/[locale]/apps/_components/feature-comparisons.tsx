import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type Media =
  | {
      kind: "image";
      src: string;
      alt: string;
      priority?: boolean;
    }
  | {
      kind: "video";
      src: string;
      poster?: string;
      ariaLabel: string;
    };

type FeatureItem =
  | {
      title: string;
      description: string;
      media: Media;
    }
  | {
      title: string;
      description: string;
      before: Media;
      after: Media;
    };

function isSingleMediaItem(
  item: FeatureItem,
): item is Extract<FeatureItem, { media: Media }> {
  return "media" in item;
}

function isCompareItem(
  item: FeatureItem,
): item is Extract<FeatureItem, { before: Media; after: Media }> {
  return "before" in item && "after" in item;
}

interface FeatureComparisonsProps {
  title?: string;
  items: FeatureItem[];
  ctaLabel?: string;
  ctaHref?: string;
  labels?: {
    before: string;
    after: string;
    compare: string;
  };
  className?: string;
}

function MediaPane({ media }: { media: Media }) {
  if (media.kind === "image") {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-muted/10">
        <Image
          src={media.src}
          alt={media.alt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 20vw, 45vw"
          priority={media.priority}
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-muted/10">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={media.src}
        poster={media.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={media.ariaLabel}
      />
    </div>
  );
}

function SingleMediaPane({ media }: { media: Media }) {
  if (media.kind === "image") {
    return (
      <div className="relative aspect-video w-full">
        <Image
          src={media.src}
          alt={media.alt}
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 28vw, 92vw"
          priority={media.priority}
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full">
      <video
        className="absolute inset-0 h-full w-full object-contain"
        src={media.src}
        poster={media.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={media.ariaLabel}
      />
    </div>
  );
}

function CompareCard({
  before,
  after,
  priority,
  labels,
}: {
  before: Media;
  after: Media;
  priority?: boolean;
  labels?: FeatureComparisonsProps["labels"];
}) {
  const beforeWithPriority =
    before.kind === "image" ? { ...before, priority } : before;
  const afterWithPriority =
    after.kind === "image" ? { ...after, priority } : after;

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-border bg-card p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="relative">
          <div className="absolute left-3 top-3 z-10 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-foreground backdrop-blur">
            {labels?.before}
          </div>
          <MediaPane media={beforeWithPriority} />
        </div>

        <div className="flex items-center justify-center">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/10 text-muted-foreground">
            <ChevronRight
              className="h-5 w-5 rotate-90 text-muted-foreground sm:rotate-0"
              aria-hidden
            />
            <span className="sr-only">{labels?.compare}</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-3 z-10 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-foreground backdrop-blur">
            {labels?.after}
          </div>
          <MediaPane media={afterWithPriority} />
        </div>
      </div>
    </div>
  );
}

function SingleMediaCard({
  media,
  priority,
}: {
  media: Media;
  priority?: boolean;
}) {
  const mediaWithPriority =
    media.kind === "image" ? { ...media, priority } : media;

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-border bg-muted/10">
      <SingleMediaPane media={mediaWithPriority} />
    </div>
  );
}

function FeatureRow({
  item,
  index,
  ctaLabel,
  ctaHref,
  labels,
}: {
  item: FeatureItem;
  index: number;
  ctaLabel?: string;
  ctaHref?: string;
  labels?: FeatureComparisonsProps["labels"];
}) {
  const mediaFirst = index % 2 === 0;
  const isPriority = index === 0;

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn(mediaFirst ? "lg:order-1" : "lg:order-2")}>
        {isCompareItem(item) ? (
          <CompareCard
            before={item.before}
            after={item.after}
            priority={isPriority}
            labels={labels}
          />
        ) : isSingleMediaItem(item) ? (
          <SingleMediaCard media={item.media} priority={isPriority} />
        ) : null}
      </div>

      <div className={cn(mediaFirst ? "lg:order-2" : "lg:order-1")}>
        <h3 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {item.title}
        </h3>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {item.description}
        </p>
        {ctaLabel ? (
          <div className="mt-6">
            <Link
              href={ctaHref ?? "#"}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function FeatureComparisons({
  title,
  items,
  ctaLabel,
  ctaHref,
  labels,
  className,
}: FeatureComparisonsProps) {
  return (
    <section className={cn("text-foreground", className)}>
      {title ? (
        <div className="mb-10">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h2>
        </div>
      ) : null}

      <div className="grid gap-6 lg:gap-12">
        {items.map((item, index) => (
          <FeatureRow
            key={item.title}
            item={item}
            index={index}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
            labels={labels}
          />
        ))}
      </div>
    </section>
  );
}
