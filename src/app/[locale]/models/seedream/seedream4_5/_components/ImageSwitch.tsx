'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ImageSwitchProps {
  image1: string;
  image2: string;
  alt1?: string;
  alt2?: string;
}

export default function ImageSwitch({ image1, image2, alt1, alt2 }: ImageSwitchProps) {
  const [isShowingImage2, setIsShowingImage2] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsShowingImage2((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl cursor-pointer">
      <AnimatePresence mode="wait">
        {!isShowingImage2 ? (
          <motion.div
            key="image1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <img
              src={image1}
              alt={alt1}
              className="w-full rounded-xl object-cover shadow-md"
            />
          </motion.div>
        ) : (
          <motion.div
            key="image2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <img
              src={image2}
              alt={alt2}
              className="w-full rounded-xl object-cover shadow-md"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
