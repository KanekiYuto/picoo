import type { ReactNode } from "react";
import Image from "next/image";

type AppPreviewMedia =
  | {
      kind: "video";
      src: string;
      poster?: string;
      ariaLabel?: string;
      autoPlay?: boolean;
      loop?: boolean;
      muted?: boolean;
      playsInline?: boolean;
      preload?: "none" | "metadata" | "auto";
    }
  | {
      kind: "image";
      src: string;
      alt: string;
      width?: number;
      height?: number;
      priority?: boolean;
      sizes?: string;
    };

interface AppProps {
    title: string;
    description: string;
    form: ReactNode;
    previewMedia?: AppPreviewMedia;
}

export function App({ title, description, form, previewMedia }: AppProps) {
    const resolvedPreviewMedia: AppPreviewMedia = previewMedia ?? {
        kind: "video",
        src: "/material/apps/ai-hairstyle-changer/hairstyle-changer1-vid.mp4",
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        preload: "metadata",
    };

    return (
        <section className="grid w-full grid-cols-1 gap-10 rounded-3xl border border-border bg-secondary-background p-6 text-foreground sm:gap-12 md:grid-cols-[1fr_1.15fr] md:gap-16 md:p-10">
            <div className="order-2 flex flex-col gap-6 md:order-1">
                <header className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        {title}
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        {description}
                    </p>
                </header>

                <div className="space-y-4">
                    {form}
                </div>
            </div>

            <div className="order-1 flex items-start justify-center md:order-2">
                <div className="w-full overflow-hidden rounded-3xl border border-border bg-background">
                    {resolvedPreviewMedia.kind === "video" ? (
                        <video
                            className="block h-auto w-full object-contain"
                            src={resolvedPreviewMedia.src}
                            poster={resolvedPreviewMedia.poster}
                            aria-label={resolvedPreviewMedia.ariaLabel}
                            autoPlay={resolvedPreviewMedia.autoPlay ?? true}
                            loop={resolvedPreviewMedia.loop ?? true}
                            muted={resolvedPreviewMedia.muted ?? true}
                            playsInline={resolvedPreviewMedia.playsInline ?? true}
                            preload={resolvedPreviewMedia.preload ?? "metadata"}
                        />
                    ) : resolvedPreviewMedia.width && resolvedPreviewMedia.height ? (
                        <Image
                            className="block h-auto w-full object-contain"
                            src={resolvedPreviewMedia.src}
                            alt={resolvedPreviewMedia.alt}
                            width={resolvedPreviewMedia.width}
                            height={resolvedPreviewMedia.height}
                            priority={resolvedPreviewMedia.priority}
                            sizes={resolvedPreviewMedia.sizes}
                        />
                    ) : (
                        <img
                            className="block h-auto w-full object-contain"
                            src={resolvedPreviewMedia.src}
                            alt={resolvedPreviewMedia.alt}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
