import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialItem {
  quote: string;
  name: string;
  title?: string;
  avatarSrc?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  items: TestimonialItem[];
  ratingLabel?: (rating: number) => string;
  className?: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .join("");
}

function RatingStars({
  rating = 5,
  ratingLabel,
}: {
  rating?: TestimonialItem["rating"];
  ratingLabel?: (rating: number) => string;
}) {
  return (
    <div className="flex items-center gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < rating ? "fill-current" : "fill-transparent opacity-30",
          )}
          aria-hidden
        />
      ))}
      <span className="sr-only">
        {ratingLabel ? ratingLabel(rating) : `${rating} out of 5 stars`}
      </span>
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-muted/10">
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
    );
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/10 text-sm font-semibold text-foreground">
      <span aria-hidden>{getInitials(name)}</span>
      <span className="sr-only">{name}</span>
    </div>
  );
}

export function Testimonials({
  title,
  subtitle,
  items,
  ratingLabel,
  className,
}: TestimonialsProps) {
  const visibleItems = items.slice(0, 4);

  return (
    <section className={cn("text-foreground", className)}>
      <div className="mb-10 space-y-3">
        {subtitle ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title ?? "Loved by creators worldwide"}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {visibleItems.map((item) => (
          <figure
            key={`${item.name}-${item.quote}`}
            className="rounded-3xl border border-border bg-muted/10 p-6"
          >
            <RatingStars rating={item.rating ?? 5} ratingLabel={ratingLabel} />
            <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <Avatar name={item.name} src={item.avatarSrc} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {item.name}
                </div>
                {item.title ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {item.title}
                  </div>
                ) : null}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
