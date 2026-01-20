"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneratorHeaderProps {
  onClose: () => void;
  activePanel: string | null;
}

export function GeneratorHeader({ onClose, activePanel }: GeneratorHeaderProps) {
  const [sessionType, setSessionType] = useState("current");

  return (
    <div className="flex justify-between bg-background-generator items-center p-2 pointer-events-auto relative m-2 rounded-xl flex-1 border border-background-2" style={{ zIndex: 60 }}>
      <Select value={sessionType} onValueChange={setSessionType}>
        <SelectTrigger className="h-9 !bg-background-generator hover:!bg-background-2 border border-background-3 rounded-xl cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[51] !bg-background-generator !border-background-2 rounded-xl">
          <SelectItem value="current" className="hover:!bg-background-generator focus:!bg-background-2 cursor-pointer">当前会话</SelectItem>
          <SelectItem value="history" className="hover:!bg-background-generator focus:!bg-background-2 cursor-pointer">历史记录</SelectItem>
        </SelectContent>
      </Select>

      {/* 右侧：关闭按钮 */}
      {activePanel === null && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-background-generator hover:bg-background-2 border border-background-2 text-foreground transition-colors backdrop-blur-sm cursor-pointer"
          aria-label="Close Generator Modal"
        >
          <X className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
}
