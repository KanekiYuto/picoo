"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { CreativeInput } from "./CreativeInput";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center text-center px-4 md:px-6"
    >
      <motion.div
        variants={fadeInUp}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold"
      >
        {t("title")}
      </motion.div>
      <motion.p
        variants={fadeInUp}
        className="mt-4 md:mt-6 max-w-2xl text-base md:text-lg lg:text-base xl:text-lg text-muted"
      >
        {t("description")}
      </motion.p>

      {/* Input Box */}
      <CreativeInput />
    </motion.section>
  );
}
