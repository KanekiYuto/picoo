'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

interface HeroCarouselProps {
  images: string[];
  noImages: string;
}

export default function HeroCarousel({ images, noImages }: HeroCarouselProps) {
  return (
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
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-lg relative">
                  <Image
                    src={image}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
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
  );
}
