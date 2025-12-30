"use client";

import { motion } from "framer-motion";
import { Download, Grid3x3, Trash2, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

function ToolbarButton({ onClick, icon: Icon, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-2.5 py-2 rounded-md",
        "text-foreground text-sm transition-colors",
        "hover:bg-sidebar-hover"
      )}
      title={title}
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </button>
  );
}

interface SelectionToolbarProps {
  position: { x: number; y: number };
  onArrange: () => void;
}

export function SelectionToolbar({ position, onArrange }: SelectionToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 z-20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <ToolbarButton onClick={onArrange} icon={Grid3x3} title="整理" />
    </motion.div>
  );
}

interface ImageToolbarProps {
  position: { x: number; y: number };
  onDownload: () => void;
  onUpscale: () => void;
}

export function ImageToolbar({ position, onDownload, onUpscale }: ImageToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 z-20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <ToolbarButton onClick={onDownload} icon={Download} title="下载" />
      <ToolbarButton onClick={onUpscale} icon={Maximize} title="图像放大" />
    </motion.div>
  );
}

interface ErrorToolbarProps {
  position: { x: number; y: number };
  onDelete: () => void;
}

export function ErrorToolbar({ position, onDelete }: ErrorToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 z-20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <ToolbarButton onClick={onDelete} icon={Trash2} title="删除" />
    </motion.div>
  );
}
