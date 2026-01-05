"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Video, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useGeneratorStore } from "@/store/useGeneratorStore";
import { Textarea } from "@/components/ui/textarea";
import { requireAuth } from "@/lib/guards";

type MediaType = "image" | "video";

// 随机提示词库
const imagePrompts = [
  "Asian woman in yellow bikini enjoying sunny beach day, wearing round glasses, with clear turquoise water and blue sky in the background",
  "Felicitar las navidades y próspero año nuevo con homer simsom",
];

const videoPrompts = [
  'Homer Simpson and his family celebrating Christmas',
];

/**
 * Hero 输入框组件
 * 首页主要交互入口
 */
export function HeroInput() {
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
    if (!inputValue.trim()) return;
    requireAuth(() => {
      openGeneratorModalWithPrompt(inputValue, selectedType);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-3xl"
    >
      <div className="relative rounded-3xl bg-gradient-to-r from-[#ff3466] via-[#c721ff] to-[#ff3466] p-[3px] shadow-2xl">
        <div className="relative rounded-3xl bg-background backdrop-blur-sm p-6 md:p-8">
        <textarea
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("placeholder")}
          className="max-h-40 min-h-6 w-full resize-none md:resize-y !border-0 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none !ring-0 custom-scrollbar"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Media Type Tabs */}
            <div className="relative flex gap-1 rounded-lg bg-muted/10 p-1">
              <motion.button
                onClick={() => setSelectedType("image")}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  selectedType === "image"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selectedType === "image" && (
                  <motion.div
                    layoutId="hero-active-tab"
                    className="absolute inset-0 rounded-md bg-muted/15"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <ImageIcon className="relative z-10 h-4 w-4" />
                <span className="relative z-10 hidden md:inline">{t("image")}</span>
              </motion.button>
              <motion.button
                onClick={() => setSelectedType("video")}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  selectedType === "video"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {selectedType === "video" && (
                  <motion.div
                    layoutId="hero-active-tab"
                    className="absolute inset-0 rounded-md bg-muted/15"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <Video className="relative z-10 h-4 w-4" />
                <span className="relative z-10 hidden md:inline">{t("video")}</span>
              </motion.button>
            </div>

            {/* 随机提示词按钮 */}
            <motion.button
              onClick={handleRandomPrompt}
              whileTap={{ scale: 0.9, rotate: -10 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground cursor-pointer"
              aria-label={t("randomPrompt")}
            >
              <Dices className="h-5 w-5" />
            </motion.button>
          </div>

          {/* 提交按钮 */}
          <motion.button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
          >
            ↑
          </motion.button>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
