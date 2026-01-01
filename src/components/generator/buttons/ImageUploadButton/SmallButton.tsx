"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SmallButtonProps {
  uploadImages: string[];
  onClick?: () => void;
  onOpenMobileImagePanel?: () => void;
  className?: string;
}

export function SmallButton({
  uploadImages,
  onClick,
  onOpenMobileImagePanel,
  className,
}: SmallButtonProps) {
  const hasImages = uploadImages.length > 0;

  return (
    <motion.button
      onClick={() => {
        if (hasImages) {
          onOpenMobileImagePanel?.();
        } else {
          onClick?.();
        }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center flex-shrink-0 cursor-pointer",
        "w-10 h-10 rounded-xl",
        "border-2 border-dashed border-border",
        "bg-sidebar-hover hover:bg-sidebar-active",
        "transition-all duration-300",
        className
      )}
    >
      <Plus className="h-5 w-5 text-muted-foreground" />
      {uploadImages.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center"
        >
          {uploadImages.length}
        </motion.div>
      )}
    </motion.button>
  );
}
