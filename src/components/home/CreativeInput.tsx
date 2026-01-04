"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { Image as ImageIcon, Video, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useGeneratorStore } from "@/stores/generatorStore";

type MediaType = "image" | "video";

// 随机提示词库
const imagePrompts = [
  "Asian woman in yellow bikini enjoying sunny beach day, wearing round glasses, with clear turquoise water and blue sky in the background",
  "Felicitar las navidades y próspero año nuevo con homer simsom",
];

const videoPrompts = [
  'Homer Simpson and his family celebrating Christmas',
];

export function CreativeInput() {
  const t = useTranslations("home.creativeInput");
  const { openGeneratorModalWithPrompt } = useGeneratorStore();
  const [inputValue, setInputValue] = useState("");
  const [selectedType, setSelectedType] = useState<MediaType>("image");

  const handleRandomPrompt = () => {
    const prompts = selectedType === "image" ? imagePrompts : videoPrompts;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setInputValue(randomPrompt);
  };

  const handleSubmit = () => {
    openGeneratorModalWithPrompt(inputValue, selectedType);
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="mt-6 md:mt-8 w-full max-w-3xl"
    >
      <div className="relative rounded-2xl border border-border bg-secondary-background p-4 md:p-6">
        <textarea
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("placeholder")}
          className="max-h-40 min-h-6 w-full resize-none md:resize-y !border-0 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none !ring-0 custom-scrollbar"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <div className="mt-3 md:mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Media Type Tabs */}
            <div className="relative flex gap-1 rounded-lg bg-muted/10 p-1">
              <motion.button
                onClick={() => setSelectedType("image")}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
                  selectedType === "image"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selectedType === "image" && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-md bg-muted/15"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <ImageIcon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{t("image")}</span>
              </motion.button>
              <motion.button
                onClick={() => setSelectedType("video")}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
                  selectedType === "video"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selectedType === "video" && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-md bg-muted/15"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <Video className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{t("video")}</span>
              </motion.button>
            </div>

            {/* 随机提示词按钮 */}
            <motion.button
              onClick={handleRandomPrompt}
              whileTap={{ scale: 0.9, rotate: -10 }}
              className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label={t("randomPrompt")}
            >
              <Dices className="h-4 w-4" />
            </motion.button>
          </div>
          <motion.button
            onClick={handleSubmit}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-hover cursor-pointer"
          >
            ↑
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
