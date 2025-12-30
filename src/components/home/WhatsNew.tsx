"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface NewItem {
  id: string;
  title: string;
  image: string;
}

const newItems: NewItem[] = [
  {
    id: "1",
    title: "Lipsync Studio",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "2",
    title: "Kling Studio",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "3",
    title: "Seeddream v4.5",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "4",
    title: "Unlimited 4K Nano Banana PRO",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "5",
    title: "Viral Nano Banana Apps",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "6",
    title: "Unlimited FLUX.2",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "7",
    title: "ImagineArt 1.5 Is Live",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "8",
    title: "ImagineArt 1.5 Is Live",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "9",
    title: "ImagineArt 1.5 Is Live",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
  {
    id: "10",
    title: "ImagineArt 1.5 Is Live",
    image: "https://d1q70pf5vjeyhc.cloudfront.net/predictions/475c36da4a674727ba998c771f08be0d/1.png",
  },
];

export function WhatsNew() {
  const t = useTranslations("home.whatsNew");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      checkScrollPosition();
      scrollElement.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        scrollElement.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="mb-4 md:mb-6 text-lg md:text-2xl lg:text-3xl font-semibold text-foreground px-4 md:px-24 lg:px-36">{t("title")}</div>

      {/* Navigation Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-20 lg:left-32 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm text-foreground transition-all hover:bg-secondary cursor-pointer"
          aria-label={t("scrollLeft")}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-20 lg:right-32 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm text-foreground transition-all hover:bg-secondary cursor-pointer"
          aria-label={t("scrollRight")}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth hide-scrollbar px-4 md:px-24 lg:px-36"
      >
        {newItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="group relative min-w-[200px] sm:min-w-[240px] md:min-w-[280px] lg:min-w-[300px] cursor-pointer"
          >
            {/* Background with image */}
            <div className="relative h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] w-full overflow-hidden rounded-xl border border-border">
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/5" />
            </div>

            {/* Title below image */}
            <div className="mt-2 md:mt-3">
              <div className="text-sm md:text-base lg:text-lg font-semibold text-foreground leading-tight line-clamp-2">
                {item.title}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
