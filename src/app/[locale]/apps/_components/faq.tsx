import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  items: FAQItem[];
  defaultOpenIndex?: number | null;
  labels?: {
    expand: string;
    collapse: string;
  };
  className?: string;
}

export function FAQ({
  title,
  items,
  defaultOpenIndex = 0,
  labels,
  className,
}: FAQProps) {
  return (
    <section className={cn("text-foreground", className)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-16">
        <div className="pt-8 lg:col-span-4">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            {title ?? "Frequently asked questions"}
          </h2>
        </div>

        <div className="lg:col-span-8">
          <div className="space-y-0">
            {items.map((item, index) => {
              const isDefaultOpen = defaultOpenIndex === index;

              return (
                <details
                  key={`${item.question}-${index}`}
                  open={isDefaultOpen}
                  className="group border-b border-border"
                >
                  <summary className="flex w-full cursor-pointer list-none items-center justify-between py-4 text-left sm:py-6">
                    <span
                      className={cn(
                        "pr-3 text-sm font-medium transition-colors sm:pr-8 sm:text-base lg:text-lg",
                        "text-foreground group-open:text-primary",
                      )}
                    >
                      {item.question}
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/10 text-foreground/70">
                      <Plus
                        className="h-4 w-4 text-current group-open:hidden"
                        aria-hidden
                      />
                      <Minus
                        className="hidden h-4 w-4 text-current group-open:block"
                        aria-hidden
                      />
                      <span className="sr-only">
                        <span className="block group-open:hidden">
                          {labels?.expand}
                        </span>
                        <span className="hidden group-open:block">
                          {labels?.collapse}
                        </span>
                      </span>
                    </span>
                  </summary>

                  <div className="pb-4 pr-6 sm:pb-6 sm:pr-12">
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm lg:text-base">
                      {item.answer}
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
