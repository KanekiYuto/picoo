import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PromptResultExampleItem {
  imageSrc: string;
  imageAlt: string;
  prompt: string;
}

export interface PromptResultExamplesProps {
  title: string;
  description?: string;
  promptLabel?: string;
  items: PromptResultExampleItem[];
  className?: string;
}

export function PromptResultExamples({
  title,
  description,
  promptLabel,
  items,
  className,
}: PromptResultExamplesProps) {
  return (
    <section className={cn("text-foreground", className)}>
      <div className="mb-10 space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={`${item.imageSrc}-${item.prompt}`}
            className="overflow-hidden rounded-3xl border border-border bg-muted/10"
          >
            <div className="relative aspect-square w-full bg-muted/10">
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>

            <div className="p-4">
              <div className="relative rounded-2xl border border-border bg-background/40 p-4 pt-10">
                {promptLabel ? (
                  <div className="absolute left-3 top-3 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-foreground backdrop-blur">
                    {promptLabel}
                  </div>
                ) : null}
                <p className="line-clamp-5 font-mono text-xs leading-relaxed text-foreground sm:text-sm">
                  {item.prompt}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
