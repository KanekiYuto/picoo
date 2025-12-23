import React from "react";

interface DividerProps {
  /** 变体样式 */
  variant?: "solid" | "dashed" | "dotted";
  /** 自定义类名 */
  className?: string;
}

/**
 * 分隔线组件
 * 用于在页面中添加视觉分隔
 */
export default function Divider({
  variant = "solid",
  className = ""
}: DividerProps) {
  const variantClasses = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
  };

  return (
    <hr
      className={`
        border-[var(--color-border)]
        ${variantClasses[variant]}
        ${className}
      `}
    />
  );
}
