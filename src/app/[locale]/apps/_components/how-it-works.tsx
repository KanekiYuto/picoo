import Image from "next/image";
import { cn } from "@/lib/utils";

type StepMedia =
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

interface StepItem {
  title: string;
  description: string;
  media: StepMedia;
}

interface HowItWorksProps {
  title: string;
  steps: StepItem[];
  stepLabel?: string;
  className?: string;
}

function StepCard({
  step,
  index,
  stepLabel,
}: {
  step: StepItem;
  index: number;
  stepLabel?: string;
}) {
  return (
    <article className="flex flex-col gap-6">
      <div className="group relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl bg-muted/10">
            {step.media.kind === "image" ? (
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={step.media.src}
                  alt={step.media.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  priority={step.media.priority}
                />
              </div>
            ) : (
              <div className="relative aspect-[16/9] w-full">
                <video
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  src={step.media.src}
                  poster={step.media.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={step.media.ariaLabel}
                />
              </div>
            )}
          </div>
        </div>

        {stepLabel ? (
          <div className="absolute left-2 top-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
            {stepLabel.replace("{n}", String(index + 1))}
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground md:text-xl">
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {step.description}
        </p>
      </div>
    </article>
  );
}

export function HowItWorks({ title, steps, stepLabel, className }: HowItWorksProps) {
  return (
    <section className={cn("text-foreground", className)}>
      <div className="mb-10 space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
        {steps.map((step, index) => (
          <StepCard key={step.title} step={step} index={index} stepLabel={stepLabel} />
        ))}
      </div>
    </section>
  );
}
