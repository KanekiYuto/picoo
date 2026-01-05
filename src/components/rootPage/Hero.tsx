'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { HeroInput } from '@/components/rootPage/HeroInput';
import { useTranslations } from 'next-intl';

/**
 * 背景光效组件
 */
function BackgroundEffects() {
  return (
    <>
      {/* 主光效 - 中心放射 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[#ff3466]/30 via-[#c721ff]/20 to-transparent blur-3xl animate-pulse" />
      </div>
    </>
  );
}

/**
 * Hero 主页标题区域组件
 */
export function Hero() {
  const t = useTranslations('rootPage.hero');

  return (
    <div className='relative h-screen flex items-center justify-center px-4 md:px-6 overflow-hidden'>
      <BackgroundEffects />

      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center"
      >
        {/* Title */}
        <motion.h1
          variants={fadeInUp}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] text-foreground mb-6 md:mb-8"
        >
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            {t('title.prefix')}
          </span>
          <span className="text-gradient-primary">
            {t('title.highlight')}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeInUp}
          className="max-w-3xl text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-12 md:mb-16"
        >
          {t.rich('description', {
            models: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
          })}
        </motion.p>

        {/* Input Box */}
        <HeroInput />
      </motion.section>
    </div>
  );
}
