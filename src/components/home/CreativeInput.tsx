"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { Image as ImageIcon, Video, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type MediaType = "image" | "video";

// 随机提示词库
const imagePrompts = [
  "一只可爱的橘猫在阳光下打哈欠",
  "赛博朋克风格的未来城市夜景",
  "梦幻般的极光在雪山之巅舞动",
  "古老的图书馆里漂浮着发光的书页",
  "水晶般透明的蝴蝶在魔法森林中飞舞",
];

const videoPrompts = [
  "镜头缓缓推进，展现宁静的湖面倒影",
  "无人机俯拍城市灯光从白天到黑夜的转换",
  "时光流逝，花朵从含苞到绽放的全过程",
  "第一人称视角穿越霓虹灯闪烁的街道",
  "慢动作捕捉雨滴落入水面的涟漪",
];

export function CreativeInput() {
  const t = useTranslations("home.creativeInput");
  const [inputValue, setInputValue] = useState("");
  const [selectedType, setSelectedType] = useState<MediaType>("image");

  const handleRandomPrompt = () => {
    const prompts = selectedType === "image" ? imagePrompts : videoPrompts;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setInputValue(randomPrompt);
  };

  const handleSubmit = () => {
    // TODO: 处理提交逻辑
    console.log("Submitted:", inputValue, "Type:", selectedType);
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="mt-6 md:mt-8 w-full max-w-3xl"
    >
      <div className="relative rounded-2xl border border-border bg-card p-4 md:p-6">
        <textarea
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("placeholder")}
          className="max-h-40 min-h-6 w-full resize-none md:resize-y !border-0 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted focus:outline-none !ring-0 custom-scrollbar"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <div className="mt-3 md:mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Media Type Tabs */}
            <div className="relative flex gap-1 rounded-full bg-sidebar-active p-1">
              <motion.button
                onClick={() => setSelectedType("image")}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
                  selectedType === "image"
                    ? "text-white"
                    : "text-white/60 hover:text-white/90"
                )}
              >
                {selectedType === "image" && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-full bg-input-tab-active"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <ImageIcon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{t("image")}</span>
              </motion.button>
              <motion.button
                onClick={() => setSelectedType("video")}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
                  selectedType === "video"
                    ? "text-white"
                    : "text-white/60 hover:text-white/90"
                )}
              >
                {selectedType === "video" && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-full bg-input-tab-active"
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, rotate: 180 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-active text-white/60 transition-colors hover:bg-input-tab-active hover:text-white cursor-pointer"
              aria-label={t("randomPrompt")}
            >
              <Dices className="h-4 w-4" />
            </motion.button>
          </div>
          <motion.button
            onClick={handleSubmit}
            className="rounded-full bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-hover cursor-pointer"
          >
            ↑
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
