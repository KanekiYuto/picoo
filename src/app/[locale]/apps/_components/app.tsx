import type { ReactNode } from "react";

interface AppProps {
    title: string;
    description: string;
    form: ReactNode;
}

export function App({ title, description, form }: AppProps) {
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
                    <video
                        className="block h-auto w-full object-contain"
                        src="https://cdn.web.imagine.art/imagine-one/imagine-apps/hairstyle-changer1-vid.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                    />
                </div>
            </div>
        </section>
    );
}
