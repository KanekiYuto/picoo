'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PromptImageProps {
  image: string;
  prompt: string;
  alt?: string;
}

export default function PromptImage({ image, prompt, alt}: PromptImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-xl overflow-hidden group cursor-pointer aspect-video"
    >
      <Image
        src={image}
        alt={alt || ''}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 rounded-b-xl translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-sm leading-relaxed">{prompt}</p>
      </div>
    </motion.div>
  );
}
