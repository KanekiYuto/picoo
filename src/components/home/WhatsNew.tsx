"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface NewItem {
  id: string;
  title: string;
  image: string;
  link: string;
}

const newItems: NewItem[] = [
  {
    id: "1",
    title: "Seedream 4.5",
    image: "/material/7d6004e4-4b06-4e95-8dc1-4e5500d3dfbd.webp",
    link: "/models/seedream/seedream4_5",
  },
];

export function WhatsNew() {
  const t = useTranslations("home.whatsNew");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 检查滚动位置
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // 监听滚动和窗口大小变化
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

  // 滚动控制
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
      {/* 标题 */}
      <h2 className="mb-4 md:mb-6 text-lg md:text-2xl lg:text-3xl font-semibold text-foreground px-4 md:px-24 lg:px-36">
        {t("title")}
      </h2>

      {/* 左侧导航按钮 */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-20 lg:left-32 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm text-foreground transition-all hover:bg-secondary cursor-pointer"
          aria-label={t("scrollLeft")}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* 右侧导航按钮 */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-20 lg:right-32 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm text-foreground transition-all hover:bg-secondary cursor-pointer"
          aria-label={t("scrollRight")}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* 滚动卡片容器 */}
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
            className="min-w-[200px] sm:min-w-[240px] md:min-w-[280px] lg:min-w-[300px]"
          >
            <Link href={item.link} className="group block">
              {/* 图片容器 */}
              <div className="relative h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] w-full overflow-hidden rounded-xl border border-border">
                {/* 背景图片 */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/5" />
              </div>

              {/* 标题 */}
              <div className="mt-2 md:mt-3">
                <div className="text-sm md:text-base lg:text-base font-semibold text-foreground leading-tight line-clamp-2">
                  {item.title}
                </div>
              </div>
            </Link>
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
