'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { useGeneratorStore } from '@/stores/generatorStore';
import { Link } from '@i18n/routing';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

interface HeroProps {
  title: string;
  description: string;
  images: string[];
  features?: string[];
  primaryCta?: string;
  secondaryCta?: string;
  noImages?: string;
}

export default function Hero({ title, description, images, features = [], primaryCta, secondaryCta, noImages }: HeroProps) {
  const { openGeneratorModal } = useGeneratorStore();

  return (
    <div className="flex flex-col md:grid md:grid-cols-4 gap-8 lg:gap-16 items-center py-12 md:py-20">
      {/* 左侧文本 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6 md:col-span-2"
      >
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-primary">
            {title}
          </h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
          {description}
        </h2>

        {features.length > 0 && (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-[#ff3466] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-4 pt-4">
          <button onClick={openGeneratorModal} className="px-6 py-3 bg-gradient-primary text-white rounded-lg transition font-medium cursor-pointer">
            {primaryCta}
          </button>
          <Link href="/pricing" className="px-6 py-3 border border-border rounded-lg hover:bg-muted/20 bg-muted/20 font-medium cursor-pointer inline-flex items-center">
            {secondaryCta}
          </Link>
        </div>
      </motion.div>

      {/* 右侧轮播图 */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:col-span-2 overflow-hidden"
      >
        {images.length > 0 ? (
          <Carousel
            className="w-full"
            opts={{
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-lg">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-muted/40 hover:bg-muted/60 border-0" />
            <CarouselNext variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-muted/40 hover:bg-muted/60 border-0" />
          </Carousel>
        ) : (
          <div className="aspect-video rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-lg">
            {noImages}
          </div>
        )}
      </motion.div>
    </div>
  );
}
